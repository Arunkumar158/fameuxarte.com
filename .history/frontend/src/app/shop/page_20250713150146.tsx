'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { formatCurrency } from '@/components/lib/utils';

interface ArtworkItem {
  id: number;
  title: string;
  imageUrl: string;
  description: string;
  category: string;
  price: number;
}

interface CartItem extends ArtworkItem {
  quantity: number;
}

const artworks: ArtworkItem[] = [
  {
    id: 1,
    title: "Abstract Harmony",
    imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8",
    description: "A vibrant exploration of color and form",
    category: "Abstract",
    price: 299.99
  },
  {
    id: 2,
    title: "Urban Dreams",
    imageUrl: "https://images.unsplash.com/photo-1549887534-1541e9326642",
    description: "Contemporary cityscape interpretation",
    category: "Urban",
    price: 399.99
  },
  {
    id: 3,
    title: "Nature's Whisper",
    imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9",
    description: "Organic forms and natural elements",
    category: "Nature",
    price: 349.99
  },
  {
    id: 4,
    title: "Digital Waves",
    imageUrl: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead",
    description: "Digital art exploration",
    category: "Digital",
    price: 249.99
  }
];

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function ShopPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (artwork: ArtworkItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === artwork.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === artwork.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...artwork, quantity: 1 }];
    });
    // Automatically open the cart when an item is added
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Art Shop</h1>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-primary hover:bg-secondary rounded-full"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <motion.div
              key={artwork.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg overflow-hidden shadow-lg"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{artwork.title}</h3>
                <p className="text-muted-foreground mb-4">{artwork.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{formatCurrency(artwork.price)}</span>
                  <button
                    onClick={() => addToCart(artwork)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cart Sidebar */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-xl">
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Shopping Cart</h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 hover:bg-secondary rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 mb-4 p-4 bg-secondary rounded-lg">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-muted-foreground">{formatCurrency(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-background rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-background rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-destructive hover:bg-destructive/10 p-1 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.length > 0 ? (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-lg font-semibold mb-4">
                      <span>Total:</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Your cart is empty
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}