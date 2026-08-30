import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ArticleCTAProps {
  label: string;
  url: string;
  description?: string;
}

/**
 * ArticleCTA — editorial commerce call-to-action block.
 * Links blog readers directly to relevant marketplace pages:
 * artworks, artists, collections, categories.
 *
 * Should be placed between article content and the DiscoveryHub.
 */
const ArticleCTA = ({ label, url, description }: ArticleCTAProps) => {
  if (!label || !url) return null;

  // Determine if external URL (absolute) or internal route
  const isExternal = url.startsWith("http");

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-surface-2/60 backdrop-blur-sm p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-gold/40 transition-all duration-300">
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="relative">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold mb-2">
          Explore on Fameuxarte
        </div>
        <p className="text-[20px] font-serif text-linen leading-snug tracking-tight">
          {label}
        </p>
        {description && (
          <p className="mt-2 text-[14px] text-[#888] leading-relaxed max-w-md">
            {description}
          </p>
        )}
      </div>

      <div className="relative flex-shrink-0">
        <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-linen/20 text-[13px] font-medium text-linen group-hover:border-gold/60 group-hover:text-gold transition-all duration-300">
          Explore Now
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[680px] px-6 py-8">
      {isExternal ? (
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
          {content}
        </a>
      ) : (
        <Link to={url} aria-label={label}>
          {content}
        </Link>
      )}
    </div>
  );
};

export default ArticleCTA;
