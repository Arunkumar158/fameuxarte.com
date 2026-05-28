import { Link, useLocation } from "react-router-dom";
import { Heart, LogOut, ShoppingCart, User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { useState } from "react";
import MobileMenu from "@/components/navigation/MobileMenu";

const navItems = [
  { label: "Discover", to: "/artworks" },
  { label: "Collections", to: "/collections" },
  { label: "Artists", to: "/artists" },
  {
    label: "ArtGuard",
    to: "#artguard",
    comingSoon: "ArtGuard verification is coming soon. We are building an authenticity layer for every listed artwork.",
  },
  { label: "Journal", to: "/blog" },
];

const HomeNav = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { likedCount } = useLikedItems();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex w-full items-center justify-between bg-obsidian px-6 py-[14px]">
        <Link to="/" className="text-[14px] font-medium tracking-[-0.01em] text-linen">
          Fameuxarte
        </Link>

        <div className="hidden items-center gap-5 sm:flex">
          {navItems.map((item) =>
            item.comingSoon ? (
              <button
                key={item.label}
                type="button"
                onClick={() => window.alert(item.comingSoon)}
                className="border-none bg-transparent p-0 text-[12px] text-[#666] transition-colors hover:text-stone"
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

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/liked-items"
                aria-label="Liked artworks"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
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
                aria-label="Cart"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-medium leading-none text-obsidian">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                aria-label="Profile"
                className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
              >
                <User className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                aria-label="Sign out"
                className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth" state={{ from: location.pathname }} className="hidden cursor-pointer border-none bg-transparent text-[12px] text-[#666] transition-colors hover:text-stone sm:inline-flex">
                Sign in
              </Link>
              <Link to="/artworks" className="hidden sm:inline-flex rounded-[6px] bg-linen px-[14px] py-[7px] text-[12px] font-medium text-obsidian transition-opacity hover:opacity-90">
                Collect art
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            className="inline-flex sm:hidden h-8 w-8 items-center justify-center rounded-[6px] border border-border-subtle bg-surface-2 text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
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
