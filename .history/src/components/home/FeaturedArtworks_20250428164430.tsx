
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Price } from "@/components/shared/Price";

const ArtworkCard = ({ artwork, index }) => {
  return (
    <Link 
      to={`/artworks/${artwork.slug || artwork.id}`} 
      className="artwork-card card-hover" 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="artwork-image">
        <img 
          src={artwork.image_url || "/placeholder.svg"}
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
            View Details
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
  const { data: artworks, isLoading } = useQuery({
    queryKey: ["featured-artworks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select(`
          *,
          artist:artists!artworks_artist_id_fkey (
            id,
            name,
            specialty
          )
        `)
        .limit(6);
      
      if (error) throw error;
      return data;
    }
  });

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
                artist_name: artwork.artist?.name || artwork.artist?.specialty || 'Unknown Artist'
              }} 
              index={index} 
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild className="bg-brand-blue hover:bg-brand-blue/90 group">
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
