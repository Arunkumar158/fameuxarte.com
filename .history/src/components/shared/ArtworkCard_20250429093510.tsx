import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { Heart } from "lucide-react";

type ArtworkCardProps = {
  artwork: {
    id: string;
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
  const isLiked = isItemLiked(artwork.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(artwork.id);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(artwork.id);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
      <Link to={`/artworks/${artwork.slug || artwork.id}`} className="aspect-square relative block overflow-hidden">
        <img
          src={artwork.image}
          alt={`${artwork.title} - ${artwork.category || 'Artwork'} by ${artwork.artist}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-4">
          <Button
            variant="secondary" 
            size="sm" 
            className="w-full"
          >
            View Details
          </Button>
        </div>
      </Link>
      
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-1">
            <Link to={`/artworks/${artwork.slug || artwork.id}`} className="hover:underline">
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
