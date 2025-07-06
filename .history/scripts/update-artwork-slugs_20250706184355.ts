import { createClient } from '@supabase/supabase-js';
import { generateUniqueSlug } from '../src/lib/utils';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Artwork {
  id: string;
  title: string;
  slug: string | null;
}

async function updateArtworkSlugs() {
  try {
    console.log('🔍 Checking for artworks without slugs...');

    // Fetch all artworks
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id, title, slug')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching artworks:', error);
      return;
    }

    if (!artworks || artworks.length === 0) {
      console.log('No artworks found in the database.');
      return;
    }

    console.log(`📊 Found ${artworks.length} total artworks`);

    // Find artworks without slugs
    const artworksWithoutSlugs = artworks.filter(artwork => !artwork.slug);
    const artworksWithSlugs = artworks.filter(artwork => artwork.slug);

    console.log(`❌ Found ${artworksWithoutSlugs.length} artworks without slugs`);
    console.log(`✅ Found ${artworksWithSlugs.length} artworks with existing slugs`);

    if (artworksWithoutSlugs.length === 0) {
      console.log('🎉 All artworks already have slugs!');
      return;
    }

    // Get existing slugs to avoid duplicates
    const existingSlugs = artworksWithSlugs.map(artwork => artwork.slug!);

    console.log('\n🔄 Generating slugs for artworks without slugs...');

    // Generate and update slugs
    const updates = [];
    for (const artwork of artworksWithoutSlugs) {
      const newSlug = generateUniqueSlug(artwork.title, existingSlugs);
      existingSlugs.push(newSlug); // Add to existing slugs to avoid duplicates in this batch

      updates.push({
        id: artwork.id,
        slug: newSlug,
        title: artwork.title
      });

      console.log(`  📝 "${artwork.title}" → "${newSlug}"`);
    }

    // Update the database
    console.log('\n💾 Updating database...');
    
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('artworks')
        .update({ slug: update.slug })
        .eq('id', update.id);

      if (updateError) {
        console.error(`❌ Error updating artwork "${update.title}":`, updateError);
      } else {
        console.log(`✅ Updated "${update.title}" with slug "${update.slug}"`);
      }
    }

    console.log('\n🎉 Slug update process completed!');

    // Verify the update
    console.log('\n🔍 Verifying updates...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('artworks')
      .select('id, title, slug')
      .is('slug', null);

    if (verifyError) {
      console.error('Error verifying updates:', verifyError);
      return;
    }

    if (verifyData && verifyData.length > 0) {
      console.log(`⚠️  Warning: ${verifyData.length} artworks still don't have slugs:`);
      verifyData.forEach(artwork => {
        console.log(`  - "${artwork.title}" (ID: ${artwork.id})`);
      });
    } else {
      console.log('✅ All artworks now have slugs!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
updateArtworkSlugs().then(() => {
  console.log('\n🏁 Script execution completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 