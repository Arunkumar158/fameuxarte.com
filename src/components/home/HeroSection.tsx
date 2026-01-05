import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      style={{
        backgroundImage: "url('/media/image/WhatsApp Image 2025-10-09 at 12.10.39 PM.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        minHeight: '80vh'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-pink-500/20 to-blue-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-4 group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-3xl transform group-hover:scale-110 transition-transform duration-700" />
          <h1 className="relative text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-4 animate-fade-in bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {/* FAMEUXARTE */}
          </h1>
          <p className="relative text-2xl md:text-3xl font-bold animate-fade-in delay-300 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Art Gallery for the unseen artists
          </p>
        </div>
        
        <p className="mt-6 max-w-xl text-lg md:text-xl text-white/90 animate-fade-in font-light tracking-wide">
          <span className="text-purple-300">VISION.</span>{" "}
          <span className="text-pink-300">INSPIRE.</span>{" "}
          <span className="text-blue-300">COLLECT</span>
        </p>
        
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 animate-slide-up group rounded-lg transition-all duration-300">
            <Link to="/artworks" className="flex items-center gap-2">
              <span className="relative z-10">Explore Artworks</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/10 to-purple-500/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="relative overflow-hidden bg-transparent text-white border-white/30 hover:border-white/50 hover:bg-white/5 animate-slide-up delay-150 rounded-lg transition-all duration-300 group">
            <Link to="/artists" className="relative">
              <span className="relative z-10">Meet the Artists</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/10 to-purple-500/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
