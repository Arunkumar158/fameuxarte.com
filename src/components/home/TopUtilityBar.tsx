import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Truck } from "lucide-react";

const TopUtilityBar = () => {
  return (
    <div className="w-full bg-[#0d0d0d] text-[#d6d6d6] text-[11px] font-normal tracking-wide px-4 sm:px-8 py-2 border-b border-white/[0.08]">
      <div className="mx-auto max-w-[1400px] flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left trust badges */}
        <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6 text-stone-300">
          <span className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
            <span className="text-amber-400 text-xs font-bold">◇</span>
            <span>Original Artworks</span>
          </span>
          <span className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
            <span className="text-amber-400 text-xs font-bold">◇</span>
            <span>Verified Artists</span>
          </span>
          <span className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
            <span className="text-amber-400 text-xs font-bold">◇</span>
            <span>Secure Global Delivery</span>
          </span>
        </div>

        {/* Right utility links */}
        <div className="flex items-center gap-3 sm:gap-5 text-stone-300 text-[11px]">
          <Link to="/for-artists" className="hover:text-white transition-colors">
            Sell on Fameuxarte
          </Link>
          <span className="text-stone-600">|</span>
          <Link to="/collector/support" className="hover:text-white transition-colors">
            Help
          </Link>
          <span className="text-stone-600">|</span>
          <Link to="/collector/orders" className="hover:text-white transition-colors">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopUtilityBar;
