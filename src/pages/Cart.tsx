
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";
import { Link } from "react-router-dom";
import SectionTitle from "@/components/shared/SectionTitle";
import { Price } from "@/components/shared/Price";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, isLoading } = useCart();
  const total = items.reduce((sum, item) => sum + (item.artwork.price * item.quantity), 0);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse">Loading your collection...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <SectionTitle
          title="Your Collection"
          subtitle="Review and manage your reserved artworks"
        />
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">Your collection is empty</p>
            <Link to="/artworks">
              <Button>Browse Artworks</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 mt-8">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                <div className="w-24 h-24 bg-muted rounded-md overflow-hidden">
                  {item.artwork.image_sign ? (
                    <img
                      src={item.artwork.image_sign}
                      alt={item.artwork.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.artwork.title}</h3>
                  <div className="text-muted-foreground">
                    <Price amount={item.artwork.price} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4">
              <div>
                <p className="text-lg font-medium">Total Investment</p>
                <p className="text-2xl font-semibold">
                  <Price amount={total} />
                </p>
              </div>
              <Link to="/checkout">
                <Button size="lg" disabled={items.length === 0}>
                  Proceed to Secure Acquisition
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Cart;
