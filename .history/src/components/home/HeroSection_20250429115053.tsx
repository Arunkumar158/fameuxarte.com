import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-black/60">
        <div className="absolute inset-0 z-0" />
      </div>
      
      <div className="container relative z-10 flex flex-col items-center text-center">
        <div className="mb-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-4 animate-fade-in text-white">
            FAMEUXARTE
          </h1>
          <p className="text-2xl md:text-3xl font-light text-gradient animate-fade-in delay-300">
            Where Art Transcends Boundaries
          </p>
        </div>
        
        <p className="mt-6 max-w-xl text-lg md:text-xl text-gray-200 animate-fade-in">
          Curated collections from visionary artists redefining contemporary aesthetics
        </p>
        
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-brand-red hover:bg-brand-red/90 animate-slide-up group">
            <Link to="/artworks" className="flex items-center gap-2">
              Explore Artworks
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white/10 animate-slide-up delay-150">
            <Link to="/artists">Meet the Artists</Link>
          </Button>
        </div>

        <div className="absolute bottom-10 left-0 right-0 mx-auto text-center">
          <button 
            onClick={() => {
              document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-white/70 hover:text-white flex flex-col items-center transition"
            aria-label="Scroll down"
          >
            <span className="text-sm mb-2">Discover More</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="animate-bounce"
            >
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
