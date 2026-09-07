/**
 * resend-webhook/index.ts
 * Fameuxarte Resend Webhook Handler
 *
 * Receives delivery events from Resend (sent, delivered, bounced, etc.)
 * and updates the corresponding email_logs record.
 *
 * Security:
 *   - verify_jwt = false (public endpoint — Resend doesn't send JWTs)
 *   - Resend HMAC-SHA256 signature verification using RESEND_WEBHOOK_SECRET
 *   - Idempotent — repeated events for the same resend_email_id are safe
 *
 * IMPORTANT: Never base business logic on email opens or clicks.
 * This function only updates email_logs status for observability.
 *
 * Configuration:
 *   In supabase/config.toml: verify_jwt = false
 *   In Supabase secrets: RESEND_WEBHOOK_SECRET = <from Resend dashboard>
 *   In Resend: Webhook URL → https://<project>.supabase.co/functions/v1/resend-webhook
 *   Events to enable: email.sent, email.delivered, email.bounced, email.complained, email.failed
 */

// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

import type { ResendWebhookEvent } from '../_shared/email/types.ts';
import { updateEmailLogByResendId } from '../_shared/email/logger.ts';

declare const Deno: { env: { get(k: string): string | undefined } };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'svix-id, svix-timestamp, svix-signature, content-type',
};

// ---------------------------------------------------------------------------
// HMAC-SHA256 Signature Verification
// Resend uses Svix for webhook delivery. Headers: svix-id, svix-timestamp, svix-signature
// Signature format: "v1,<base64(hmac-sha256(secret, `${svix-id}.${svix-timestamp}.${body}`)>)"
// ---------------------------------------------------------------------------

async function verifyResendSignature(
  req: Request,
  body: string
): Promise<boolean> {
  const secret = Deno.env.get('RESEND_WEBHOOK_SECRET');
  if (!secret) {
    // If no secret configured, skip verification (not recommended for production)
    console.warn('[resend-webhook] RESEND_WEBHOOK_SECRET not set — skipping signature verification');
    return true;
  }

  const svixId        = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('[resend-webhook] Missing Svix headers');
    return false;
  }

  // Reject timestamps older than 5 minutes (replay attack protection)
  const ts = parseInt(svixTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) {
    console.error('[resend-webhook] Timestamp too old — possible replay attack');
    return false;
  }

  try {
    // Svix secret is prefixed with "whsec_" — strip it for raw bytes
    const rawSecret = secret.startsWith('whsec_')
      ? atob(secret.slice(6))
      : secret;

    const msgToSign = `${svixId}.${svixTimestamp}.${body}`;
    const enc       = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(rawSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msgToSign));
    const computedSig = `v1,${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;

    // svix-signature may contain multiple space-separated values (v1,<sig> v1,<sig>)
    const signatures = svixSignature.split(' ');
    return signatures.includes(computedSig);

  } catch (err) {
    console.error('[resend-webhook] Signature verification error:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Event → Status mapping
// ---------------------------------------------------------------------------

function eventToStatus(eventType: string): string {
  const map: Record<string, string> = {
    'email.sent':              'sent',
    'email.delivered':         'delivered',
    'email.delivery_delayed':  'sent',      // Still in-flight
    'email.bounced':           'bounced',
    'email.complained':        'complained',
    'email.opened':            'delivered', // Opened implies delivered
    'email.clicked':           'delivered', // Clicked implies delivered
  };
  return map[eventType] ?? 'sent';
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let bodyText: string;
  try {
    bodyText = await req.text();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // ── Verify Resend signature ─────────────────────────────────────────────
  const valid = await verifyResendSignature(req, bodyText);
  if (!valid) {
    console.error('[resend-webhook] Signature verification FAILED — rejecting request');
    return new Response('Unauthorized', { status: 401 });
  }

  // ── Parse event ─────────────────────────────────────────────────────────
  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(bodyText);
  } catch {
    console.error('[resend-webhook] Invalid JSON body');
    return new Response('Bad Request', { status: 400 });
  }

  const { type: eventType, data, created_at } = event;
  const emailId = data?.email_id;

  if (!emailId) {
    console.warn('[resend-webhook] No email_id in event data — ignoring');
    return new Response('OK', { status: 200 });
  }

  console.log(`[resend-webhook] Received: ${eventType} for email_id: ${emailId}`);

  // ── Update email_logs ────────────────────────────────────────────────────
  const status = eventToStatus(eventType);
  const now    = created_at ?? new Date().toISOString();

  try {
    await updateEmailLogByResendId(emailId, {
      status,
      deliveredAt: eventType === 'email.delivered' || eventType === 'email.opened' || eventType === 'email.clicked' ? now : undefined,
      openedAt:    eventType === 'email.opened'  ? now : undefined,
      clickedAt:   eventType === 'email.clicked' ? now : undefined,
      bouncedAt:   eventType === 'email.bounced' ? now : undefined,
      failedAt:    eventType === 'email.bounced' || eventType === 'email.complained' ? now : undefined,
    });
  } catch (err) {
    // Log failure but return 200 to prevent Resend from retrying indefinitely
    console.error('[resend-webhook] Failed to update email log:', err);
  }

  // ── Always return 200 to Resend ──────────────────────────────────────────
  // Non-200 causes Resend to retry the webhook. Only return non-200 for
  // authentication failures (already done above).
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
});
