import { Link } from "react-router-dom";
import { format } from "date-fns";

export interface EditorialHeroProps {
  title: string;
  category?: string;
  excerpt?: string;
  imageUrl?: string;
  publishedAt: string;
  updatedAt?: string;
  readTime?: number;
  authorName?: string;
}

export const EditorialHero = ({
  title,
  category,
  excerpt,
  imageUrl,
  publishedAt,
  updatedAt,
  readTime,
  authorName,
}: EditorialHeroProps) => {
  const pubDate = new Date(publishedAt);
  const updDate = updatedAt ? new Date(updatedAt) : null;
  const showUpdated = updDate && updDate.getTime() !== pubDate.getTime();

  return (
    <header className="pt-10 pb-12 md:pt-14 md:pb-16 max-w-5xl mx-auto px-6">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
        {category && (
          <Link
            to={`/blog?category=${encodeURIComponent(category)}`}
            className="text-gold font-medium uppercase tracking-widest text-xs mb-6 hover:underline"
          >
            {category}
          </Link>
        )}

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-linen leading-tight mb-6 tracking-tight">
          {title}
        </h1>

        {excerpt && (
          <p className="text-lg md:text-xl text-[#888] font-light leading-relaxed mb-8 max-w-2xl">
            {excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-[#666] uppercase tracking-wider">
          {authorName && (
            <>
              <span className="text-[#888] normal-case font-normal tracking-normal capitalize">
                {authorName}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#444]" />
            </>
          )}
          <time dateTime={publishedAt}>
            {format(pubDate, "MMMM d, yyyy")}
          </time>
          {showUpdated && updDate && (
            <>
              <span className="w-1 h-1 rounded-full bg-[#444]" />
              <span>
                Updated{" "}
                <time dateTime={updatedAt}>
                  {format(updDate, "MMM d, yyyy")}
                </time>
              </span>
            </>
          )}
          {readTime && (
            <>
              <span className="w-1 h-1 rounded-full bg-[#444]" />
              <span>{readTime} min read</span>
            </>
          )}
        </div>
      </div>

      {imageUrl && (
        <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden bg-surface-2 mt-8 relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/30 to-transparent" />
        </div>
      )}
    </header>
  );
};

