import React from 'react';
import { ShieldCheck, Star, Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TrustBadgeType = 'verified' | 'premium' | 'featured' | 'new';

interface TrustBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  type: TrustBadgeType;
  showText?: boolean;
}

const badgeConfig = {
  verified: {
    icon: ShieldCheck,
    text: 'Verified Artist',
    colors: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-500',
  },
  premium: {
    icon: Award,
    text: 'Premium Artist',
    colors: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconColor: 'text-indigo-500',
  },
  featured: {
    icon: Star,
    text: 'Featured Artist',
    colors: 'bg-amber-50 text-amber-700 border-amber-200',
    iconColor: 'text-amber-500',
  },
  new: {
    icon: Sparkles,
    text: 'New Artist',
    colors: 'bg-blue-50 text-blue-700 border-blue-200',
    iconColor: 'text-blue-500',
  }
};

export function TrustBadge({ type, showText = true, className, ...props }: TrustBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        config.colors,
        className
      )}
      title={config.text}
      {...props}
    >
      <Icon className={cn('w-3.5 h-3.5', showText && 'mr-1', config.iconColor)} />
      {showText && <span>{config.text}</span>}
    </div>
  );
}
