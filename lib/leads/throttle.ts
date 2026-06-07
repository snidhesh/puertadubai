import type {TransactionSql} from 'postgres';
import {sql} from '@/lib/db/client';
import {hmacEmail, hmacIp} from './hash';

/**
 * Postgres-backed throttle.
 *
 * Atomic check-and-record in one transaction, both scopes together:
 *   1. Acquire both advisory locks up-front in fixed order (email
 *      before ip) so concurrent submissions with different pairings
 *      cannot deadlock.
 *   2. Count both scopes inside the locks — concurrent requests with
 *      the same key see each other's committed rows.
 *   3. If either cap is exceeded, ROLLBACK and reject WITHOUT inserting
 *      a new row. (Inserting on top of a capped bucket would re-arm the
 *      15-min sliding window indefinitely.)
 *   4. Otherwise insert BOTH rows and COMMIT.
 *
 * The 64-bit `hashtextextended($, 0)` lock key is collision-resistant at
 * any realistic scale; plain `hashtext()` would only give 32 bits.
 *
 * MUST run inside `sql.begin(async (sql) => { ... })` so every statement
 * shares one connection — the advisory lock is per-connection.
 */

export class ThrottleReject extends Error {
  constructor(public readonly scope: 'email' | 'ip' | 'login-ip' | 'login-global') {
    super(`throttle:${scope}`);
  }
}

const SUBMISSION_LIMITS = {
  email: 3,
  ip: 5
} as const;

const LOGIN_LIMITS = {
  'login-ip': 5,
  'login-global': 40
} as const;

export async function recordSubmissionAttempt(opts: {
  email: string;
  rawIp: string;
}): Promise<void> {
  const emailKey = hmacEmail(opts.email);
  const ipKey = hmacIp(opts.rawIp);
  await sql.begin(async (txn) => {
    await runThrottleCheck(txn, [
      {key: emailKey, scope: 'email', limit: SUBMISSION_LIMITS.email},
      {key: ipKey, scope: 'ip', limit: SUBMISSION_LIMITS.ip}
    ]);
  });
}

export async function recordLoginAttempt(opts: {
  rawIp: string;
}): Promise<void> {
  const ipKey = hmacIp(opts.rawIp);
  // `login-global` is keyed by HMAC of the literal string — it's a
  // single shared bucket so every login attempt site-wide counts.
  const globalKey = hmacIp('login-global');
  await sql.begin(async (txn) => {
    await runThrottleCheck(txn, [
      {key: ipKey, scope: 'login-ip', limit: LOGIN_LIMITS['login-ip']},
      {key: globalKey, scope: 'login-global', limit: LOGIN_LIMITS['login-global']}
    ]);
  });
}

type Bucket = {
  key: string;
  scope: 'email' | 'ip' | 'login-ip' | 'login-global';
  limit: number;
};

async function runThrottleCheck(txn: TransactionSql, buckets: Bucket[]): Promise<void> {
  // Acquire all locks first, in argument order. Callers pass buckets
  // in a fixed order to avoid AB-BA deadlock.
  for (const b of buckets) {
    await txn`SELECT pg_advisory_xact_lock(hashtextextended(${b.key + ':' + b.scope}, 0))`;
  }

  // Count each scope inside the locks.
  const counts = await Promise.all(
    buckets.map(async (b) => {
      const [row] = await txn<{count: string}[]>`
        SELECT count(*)::int AS count
        FROM lead_submission_limits
        WHERE key = ${b.key} AND scope = ${b.scope}
          AND submitted_at > NOW() - INTERVAL '15 minutes'
      `;
      return {bucket: b, count: Number(row.count)};
    })
  );

  // If any cap is exceeded, reject WITHOUT inserting a new row.
  for (const {bucket, count} of counts) {
    if (count >= bucket.limit) {
      throw new ThrottleReject(bucket.scope);
    }
  }

  // All caps passed — record this attempt in every scope.
  for (const b of buckets) {
    await txn`INSERT INTO lead_submission_limits (key, scope) VALUES (${b.key}, ${b.scope})`;
  }
}
