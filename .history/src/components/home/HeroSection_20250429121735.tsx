import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const { data: featuredArtwork } = useQuery({
    queryKey: ["featured-hero-artwork"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select(`
          id,
          title,
          "https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"
        `)
        .not("category", "eq", "Uncategorized")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-black/60"
        style={{
          backgroundImage: `url(${featuredArtwork?.["https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"] || "/placeholder.svg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(2px)",
          transform: "scale(1.1)",
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="container relative z-10 flex flex-col items-center text-center">
        <div className="mb-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-4 animate-fade-in text-white">
            FAMEUXARTE
          </h1>
          <p className="text-2xl md:text-3xl font-light text-gradient animate-fade-in delay-300">
            Art Gallery for the unseen artists
          </p>
        </div>
        
        <p className="mt-6 max-w-xl text-lg md:text-xl text-gray-200 animate-fade-in">
          VISION. INSPIRE.COLLECT
        </p>
        
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-brand-red hover:bg-brand-red/90 animate-slide-up group rounded-lg">
            <Link to="/artworks" className="flex items-center gap-2">
              Explore Artworks
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white/10 animate-slide-up delay-150 rounded-lg">
            <Link to="/artists">Meet the Artists</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
