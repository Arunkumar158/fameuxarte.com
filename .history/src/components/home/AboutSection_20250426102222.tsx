
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutSection = () => {
  return (
    <section className="section-padding bg-black/90">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
          <div className="lg:w-1/2 animate-slide-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              About <span className="text-gradient">Fameuxarte</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-brand-red to-brand-blue mb-6"></div>
            
            <div className="space-y-4 text-gray-300">
              <p>
                Fameuxarte was founded with a singular vision: to create a platform where extraordinary art and discerning collectors converge. Our journey began in 2015 when a group of passionate art enthusiasts recognized the need for a curated space that celebrates artistic innovation while honoring timeless techniques.
              </p>
              <p>
                Today, we proudly represent over 200 emerging and established artists from across the globe, each bringing their unique perspective and creative vision to our carefully curated collection.
              </p>
              <p>
                Our mission extends beyond mere transactions—we strive to foster meaningful connections between artists and collectors, to educate and inspire our community, and to champion artwork that challenges, moves, and transforms.
              </p>
            </div>
            
            <div className="mt-8 flex gap-4">
              <Button asChild className="bg-brand-red hover:bg-brand-red/90">
                <Link to="/about">Our Story</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/artists">Our Artists</Link>
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2 animate-slide-up delay-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1594741158705-7411cbc7f1f6" 
                    alt="Art Gallery" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="overflow-hidden rounded-lg h-40">
                  <img 
                    src="https://images.unsplash.com/photo-1551038247-3d9af20df552" 
                    alt="Architecture" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="overflow-hidden rounded-lg h-40">
                  <img 
                    src="https://images.unsplash.com/photo-1470813740244-df37b8c1edcb" 
                    alt="Abstract Art" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="overflow-hidden rounded-lg h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1486718448742-163732cd1544" 
                    alt="Sculpture" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
