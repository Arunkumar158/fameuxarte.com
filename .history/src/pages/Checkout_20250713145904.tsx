import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Helper function to format currency in INR
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const Checkout = () => {
  const { items, removeFromCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const total = items.reduce((sum, item) => sum + (item.artwork.price * item.quantity), 0);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Create order on server
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
        body: { items, totalAmount: total }
      });

      if (orderError) throw orderError;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: "rzp_test_i99VSCi7UUbsms",
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.id,
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
