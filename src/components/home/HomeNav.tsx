import { Link, useLocation } from "react-router-dom";
import { Heart, LogOut, ShoppingCart, User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { useState } from "react";
import MobileMenu from "@/components/navigation/MobileMenu";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Discover", to: "/artworks" },
  { label: "Collections", to: "/collections" },
  { label: "Artists", to: "/artists" },
  {
    label: "ArtGuard",
    to: "#artguard",
    comingSoon: true,
    comingSoonMessage: "ArtGuard AI verification is coming soon. We're building an authenticity layer for every listed artwork.",
  },
  { label: "Journal", to: "/blog" },
];

const HomeNav = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { likedCount } = useLikedItems();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleArtGuardClick = (message: string) => {
    toast({
      title: "Coming Soon",
      description: message,
    });
  };

  return (
    <>
      {/* Sticky nav with safe-area top padding for notched devices */}
      <nav
        className="sticky top-0 z-50 flex w-full items-center justify-between bg-obsidian/95 backdrop-blur-md border-b border-border-faint px-4 sm:px-6 py-[14px]"
        style={{ paddingTop: `calc(env(safe-area-inset-top) + 14px)` }}
      >
        <Link to="/" className="text-[14px] font-medium tracking-[-0.01em] text-linen shrink-0">
          Fameuxarte
        </Link>

        {/* Desktop nav links — hidden below md (768px) */}
        <div className="hidden md:flex items-center gap-5">
          {navItems.map((item) =>
            item.comingSoon ? (
              <button
                key={item.label}
                type="button"
                onClick={() => handleArtGuardClick(item.comingSoonMessage!)}
                className="border-none bg-transparent p-0 text-[12px] text-[#666] transition-colors hover:text-stone cursor-pointer"
              >
                {item.label}
              </button>
            ) : item.to.startsWith("#") ? (
              <a key={item.label} href={item.to} className="text-[12px] text-[#666] transition-colors hover:text-stone">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} to={item.to} className="text-[12px] text-[#666] transition-colors hover:text-stone">
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/liked-items"
                aria-label={`Liked artworks${likedCount > 0 ? `, ${likedCount} items` : ""}`}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                {likedCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-medium leading-none text-obsidian">
                    {likedCount}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-medium leading-none text-obsidian">
                    {cartCount}
                  </span>
                )}
              </Link>
              {/* Profile & logout only visible on desktop */}
              <Link
                to="/profile"
                aria-label="Profile"
                className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
              >
                <User className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                aria-label="Sign out"
                className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/auth"
                state={{ from: location.pathname }}
                className="cursor-pointer border-none bg-transparent text-[12px] text-[#666] transition-colors hover:text-stone"
              >
                Sign in
              </Link>
              <Link
                to="/artworks"
                className="inline-flex rounded-[6px] bg-linen px-[14px] py-[7px] text-[12px] font-medium text-obsidian transition-opacity hover:opacity-90"
              >
                Collect art
              </Link>
            </div>
          )}

          {/* Mobile menu button — visible below md */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
    </>
  );
};

export default HomeNav;
