/**
 * email/logger.ts
 * Fameuxarte Email Logger
 *
 * Writes to the email_logs table using the service role client.
 * The idempotency_key UNIQUE constraint on email_logs provides
 * concurrency-safe duplicate prevention at the database level.
 *
 * Deno-compatible — no Node.js imports.
 */

// @ts-ignore — Deno ESM import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

declare const Deno: { env: { get(k: string): string | undefined } };

export interface LogEmailParams {
  idempotencyKey?: string;
  recipient: string;
  template: string;
  templateVersion: string;
  category: string;
  subject: string;
  relatedUserId?: string;
  relatedOrderId?: string;
  relatedTicketId?: string;
  metadata?: Record<string, unknown>;
}

export interface LogEmailResult {
  logId: string | null;
  duplicate: boolean;   // true if idempotency key already existed
}

export interface UpdateLogParams {
  logId: string;
  status: string;
  resendEmailId?: string;
  errorMessage?: string;
  sentAt?: string;
}

function getAdminClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Create a log entry before sending.
 * If the idempotency key already exists (UNIQUE violation), returns duplicate: true.
 * The caller should not send the email if duplicate is true.
 */
export async function createEmailLog(params: LogEmailParams): Promise<LogEmailResult> {
  const adminClient = getAdminClient();

  const insertData: Record<string, unknown> = {
    recipient:        params.recipient,
    template:         params.template,
    template_version: params.templateVersion,
    category:         params.category,
    subject:          params.subject,
    status:           'pending',
    last_attempt_at:  new Date().toISOString(),
    metadata:         params.metadata ?? {},
  };

  if (params.idempotencyKey) insertData.idempotency_key = params.idempotencyKey;
  if (params.relatedUserId)  insertData.related_user_id = params.relatedUserId;
  if (params.relatedOrderId) insertData.related_order_id = params.relatedOrderId;
  if (params.relatedTicketId) insertData.related_ticket_id = params.relatedTicketId;

  const { data, error } = await adminClient
    .from('email_logs')
    .insert(insertData)
    .select('id')
    .single();

  if (error) {
    // PostgreSQL UNIQUE violation code: 23505
    if (error.code === '23505') {
      console.log(`[email/logger] Duplicate prevented by idempotency key: ${params.idempotencyKey}`);
      return { logId: null, duplicate: true };
    }
    console.error('[email/logger] Failed to create email log:', error.message);
    // Non-fatal — proceed with sending even if logging fails
    return { logId: null, duplicate: false };
  }

  return { logId: data?.id ?? null, duplicate: false };
}

/**
 * Update an existing log entry after the send attempt.
 */
export async function updateEmailLog(params: UpdateLogParams): Promise<void> {
  if (!params.logId) return;

  const adminClient = getAdminClient();
  const updateData: Record<string, unknown> = {
    status: params.status,
  };

  if (params.resendEmailId) updateData.resend_email_id = params.resendEmailId;
  if (params.errorMessage)  updateData.error_message   = params.errorMessage;
  if (params.sentAt)        updateData.sent_at          = params.sentAt;
  if (params.status === 'failed') updateData.failed_at = new Date().toISOString();

  const { error } = await adminClient
    .from('email_logs')
    .update(updateData)
    .eq('id', params.logId);

  if (error) {
    console.error('[email/logger] Failed to update email log:', error.message);
  }
}

/**
 * Update email log status via Resend webhook (by resend_email_id).
 */
export async function updateEmailLogByResendId(
  resendEmailId: string,
  update: {
    status: string;
    deliveredAt?: string;
    openedAt?: string;
    clickedAt?: string;
    bouncedAt?: string;
    failedAt?: string;
  }
): Promise<void> {
  const adminClient = getAdminClient();
  const updateData: Record<string, unknown> = { status: update.status };

  if (update.deliveredAt) updateData.delivered_at = update.deliveredAt;
  if (update.openedAt)    updateData.opened_at    = update.openedAt;
  if (update.clickedAt)   updateData.clicked_at   = update.clickedAt;
  if (update.bouncedAt || update.failedAt) updateData.failed_at = update.bouncedAt || update.failedAt;

  const { error } = await adminClient
    .from('email_logs')
    .update(updateData)
    .eq('resend_email_id', resendEmailId);

  if (error) {
    console.error('[email/logger] Failed to update log by resend_email_id:', error.message);
  }
}

/**
 * Increment retry count on failure.
 */
export async function incrementRetryCount(logId: string, nextRetryAt?: string): Promise<void> {
  if (!logId) return;
  const adminClient = getAdminClient();
  const { error } = await adminClient.rpc('increment_email_retry', {
    p_log_id: logId,
    p_next_retry_at: nextRetryAt ?? null,
  });
  if (error) {
    // RPC might not exist yet — fall back to manual update
    await adminClient
      .from('email_logs')
      .update({
        retry_count: adminClient.rpc('email_retry_count_plus_one'),
        next_retry_at: nextRetryAt ?? null,
        last_attempt_at: new Date().toISOString(),
      })
      .eq('id', logId);
  }
}
