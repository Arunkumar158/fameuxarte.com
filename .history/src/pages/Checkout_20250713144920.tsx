import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { items, removeFromCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const total = items.reduce((sum, item) => sum + (item.artwork.price * item.quantity), 0);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to complete your purchase.",
        });
        navigate('/auth');
        return;
      }

      // Create order in database first
      const { data: orderRecord, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending',
          billing_address: null, // Will be updated later
          shipping_address: null, // Will be updated later
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order record:', orderError);
        throw new Error('Failed to create order');
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderRecord.id,
        artwork_id: item.artwork.id,
        quantity: item.quantity,
        price_at_purchase: item.artwork.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw new Error('Failed to create order items');
      }

      // Create Razorpay order
      const { data: orderData, error: razorpayError } = await supabase.functions.invoke('create-order', {
        body: { 
          items, 
          totalAmount: total,
          orderId: orderRecord.id 
        }
      });

      if (razorpayError) {
        console.error('Razorpay order creation error:', razorpayError);
        throw razorpayError;
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_i99VSCi7UUbsms", // Fallback to test key
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.id,
          name: 'Fameuxarte Gallery',
          description: 'Art Purchase',
          handler: async (response: any) => {
            try {
              console.log('Payment response:', response);
              
              // Verify payment
              const { error: verifyError } = await supabase.functions.invoke('verify-payment', {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderRecord.id, // Pass our order ID
                }
              });

              if (verifyError) {
                console.error('Payment verification error:', verifyError);
                toast({
                  variant: "destructive",
                  title: "Payment Verification Failed",
                  description: "Unable to verify your payment. Please contact support.",
                });
                navigate('/payment-failed?type=verification_failed&message=Payment verification failed');
                return;
              }

              // Clear cart
              for (const item of items) {
                await removeFromCart(item.id);
              }

              toast({
                title: "Payment Successful!",
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
              navigate('/payment-failed?type=network_error&message=Network error during payment processing');
            }
          },
          modal: {
            ondismiss: function() {
              console.log('Payment cancelled by user');
              toast({
                variant: "destructive",
                title: "Payment Cancelled",
                description: "You cancelled the payment process. Your cart items are still available.",
              });
              // Don't navigate to payment-failed for cancellation
              // User can try again from checkout
            }
          },
          prefill: {
            name: user?.user_metadata?.full_name || '',
            email: user?.email || '',
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

      script.onerror = () => {
        throw new Error('Failed to load Razorpay script');
      };

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Unable to process your payment. Please try again.",
      });
      navigate('/payment-failed?type=general&message=' + encodeURIComponent(error instanceof Error ? error.message : "Checkout failed"));
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
                <p className="font-medium">${(item.artwork.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Total</p>
                <p className="text-xl font-semibold">${total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Please sign in to complete your purchase.
              </p>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handlePayment}
            disabled={isProcessing || items.length === 0 || !user}
          >
            {isProcessing ? "Processing..." : `Pay $${total.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
