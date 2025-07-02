import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to add items to your cart",
      });
      navigate("/auth");
      return;
    }

    if (!artwork.id) {
      console.error("Artwork ID is missing");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to add item to cart",
      });
      return;
    }

    addToCart(artwork.id).catch(err => {
      console.error("Error adding to cart:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart",
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

    toggleLike(artwork.id).catch(err => {
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
    <div className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      <Link to={artworkUrl} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={artwork.image}
            alt={artwork.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-1">
            <Link to={artworkUrl} className="hover:underline">
              {artwork.title}
            </Link>
          </h3>
          <Button
            size="icon"
            variant="ghost"
            className={`h-7 w-7 shrink-0 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
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
            className="w-full" 
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;
