import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const ArtworkSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: 2, spacing: 20 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3, spacing: 30 },
      },
      "(min-width: 1280px)": {
        slides: { perView: 4, spacing: 30 },
      },
    },
    slides: { perView: 1, spacing: 20 },
    loop: true,
  });

  const { data: artworks, isLoading } = useQuery({
    queryKey: ["featured-artworks-slider"],
    queryFn: async () => {
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
        .not("category", "eq", "Uncategorized")
        .order("created_at", { ascending: false })
        .limit(12);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!artworks?.length) {
    return null;
  }

  return (
    <section className="py-12 bg-black/80">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
            Featured <span className="text-gradient">Artworks</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-brand-red to-brand-blue mx-auto mb-6"></div>
          <p className="text-lg max-w-2xl mx-auto text-gray-300 animate-slide-up delay-100">
            Discover our curated selection of exceptional pieces
          </p>
        </div>

        <div className="relative">
          <div ref={sliderRef} className="keen-slider">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="keen-slider__slide">
                <Link 
                  to={`/artworks/${artwork.slug || artwork.id}`}
                  className="group block relative overflow-hidden rounded-lg aspect-square"
                >
                  <img
                    src={artwork.image_path || "/placeholder.svg"}
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="text-white">
                      <h3 className="font-semibold text-lg">{artwork.title}</h3>
                      <p className="text-sm">{artwork.artist?.full_name || "Unknown Artist"}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {loaded && instanceRef.current && (
            <>
              <button
                onClick={() => instanceRef.current?.prev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Previous slide"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => instanceRef.current?.next()}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Next slide"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
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

export default ArtworkSlider; 