-- Artist follows table
-- Allows collectors to follow artists; followed artists appear on /collector/following

CREATE TABLE IF NOT EXISTS public.artist_follows (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT artist_follows_unique UNIQUE (follower_id, artist_id)
);

-- Row-level security
ALTER TABLE public.artist_follows ENABLE ROW LEVEL SECURITY;

-- Collectors can insert/delete their own follows
CREATE POLICY "Users can manage their own follows"
  ON public.artist_follows
  FOR ALL
  USING  (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- Anyone (incl. anonymous) can read follows (for counts, etc.)
CREATE POLICY "Anyone can read follows"
  ON public.artist_follows
  FOR SELECT
  USING (true);

-- Index for fast lookup of "who does this user follow"
CREATE INDEX IF NOT EXISTS idx_artist_follows_follower ON public.artist_follows (follower_id);

-- Index for fast lookup of "how many followers does this artist have"
CREATE INDEX IF NOT EXISTS idx_artist_follows_artist ON public.artist_follows (artist_id);
