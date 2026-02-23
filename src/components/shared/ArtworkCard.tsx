import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { Heart } from "lucide-react";
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
      className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-xl hover:border-brand-red/50"
    >
      <Link to={artworkUrl} className="block" style={{ transform: "translateZ(20px)" }}>
        <div className="aspect-square overflow-hidden">
          <img
            src={artwork.image}
            alt={artwork.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>
      <div className="flex flex-col gap-1 p-4" style={{ transform: "translateZ(30px)" }}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-1">
            <Link to={artworkUrl} className="hover:underline transition-colors duration-300">
              {artwork.title}
            </Link>
          </h3>
          <Button
            size="icon"
            variant="ghost"
            className={`h-7 w-7 shrink-0 transition-transform hover:scale-110 active:scale-90 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
            onClick={handleToggleLike}
            aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{artwork.artist}</p>
        <div className="mt-1">
          <Price amount={artwork.price} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            size="sm"
            className="w-full bg-primary/90 hover:bg-primary hover:scale-[1.02] transition-all duration-300"
            onClick={handleAddToCart}
          >
            Reserve Artwork
          </Button>
        </div>
      </div>
      {/* Decorative glass reflection effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

export default ArtworkCard;
