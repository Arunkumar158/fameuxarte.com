import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight } from "lucide-react";
import { digitalProducts } from "@/data/resources";
import { Button } from "@/components/ui/button";
import { posthog } from "posthog-js";

interface RelatedResourceProps {
  productId: string;
  variant?: "compact" | "inline";
}

export const RelatedResource = ({ productId, variant = "compact" }: RelatedResourceProps) => {
  const product = digitalProducts.find(p => p.id === productId);
  
  if (!product) return null;

  const { id, title, shortDescription, price, category, externalUrl } = product;
  const isComingSoon = !externalUrl;

  const handleActionClick = () => {
    if (isComingSoon) return;
    
    try {
      posthog.capture("resource_external_checkout_click", {
        product_id: id,
        product_category: category,
        source: `blog_cta_${variant}`
      });
    } catch (e) {
      console.warn("PostHog error", e);
    }
  };

  if (variant === "compact") {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8">
        <div className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold mb-2">
          Featured Resource
        </div>
        <h4 className="font-serif text-white text-lg mb-2 leading-tight">
          {title}
        </h4>
        <p className="text-white/70 text-sm mb-4 leading-relaxed line-clamp-3">
          {shortDescription}
        </p>
        
        {isComingSoon ? (
          <Button 
            variant="outline" 
            size="sm"
            disabled 
            className="w-full bg-transparent border-white/20 text-white/50 cursor-not-allowed text-xs"
          >
            Coming Soon
          </Button>
        ) : (
          <a 
            href={externalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={handleActionClick}
            className="block"
          >
            <Button 
              size="sm"
              className="w-full bg-brand-gold hover:bg-white text-black transition-colors flex items-center justify-center gap-2 text-xs"
            >
              Get it for {price}
              <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
        )}
      </div>
    );
  }

  // Inline variant
  return (
    <div className="my-10 p-6 sm:p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 border-l-2 border-l-brand-gold rounded-r-xl">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold px-2 py-1 bg-brand-gold/10 rounded-sm">
              {category}
            </span>
            <span className="text-white/50 text-xs">Recommended</span>
          </div>
          <h4 className="font-serif text-white text-xl mb-2">
            {title}
          </h4>
          <p className="text-white/70 text-sm">
            {shortDescription}
          </p>
        </div>
        
        <div className="flex-shrink-0 w-full sm:w-auto">
          {isComingSoon ? (
            <Button 
              variant="outline" 
              disabled 
              className="w-full sm:w-auto bg-transparent border-white/20 text-white/50 cursor-not-allowed"
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
                className="w-full sm:w-auto bg-brand-gold hover:bg-white text-black transition-colors flex items-center gap-2"
              >
                Get it for {price}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
