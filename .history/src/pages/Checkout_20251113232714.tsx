import { useState, useEffect } from "react";
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
  handler: (response: RazorpayPaymentResponse) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
    backdrop_color: string;
    hide_topbar: boolean;
  };
  notes?: Record<string, string>;
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

const Checkout = () => {
  const { items, removeFromCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const total = items.reduce((sum, item) => sum + (item.artwork.price * item.quantity), 0);

  // Load Razorpay script on component mount
  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log('✅ Razorpay script already loaded');
      return;
    }

    // Load Razorpay checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay checkout script loaded successfully');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay checkout script');
    };
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Don't remove script on unmount as it might be needed for other components
    };
  }, []);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      console.log('=== CHECKOUT PROCESS START ===');

      // Validate cart
      if (!items || items.length === 0) {
        console.error('❌ Cart is empty');
        toast({
          variant: "destructive",
          title: "Cart Empty",
          description: "Your cart is empty. Please add items before checkout.",
        });
        return;
      }

      // Debug: Log raw cart items
      console.log('📦 Cart items:', items);
      console.log('💰 Total amount:', total, `(₹${total.toFixed(2)})`);

      // Format items to match Edge Function requirements
      const formattedItems = items.map((item, index) => {
        console.log(`Processing item ${index}:`, {
          id: item.id,
          artwork_id: item.artwork_id,
          artwork: item.artwork,
          quantity: item.quantity
        });
        
        // Ensure we have the artwork data
        if (!item.artwork) {
          throw new Error(`Item ${index} is missing artwork data`);
        }

        // The artwork ID is stored as artwork_id at the root level
        return {
          artwork: {
            id: item.artwork_id || item.artwork.id,
            title: item.artwork.title || 'Untitled Artwork',
            price: item.artwork.price || 0
          },
          quantity: item.quantity || 1
        };
      });

      // Validate formatted items
      const invalidItems = formattedItems.filter(item => 
        !item.artwork.id || 
        !item.artwork.title || 
        !item.artwork.price || 
        item.artwork.price <= 0 ||
        !item.quantity ||
        item.quantity <= 0
      );

      if (invalidItems.length > 0) {
        console.error('❌ Invalid items found:', invalidItems);
        toast({
          variant: "destructive",
          title: "Invalid Cart Items",
          description: "Some items in your cart are invalid. Please refresh and try again.",
        });
        return;
      }

      // Log order payload for debugging
      console.log('📤 Sending order payload to create-order function:', {
        itemsCount: formattedItems.length,
        totalAmount: total,
        totalAmountInPaise: Math.round(total * 100)
      });

      // Create order on server using Supabase Edge Function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
        body: { 
          items: formattedItems, 
          totalAmount: total // Send amount in rupees (will be converted to paise in Edge Function)
        }
      });

      // Enhanced error handling
      if (orderError) {
        console.error('❌ Order creation failed:', {
          error: orderError,
          message: orderError.message,
          context: orderError.context
        });
        
        let errorMessage = "Unable to create order. Please try again.";
        if (orderError.message) {
          errorMessage = orderError.message;
        }
        
        toast({
          variant: "destructive",
          title: "Checkout Failed",
          description: errorMessage,
        });
        return;
      }

      // Check if orderData exists and has required fields
      if (!orderData) {
        console.error('❌ No order data received from server');
        toast({
          variant: "destructive", 
          title: "Checkout Failed",
          description: "Invalid response from server. Please try again.",
        });
        return;
      }

      // Log successful response
      console.log('✅ Order created successfully:', {
        orderId: orderData.id,
        amount: orderData.amount,
        amountInRupees: `₹${(orderData.amount / 100).toFixed(2)}`,
        currency: orderData.currency,
        keyId: orderData.key_id ? `${orderData.key_id.slice(0, 8)}...${orderData.key_id.slice(-4)}` : 'MISSING'
      });

      // Verify required fields in response
      if (!orderData.id || !orderData.amount || !orderData.key_id) {
        console.error('❌ Invalid order response - missing required fields:', {
          hasId: !!orderData.id,
          hasAmount: !!orderData.amount,
          hasKeyId: !!orderData.key_id,
          orderData
        });
        toast({
          variant: "destructive", 
          title: "Checkout Failed",
          description: "Invalid order configuration received from server.",
        });
        return;
      }

      // Verify we're using LIVE key
      if (!orderData.key_id.startsWith('rzp_live_')) {
        console.warn('⚠️ WARNING: Not using live Razorpay key:', orderData.key_id?.slice(0, 8));
      } else {
        console.log('✅ Using LIVE Razorpay key');
      }

      // Wait for Razorpay script to load if not already loaded
      if (!window.Razorpay) {
        console.log('⏳ Waiting for Razorpay script to load...');
        let attempts = 0;
        while (!window.Razorpay && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        if (!window.Razorpay) {
          throw new Error('Razorpay checkout script failed to load');
        }
      }

      // Initialize Razorpay checkout with LIVE key from backend
      const options = {
        key: orderData.key_id, // LIVE key from Edge Function
        amount: orderData.amount, // Amount in paise (already from Razorpay)
        currency: orderData.currency || 'INR',
        order_id: orderData.id, // Razorpay order ID
        name: 'Gallery Canvas',
        description: `Order for ${formattedItems.length} item(s)`,
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            console.log('💳 Payment response received:', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              hasSignature: !!response.razorpay_signature
            });

            // Verify payment with backend
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            });

            if (verifyError) {
              console.error('❌ Payment verification failed:', verifyError);
              toast({
                variant: "destructive",
                title: "Payment Verification Failed",
                description: verifyError.message || "Unable to verify your payment. Please contact support.",
              });
              navigate('/payment-failed');
              return;
            }

            if (!verifyData || !verifyData.success) {
              console.error('❌ Payment verification returned failure:', verifyData);
              toast({
                variant: "destructive",
                title: "Payment Verification Failed",
                description: "Payment could not be verified. Please contact support.",
              });
              navigate('/payment-failed');
              return;
            }

            console.log('✅ Payment verified successfully:', verifyData);

            // Clear cart after successful payment
            console.log('🛒 Clearing cart...');
            for (const item of items) {
              try {
                await removeFromCart(item.id);
              } catch (removeError) {
                console.error(`Failed to remove item ${item.id} from cart:`, removeError);
                // Continue removing other items even if one fails
              }
            }

            toast({
              title: "Payment Successful! 🎉",
              description: "Your order has been placed successfully. You will receive a confirmation email shortly.",
            });
            
            console.log('=== CHECKOUT PROCESS SUCCESS ===');
            navigate('/order-success');
          } catch (error) {
            console.error('❌ Error in payment handler:', error);
            toast({
              variant: "destructive",
              title: "Payment Processing Error",
              description: "An error occurred while processing your payment. Please contact support if the amount was deducted.",
            });
            navigate('/payment-failed');
          }
        },
        modal: {
          ondismiss: function() {
            console.log('⚠️ User cancelled payment');
            toast({
              variant: "destructive",
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
            });
            navigate('/payment-failed');
          }
        },
        prefill: {
          // These can be populated from user profile if available
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#6366f1',
          backdrop_color: '#ffffff',
          hide_topbar: false,
        },
        notes: {
          items: JSON.stringify(formattedItems.map(item => ({
            id: item.artwork.id,
            title: item.artwork.title,
            quantity: item.quantity
          })))
        }
      };

      console.log('🚀 Opening Razorpay checkout...');
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('❌ Checkout error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Unable to process your payment. Please try again.",
      });
      
      // Only navigate to payment-failed if we're not already on checkout page
      // This prevents navigation loops
      if (window.location.pathname !== '/payment-failed') {
        navigate('/payment-failed');
      }
    } finally {
      setIsProcessing(false);
      console.log('=== CHECKOUT PROCESS END ===');
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
        
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            {items.length === 0 ? (
              <p className="text-muted-foreground">Your cart is empty.</p>
            ) : (
              <>
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
              </>
            )}
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
