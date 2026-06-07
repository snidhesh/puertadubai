/**
 * DB env shim. Vercel's Postgres-via-Marketplace integration injects
 * one of several env-var name conventions (the names have evolved with
 * the rebrand to Neon and may shift again). This shim normalises
 * whichever names landed into `DATABASE_URL` (pooled) and
 * `DATABASE_URL_UNPOOLED` (direct).
 *
 * Pooled is read by the runtime client; unpooled is used only by
 * migrations and any long-running job.
 */

export type DbEnv = {
  pooled: string;
  unpooled: string;
};

export function readDbEnv(): DbEnv {
  const pooled =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL;
  const unpooled =
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL_NO_SSL ??
    pooled;

  if (!pooled) {
    throw new Error(
      'Missing DATABASE_URL / POSTGRES_URL — attach Postgres via Vercel Marketplace'
    );
  }

  return {pooled, unpooled: unpooled ?? pooled};
}
