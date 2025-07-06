import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testArtworkFetch() {
  console.log('🧪 Testing artwork fetch functionality...\n');

  try {
    // Test 1: Basic fetch without joins
    console.log('📋 Test 1: Basic artwork fetch...');
    const { data: basicArtworks, error: basicError } = await supabase
      .from('artworks')
      .select('id, title, price, category')
      .limit(3);

    if (basicError) {
      console.error('❌ Basic fetch failed:', basicError);
      return;
    }

    console.log(`✅ Basic fetch successful: ${basicArtworks?.length || 0} artworks`);
    basicArtworks?.forEach((artwork, index) => {
      console.log(`   ${index + 1}. ${artwork.title} - $${artwork.price} (${artwork.category || 'No category'})`);
    });

    // Test 2: Fetch with artist relationship (the fixed query)
    console.log('\n👨‍🎨 Test 2: Fetch with artist relationship...');
    const { data: artworksWithArtists, error: artistError } = await supabase
      .from('artworks')
      .select(`
        id,
        title,
        price,
        category,
        image_path,
        slug,
        artist:profiles!artworks_artist_id_fkey (
          id,
          full_name
        )
      `)
      .limit(3);

    if (artistError) {
      console.error('❌ Artist relationship fetch failed:', artistError);
      return;
    }

    console.log(`✅ Artist relationship fetch successful: ${artworksWithArtists?.length || 0} artworks`);
    artworksWithArtists?.forEach((artwork, index) => {
      console.log(`   ${index + 1}. ${artwork.title}`);
      console.log(`      Artist: ${artwork.artist?.full_name || 'Unknown'}`);
      console.log(`      Price: $${artwork.price}`);
      console.log(`      Category: ${artwork.category || 'None'}`);
      console.log(`      Has image: ${!!artwork.image_path}`);
      console.log(`      Has slug: ${!!artwork.slug}`);
    });

    // Test 3: Test the exact FeaturedArtworks query
    console.log('\n⭐ Test 3: FeaturedArtworks query...');
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
      console.error('❌ FeaturedArtworks query failed:', featuredError);
      return;
    }

    console.log(`✅ FeaturedArtworks query successful: ${featuredArtworks?.length || 0} artworks`);
    
    if (featuredArtworks?.length === 0) {
      console.log('⚠️  No artworks returned - this might indicate:');
      console.log('   - No artworks in the database');
      console.log('   - RLS policies blocking access');
      console.log('   - Missing required fields');
    } else {
      console.log('🎉 FeaturedArtworks query is working correctly!');
    }

    // Test 4: Check for any artworks with missing artist profiles
    console.log('\n🔍 Test 4: Checking for missing artist profiles...');
    const artworksWithoutArtist = featuredArtworks?.filter(a => !a.artist) || [];
    
    if (artworksWithoutArtist.length > 0) {
      console.log(`⚠️  Found ${artworksWithoutArtist.length} artworks without artist profiles:`);
      artworksWithoutArtist.forEach(artwork => {
        console.log(`   - ${artwork.title} (ID: ${artwork.id})`);
      });
    } else {
      console.log('✅ All artworks have valid artist profiles');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`- Total artworks tested: ${featuredArtworks?.length || 0}`);
    console.log(`- Artworks with valid artist info: ${featuredArtworks?.filter(a => a.artist).length || 0}`);
    console.log(`- Artworks missing artist info: ${artworksWithoutArtist.length}`);
    
    if (featuredArtworks?.length === 0) {
      console.log('\n💡 Recommendations:');
      console.log('1. Check if there are artworks in the database');
      console.log('2. Verify RLS policies allow public read access');
      console.log('3. Ensure artworks have valid artist_id values');
      console.log('4. Check that profiles table has corresponding records');
    }

  } catch (error) {
    console.error('❌ Test failed with unexpected error:', error);
  }
}

// Run the test
testArtworkFetch().then(() => {
  console.log('\n✅ Testing completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Testing failed:', error);
  process.exit(1);
}); 