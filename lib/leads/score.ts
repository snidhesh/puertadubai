/**
 * Deterministic lead scoring — pure function, fully unit-testable.
 *
 * Precedence: residency-led → business-setup-led → yield-led → exploratory.
 * Residency takes priority because the Golden Visa concierge offer is
 * highest-intent and highest-margin.
 *
 * The category is stored in the Airtable Leads row AND included in the
 * Resend ops-notification email subject (`[<leadCategory>] New readiness
 * intake`) so the rep sees it in inbox preview without opening. **The
 * subject contains no PII.**
 */
export type LeadCategory =
  | 'residency-led'
  | 'business-setup-led'
  | 'yield-led'
  | 'exploratory';

export type ScoringInput = {
  residencyGoal?: string | null;
  investmentObjective?: string | null;
  servicesNeeded?: readonly string[] | null;
};

const RESIDENCY_TRIGGER = 'golden-visa-priority';
const BUSINESS_SERVICES = new Set(['company-formation', 'banking', 'tax']);
const YIELD_SERVICES = new Set(['secondary', 'off-plan']);

export function categoriseLead(input: ScoringInput): LeadCategory {
  const services = new Set(input.servicesNeeded ?? []);

  if (input.residencyGoal === RESIDENCY_TRIGGER) return 'residency-led';

  for (const s of services) {
    if (BUSINESS_SERVICES.has(s)) return 'business-setup-led';
  }

  if (input.investmentObjective === 'yield') return 'yield-led';
  for (const s of services) {
    if (YIELD_SERVICES.has(s)) return 'yield-led';
  }

  return 'exploratory';
}
