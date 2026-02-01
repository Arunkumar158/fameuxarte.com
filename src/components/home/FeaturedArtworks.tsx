import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Price } from "@/components/shared/Price";
import { useArtworkImage } from "@/hooks/useArtworkImage";

const ArtworkCard = ({ artwork, index }) => {
  const { imageUrl } = useArtworkImage(artwork.image_path);
  
  return (
    <Link 
      to={`/artworks/${artwork.slug || artwork.id}`} 
      className="artwork-card card-hover" 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="artwork-image">
        <img 
          src={imageUrl}
          alt={`${artwork.title} - ${artwork.category || 'Artwork'} by ${artwork.artist_name}`}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
          <Button 
            variant="outline" 
            size="sm"
            className="text-white border-white hover:bg-white/20 w-full"
          >
            View Artwork Details
          </Button>
        </div>
      </div>
      <div className="artwork-details">
        <h3 className="font-heading font-semibold text-lg">{artwork.title}</h3>
        <p className="text-sm text-muted-foreground">{artwork.artist_name}</p>
        <div className="font-medium mt-1">
          <Price amount={artwork.price} />
        </div>
        {artwork.category && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs bg-brand-red/20 text-brand-red rounded">
              {artwork.category}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

const FeaturedArtworks = () => {
  const { data: artworks, isLoading, error } = useQuery({
    queryKey: ["featured-artworks"],
    queryFn: async () => {
      console.log("🔍 Fetching featured artworks...");
      
      // First, let's check how many total artworks exist
      const { count: totalCount, error: countError } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true });
      
      if (countError) {
        console.error("❌ Error counting total artworks:", countError);
      } else {
        console.log(`📊 Total artworks in database: ${totalCount}`);
      }

      // Check for artworks with missing required fields
      const { data: missingFields, error: missingError } = await supabase
        .from("artworks")
        .select("id, title, image_path, slug, artist_id")
        .or("image_path.is.null,slug.is.null,artist_id.is.null");
      
      if (missingError) {
        console.error("❌ Error checking missing fields:", missingError);
      } else if (missingFields?.length) {
        console.log(`⚠️  Found ${missingFields.length} artworks with missing fields:`, missingFields);
      }

      // Now fetch the featured artworks with correct relationship
      const { data, error } = await supabase
        .from("artworks")
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
      
      if (error) {
        console.error("❌ Error fetching featured artworks:", error);
        throw error;
      }
      
      console.log(`✅ Successfully fetched ${data?.length || 0} featured artworks:`, data);
      
      // Log any artworks with missing artist information
      if (data) {
        const artworksWithoutArtist = data.filter(artwork => !artwork.artist);
        if (artworksWithoutArtist.length > 0) {
          console.log(`⚠️  ${artworksWithoutArtist.length} artworks without artist info:`, artworksWithoutArtist);
        }
      }
      
      return data;
    }
  });

  // Log any query errors
  if (error) {
    console.error("❌ Featured artworks query error:", error);
  }

  if (isLoading) {
    return (
      <section id="featured-section" className="section-padding bg-black/80">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
              Featured <span className="text-gradient">Artworks</span>
            </h2>
            <p className="text-lg text-gray-300">Loading featured artworks...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!artworks?.length) {
    return (
      <section id="featured-section" className="section-padding bg-black/80">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
              Featured <span className="text-gradient">Artworks</span>
            </h2>
            <p className="text-lg text-gray-300">No artworks available at the moment.</p>
            {error && (
              <p className="text-sm text-red-400 mt-2">
                Error: {error.message}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-section" className="section-padding bg-black/80">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
            Featured <span className="text-gradient">Artworks</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-brand-red to-brand-blue mx-auto mb-6"></div>
          <p className="text-lg max-w-2xl mx-auto text-gray-300 animate-slide-up delay-100">
            Discover our curated selection of exceptional pieces that represent the pinnacle of contemporary artistic expression
          </p>
        </div>

        <div className="gallery-grid mt-12 animate-slide-up delay-200">
          {artworks?.map((artwork, index) => (
            <ArtworkCard 
              key={artwork.id} 
              artwork={{
                ...artwork,
                artist_name: artwork.artist?.full_name || 'Unknown Artist'
              }} 
              index={index} 
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild className="bg-brand-blue hover:bg-brand-blue/90 group rounded-lg">
            <Link to="/artworks" className="flex items-center gap-2">
              View All Artworks
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtworks;
