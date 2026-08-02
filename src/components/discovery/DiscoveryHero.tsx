import React from 'react';
import { DiscoveryEntity } from '@/lib/discovery/registry';

interface DiscoveryHeroProps {
  entity: DiscoveryEntity;
}

export const DiscoveryHero: React.FC<DiscoveryHeroProps> = ({ entity }) => {
  return (
    <div className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center bg-obsidian overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${entity.openGraphImage || '/placeholder.svg'})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <span className="inline-block py-1 px-3 mb-4 text-xs font-semibold tracking-widest text-gold uppercase border border-gold/30 rounded-full bg-gold/10 backdrop-blur-sm">
          {entity.type}
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          {entity.heroTitle}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {entity.heroDescription}
        </p>
      </div>
    </div>
  );
};
