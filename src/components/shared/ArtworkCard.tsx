import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState } from "react";

type ArtworkCardProps = {
  artwork: {
    id: string | number;
    slug?: string;
    title: string;
    artist: string;
    price: number;
    image: string;
    category?: string;
  };
};

const ArtworkCard = ({ artwork }: ArtworkCardProps) => {
  const { addToCart } = useCart();
  const { isItemLiked, toggleLike } = useLikedItems();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isLiked = isItemLiked(artwork.id);

  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to reserve artworks",
      });
      navigate("/auth");
      return;
    }

    if (!artwork.id) {
      console.error("Artwork ID is missing");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to reserve artwork",
      });
      return;
    }

    addToCart(String(artwork.id)).catch(err => {
      console.error("Error adding to cart:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reserve artwork",
      });
    });
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to like items",
      });
      navigate("/auth");
      return;
    }

    if (!artwork.id) {
      console.error("Artwork ID is missing");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to like item",
      });
      return;
    }

    toggleLike(String(artwork.id)).catch(err => {
      console.error("Error toggling like:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update likes",
      });
    });
  };

  const artworkUrl = `/artworks/${artwork.slug || artwork.id}`;

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-xl border border-white/5 bg-brand-dark/80 backdrop-blur-sm text-card-foreground shadow-sm card-hover-gold"
    >
      <Link to={artworkUrl} className="block relative" style={{ transform: "translateZ(20px)" }}>
        <div className="aspect-square overflow-hidden rounded-t-xl">
          <img
            src={artwork.image}
            alt={artwork.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 flex items-center gap-1.5 rounded-full border border-white/10 text-[10px] uppercase tracking-wider font-semibold text-brand-gold">
          <ShieldCheck className="w-3 h-3" />
          <span>AI Verified</span>
        </div>
      </Link>
      <div className="flex flex-col gap-1.5 p-5" style={{ transform: "translateZ(30px)" }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg line-clamp-1 tracking-tight">
              <Link to={artworkUrl} className="hover:text-brand-gold transition-colors duration-300">
                {artwork.title}
              </Link>
            </h3>
            <p className="text-sm font-medium text-muted-foreground/80">{artwork.artist}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 shrink-0 transition-transform hover:scale-110 active:scale-90 ${isLiked ? "text-brand-gold" : "text-muted-foreground"}`}
            onClick={handleToggleLike}
            aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-sm font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Limited Edition
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Investment</span>
            <div className="text-lg font-bold text-white"><Price amount={artwork.price} /></div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button
            size="sm"
            className="w-full btn-primary h-10 rounded-md"
            onClick={handleAddToCart}
          >
            Own This Piece
          </Button>
        </div>
      </div>
      {/* Decorative glass reflection effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-brand-gold/0 via-brand-gold/5 to-brand-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </motion.div>
  );
};

export default ArtworkCard;
