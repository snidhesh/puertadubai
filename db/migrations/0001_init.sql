-- =====================================================================
-- 0001_init.sql — initial Postgres schema (Neon via Vercel Marketplace)
-- Three tables:
--   leads                    — lead submissions, 24-month retention
--   lead_submission_limits   — HMAC-keyed throttle ledger (form + login)
--   webhook_deliveries       — Sanity webhook idempotency-key dedupe
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source              TEXT NOT NULL CHECK (source IN ('private-circle','golden-visa-inquiry','contact','investment-readiness')),
  locale              TEXT NOT NULL CHECK (locale IN ('en','fr','es','pt','ar')),
  lead_category       TEXT,
  name                TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  country             TEXT,
  interest            TEXT,
  message             TEXT,
  budget_band         TEXT,
  target_emirate      TEXT,
  timeline            TEXT,
  investment_obj      TEXT,
  residency_goal      TEXT,
  services_needed     TEXT[],
  consent_version     TEXT NOT NULL,
  marketing_opt_in    BOOLEAN NOT NULL DEFAULT false,
  stage               TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new','contacted','qualified','converted','lost')),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx    ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_source_idx        ON leads (source);
CREATE INDEX IF NOT EXISTS leads_lead_category_idx ON leads (lead_category);
CREATE INDEX IF NOT EXISTS leads_email_idx         ON leads (email);

-- Throttle ledger. Key = HMAC-SHA256(LIMIT_HMAC_SECRET, email_or_ip)
-- (or the literal string 'login-global' for the site-wide scope) so a
-- leak of the table never exposes raw emails or IPs.
CREATE TABLE IF NOT EXISTS lead_submission_limits (
  key          TEXT NOT NULL,
  scope        TEXT NOT NULL CHECK (scope IN ('email','ip','login-ip','login-global')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lead_submission_limits_lookup_idx
  ON lead_submission_limits (key, scope, submitted_at DESC);

-- Sanity webhook dedupe. Durable across cold starts; ON CONFLICT
-- DO NOTHING gives an atomic first-vs-replay test.
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  idempotency_key TEXT PRIMARY KEY,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
