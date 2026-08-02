/**
 * Fameuxarte DiscoveryBreadcrumbs Component
 * Accessible React UI breadcrumbs component with Schema.org microdata markup.
 */

import React from 'react';
import { BreadcrumbItem } from '@/platform/discovery/types';
import { ChevronRight } from 'lucide-react';

export interface DiscoveryBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const DiscoveryBreadcrumbs: React.FC<DiscoveryBreadcrumbsProps> = ({ items, className = '' }) => {
  if (!items || items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`py-2 text-sm text-neutral-400 ${className}`}>
      <ol className="flex items-center space-x-2 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => (
          <li
            key={item.url}
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 mx-1 text-neutral-600 flex-shrink-0" />}
            {index === items.length - 1 ? (
              <span className="text-neutral-200 font-medium truncate max-w-xs" itemProp="name">
                {item.name}
              </span>
            ) : (
              <a
                href={item.url}
                className="hover:text-gold transition-colors duration-200"
                itemProp="item"
              >
                <span itemProp="name">{item.name}</span>
              </a>
            )}
            <meta itemProp="position" content={String(item.position)} />
          </li>
        ))}
      </ol>
    </nav>
  );
};
