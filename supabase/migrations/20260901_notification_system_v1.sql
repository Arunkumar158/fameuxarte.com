-- =============================================================
-- Migration: Notification System V1
-- Safe to run whether or not the notifications table already exists.
-- If the table is missing, it creates it with all V1 columns.
-- If the table exists, it adds only the new columns (additive).
-- =============================================================

-- 1. Create notifications table if it does not already exist
--    (includes all original columns + the V1 additions in one shot)
CREATE TABLE IF NOT EXISTS public.notifications (
    id          uuid         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title       text         NOT NULL,
    message     text         NOT NULL,
    type        text         NOT NULL,
    read        boolean      NOT NULL DEFAULT false,
    read_at     timestamptz,
    priority    text         NOT NULL DEFAULT 'normal'
                             CHECK (priority IN ('normal', 'important', 'urgent')),
    metadata    jsonb        DEFAULT '{}'::jsonb,
    created_at  timestamptz  NOT NULL DEFAULT now()
);

-- 2. If the table already existed, safely add the new V1 columns
--    ADD COLUMN IF NOT EXISTS is idempotent — safe to run multiple times.
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS read_at  timestamptz;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal';

-- Add CHECK constraint for priority only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.notifications'::regclass
      AND conname  = 'notifications_priority_check'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_priority_check
      CHECK (priority IN ('normal', 'important', 'urgent'));
  END IF;
END $$;

-- 3. Enable RLS (idempotent)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (drop-and-recreate for idempotency)

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (read-state only; trigger enforces limits)
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Authenticated users can insert notifications (required for client-side sendNotification())
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Admins have full access
DROP POLICY IF EXISTS "Admins have full access to notifications" ON public.notifications;
CREATE POLICY "Admins have full access to notifications"
ON public.notifications TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON public.notifications(user_id, read);

-- 6. Trigger: protect immutable fields on UPDATE
--    Prevents regular users from changing user_id, title, message, type, metadata, priority.
--    Auto-stamps read_at when read flips from false → true.
CREATE OR REPLACE FUNCTION public.protect_notification_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Service role (auth.uid() IS NULL) can update anything
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admins can update anything
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  -- Regular users: block changes to immutable fields
  IF NEW.user_id   IS DISTINCT FROM OLD.user_id   OR
     NEW.title     IS DISTINCT FROM OLD.title     OR
     NEW.message   IS DISTINCT FROM OLD.message   OR
     NEW.type      IS DISTINCT FROM OLD.type      OR
     NEW.metadata  IS DISTINCT FROM OLD.metadata  OR
     NEW.priority  IS DISTINCT FROM OLD.priority
  THEN
    RAISE EXCEPTION 'You may only update read status on notifications.';
  END IF;

  -- Auto-stamp read_at when marking as read
  IF NEW.read = true AND OLD.read = false THEN
    NEW.read_at = now();
  END IF;

  -- Clear read_at if un-marking (edge case)
  IF NEW.read = false AND OLD.read = true THEN
    NEW.read_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_notification_immutability ON public.notifications;

CREATE TRIGGER enforce_notification_immutability
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.protect_notification_fields();
