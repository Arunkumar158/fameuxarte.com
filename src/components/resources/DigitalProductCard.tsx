import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, ShoppingBag } from "lucide-react";
import type { DigitalProduct } from "@/data/resources";
import { posthog } from "posthog-js";

interface DigitalProductCardProps {
  product: DigitalProduct;
  featured?: boolean;
}

export const DigitalProductCard = ({ product, featured = false }: DigitalProductCardProps) => {
  const { id, title, shortDescription, price, category, badge, externalUrl, image } = product;
  const isComingSoon = !externalUrl;

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
        {badge && (
          <div className="absolute top-4 right-4 z-10 bg-brand-gold text-black text-xs font-bold px-3 py-1 rounded-full">
            {badge}
          </div>
        )}
        
        {image ? (
          <img 
            src={image} 
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
        
        {/* Category label on image if no badge */}
        {!badge && (
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
          {shortDescription}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
          <div className="font-heading font-medium text-lg text-white">
            {price}
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
              href={externalUrl} 
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
