'use server';

import {revalidatePath} from 'next/cache';
import {cookies} from 'next/headers';
import {SESSION_COOKIE_NAME, verifySession} from '@/lib/internal/session';
import {updateLeadStage, type LeadStage} from '@/lib/internal/leads-store';

const VALID_STAGES: ReadonlyArray<LeadStage> = [
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost'
];

/**
 * Stage-update Server Action. Next 16's default same-origin enforcement
 * blocks cross-origin POSTs; the explicit session check inside the
 * action makes the privilege-gate behaviour obvious in the source. No
 * CORS headers are emitted from /internal/*.
 */
export async function updateStage(id: string, formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  if (!verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    throw new Error('session-required');
  }
  const stage = String(formData.get('stage') ?? '');
  if (!VALID_STAGES.includes(stage as LeadStage)) {
    throw new Error('invalid-stage');
  }
  await updateLeadStage(id, stage as LeadStage);
  revalidatePath(`/internal/leads/${id}`, 'page');
  revalidatePath('/internal/leads', 'page');
}
