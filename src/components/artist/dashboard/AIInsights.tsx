import React from 'react';
import { Sparkles, TrendingUp, Search, Lock } from 'lucide-react';

export const AIInsights = () => {
  return (
    <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5 flex flex-col h-full relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold/5 blur-3xl transition-transform duration-700 group-hover:scale-150" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <h3 className="text-[14px] font-medium text-linen">AI Insights</h3>
        </div>
        <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gold">
          Early Access
        </span>
      </div>

      <p className="text-[12px] text-stone mb-6 relative z-10">
        AI-powered predictions based on global art market trends and collector behavior.
      </p>

      <div className="space-y-3 flex-1 relative z-10">
        <div className="flex items-start gap-3 rounded-[6px] border border-border-faint bg-obsidian/50 p-3">
          <div className="mt-0.5 shrink-0 rounded bg-blue-500/10 p-1.5 text-blue-400">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-[12px] font-medium text-linen">Price Optimization</h4>
            <p className="mt-0.5 text-[11px] text-stone">
              Abstract expressionism works in your size range are currently trending 12% higher.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-[6px] border border-border-faint bg-obsidian/50 p-3">
          <div className="mt-0.5 shrink-0 rounded bg-purple-500/10 p-1.5 text-purple-400">
            <Search className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-[12px] font-medium text-linen">Demand Forecasting</h4>
            <p className="mt-0.5 text-[11px] text-stone">
              Collectors are actively searching for "Monochromatic landscapes" this week.
            </p>
          </div>
        </div>
      </div>
      
      {/* Overlay for Premium Features in the future */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-2/80 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Lock className="h-6 w-6 text-gold mb-2" />
        <h4 className="text-sm font-medium text-linen">Fameuxarte Pro</h4>
        <p className="text-xs text-stone mt-1 max-w-[200px] text-center">
          Unlock full market intelligence and personalized pricing strategies.
        </p>
        <button className="mt-3 rounded-[4px] bg-gold/10 px-3 py-1.5 text-[11px] font-medium text-gold hover:bg-gold/20 transition-colors">
          Join Waitlist
        </button>
      </div>
    </div>
  );
};
