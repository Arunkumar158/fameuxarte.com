# Artwork Slug Update Guide

This guide explains how to check and update artwork slugs in the Supabase database.

## Overview

The application uses SEO-friendly slugs for artwork URLs (e.g., `/artworks/sunset-mountain` instead of `/artworks/123`). This script checks the database for artworks without slugs and generates them from the artwork titles.

## Prerequisites

1. Make sure you have the Supabase environment variables set up in your `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

## Running the Slug Update Script

### Option 1: Using npm script
```bash
npm run update-slugs
```

### Option 2: Direct execution
```bash
npx tsx scripts/update-artwork-slugs.ts
```

## What the Script Does

1. **Fetches all artworks** from the database
2. **Identifies artworks without slugs** 
3. **Generates unique slugs** from artwork titles using the following rules:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters
   - Ensure uniqueness by appending numbers if needed
4. **Updates the database** with the new slugs
5. **Verifies the updates** to ensure all artworks now have slugs

## Slug Generation Examples

- "Sunset Mountain" → "sunset-mountain"
- "Abstract Harmony #1" → "abstract-harmony-1"
- "Urban Dreams!" → "urban-dreams"
- "Nature's Whisper" → "natures-whisper"

## Database Schema

The `artworks` table should have a `slug` column:
```sql
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  -- other fields...
);
```

## Application Integration

The application is configured to:

1. **Use slugs in URLs**: `/artworks/:slug` route
2. **Fallback to IDs**: If no slug exists, falls back to using the artwork ID
3. **Generate canonical URLs**: Uses slug when available, ID as fallback

## Components Updated

The following components have been updated to properly handle slugs:

- `ArtworkDetails.tsx` - Handles both slug and ID parameters
- `ArtworkCard.tsx` - Uses slug in links when available
- `ArtworkGrid.tsx` - Fetches and passes slug data
- `ArtworkSlider.tsx` - Uses slug in links
- `FeaturedArtworks.tsx` - Uses slug in links
- `LikedItems.tsx` - Passes slug to ArtworkCard
- `Account.tsx` - Passes slug to ArtworkCard
- `Collections.tsx` - Fetches and passes slug data

## Troubleshooting

### Script fails to run
- Check that environment variables are set correctly
- Ensure you have network access to Supabase
- Verify that the `artworks` table exists and has a `slug` column

### Duplicate slugs
- The script automatically handles duplicates by appending numbers
- If you encounter issues, check the database for any constraint violations

### Links not working
- Ensure the routing is set up correctly in `App.tsx`
- Check that the `useParams` hook is extracting the slug parameter
- Verify that the Supabase query is using the correct field for lookup

## Manual Database Check

You can also manually check the database:

```sql
-- Check artworks without slugs
SELECT id, title FROM artworks WHERE slug IS NULL;

-- Check for duplicate slugs
SELECT slug, COUNT(*) FROM artworks WHERE slug IS NOT NULL GROUP BY slug HAVING COUNT(*) > 1;

-- View all artworks with their slugs
SELECT id, title, slug FROM artworks ORDER BY created_at;
``` 