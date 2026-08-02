import React from 'react';
import { Link } from 'react-router-dom';
import { DiscoveryEntity } from '@/lib/discovery/registry';

interface DiscoveryNavigatorProps {
  title: string;
  items: string[]; // slugs
  type: DiscoveryEntity['type'];
  basePath: string;
}

export const DiscoveryNavigator: React.FC<DiscoveryNavigatorProps> = ({ title, items, basePath }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="py-8 border-t border-gold/10">
      <h3 className="text-xl font-serif text-white mb-4">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {items.map(item => (
          <Link 
            key={item} 
            to={`${basePath}/${item}`}
            className="px-4 py-2 bg-obsidian-light/50 border border-gold/20 rounded-full text-gray-300 hover:text-gold hover:border-gold transition-colors text-sm capitalize"
          >
            {item.replace(/-/g, ' ')}
          </Link>
        ))}
      </div>
    </div>
  );
};
