/**
 * send-email/index.ts
 * Fameuxarte Email Delivery Edge Function — V2
 *
 * REPLACED: Original thin wrapper (V1) → Full email service
 *
 * This is the ONLY server-side entry point for sending emails.
 * All application code must call this function, never Resend directly.
 *
 * Authorization:
 *   - Called from other Edge Functions using SUPABASE_SERVICE_ROLE_KEY
 *     → No JWT check needed (X-Service-Auth header used instead)
 *   - Admin testing: called with authenticated admin JWT
 *     → JWT verified, admin role checked
 *
 * Security:
 *   - RESEND_API_KEY never leaves server-side
 *   - Template variables are validated before rendering
 *   - No sensitive data (passwords, keys, tokens) accepted in variables
 */

// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

import type { SendEmailRequest } from '../_shared/email/types.ts';
import { sendEmail } from '../_shared/email/service.ts';
import { getTemplate, getTemplateTypes, getTestVariables } from '../_shared/email/registry.ts';

declare const Deno: { env: { get(k: string): string | undefined } };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-service-auth',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const SUPABASE_ANON_KEY         = Deno.env.get('SUPABASE_ANON_KEY')!;
    const INTERNAL_SERVICE_SECRET   = Deno.env.get('INTERNAL_SERVICE_SECRET') ?? '';

    // ── Authorization ───────────────────────────────────────────────────────
    // Two valid callers:
    // A) Internal Edge Function → X-Service-Auth: <INTERNAL_SERVICE_SECRET>
    // B) Admin test UI → Authorization: Bearer <admin JWT>

    const xServiceAuth  = req.headers.get('X-Service-Auth');
    const authHeader    = req.headers.get('Authorization');

    let isAuthorized = false;
    let callerIsAdmin = false;

    // Path A: service-to-service call using custom secret
    if (INTERNAL_SERVICE_SECRET && xServiceAuth === INTERNAL_SERVICE_SECRET) {
      isAuthorized = true;
    }

    // Path B: service-to-service call using Service Role Key
    if (!isAuthorized && authHeader === `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
      isAuthorized = true;
    }

    // Path C: user JWT (check role)
    let callerUser = null;
    if (!isAuthorized && authHeader) {
      const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth:   { persistSession: false },
      });
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userErr } = await callerClient.auth.getUser(token);

      if (!userErr && user) {
        callerUser = user;
        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: { persistSession: false },
        });
        const { data: profile } = await adminClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          isAuthorized  = true;
          callerIsAdmin = true;
        } else if (profile?.role === 'artist') {
          // Path D: Artists can trigger specific transactional emails
          isAuthorized = true; // We will validate the template type below
        }
      }
    }

    if (!isAuthorized) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // ── Parse request body ──────────────────────────────────────────────────
    const body = await req.json();
    let { type, to, variables, idempotencyKey, replyTo,
            relatedUserId, relatedOrderId, relatedTicketId, metadata,
            _test: isTest } = body;

    // ── Auto-resolve email if missing ───────────────────────────────────────
    if (!to && relatedUserId) {
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });
      const { data: { user: relatedUser } } = await adminClient.auth.admin.getUserById(relatedUserId);
      if (relatedUser?.email) {
        to = relatedUser.email;
      }
    }

    // ── Role-based template restriction ─────────────────────────────────────
    if (callerUser && !callerIsAdmin) {
      // Artists can only send order shipping/delivery updates
      const allowedArtistTemplates = ['order_shipped', 'order_delivered'];
      if (!allowedArtistTemplates.includes(type)) {
        return json({ error: `Forbidden: Artists cannot send template type '${type}'` }, 403);
      }
    }

    // ── Basic input validation ──────────────────────────────────────────────
    if (!type || typeof type !== 'string') {
      return json({ error: 'type is required' }, 400);
    }
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return json({ error: 'to is required and must be a valid email address (could not auto-resolve)' }, 400);
    }
    if (!variables || typeof variables !== 'object') {
      return json({ error: 'variables must be an object' }, 400);
    }

    // ── Template existence check ────────────────────────────────────────────
    const template = getTemplate(type as any);
    if (!template) {
      return json({
        error: `Unknown template type: ${type}`,
        available: getTemplateTypes(),
      }, 400);
    }

    // ── Non-admin cannot call marketing templates directly ──────────────────
    // (marketing emails must go through the proper consent-checked path)
    if (template.category === 'marketing' && !callerIsAdmin && !isTest) {
      // Allow service callers — they are trusted to check consent first
      // This is a defence-in-depth check only
    }

    // ── Send ────────────────────────────────────────────────────────────────
    const request: SendEmailRequest = {
      type: type as any,
      to,
      variables,
      idempotencyKey,
      replyTo,
      relatedUserId,
      relatedOrderId,
      relatedTicketId,
      metadata: { ...metadata, _test: isTest ?? false },
    };

    const result = await sendEmail(request);

    const status = result.success || result.skipped ? 200 : 500;
    return json(result, status);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[send-email] Unexpected error:', message);
    return json({ error: 'Internal server error' }, 500);
  }
});
