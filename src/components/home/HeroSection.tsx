import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      />
      
      {/* Content */}
      <div className="container relative z-10 flex flex-col items-center text-center">
        <div className="mb-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-4 animate-fade-in text-white">
            FAMEUXARTE
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-gradient animate-fade-in delay-300">
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
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
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
