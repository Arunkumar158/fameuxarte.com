
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  artwork_id: string;
  quantity: number;
  artwork: {
    title: string;
    price: number;
    image_sign: string | null;
  };
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  addToCart: (artworkId: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCartItems = async () => {
    if (!user) {
      setItems([]);
      setCartCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          artwork_id,
          quantity,
          artworks (
            title,
            price,
            image_path
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const mappedItems = data?.map(item => ({
        id: item.id,
        artwork_id: item.artwork_id,
        quantity: item.quantity,
        artwork: {
          title: item.artworks?.title || "Unknown",
          price: item.artworks?.price || 0,
          image_sign: item.artworks?.image_path
        }
      })) || [];
      
      setItems(mappedItems);
      const totalCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cart items",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchCartItems();

    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: user ? `user_id=eq.${user.id}` : undefined
        },
        () => {
          fetchCartItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addToCart = async (artworkId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to add items to your cart",
      });
      return;
    }

    try {
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('artwork_id', artworkId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            artwork_id: artworkId,
            quantity: 1
          });

        if (error) throw error;
      }

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
      
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart",
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
      
      await fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item from cart",
      });
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;
      
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity",
      });
    }
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      cartCount, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      isLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
