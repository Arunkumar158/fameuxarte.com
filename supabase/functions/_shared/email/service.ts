/**
 * email/service.ts
 * Fameuxarte Central Email Service
 *
 * THE single entry point for all email delivery.
 * Application code NEVER calls Resend directly.
 *
 * Responsibilities:
 *   1. Resolve template from registry
 *   2. Validate variables
 *   3. Check idempotency (database-level, concurrency-safe)
 *   4. Check marketing consent (for marketing category emails)
 *   5. Render HTML + plain text
 *   6. Deliver via Resend API
 *   7. Log result
 *   8. Return structured result
 *
 * Email failure NEVER throws — it returns { success: false, error }.
 * Business transactions are not blocked by email failure.
 *
 * Deno-compatible — no Node.js imports.
 */

// @ts-ignore — Deno ESM import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

import type { SendEmailRequest, SendEmailResult, EmailType } from './types.ts';
import { getTemplate } from './registry.ts';
import { createEmailLog, updateEmailLog } from './logger.ts';

declare const Deno: { env: { get(k: string): string | undefined } };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_RETRIES      = 3;
const RETRY_DELAY_MS   = [0, 5000, 15000];   // ms delay before each attempt (0 = immediate)
const RESEND_API_URL   = 'https://api.resend.com/emails';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check marketing consent.
 * Returns true if user is opted in (or no preference record = default opted in).
 * Transactional emails always return true regardless.
 */
async function isMarketingEnabled(userId: string | undefined): Promise<boolean> {
  if (!userId) return true; // No user = don't block (handled elsewhere)

  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(url, key, { auth: { persistSession: false } });

  const { data } = await adminClient
    .from('email_preferences')
    .select('marketing_enabled')
    .eq('user_id', userId)
    .single();

  // No record = default opted in
  return data?.marketing_enabled ?? true;
}

// ---------------------------------------------------------------------------
// Core sendEmail function
// ---------------------------------------------------------------------------

/**
 * Send a Fameuxarte transactional or marketing email.
 *
 * @example
 * const result = await sendEmail({
 *   type: 'order_confirmation',
 *   to: 'buyer@example.com',
 *   variables: { customer_name: 'Ananya', order_number: 'FA001', ... },
 *   idempotencyKey: `order_confirmation:${orderId}`,
 *   relatedUserId: userId,
 *   relatedOrderId: orderId,
 * });
 *
 * // Email failure does NOT throw — always check result.success
 * if (!result.success) {
 *   console.error('Email failed:', result.error);
 * }
 */
export async function sendEmail(request: SendEmailRequest): Promise<SendEmailResult> {
  const { type, to, variables, idempotencyKey, replyTo,
          relatedUserId, relatedOrderId, relatedTicketId, metadata } = request;

  try {
    // ── 1. Resolve template ───────────────────────────────────────────────
    const template = getTemplate(type as EmailType);
    if (!template) {
      console.error(`[email/service] Unknown template type: ${type}`);
      return { success: false, error: `Unknown template: ${type}` };
    }

    // ── 2. Validate variables ─────────────────────────────────────────────
    const validation = template.validate(variables);
    if (!validation.valid) {
      console.error(`[email/service] Template validation failed for ${type}:`, validation.errors);
      return {
        success: false,
        error: `Template validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // ── 3. Marketing consent check ────────────────────────────────────────
    if (template.category === 'marketing') {
      const opted = await isMarketingEnabled(relatedUserId);
      if (!opted) {
        console.log(`[email/service] Marketing email blocked — user opted out: ${relatedUserId}`);
        return {
          success: false,
          skipped: true,
          skipReason: 'User has opted out of marketing emails',
        };
      }
    }

    // ── 4. Check RESEND_API_KEY ───────────────────────────────────────────
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('[email/service] RESEND_API_KEY is not set');
      return { success: false, error: 'Email service not configured (missing API key)' };
    }

    // ── 5. Idempotency — create log entry ─────────────────────────────────
    //      The UNIQUE constraint on idempotency_key makes this atomic.
    //      If the key already exists, createEmailLog returns duplicate: true.
    const subject = template.defaultSubject;
    const { logId, duplicate } = await createEmailLog({
      idempotencyKey,
      recipient:       to,
      template:        type,
      templateVersion: template.version,
      category:        template.category,
      subject,
      relatedUserId,
      relatedOrderId,
      relatedTicketId,
      metadata,
    });

    if (duplicate) {
      console.log(`[email/service] Skipped duplicate email (idempotency): ${type} → ${to}`);
      return {
        success: true,
        skipped: true,
        skipReason: 'Duplicate prevented by idempotency key',
        emailLogId: undefined,
      };
    }

    // ── 6. Render templates ────────────────────────────────────────────────
    const html = template.renderHtml(variables);
    const text = template.renderText(variables);

    // ── 7. Build Resend payload ────────────────────────────────────────────
    const emailPayload: Record<string, unknown> = {
      from:    template.from,
      to:      [to],
      subject,
      html,
      text,
    };
    if (replyTo) emailPayload.reply_to = replyTo;

    // ── 8. Send via Resend with retry ──────────────────────────────────────
    let lastError = '';
    let resendEmailId: string | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await sleep(RETRY_DELAY_MS[attempt] ?? 15000);
        console.log(`[email/service] Retry ${attempt}/${MAX_RETRIES - 1} for ${type} → ${to}`);
      }

      try {
        const res = await fetch(RESEND_API_URL, {
          method:  'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify(emailPayload),
        });

        const body = await res.json();

        if (res.ok && body.id) {
          resendEmailId = body.id;
          // ── 9. Update log → sent ─────────────────────────────────────
          await updateEmailLog({
            logId:        logId!,
            status:       'sent',
            resendEmailId,
            sentAt:       new Date().toISOString(),
          });

          console.log(`[email/service] ✅ Sent: ${type} → ${to} (resend_id: ${resendEmailId})`);

          return {
            success: true,
            emailLogId: logId ?? undefined,
            resendEmailId,
          };
        }

        lastError = body?.message ?? body?.error ?? `HTTP ${res.status}`;
        console.warn(`[email/service] Resend error on attempt ${attempt}: ${lastError}`);

      } catch (fetchErr) {
        lastError = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        console.warn(`[email/service] Fetch error on attempt ${attempt}: ${lastError}`);
      }
    }

    // ── 10. All retries exhausted — log failure ────────────────────────────
    //        Business transaction is NOT affected by this failure.
    await updateEmailLog({
      logId:        logId!,
      status:       'failed',
      errorMessage: lastError,
    });

    console.error(`[email/service] ❌ Failed after ${MAX_RETRIES} attempts: ${type} → ${to}: ${lastError}`);
    return {
      success: false,
      emailLogId: logId ?? undefined,
      error: lastError,
    };

  } catch (err) {
    // Outer catch — never let email crash the caller
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email/service] ❌ Unexpected error for ${type} → ${to}:`, message);
    return { success: false, error: message };
  }
}
