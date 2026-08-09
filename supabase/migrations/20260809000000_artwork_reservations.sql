/* Migration: Artwork Reservations */

-- Add reserved_until column to artworks table
ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS reserved_until timestamptz;

-- Function to release expired reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE artworks
    SET 
        status = 'available',
        reserved_until = NULL
    WHERE 
        status = 'reserved' 
        AND reserved_until IS NOT NULL 
        AND reserved_until < NOW();
END;
$$;

-- Create pg_cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run every 5 minutes
-- Note: pg_cron execution requires the database to support it. If it fails on local, it's fine,
-- we can still call it manually or from an edge function if needed.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        -- Run every 5 minutes
        PERFORM cron.schedule(
            'release_expired_reservations_job',
            '*/5 * * * *',
            'SELECT release_expired_reservations()'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if cron scheduling fails (e.g., due to permissions)
        RAISE NOTICE 'Failed to schedule pg_cron job: %', SQLERRM;
END $$;
