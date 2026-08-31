import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  image: string;
}

const slides: HeroSlide[] = [
  {
    id: 1,
    badge: "CURATED WITH PASSION",
    title: "Art that Speaks to You",
    subtitle: "Explore original artworks from talented artists around the world.",
    primaryCtaText: "Explore Artworks",
    primaryCtaLink: "/artworks",
    secondaryCtaText: "Shop Collections",
    secondaryCtaLink: "/collections",
    image: "/images/hero/gallery-wall.jpg",
  },
  {
    id: 2,
    badge: "AUTHENTIC & VERIFIED",
    title: "Timeless Masterpieces for Modern Spaces",
    subtitle: "Every piece verified with digital provenance and physical certificate.",
    primaryCtaText: "Discover New Arrivals",
    primaryCtaLink: "/artworks",
    secondaryCtaText: "Meet the Artists",
    secondaryCtaLink: "/artists",
    image: "/images/hero/gallery-wall.jpg",
  },
  {
    id: 3,
    badge: "INVESTMENT GRADE",
    title: "Collect Exceptional Contemporary Art",
    subtitle: "Direct acquisition from world-class painters, sculptors, and printmakers.",
    primaryCtaText: "View Featured Works",
    primaryCtaLink: "/artworks",
    secondaryCtaText: "Explore Editions",
    secondaryCtaLink: "/collections",
    image: "/images/hero/gallery-wall.jpg",
  },
  {
    id: 4,
    badge: "GLOBAL FINE ART",
    title: "Transform Your Living & Work Spaces",
    subtitle: "Museum quality curation with white-glove secure international delivery.",
    primaryCtaText: "Browse Collection",
    primaryCtaLink: "/artworks",
    secondaryCtaText: "About Fameuxarte",
    secondaryCtaLink: "/our-story",
    image: "/images/hero/gallery-wall.jpg",
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide rotation every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full overflow-hidden bg-[#faf8f5]">
      {/* Hero Banner Container with natural gallery background */}
      <div className="relative min-h-[460px] sm:min-h-[540px] md:min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* Background Image with subtle gradient wash for text legibility */}
        <div className="absolute inset-0 z-0">
          <img
            src={slide.image}
            alt="Fameuxarte Art Gallery Interior"
            className="w-full h-full object-cover object-center md:object-right transition-all duration-1000"
          />
          {/* Subtle light gradient on the left side to guarantee high contrast typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f5]/90 via-[#faf8f5]/65 to-transparent md:to-transparent" />
        </div>

        {/* Content Floating Container */}
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 sm:px-12 md:px-16 py-12">
          <div className="max-w-[560px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-start"
              >
                {/* Overline Badge */}
                <span className="text-[11px] sm:text-[12px] font-semibold tracking-[0.2em] text-[#b28247] uppercase mb-3">
                  {slide.badge}
                </span>

                {/* Main Headline */}
                <h1 className="font-serif text-[36px] sm:text-[46px] md:text-[54px] lg:text-[60px] font-medium leading-[1.08] text-[#111111] tracking-[-0.02em] mb-4">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-[14px] sm:text-[16px] text-[#4a4a4a] leading-relaxed mb-7 max-w-[480px]">
                  {slide.subtitle}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3.5">
                  <Link
                    to={slide.primaryCtaLink}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#111111] text-white text-[13px] font-medium hover:bg-black transition-all hover:gap-3 shadow-sm hover:shadow"
                  >
                    <span>{slide.primaryCtaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to={slide.secondaryCtaLink}
                    className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-white/80 backdrop-blur-sm border border-[#222222] text-[#111111] text-[13px] font-medium hover:bg-white transition-all shadow-xs"
                  >
                    {slide.secondaryCtaText}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Navigation Arrow - Left */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 backdrop-blur-md border border-[#e5e5e5] text-[#222222] shadow-sm flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Carousel Navigation Arrow - Right */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 backdrop-blur-md border border-[#e5e5e5] text-[#222222] shadow-sm flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Carousel Pagination Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? "w-6 bg-[#111111]" : "w-2 bg-[#cccccc] hover:bg-[#999999]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
