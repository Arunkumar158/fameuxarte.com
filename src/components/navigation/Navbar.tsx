import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, ShoppingCart, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import MobileMenu from "./MobileMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLikedItems } from "@/hooks/useLikedItems";
import CurrencySelector from "@/components/shared/CurrencySelector";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { likedCount } = useLikedItems();
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isHomeRoute = pathname === "/";
  const navbarClasses = `fixed w-full top-0 z-[100] transition-all duration-500 ${
    isScrolled || !isHomeRoute
      ? "bg-gradient-to-r from-black/95 via-black/85 to-black/95 backdrop-blur-md shadow-lg border-b border-white/5"
      : "bg-gradient-to-r from-black/20 via-transparent to-black/20"
  }`;

  const textColor = isScrolled || !isHomeRoute ? "text-white" : "text-white";
  const logoColor = isScrolled || !isHomeRoute ? "text-white" : "text-white";

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand - Left */}
          <Link to="/" className={`font-heading font-bold text-xl sm:text-2xl tracking-tight ${logoColor} relative group`}>
            <span className="relative z-10 bg-gradient-to-br from-white via-white/90 to-brand-red bg-clip-text text-transparent transition-all duration-300 group-hover:from-brand-red group-hover:to-white">
              FAMEUXARTE
            </span>
            <span className="absolute -inset-x-4 -inset-y-2 z-0 scale-75 bg-gradient-to-r from-brand-red/0 via-white/5 to-brand-red/0 opacity-0 blur-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"></span>
          </Link>

          {/* Navigation Links - Center */}
          {!isMobile && (
            <div className={`flex-1 flex justify-center items-center space-x-4 sm:space-x-8 ${textColor} mx-4`}>
              <Link to="/artworks" className="text-sm sm:text-base relative group">
                <span className="relative">Artworks</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-red via-white to-brand-red group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/artists" className="text-sm sm:text-base relative group">
                <span className="relative">Artists</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-red via-white to-brand-red group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/collections" className="text-sm sm:text-base relative group">
                <span className="relative">Collections</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-red via-white to-brand-red group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/blog" className="text-sm sm:text-base relative group">
                <span className="relative">Blog</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-red via-white to-brand-red group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
          )}

          {/* Right Section - Currency & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <>
                <div className="hidden xs:block">
                  <CurrencySelector />
                </div>
                
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className={`${textColor} relative h-8 w-8 sm:h-10 sm:w-10 group`}>
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand-red" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-br from-brand-red to-red-600 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-lg">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <Link to="/liked-items">
                  <Button variant="ghost" size="icon" className={`${textColor} relative h-8 w-8 sm:h-10 sm:w-10 group`}>
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand-red" />
                    {likedCount > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-br from-brand-red to-red-600 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-lg">
                        {likedCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            )}

            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className={`${textColor} h-8 w-8 sm:h-10 sm:w-10 group relative overflow-hidden`}>
                    <User className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand-red" />
                    <span className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-red/0 via-white/5 to-brand-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`${textColor} hidden md:flex items-center gap-2 text-xs sm:text-sm group relative overflow-hidden`}
                  onClick={() => signOut()}
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-brand-red" />
                  <span className="relative z-10">Logout</span>
                  <span className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-red/0 via-white/5 to-brand-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 relative group overflow-hidden border-white/20 hover:border-white/40 transition-colors"
                >
                  <span className="relative z-10">Sign In</span>
                  <span className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-red/0 via-white/5 to-brand-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>
            )}

            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className={`${textColor} h-8 w-8 sm:h-10 sm:w-10`}
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
    </nav>
  );
};

export default Navbar;