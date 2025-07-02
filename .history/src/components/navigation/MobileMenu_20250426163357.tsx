import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { ShoppingCart, Heart, User, LogOut } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-[101] bg-background md:hidden animate-fade-in">
      <div className="container flex h-14 sm:h-16 items-center justify-between pt-16">
        <Link to="/" className="font-serif text-xl sm:text-2xl font-semibold">
          Fameuxarte
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10">
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
      <nav className="container grid gap-4 sm:gap-6 pb-6 sm:pb-8 pt-4 sm:pt-6">
        <Link
          to="/artworks"
          className="group flex h-9 sm:h-10 w-full items-center justify-between rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={onClose}
        >
          Artworks
        </Link>
        <Link
          to="/artists"
          className="group flex h-9 sm:h-10 w-full items-center justify-between rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={onClose}
        >
          Artists
        </Link>
        <Link
          to="/collections"
          className="group flex h-9 sm:h-10 w-full items-center justify-between rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={onClose}
        >
          Collections
        </Link>
        <Link
          to="/blog"
          className="group flex h-9 sm:h-10 w-full items-center justify-between rounded-md px-3 sm:px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={onClose}
        >
          Blog
        </Link>

        {user && (
          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/cart" className="relative" onClick={onClose}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-brand-red text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/liked-items" onClick={onClose}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    {likedCount > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-brand-red text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {likedCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/profile" onClick={onClose}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center">
                <CurrencySelector />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-9 sm:h-10 text-sm"
              onClick={() => {
                signOut();
                onClose();
              }}
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Logout
            </Button>
          </div>
        )}
        
        {!user && !isAuthPage && (
          <div className="mt-4 sm:mt-6 space-y-2">
            <Button asChild variant="default" className="w-full h-9 sm:h-10 text-sm">
              <Link to="/auth" onClick={onClose}>Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-9 sm:h-10 text-sm">
              <Link to="/auth" onClick={onClose}>Create Account</Link>
            </Button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu;
