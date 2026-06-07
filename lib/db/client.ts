import postgres, {type Sql} from 'postgres';
import {readDbEnv} from './env';

/**
 * Tagged-template SQL client. Lazy-initialised so module evaluation
 * during `next build` page-data collection doesn't throw on a missing
 * `DATABASE_URL` — the client only connects when a query actually runs.
 *
 * NOTE: throttle and any other transaction MUST wrap their queries in
 * `sql.begin(async (sql) => { ... })` — top-level `sql\`...\`` calls
 * scatter across pooled connections and silently break per-connection
 * guarantees like advisory locks.
 */
let cached: Sql | null = null;

function getClient(): Sql {
  if (cached) return cached;
  const env = readDbEnv();
  cached = postgres(env.pooled, {
    max: 5,
    idle_timeout: 30,
    connect_timeout: 10
  });
  return cached;
}

/**
 * Proxy that defers actual `postgres()` construction until the first
 * call. Importers can keep the ergonomic `sql\`SELECT ...\`` shape.
 */
export const sql = new Proxy(
  (() => undefined) as unknown as Sql,
  {
    get(_target, prop) {
      const client = getClient();
      const value = (client as unknown as Record<string | symbol, unknown>)[prop];
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value;
    },
    apply(_target, _thisArg, args: unknown[]) {
      const client = getClient();
      return (client as unknown as (...args: unknown[]) => unknown)(...args);
    }
  }
) as Sql;
