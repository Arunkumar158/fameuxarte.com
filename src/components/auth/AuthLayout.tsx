import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  visualContent?: ReactNode;
}

const AuthLayout = ({ children, title, subtitle, visualContent }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-obsidian">
      <div className="w-full lg:w-2/5 flex flex-col justify-center overflow-y-auto px-4 sm:px-8 py-8 sm:py-12 bg-obsidian">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <a href="/" className="text-[18px] font-medium text-linen tracking-[-0.01em]">
              Fameuxarte
            </a>
          </div>

          <div className="mb-8">
            <h1 className="text-[28px] font-medium text-linen tracking-[-0.02em] leading-[1.2] mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[14px] text-[#666] leading-[1.75]">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>

      <div className="hidden lg:block lg:w-3/5 relative bg-surface-1">
        {visualContent || <DefaultVisual />}
      </div>
    </div>
  );
};

const DefaultVisual = () => (
  <div className="h-full flex items-center justify-center p-12 bg-gradient-to-br from-surface-1 via-[#0f1a2e] to-surface-1">
    <div className="max-w-xl">
      <div className="mb-8">
        <span className="inline-block text-[10px] tracking-[0.14em] uppercase text-verified bg-verified/10 border border-verified/20 px-3 py-1 rounded-full mb-6">
          ArtGuard Verified Platform
        </span>
      </div>

      <h2 className="text-[32px] font-medium text-linen tracking-[-0.025em] leading-[1.2] mb-4">
        Join 12,000+ collectors who trust Fameuxarte
      </h2>

      <p className="text-[15px] text-[#888] leading-[1.75] mb-8">
        Every artwork authenticated. Every artist verified. Start building your collection with confidence.
      </p>

      <div className="flex gap-12 pt-6 border-t border-border-faint">
        <div>
          <div className="text-[24px] font-medium text-linen tracking-[-0.02em] mb-1">98%</div>
          <div className="text-[12px] text-[#555]">Authenticity rate</div>
        </div>
        <div>
          <div className="text-[24px] font-medium text-linen tracking-[-0.02em] mb-1">1,200+</div>
          <div className="text-[12px] text-[#555]">Verified artworks</div>
        </div>
        <div>
          <div className="text-[24px] font-medium text-linen tracking-[-0.02em] mb-1">340</div>
          <div className="text-[12px] text-[#555]">Artists</div>
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
