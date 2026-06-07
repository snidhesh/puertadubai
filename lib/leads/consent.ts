/**
 * Active privacy/consent version. Bumping invalidates older privacy text
 * — lead records keep the version they accepted at submission so audits
 * always know what the applicant saw.
 *
 * Lives in its own module so client components can import it without
 * pulling in the server-action adapter (a `'use server'` file may only
 * export async functions).
 */
export const CURRENT_CONSENT_VERSION = '2026-06-06';
