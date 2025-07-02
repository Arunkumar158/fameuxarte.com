import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutSection = () => {
  return (
    <section className="section-padding bg-black/90">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center animate-slide-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            About <span className="text-gradient">Fameuxarte</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-brand-red to-brand-blue mx-auto mb-6"></div>
          
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
          
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild className="bg-brand-red hover:bg-brand-red/90">
              <Link to="/about">Our Story</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/artists">Our Artists</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
