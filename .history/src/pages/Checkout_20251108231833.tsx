import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
  modal: {
    ondismiss: () => void;
  };
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
    backdrop_color: string;
    hide_topbar: boolean;
  };
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// Type definitions for order payload and response
interface OrderItem {
  artwork: {
    id: string;
    title: string;
    price: number;
  };
  quantity: number;
}

interface OrderPayload {
  items: OrderItem[];
  totalAmount: number;
}

interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  key_id: string;
}

const Checkout = () => {
  const { items, removeFromCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const total = items.reduce((sum, item) => sum + (item.artwork.price * item.quantity), 0);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Debug: Log raw cart items first
      console.log('Raw cart items:', items);

      // Validate cart items before formatting
      if (!items || items.length === 0) {
        toast({
          variant: "destructive",
          title: "Cart Empty",
          description: "Please add items to your cart before checkout",
        });
        return;
      }

      // Format items to match Edge Function requirements
      const formattedItems: OrderItem[] = items.map((item, index) => {
        // Validate required fields
        if (!item.artwork_id) {
          throw new Error(`Item at index ${index} is missing artwork_id`);
        }
        if (!item.artwork) {
          throw new Error(`Item at index ${index} is missing artwork object`);
        }
        if (!item.artwork.title) {
          throw new Error(`Item at index ${index} is missing artwork title`);
        }
        if (typeof item.artwork.price !== 'number' || item.artwork.price <= 0) {
          throw new Error(`Item at index ${index} has invalid artwork price: ${item.artwork.price}`);
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          throw new Error(`Item at index ${index} has invalid quantity: ${item.quantity}`);
        }
        
        // The artwork ID is stored as artwork_id at the root level, not inside artwork object
        return {
          artwork: {
            id: item.artwork_id,  // Use artwork_id from root level
            title: item.artwork.title,
            price: item.artwork.price
          },
          quantity: item.quantity
        };
      });

      // Log order payload for debugging
      console.log('Sending order payload:', {
        items: formattedItems,
        totalAmount: total
      });

      // Create order on server - capture full response
      const response = await supabase.functions.invoke('create-order', {
        body: { 
          items: formattedItems, 
          totalAmount: total 
        } as OrderPayload
      });

      console.log('Full response:', response);
      
      const { data: orderData, error: orderError } = response;
      
      // Type assertion for order data
      const order = orderData as OrderResponse | null;

      // Enhanced error logging
      if (orderError) {
        console.error('Order creation failed:', orderError);
        console.error('Response data:', orderData);
        
        // The error details are often in the data object for 400 errors
        let errorMessage = "Unable to create order";
        let errorDetails = "";
        
        if (orderData && typeof orderData === 'object') {
          console.error('Error details from response:', orderData);
          errorMessage = orderData.error || errorMessage;
          errorDetails = orderData.details ? JSON.stringify(orderData.details, null, 2) : "";
        }
        
        toast({
          variant: "destructive",
          title: "Checkout Failed",
          description: `${errorMessage}${errorDetails ? '\n' + errorDetails : ''}`,
        });
        return;
      }

      // Log successful response
      console.log('Order created successfully:', order);

      // Verify key_id and amount in response
      if (!order || !order.key_id || !order.amount) {
        console.error('Invalid order response:', order);
        toast({
          variant: "destructive", 
          title: "Checkout Failed",
          description: "Invalid order configuration received",
        });
        return;
      }

      // Load and initialize Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: order.key_id,  // Live key from Edge Function
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: 'Gallery Canvas',
          description: 'Art Purchase',
          handler: async (response: any) => {
            try {
              // Verify payment
              const { error: verifyError } = await supabase.functions.invoke('verify-payment', {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }
              });

              if (verifyError) {
                toast({
                  variant: "destructive",
                  title: "Payment Failed",
                  description: "Unable to verify your payment. Please try again.",
                });
                navigate('/payment-failed');
                return;
              }

              // Clear cart
              for (const item of items) {
                await removeFromCart(item.id);
              }

              toast({
                title: "Payment Successful",
                description: "Your order has been placed successfully!",
              });
              navigate('/order-success');
            } catch (error) {
              console.error('Payment verification failed:', error);
              toast({
                variant: "destructive",
                title: "Payment Failed",
                description: "An error occurred while processing your payment.",
              });
              navigate('/payment-failed');
            }
          },
          modal: {
            ondismiss: function() {
              toast({
                variant: "destructive",
                title: "Payment Cancelled",
                description: "You cancelled the payment process.",
              });
              navigate('/payment-failed');
            }
          },
          prefill: {
            name: 'John Doe',
            email: 'john@example.com',
          },
          theme: {
            color: '#6366f1',
            backdrop_color: '#ffffff',
            hide_topbar: false,
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: "Unable to process your payment. Please try again.",
      });
      navigate('/payment-failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
        
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium">{item.artwork.title}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatCurrency(item.artwork.price * item.quantity)}</p>
              </div>
            ))}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Total</p>
                <p className="text-xl font-semibold">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handlePayment}
            disabled={isProcessing || items.length === 0}
          >
            {isProcessing ? "Processing..." : `Pay ${formatCurrency(total)}`}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;