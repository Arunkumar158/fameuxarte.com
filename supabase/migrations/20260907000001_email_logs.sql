-- =============================================================
-- Migration: Email Logs
-- Fameuxarte Email Delivery System — V1
--
-- Tracks every outbound email attempt. The idempotency_key
-- UNIQUE constraint is the primary concurrency-safe duplicate
-- prevention mechanism — no application-level check/send/insert
-- race condition possible.
-- =============================================================

-- 1. Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Duplicate prevention (concurrency-safe via UNIQUE constraint)
    idempotency_key     text         UNIQUE,

    -- Recipient / content
    recipient           text         NOT NULL,
    template            text         NOT NULL,
    template_version    text         NOT NULL DEFAULT '1.0',
    category            text         NOT NULL CHECK (category IN ('transactional', 'marketing')),
    subject             text         NOT NULL,

    -- Delivery status (updated by Resend webhooks)
    status              text         NOT NULL DEFAULT 'pending'
                                     CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'cancelled')),

    -- Provider correlation
    provider            text         NOT NULL DEFAULT 'resend',
    resend_email_id     text,        -- Resend's email ID — used to correlate webhooks

    -- Relational context (for admin log filtering)
    related_user_id     uuid         REFERENCES public.profiles(id) ON DELETE SET NULL,
    related_order_id    uuid         REFERENCES public.orders(id) ON DELETE SET NULL,
    related_ticket_id   uuid         REFERENCES public.support_tickets(id) ON DELETE SET NULL,

    -- Error / retry tracking
    error_message       text,
    retry_count         integer      NOT NULL DEFAULT 0,
    last_attempt_at     timestamptz,
    next_retry_at       timestamptz,

    -- Timestamps
    created_at          timestamptz  NOT NULL DEFAULT now(),
    sent_at             timestamptz,
    delivered_at        timestamptz,
    opened_at           timestamptz,
    clicked_at          timestamptz,
    failed_at           timestamptz,

    -- Additional context (non-sensitive)
    metadata            jsonb        DEFAULT '{}'::jsonb
);

-- 2. Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
--    - Normal users: NO access (email logs are operational data, not user-facing)
--    - Admins: full read access via service role or admin role
--    - Service role (Edge Functions): INSERT/UPDATE (bypasses RLS)

-- Admins can read all email logs
DROP POLICY IF EXISTS "Admins can read email logs" ON public.email_logs;
CREATE POLICY "Admins can read email logs"
ON public.email_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admins can update email logs (e.g. manual retry flags)
DROP POLICY IF EXISTS "Admins can update email logs" ON public.email_logs;
CREATE POLICY "Admins can update email logs"
ON public.email_logs FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Note: INSERT/DELETE is handled exclusively by Edge Functions using
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS entirely.
-- Normal users and admins cannot insert email log records directly.

-- 4. Performance indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient
    ON public.email_logs(recipient);

CREATE INDEX IF NOT EXISTS idx_email_logs_template
    ON public.email_logs(template);

CREATE INDEX IF NOT EXISTS idx_email_logs_status
    ON public.email_logs(status);

CREATE INDEX IF NOT EXISTS idx_email_logs_created_at
    ON public.email_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_logs_related_user_id
    ON public.email_logs(related_user_id)
    WHERE related_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_related_order_id
    ON public.email_logs(related_order_id)
    WHERE related_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_resend_email_id
    ON public.email_logs(resend_email_id)
    WHERE resend_email_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_next_retry_at
    ON public.email_logs(next_retry_at)
    WHERE status = 'failed' AND retry_count < 3;
