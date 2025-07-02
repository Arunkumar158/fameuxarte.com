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
  const navbarClasses = `fixed w-full top-0 z-50 transition-all duration-300 ${
    isScrolled || !isHomeRoute
      ? "bg-black/90 backdrop-blur-md shadow-sm"
      : "bg-transparent"
  }`;

  const textColor = isScrolled || !isHomeRoute ? "text-white" : "text-white";
  const logoColor = isScrolled || !isHomeRoute ? "text-white" : "text-white";

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand - Left */}
          <Link to="/" className={`font-heading font-bold text-2xl tracking-tight ${logoColor}`}>
            FAMEUXARTE
          </Link>

          {/* Navigation Links - Center */}
          {!isMobile && (
            <div className={`