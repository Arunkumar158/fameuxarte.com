# Artwork Fetching Debug Guide

This guide explains the issues found with artwork fetching and provides tools to debug and fix them.

## Issues Identified

### 1. **Incorrect Database Relationship** ✅ FIXED
- **Problem**: The `FeaturedArtworks` component was using `artists!artworks_artist_id_fkey` 
- **Solution**: Changed to `profiles!artworks_artist_id_fkey` 
- **Reason**: The `artworks` table's `artist_id` field references the `profiles` table, not the `artists` table

### 2. **Missing Artist Information** ⚠️ NEEDS VERIFICATION
- **Problem**: Some artworks may have `artist_id` values that don't exist in the `profiles` table
- **Impact**: These artworks won't show artist names and may be filtered out

### 3. **Missing Required Fields** ⚠️ NEEDS VERIFICATION
- **Problem**: Artworks may be missing `image_path`, `slug`, or other required fields
- **Impact**: These artworks may not display properly or may be excluded from queries

### 4. **RLS Policies** ⚠️ NEEDS VERIFICATION
- **Problem**: Row Level Security policies might be blocking access to artworks
- **Impact**: Artworks won't be visible even if they exist in the database

## Debugging Tools

### 1. Quick Test
```bash
npm run test-artwork-fetch
```
This runs a simple test to verify the basic artwork fetching functionality.

### 2. Comprehensive Debug
```bash
npm run debug-artworks
```
This runs a comprehensive analysis that checks:
- Total artwork count
- Missing required fields
- Artist relationship issues
- RLS policy problems
- Category distribution
- Database constraints

### 3. Slug Generation
```bash
npm run update-slugs
```
This generates slugs for artworks that don't have them.

## Database Schema Analysis

Based on the Supabase types, here's the correct relationship:

```sql
-- artworks table
artworks.artist_id -> profiles.id (via artworks_artist_id_fkey)

-- NOT
artworks.artist_id -> artists.id (this was the incorrect assumption)
```

## Fixed Query

**Before (Incorrect):**
```typescript
artist:artists!artworks_artist_id_fkey (
  id,
  name,
  specialty
)
```

**After (Correct):**
```typescript
artist:profiles!artworks_artist_id_fkey (
  id,
  full_name
)
```

## Common Issues and Solutions

### Issue 1: No Artworks Showing
**Possible Causes:**
1. No artworks in database
2. RLS policies blocking access
3. Missing required fields

**Debug Steps:**
1. Run `npm run debug-artworks`
2. Check browser console for errors
3. Verify Supabase dashboard for RLS policies

### Issue 2: Artworks Show But No Artist Names
**Possible Causes:**
1. Missing `artist_id` values
2. No corresponding records in `profiles` table
3. Incorrect relationship query

**Debug Steps:**
1. Check for artworks with null `artist_id`
2. Verify profiles table has corresponding records
3. Ensure using correct relationship query

### Issue 3: Some Artworks Missing
**Possible Causes:**
1. Missing `image_path` or `slug`
2. Category filtering (e.g., "Uncategorized" excluded)
3. RLS policies

**Debug Steps:**
1. Check for missing required fields
2. Verify category values
3. Test with different user contexts

## RLS Policy Check

To verify RLS policies, check your Supabase dashboard:

1. Go to Authentication > Policies
2. Look for `artworks` table policies
3. Ensure there's a policy allowing `SELECT` for `anon` role
4. Example policy:
```sql
CREATE POLICY "Allow public read access" ON artworks
FOR SELECT USING (true);
```

## Testing the Fix

1. **Run the test script:**
   ```bash
   npm run test-artwork-fetch
   ```

2. **Check the frontend:**
   - Open browser console
   - Navigate to the homepage
   - Look for the debugging logs in the FeaturedArtworks component

3. **Verify in Supabase dashboard:**
   - Check the `artworks` table
   - Verify `artist_id` values exist in `profiles` table
   - Check for any missing required fields

## Expected Behavior After Fix

- ✅ FeaturedArtworks component should show up to 6 artworks
- ✅ Each artwork should display title, artist name, price, and category
- ✅ Artist names should be properly displayed (not "Unknown Artist")
- ✅ No TypeScript errors in the console
- ✅ No database relationship errors

## Next Steps

1. Run the debugging tools to identify specific issues
2. Fix any missing data in the database
3. Update RLS policies if needed
4. Test the frontend to ensure artworks are displaying correctly

## Support

If you're still experiencing issues after running the debugging tools:

1. Check the console output from the debug scripts
2. Look at the browser console for any JavaScript errors
3. Verify your Supabase environment variables are correct
4. Check the Supabase dashboard for any recent changes to policies or data 