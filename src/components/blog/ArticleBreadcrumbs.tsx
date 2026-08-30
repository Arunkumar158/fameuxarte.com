import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ArticleBreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * ArticleBreadcrumbs — visible breadcrumb trail for blog articles.
 * Example: Home → Blog → Art History → Article Title
 *
 * The matching BreadcrumbList JSON-LD is injected by BreadcrumbEngine
 * inside MetadataPipeline. This component is the visible counterpart.
 *
 * Accessible: uses nav landmark with aria-label and ol/li semantics.
 */
const ArticleBreadcrumbs = ({ items }: ArticleBreadcrumbsProps) => {
  if (!items || items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-6 pt-8 pb-2">
      <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#666]" role="list">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {!isFirst && (
                <ChevronRight
                  className="w-3 h-3 text-[#444] flex-shrink-0"
                  aria-hidden="true"
                />
              )}

              {isFirst ? (
                item.href ? (
                  <Link
                    to={item.href}
                    className="flex items-center gap-1 hover:text-gold transition-colors"
                    aria-label="Home"
                  >
                    <Home className="w-3 h-3" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1">
                    <Home className="w-3 h-3" aria-hidden="true" />
                  </span>
                )
              ) : isLast ? (
                <span
                  className="text-linen/60 line-clamp-1 max-w-[200px] sm:max-w-xs"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  to={item.href}
                  className="hover:text-gold transition-colors truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="truncate">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ArticleBreadcrumbs;
