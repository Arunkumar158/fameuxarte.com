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
  const navbarClasses = `fixed w-full top-0 z-[100] transition-all duration-300 ${
    isScrolled || !isHomeRoute
      ? "bg-black/90 backdrop-blur-md shadow-sm"
      : "bg-transparent"
  }`;

  const textColor = isScrolled || !isHomeRoute ? "text-white" : "text-white";
  const logoColor = isScrolled || !isHomeRoute ? "text-white" : "text-white";

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand - Left */}
          <Link to="/" className={`font-heading font-bold text-xl sm:text-2xl tracking-tight ${logoColor} logo-text gradient-text hover:opacity-90 transition-opacity`}>
            FAMEUXARTE
          </Link>

          {/* Navigation Links - Center */}
          {!isMobile && (
            <div className={`flex-1 flex justify-center items-center space-x-4 sm:space-x-8 ${textColor} mx-4`}>
              <Link to="/artworks" className="text-sm sm:text-base hover:text-brand-red transition-colors">
                Artworks
              </Link>
              <Link to="/artists" className="text-sm sm:text-base hover:text-brand-red transition-colors">
                Artists
              </Link>
              <Link to="/collections" className="text-sm sm:text-base hover:text-brand-red transition-colors">
                Collections
              </Link>
              <Link to="/blog" className="text-sm sm:text-base hover:text-brand-red transition-colors">
                Blog
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
                  <Button variant="ghost" size="icon" className={`${textColor} relative h-8 w-8 sm:h-10 sm:w-10`}>
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-brand-red text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <Link to="/liked-items">
                  <Button variant="ghost" size="icon" className={`${textColor} relative h-8 w-8 sm:h-10 sm:w-10`}>
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                    {likedCount > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-brand-red text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
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
                  <Button variant="ghost" size="icon" className={`${textColor} h-8 w-8 sm:h-10 sm:w-10`}>
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`${textColor} hidden md:flex items-center gap-2 text-xs sm:text-sm`}
                  onClick={() => signOut()}
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" variant="outline" className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                  Sign In
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