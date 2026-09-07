import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { interiorShowcaseData } from "@/data/homeShowcase";

const InteriorShowcase = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="w-full bg-black px-4 sm:px-8 py-16 sm:py-24 border-t border-white/[0.08]" aria-labelledby="showcase-heading">
      <div className="mx-auto max-w-[1400px]">
        
        {/* Section Header */}
        <div className="mb-10 sm:mb-14 text-center max-w-2xl mx-auto">
          <h2 id="showcase-heading" className="font-serif text-[28px] sm:text-[36px] font-medium text-white tracking-[-0.01em] mb-4">
            See the Art in Your Space
          </h2>
          <p className="text-stone-400 text-[15px] sm:text-[16px] leading-relaxed font-light">
            Discover how original artwork can transform the atmosphere of your home, office, or commercial space.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative group">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
              skipSnaps: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 sm:-ml-6">
              {interiorShowcaseData.map((item, index) => (
                <CarouselItem key={item.id} className="pl-4 sm:pl-6 basis-full lg:basis-[85%]">
                  <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#0f0f0f] border border-white/[0.05]">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                    
                    {/* Overlay gradient for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    
                    {/* Caption / CTA */}
                    <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <span className="inline-block px-3 py-1 mb-3 text-[11px] font-medium tracking-wider text-white uppercase bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                          {item.space}
                        </span>
                        {item.title && (
                          <h3 className="text-[18px] sm:text-[22px] font-medium text-white drop-shadow-sm">
                            {item.title}
                          </h3>
                        )}
                      </div>
                      
                      {item.href && (
                        <Link 
                          to={item.href}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[13px] font-medium rounded-full hover:bg-stone-200 transition-colors shadow-lg self-start sm:self-auto shrink-0 group/btn"
                          aria-label={`Explore artwork for ${item.space}`}
                        >
                          View Artwork
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Desktop Navigation Controls (Hidden on small mobile) */}
            <div className="hidden sm:block">
              <CarouselPrevious className="absolute -left-5 top-1/2 -translate-y-1/2 h-12 w-12 bg-black/50 border-white/10 hover:bg-black hover:border-white/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0" />
              <CarouselNext className="absolute -right-5 top-1/2 -translate-y-1/2 h-12 w-12 bg-black/50 border-white/10 hover:bg-black hover:border-white/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-0" />
            </div>
          </Carousel>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  index === current 
                    ? "w-8 h-1.5 bg-white" 
                    : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteriorShowcase;
