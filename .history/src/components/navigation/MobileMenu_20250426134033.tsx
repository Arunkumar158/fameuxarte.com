import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu = ({ onClose }: MobileMenuProps) => {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/auth";

  return (
    <div className="fixed inset-0 z-50 bg-background md:hidden animate-fade-in">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-semibold">
          Fameuxarte
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="container grid gap-6 pb-8 pt-6">
        <Link
          to="/artworks"
          className="group flex h-10 w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={onClose}
        >
          Artworks
        </Link>
        <Link
          to="/artists"
          className="group flex h-10 w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={onClose}
        >
          Artists
        </Link>
        <Link
          to="/collections"
          className="group flex h-10 w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={onClose}
        >
          Collections
        </Link>
        <Link
          to="/blog"
          className="group flex h-10 w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={onClose}
        >
          Blog
        </Link>
        
        {!isAuthPage && (
          <div className="mt-6 space-y-2">
            <Button asChild variant="default" className="w-full">
              <Link to="/auth" onClick={onClose}>Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth" onClick={onClose}>Create Account</Link>
            </Button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu;
