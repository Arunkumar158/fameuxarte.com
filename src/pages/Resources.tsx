import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { DigitalProductCard, type DigitalProduct } from "@/components/resources/DigitalProductCard";
import { supabase } from "@/integrations/supabase/client";
import { posthog } from "posthog-js";
import { ArrowRight, Sparkles, Zap, ShieldCheck, Loader2 } from "lucide-react";

const Resources = () => {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      posthog.capture("resources_page_view");
      window.scrollTo(0, 0);
    } catch (e) {
      console.warn("PostHog error", e);
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_products')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setProducts(data as DigitalProduct[]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredProduct = products.find(p => p.is_featured) || products[0];
  const gridProducts = products.filter(p => p.id !== featuredProduct?.id);

  return (
    <div className="min-h-screen bg-obsidian text-white pt-24 pb-16">
      <SEO 
        title="Resources | Fameuxarte"
        description="Practical digital resources for artists, collectors and art businesses — including tools, templates, ebooks and creative resources."
        canonicalUrl="/resources"
      />
      
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-semibold tracking-widest uppercase mb-6">
          <Sparkles className="w-3 h-3" />
          Fameuxarte Resources
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 leading-tight">
          Tools for Artists, Collectors <br className="hidden md:block" />
          <span className="text-white/50">&</span> Art Businesses
        </h1>
        
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Practical digital resources designed to help artists build, price, present, and sell their work with confidence.
        </p>
      </section>

      {/* Featured Resource */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        </div>
      ) : featuredProduct ? (
        <section className="px-6 mb-24 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-[10px] uppercase tracking-widest text-white/50 font-semibold mb-2">Featured</h2>
            <div className="w-12 h-px bg-brand-gold/50 mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <DigitalProductCard product={featuredProduct} featured={true} />
          </div>
        </section>
      ) : null}

      {/* All Resources Grid */}
      <section className="px-6 mb-24 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-serif text-white mb-2">All Resources</h2>
            <p className="text-white/50 text-sm">Explore our complete collection of digital tools.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {!isLoading && gridProducts.map(product => (
            <DigitalProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust/Value Section */}
      <section className="px-6 py-20 bg-white/5 border-y border-white/10 mb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-12">Built for the Art World</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4 text-brand-gold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Practical resources</h3>
              <p className="text-white/50 text-sm leading-relaxed">Ready to use templates and tools. No complicated setup required.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4 text-brand-gold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Premium quality</h3>
              <p className="text-white/50 text-sm leading-relaxed">Designed by industry professionals for serious artists and collectors.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4 text-brand-gold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Instant access</h3>
              <p className="text-white/50 text-sm leading-relaxed">Digital delivery through our trusted distribution partners.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-12 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-serif mb-4">Need something else?</h2>
        <p className="text-white/70 mb-8">
          Explore Fameuxarte's premium original artwork marketplace.
        </p>
        <Link to="/artworks">
          <Button className="bg-white hover:bg-brand-gold text-black transition-colors px-8 py-6 rounded-full text-base font-medium flex items-center gap-2 mx-auto">
            Explore Artwork
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Resources;
