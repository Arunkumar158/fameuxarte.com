-- =============================================================
-- Migration: Email Preferences
-- Fameuxarte Email Delivery System — V1
--
-- Minimal preference system. Transactional emails are always
-- sent regardless of preferences. Only marketing emails respect
-- the marketing_enabled flag.
--
-- Created lazily on first opt-out — no record = opted in (default).
-- =============================================================

-- 1. Create email_preferences table
CREATE TABLE IF NOT EXISTS public.email_preferences (
    user_id             uuid         PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Marketing consent (default: true — user opted in at registration)
    -- Transactional emails ignore this field and are always sent.
    marketing_enabled   boolean      NOT NULL DEFAULT true,

    updated_at          timestamptz  NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Users can read their own preferences
DROP POLICY IF EXISTS "Users can read own email preferences" ON public.email_preferences;
CREATE POLICY "Users can read own email preferences"
ON public.email_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own preferences (first opt-out creates the record)
DROP POLICY IF EXISTS "Users can insert own email preferences" ON public.email_preferences;
CREATE POLICY "Users can insert own email preferences"
ON public.email_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
DROP POLICY IF EXISTS "Users can update own email preferences" ON public.email_preferences;
CREATE POLICY "Users can update own email preferences"
ON public.email_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can read all preferences
DROP POLICY IF EXISTS "Admins can read email preferences" ON public.email_preferences;
CREATE POLICY "Admins can read email preferences"
ON public.email_preferences FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Performance index
CREATE INDEX IF NOT EXISTS idx_email_preferences_marketing
    ON public.email_preferences(user_id)
    WHERE marketing_enabled = false;

-- 5. Helper function: check if a user has marketing email enabled
--    Returns TRUE if the user has not opted out.
--    No record = opted in (default true).
CREATE OR REPLACE FUNCTION public.user_has_marketing_email_enabled(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT marketing_enabled FROM public.email_preferences WHERE user_id = p_user_id),
        true  -- Default: opted in
    );
$$;
