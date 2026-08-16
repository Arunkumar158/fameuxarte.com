-- 1. Add persistent search_vector column
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Create function to generate the search vector with weights
CREATE OR REPLACE FUNCTION generate_artwork_search_vector(
    v_title text,
    v_description text,
    v_medium text,
    v_style text,
    v_artist_name text
) RETURNS tsvector AS $$
BEGIN
    RETURN (
        setweight(to_tsvector('english', coalesce(v_title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(v_artist_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(v_medium, '') || ' ' || coalesce(v_style, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(v_description, '')), 'C')
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Trigger for Artworks table
CREATE OR REPLACE FUNCTION trg_update_artwork_search_vector() RETURNS trigger AS $$
DECLARE
    v_artist_name text;
BEGIN
    -- Fetch the artist name from profiles
    SELECT full_name INTO v_artist_name FROM profiles WHERE id = NEW.artist_id;
    
    NEW.search_vector := generate_artwork_search_vector(
        NEW.title,
        NEW.description,
        NEW.medium,
        NEW.style,
        v_artist_name
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_artworks_search_vector_update ON artworks;
CREATE TRIGGER trg_artworks_search_vector_update
BEFORE INSERT OR UPDATE OF title, description, medium, style, artist_id
ON artworks
FOR EACH ROW
EXECUTE FUNCTION trg_update_artwork_search_vector();

-- 4. Trigger for Profiles table (Sync artist name changes)
CREATE OR REPLACE FUNCTION trg_update_profile_search_vector() RETURNS trigger AS $$
BEGIN
    IF OLD.full_name IS DISTINCT FROM NEW.full_name THEN
        UPDATE artworks
        SET search_vector = generate_artwork_search_vector(
            title, description, medium, style, NEW.full_name
        )
        WHERE artist_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_search_vector_update ON profiles;
CREATE TRIGGER trg_profiles_search_vector_update
AFTER UPDATE OF full_name
ON profiles
FOR EACH ROW
EXECUTE FUNCTION trg_update_profile_search_vector();

-- 5. Backfill existing data
DO $$
DECLARE
    row record;
BEGIN
    FOR row IN SELECT id FROM artworks LOOP
        UPDATE artworks SET id = id WHERE id = row.id;
    END LOOP;
END;
$$;

-- 6. Create Indexes
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_medium ON artworks(medium);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_price ON artworks(price);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_search_vector ON artworks USING GIN(search_vector);

-- 7. Search RPC Function
CREATE OR REPLACE FUNCTION search_artworks(
    search_term text DEFAULT NULL,
    category_filter text DEFAULT NULL,
    medium_filter text DEFAULT NULL,
    style_filter text DEFAULT NULL,
    min_price numeric DEFAULT NULL,
    max_price numeric DEFAULT NULL,
    artist_filter uuid DEFAULT NULL,
    sort_by text DEFAULT 'newest',
    p_limit int DEFAULT 20,
    p_offset int DEFAULT 0
) RETURNS SETOF artworks 
SECURITY INVOKER -- Relies on RLS for data access security
AS $$
BEGIN
    RETURN QUERY
    SELECT a.*
    FROM artworks a
    WHERE 
        a.status = 'available'
        AND (category_filter IS NULL OR a.category = category_filter)
        AND (medium_filter IS NULL OR a.medium = medium_filter)
        AND (style_filter IS NULL OR a.style = style_filter)
        AND (artist_filter IS NULL OR a.artist_id = artist_filter)
        AND (min_price IS NULL OR a.price >= min_price)
        AND (max_price IS NULL OR a.price <= max_price)
        AND (
            search_term IS NULL 
            OR search_term = ''
            OR a.search_vector @@ websearch_to_tsquery('english', search_term)
        )
    ORDER BY
        CASE WHEN sort_by = 'price_asc' THEN a.price END ASC NULLS LAST,
        CASE WHEN sort_by = 'price_desc' THEN a.price END DESC NULLS LAST,
        CASE WHEN sort_by = 'relevance' AND search_term IS NOT NULL AND search_term <> '' THEN 
            ts_rank(a.search_vector, websearch_to_tsquery('english', search_term))
        END DESC NULLS LAST,
        a.created_at DESC,
        a.id DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
