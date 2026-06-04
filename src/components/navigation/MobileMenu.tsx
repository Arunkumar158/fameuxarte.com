import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Heart, User, LogOut, Artboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { ShoppingBag } from "lucide-react";
import CurrencySelector from "@/components/shared/CurrencySelector";

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu = ({ onClose }: MobileMenuProps) => {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { likedCount } = useLikedItems();
  const isAuthPage = pathname === "/auth";

  // Lock body scroll when menu is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const navLinks = [
    { label: "Artworks", to: "/artworks" },
    { label: "Artists", to: "/artists" },
    { label: "Collections", to: "/collections" },
    { label: "Blog", to: "/blog" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel — slides in from right */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-y-0 right-0 z-[101] flex w-full max-w-xs flex-col bg-obsidian shadow-2xl border-l border-border-subtle animate-slide-in-right"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-faint px-5 py-4">
          <Link
            to="/"
            className="text-[15px] font-medium tracking-[-0.01em] text-linen"
            onClick={onClose}
          >
            Fameuxarte
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Main navigation">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onClose}
                  className={`flex h-12 w-full items-center rounded-[8px] px-4 text-[14px] font-medium transition-colors hover:bg-surface-2 hover:text-gold ${
                    pathname === link.to ? "bg-surface-2 text-gold" : "text-[#aaa]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="my-4 border-t border-border-faint" />

          {/* User actions */}
          {user ? (
            <div className="space-y-3">
              {/* Cart & Likes row */}
              <div className="flex items-center gap-2">
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="relative flex flex-1 h-12 items-center justify-center gap-2 rounded-[8px] border border-border-subtle bg-surface-2 text-[13px] text-[#aaa] transition-colors hover:border-gold/30 hover:text-gold"
                  aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-obsidian">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/liked-items"
                  onClick={onClose}
                  className="relative flex flex-1 h-12 items-center justify-center gap-2 rounded-[8px] border border-border-subtle bg-surface-2 text-[13px] text-[#aaa] transition-colors hover:border-gold/30 hover:text-gold"
                  aria-label={`Liked artworks${likedCount > 0 ? `, ${likedCount} items` : ""}`}
                >
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  <span>Liked</span>
                  {likedCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-obsidian">
                      {likedCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Profile */}
              <Link
                to="/profile"
                onClick={onClose}
                className="flex h-12 w-full items-center gap-3 rounded-[8px] border border-border-subtle bg-surface-2 px-4 text-[13px] text-[#aaa] transition-colors hover:border-gold/30 hover:text-gold"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                Profile
              </Link>

              {/* Currency selector */}
              <div className="flex items-center justify-between rounded-[8px] border border-border-subtle bg-surface-2 px-4 py-2">
                <span className="text-[12px] text-[#666]">Currency</span>
                <CurrencySelector />
              </div>

              {/* Sign out */}
              <Button
                variant="outline"
                className="h-12 w-full rounded-[8px] border-border-subtle bg-transparent text-[13px] text-[#aaa] hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  signOut();
                  onClose();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          ) : (
            !isAuthPage && (
              <div className="space-y-2">
                <Button
                  asChild
                  className="h-12 w-full rounded-[8px] bg-linen text-[13px] font-medium text-obsidian hover:bg-gold"
                >
                  <Link to="/auth" state={{ from: pathname }} onClick={onClose}>
                    Sign In
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 w-full rounded-[8px] border-border-subtle bg-transparent text-[13px] text-[#aaa] hover:bg-surface-2 hover:text-linen"
                >
                  <Link to="/auth" state={{ from: pathname }} onClick={onClose}>
                    Create Account
                  </Link>
                </Button>
              </div>
            )
          )}
        </nav>

        {/* Safe area bottom padding */}
        <div style={{ height: "env(safe-area-inset-bottom)" }} />
      </div>
    </>
  );
};

export default MobileMenu;
