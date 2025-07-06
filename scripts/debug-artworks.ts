import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugArtworks() {
  console.log('🔍 Starting comprehensive artwork debugging...\n');

  try {
    // 1. Check total count of artworks
    console.log('📊 STEP 1: Checking total artwork count...');
    const { count: totalCount, error: countError } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting artworks:', countError);
      return;
    }

    console.log(`✅ Total artworks in database: ${totalCount}\n`);

    // 2. Check for artworks with missing required fields
    console.log('🔍 STEP 2: Checking for missing required fields...');
    
    const { data: missingImagePath, error: missingImageError } = await supabase
      .from('artworks')
      .select('id, title')
      .is('image_path', null);

    const { data: missingSlug, error: missingSlugError } = await supabase
      .from('artworks')
      .select('id, title')
      .is('slug', null);

    const { data: missingArtistId, error: missingArtistError } = await supabase
      .from('artworks')
      .select('id, title')
      .is('artist_id', null);

    const { data: missingPrice, error: missingPriceError } = await supabase
      .from('artworks')
      .select('id, title')
      .is('price', null);

    console.log(`📸 Artworks missing image_path: ${missingImagePath?.length || 0}`);
    if (missingImagePath?.length) {
      console.log('   IDs:', missingImagePath.map(a => a.id));
    }

    console.log(`🔗 Artworks missing slug: ${missingSlug?.length || 0}`);
    if (missingSlug?.length) {
      console.log('   IDs:', missingSlug.map(a => a.id));
    }

    console.log(`👨‍🎨 Artworks missing artist_id: ${missingArtistId?.length || 0}`);
    if (missingArtistId?.length) {
      console.log('   IDs:', missingArtistId.map(a => a.id));
    }

    console.log(`💰 Artworks missing price: ${missingPrice?.length || 0}`);
    if (missingPrice?.length) {
      console.log('   IDs:', missingPrice.map(a => a.id));
    }

    // 3. Check artist relationships
    console.log('\n👨‍🎨 STEP 3: Checking artist relationships...');
    
    const { data: artworksWithArtists, error: artistError } = await supabase
      .from('artworks')
      .select(`
        id,
        title,
        artist_id,
        artist:profiles!artworks_artist_id_fkey (
          id,
          full_name
        )
      `)
      .not('artist_id', 'is', null);

    if (artistError) {
      console.error('❌ Error checking artist relationships:', artistError);
    } else {
      const artworksWithoutArtistProfile = artworksWithArtists?.filter(a => !a.artist);
      console.log(`✅ Artworks with artist_id: ${artworksWithArtists?.length || 0}`);
      console.log(`⚠️  Artworks with artist_id but no profile: ${artworksWithoutArtistProfile?.length || 0}`);
      
      if (artworksWithoutArtistProfile?.length) {
        console.log('   Problematic artwork IDs:', artworksWithoutArtistProfile.map(a => a.id));
      }
    }

    // 4. Check for RLS policies
    console.log('\n🔒 STEP 4: Checking RLS policies...');
    
    // Try to fetch with different user contexts
    const { data: publicArtworks, error: publicError } = await supabase
      .from('artworks')
      .select('id, title')
      .limit(5);

    console.log(`✅ Public access (anon key): ${publicArtworks?.length || 0} artworks`);
    if (publicError) {
      console.error('❌ Public access error:', publicError);
    }

    // 5. Check for category filtering issues
    console.log('\n🏷️  STEP 5: Checking category distribution...');
    
    const { data: categories, error: categoryError } = await supabase
      .from('artworks')
      .select('category')
      .not('category', 'is', null);

    if (categoryError) {
      console.error('❌ Error checking categories:', categoryError);
    } else {
      const categoryCounts = categories?.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('📊 Category distribution:');
      Object.entries(categoryCounts || {}).forEach(([category, count]) => {
        console.log(`   ${category}: ${count}`);
      });

      // Check for "Uncategorized" artworks
      const { data: uncategorized, error: uncatError } = await supabase
        .from('artworks')
        .select('id, title')
        .eq('category', 'Uncategorized');

      console.log(`\n❓ Artworks with "Uncategorized" category: ${uncategorized?.length || 0}`);
      if (uncategorized?.length) {
        console.log('   IDs:', uncategorized.map(a => a.id));
      }
    }

    // 6. Test the exact query used in FeaturedArtworks
    console.log('\n🎯 STEP 6: Testing FeaturedArtworks query...');
    
    const { data: featuredArtworks, error: featuredError } = await supabase
      .from('artworks')
      .select(`
        id,
        title,
        price,
        category,
        description,
        image_path,
        slug,
        artist:profiles!artworks_artist_id_fkey (
          id,
          full_name
        )
      `)
      .limit(6);

    if (featuredError) {
      console.error('❌ FeaturedArtworks query error:', featuredError);
    } else {
      console.log(`✅ FeaturedArtworks query returned: ${featuredArtworks?.length || 0} artworks`);
      
      if (featuredArtworks?.length) {
        console.log('📋 Featured artworks:');
        featuredArtworks.forEach((artwork, index) => {
          console.log(`   ${index + 1}. ${artwork.title} (ID: ${artwork.id})`);
          console.log(`      Artist: ${artwork.artist?.full_name || 'Unknown'}`);
          console.log(`      Category: ${artwork.category || 'None'}`);
          console.log(`      Has image: ${!!artwork.image_path}`);
          console.log(`      Has slug: ${!!artwork.slug}`);
        });
      }
    }

    // 7. Check for any database constraints or triggers
    console.log('\n⚙️  STEP 7: Checking for potential database issues...');
    
    // Try to fetch all artworks without any joins
    const { data: allArtworks, error: allError } = await supabase
      .from('artworks')
      .select('*')
      .limit(10);

    if (allError) {
      console.error('❌ Error fetching all artworks:', allError);
    } else {
      console.log(`✅ Basic fetch works: ${allArtworks?.length || 0} artworks`);
    }

    // 8. Summary and recommendations
    console.log('\n📋 SUMMARY AND RECOMMENDATIONS:');
    console.log('=====================================');
    
    const issues = [];
    
    if (missingImagePath?.length) {
      issues.push(`- ${missingImagePath.length} artworks missing image_path`);
    }
    
    if (missingSlug?.length) {
      issues.push(`- ${missingSlug.length} artworks missing slug`);
    }
    
    if (missingArtistId?.length) {
      issues.push(`- ${missingArtistId.length} artworks missing artist_id`);
    }
    
    if (missingPrice?.length) {
      issues.push(`- ${missingPrice.length} artworks missing price`);
    }
    
    if (artworksWithoutArtistProfile?.length) {
      issues.push(`- ${artworksWithoutArtistProfile.length} artworks have artist_id but no matching profile`);
    }
    
    if (uncategorized?.length) {
      issues.push(`- ${uncategorized.length} artworks are categorized as "Uncategorized"`);
    }
    
    if (issues.length === 0) {
      console.log('✅ No obvious issues found!');
      console.log('💡 If artworks are still not showing, check:');
      console.log('   - Browser console for JavaScript errors');
      console.log('   - Network tab for failed requests');
      console.log('   - Supabase dashboard for RLS policies');
    } else {
      console.log('⚠️  Issues found:');
      issues.forEach(issue => console.log(issue));
      
      console.log('\n🔧 Recommended fixes:');
      console.log('1. Update missing image_path values');
      console.log('2. Generate slugs for artworks without them');
      console.log('3. Assign artist_id to artworks missing it');
      console.log('4. Create profile records for missing artists');
      console.log('5. Update "Uncategorized" artworks with proper categories');
    }

  } catch (error) {
    console.error('❌ Unexpected error during debugging:', error);
  }
}

// Run the debugging
debugArtworks().then(() => {
  console.log('\n🎉 Debugging completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debugging failed:', error);
  process.exit(1);
}); 