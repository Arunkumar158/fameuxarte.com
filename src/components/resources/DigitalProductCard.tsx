import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, ShoppingBag } from "lucide-react";
import type { DigitalProduct } from "@/data/resources";
import { posthog } from "posthog-js";

export interface DigitalProduct {
  id: string;
  title: string;
  short_description: string;
  price: number;
  currency: string;
  cover_image_url: string;
  category: string;
  gumroad_url: string;
  is_featured: boolean;
}

interface DigitalProductCardProps {
  product: DigitalProduct;
  featured?: boolean;
}

export const DigitalProductCard = ({ product, featured = false }: DigitalProductCardProps) => {
  const { id, title, short_description, price, currency, category, gumroad_url, cover_image_url, is_featured } = product;
  const isComingSoon = !gumroad_url;
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0
  }).format(price || 0);

  const handleActionClick = () => {
    if (isComingSoon) return;
    
    // Analytics
    try {
      posthog.capture("resource_external_checkout_click", {
        product_id: id,
        product_category: category,
      });
    } catch (e) {
      console.warn("PostHog error", e);
    }
  };

  const handleCardClick = () => {
    try {
      posthog.capture("resource_click", {
        product_id: id,
        product_category: category,
      });
    } catch (e) {
      console.warn("PostHog error", e);
    }
  };

  return (
    <div 
      className={`group relative flex flex-col bg-black/40 border ${featured ? 'border-brand-gold/50' : 'border-white/10'} hover:border-brand-gold/30 rounded-xl overflow-hidden transition-all duration-300 h-full`}
      onClick={handleCardClick}
    >
      {/* Visual / Image Placeholder */}
      <div className={`relative ${featured ? 'h-64 sm:h-80' : 'h-48'} bg-white/5 overflow-hidden flex items-center justify-center p-6`}>
        {is_featured && !featured && (
          <div className="absolute top-4 right-4 z-10 bg-brand-gold text-black text-xs font-bold px-3 py-1 rounded-full">
            Featured
          </div>
        )}
        
        {cover_image_url ? (
          <img 
            src={cover_image_url} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-white/20 flex flex-col items-center">
            <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-sm font-medium tracking-widest uppercase">{category}</span>
          </div>
        )}
        
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
        
        {/* Category label on image if not featured */}
        {(!is_featured || featured) && (
          <div className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full">
            {category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-6 sm:p-8">
        <h3 className={`font-serif text-white mb-3 ${featured ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
          {title}
        </h3>
        
        <p className="text-white/70 text-sm leading-relaxed mb-6 flex-grow">
          {short_description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
          <div className="font-heading font-medium text-lg text-white">
            {formattedPrice}
          </div>
          
          {isComingSoon ? (
            <Button 
              variant="outline" 
              disabled 
              className="bg-transparent border-white/20 text-white/50 cursor-not-allowed"
            >
              Coming Soon
            </Button>
          ) : (
            <a 
              href={gumroad_url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleActionClick}
            >
              <Button 
                className="bg-brand-gold hover:bg-white text-black transition-colors flex items-center gap-2"
              >
                Get it
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
