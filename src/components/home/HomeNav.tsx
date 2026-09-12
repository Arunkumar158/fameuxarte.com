import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, ShoppingBag, Search, ChevronDown, User, LogOut, Palette } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import MobileMenu from "@/components/navigation/MobileMenu";
import TopUtilityBar from "@/components/home/TopUtilityBar";

const navItems = [
  { label: "Artworks", to: "/artworks" },
  { label: "Artists", to: "/artists" },
  { label: "Collections", to: "/collections" },
  { label: "Blog", to: "/blog" },
  { label: "Community", to: "/community" },
  { label: "About Us", to: "/our-story" },
];

const HomeNav = () => {
  const { user, profile, signOut } = useAuth();
  const { cartCount } = useCart();
  const { likedCount } = useLikedItems();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-black">
      {/* Top utility announcement bar */}
      <TopUtilityBar />

      {/* Main navigation header */}
      <nav
        className="flex w-full items-center justify-between bg-black/95 backdrop-blur-md text-white px-4 sm:px-8 py-3.5 border-b border-white/[0.08]"
        style={{ paddingTop: `calc(env(safe-area-inset-top) + 12px)` }}
      >
        {/* Logo and Tagline */}
        <Link to="/" className="flex flex-col shrink-0 text-left group">
          <span className="font-serif text-[20px] sm:text-[22px] font-bold tracking-[0.14em] text-white uppercase leading-none">
            FAMEUXARTE
          </span>
          <span className="text-[9px] sm:text-[10px] tracking-[0.18em] text-stone-400 font-normal mt-1 uppercase">
            Discover. Own. Cherish.
          </span>
        </Link>

        {/* Center Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`text-[13px] font-medium transition-colors hover:text-white ${
                  isActive ? "text-white font-semibold" : "text-stone-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions: Search + Wishlist + Cart + Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Input Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative w-[220px] lg:w-[260px]"
          >
            <input
              type="text"
              placeholder="Search artworks, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-full bg-[#161616] border border-white/10 pl-4 pr-9 text-[12px] text-white placeholder:text-stone-500 focus:outline-none focus:border-white/30 focus:bg-[#1a1a1a] transition-all"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 text-stone-400 hover:text-white transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Search icon button for mobile */}
          <Link
            to="/search"
            aria-label="Search artworks"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-300 hover:bg-white/10 transition-colors"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Wishlist / Liked Items */}
          <Link
            to="/liked-items"
            aria-label={`Liked artworks${likedCount > 0 ? `, ${likedCount} items` : ""}`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-200 hover:bg-white/10 transition-colors"
          >
            <Heart className="h-4 w-4 stroke-[1.75]" />
            {likedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-medium leading-none text-black">
                {likedCount}
              </span>
            )}
          </Link>

          {/* Shopping Bag / Cart */}
          <Link
            to="/cart"
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-200 hover:bg-white/10 transition-colors"
          >
            <ShoppingBag className="h-4 w-4 stroke-[1.75]" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-medium leading-none text-black">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account / Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-semibold overflow-hidden border border-white/20">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile?.full_name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profile?.full_name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />
                  )}
                </div>
                <ChevronDown className="h-3 w-3 text-stone-400" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/auth"
                  state={{ from: location.pathname }}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-white hover:text-black transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* User Dropdown Menu */}
            {user && userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#141414] border border-white/10 shadow-xl py-1.5 z-50 animate-in fade-in-50 slide-in-from-top-2 text-[13px] text-stone-200">
                <div className="px-3.5 py-2 border-b border-white/[0.08]">
                  <p className="font-semibold truncate text-white">
                    {profile?.full_name || "Collector"}
                  </p>
                  <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                </div>

                <Link
                  to="/account"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-white/[0.06] transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-stone-400" />
                  <span>My Account</span>
                </Link>

                <Link
                  to="/artist"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-white/[0.06] transition-colors"
                >
                  <Palette className="h-3.5 w-3.5 text-stone-400" />
                  <span>Artist Studio</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-red-400 hover:bg-red-950/30 transition-colors border-t border-white/[0.08] mt-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-200 hover:bg-white/10 transition-colors"
          >
            <span className="sr-only">Open menu</span>
            <div className="flex flex-col gap-1 w-4">
              <span className="h-0.5 w-full bg-current rounded-full" />
              <span className="h-0.5 w-full bg-current rounded-full" />
              <span className="h-0.5 w-full bg-current rounded-full" />
            </div>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
    </header>
  );
};

export default HomeNav;
