import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import HomeNav from "@/components/home/HomeNav";
import { trackEvent, trackPageViewed } from "@/lib/analytics";

// Razorpay payment response interface
interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Backend order creation request interface
// Edge Function expects: { artworkId, quantity, price }
interface OrderItemRequest {
  artworkId: string;
  quantity: number;
  price: number; // in rupees
}

interface CreateOrderRequest {
  items: OrderItemRequest[];
  totalAmount: number; // in rupees, NOT paise
}

// Backend order creation response interface (matches create-order Edge Function)
interface CreateOrderResponse {
  razorpay_order_id: string;
  amount: number; // in paise
  currency: string; // "INR"
  key_id: string; // live Razorpay key_id
  order_id: number; // internal Supabase order row ID
}

// Razorpay checkout options interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
}

// Razorpay instance interface
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
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate total amount in rupees (NOT paise)
  const totalAmount = items.reduce((sum, item) => sum + (item.artwork.price * item.quantity), 0);

  // Load Razorpay script on component mount
  useEffect(() => {
    trackPageViewed({ page: 'Checkout', title: 'Checkout' });
    trackEvent('checkout_started', { amount: totalAmount, items_count: items.length });
    
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

  /**
   * Main payment handler
   * Steps:
   * 1. Validate cart and user session
   * 2. Format items according to backend contract
   * 3. Call create-order Edge Function with Authorization header
   * 4. Initialize Razorpay checkout with backend response
   * 5. Handle payment success/failure
   */
  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      console.log('=== CHECKOUT PROCESS START ===');
      console.log('Timestamp:', new Date().toISOString());

      // Step 1: Validate cart
      if (!items || items.length === 0) {
        console.error('❌ Cart is empty');
        toast({
          variant: "destructive",
          title: "Cart Empty",
          description: "Your collection is empty. Please reserve artworks before proceeding.",
        });
        return;
      }

      // Step 2: Validate user session (required for Authorization header)
      if (!session || !session.access_token) {
        console.error('❌ User session not found or missing access token');
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to proceed with secure acquisition.",
        });
        navigate('/auth');
        return;
      }

      console.log('✅ User session validated');
      console.log('📦 Cart items count:', items.length);
      console.log('💰 Total amount (rupees):', totalAmount);

      // 🔍 DEBUG - Log raw cart items structure
      console.log('🔍 Cart Items (raw):', JSON.stringify(items, null, 2));
      console.log('🔍 Cart Items (detailed):', items.map((item, idx) => {
        const artwork = item.artwork as any;
        return {
          index: idx,
          cartItemId: item.id,
          hasArtworkId: !!item.artwork_id,
          artworkId: item.artwork_id,
          artworkIdType: typeof item.artwork_id,
          hasArtwork: !!artwork,
          artwork: artwork ? {
            hasId: !!artwork.id,
            id: artwork.id,
            idType: typeof artwork.id,
            hasTitle: !!artwork.title,
            title: artwork.title,
            hasPrice: artwork.price !== undefined && artwork.price !== null,
            price: artwork.price,
            priceType: typeof artwork.price
          } : null,
          hasQuantity: item.quantity !== undefined && item.quantity !== null,
          quantity: item.quantity,
          quantityType: typeof item.quantity
        };
      }));

      // Step 3: Format items according to backend contract
      // Backend expects: { items: [{ artworkId, quantity, price }], totalAmount }
      const formattedItems: OrderItemRequest[] = items.map((item, index) => {
        const artwork = item.artwork as any;
        console.log(`🔍 Processing item ${index}:`, {
          cartItemId: item.id,
          artworkId: item.artwork_id,
          artworkIdType: typeof item.artwork_id,
          artworkIdValue: item.artwork_id,
          hasArtwork: !!artwork,
          artworkIdFromArtwork: artwork?.id,
          artworkTitle: artwork?.title,
          artworkPrice: artwork?.price,
          artworkPriceType: typeof artwork?.price,
          quantity: item.quantity,
          quantityType: typeof item.quantity
        });

        // Validate item data with detailed error messages
        if (!item.artwork_id) {
          console.error(`❌ Item ${index} validation failed: artwork_id is missing`, {
            item: JSON.stringify(item, null, 2)
          });
          throw new Error(`Item ${index} is missing artwork_id`);
        }
        if (!artwork) {
          console.error(`❌ Item ${index} validation failed: artwork object is missing`, {
            item: JSON.stringify(item, null, 2)
          });
          throw new Error(`Item ${index} is missing artwork object`);
        }
        if (artwork.price === undefined || artwork.price === null) {
          console.error(`❌ Item ${index} validation failed: artwork.price is missing`, {
            item: JSON.stringify(item, null, 2),
            artwork: JSON.stringify(artwork, null, 2)
          });
          throw new Error(`Item ${index} has invalid price: ${artwork.price}`);
        }
        if (artwork.price <= 0) {
          console.error(`❌ Item ${index} validation failed: artwork.price is not positive`, {
            price: artwork.price
          });
          throw new Error(`Item ${index} has invalid price: ${artwork.price}`);
        }
        if (item.quantity === undefined || item.quantity === null) {
          console.error(`❌ Item ${index} validation failed: quantity is missing`, {
            item: JSON.stringify(item, null, 2)
          });
          throw new Error(`Item ${index} has invalid quantity: ${item.quantity}`);
        }
        if (item.quantity <= 0) {
          console.error(`❌ Item ${index} validation failed: quantity is not positive`, {
            quantity: item.quantity
          });
          throw new Error(`Item ${index} has invalid quantity: ${item.quantity}`);
        }

        // Extract values with type checking
        const artworkId = String(item.artwork_id);
        const quantity = Number(item.quantity);
        const price = Number(artwork.price);

        console.log(`✅ Item ${index} extracted values:`, {
          artworkId,
          artworkIdType: typeof artworkId,
          quantity,
          quantityType: typeof quantity,
          price,
          priceType: typeof price
        });

        // Return flat structure matching backend's expected format
        const mappedItem = {
          artworkId: artworkId,
          quantity: quantity,
          price: price // in rupees
        };

        console.log(`✅ Item ${index} mapped result:`, mappedItem);
        return mappedItem;
      });

      console.log('✅ Items formatted successfully:', {
        itemsCount: formattedItems.length,
        items: formattedItems.map(item => ({
          artworkId: item.artworkId,
          quantity: item.quantity,
          price: item.price
        }))
      });

      // Step 4: Prepare request body according to backend contract
      const requestBody: CreateOrderRequest = {
        items: formattedItems,
        totalAmount: totalAmount // in rupees, NOT paise
      };

      console.log('📤 Request payload:', {
        itemsCount: requestBody.items.length,
        totalAmount: requestBody.totalAmount,
        totalAmountType: typeof requestBody.totalAmount
      });

      // Step 5: Call create-order Edge Function with Authorization header
      // The supabase.functions.invoke automatically includes the Authorization header
      // with the session access token when called from an authenticated context
      console.log('🔐 Calling create-order Edge Function with Authorization header...');
      
      // 🔍 FULL DEBUG - Detailed request payload logging
      console.log('🔍 FULL REQUEST PAYLOAD:', JSON.stringify(requestBody, null, 2));
      console.log('🔍 Cart Items:', items);
      console.log('🔍 Mapped Items:', requestBody.items);
      console.log('🔍 Request Body Structure:', {
        hasItems: !!requestBody.items,
        itemsIsArray: Array.isArray(requestBody.items),
        itemsLength: requestBody.items?.length,
        itemsType: typeof requestBody.items,
        firstItem: requestBody.items?.[0],
        firstItemKeys: requestBody.items?.[0] ? Object.keys(requestBody.items[0]) : null,
        totalAmount: requestBody.totalAmount,
        totalAmountType: typeof requestBody.totalAmount
      });
      
      // 🔍 DEBUG - Full request details
      console.log('🔍 DEBUG - Full request details:', {
        url: 'https://oqslvwynlppuacdrhlxl.supabase.co/functions/v1/create-order',
        payload: requestBody,
        payloadStringified: JSON.stringify(requestBody, null, 2),
        sessionUser: session?.user?.id,
        authToken: session?.access_token ? 'Present' : 'Missing'
      });
      
      // 🔍 VERIFY - Check the exact structure being sent
      console.log('🔍 VERIFY - Request body type:', typeof requestBody);
      console.log('🔍 VERIFY - Request body is object:', typeof requestBody === 'object' && !Array.isArray(requestBody));
      console.log('🔍 VERIFY - Request body keys:', Object.keys(requestBody));
      console.log('🔍 VERIFY - Items array check:', Array.isArray(requestBody.items));
      console.log('🔍 VERIFY - Items length:', requestBody.items?.length);
      console.log('🔍 VERIFY - First item structure:', requestBody.items?.[0]);
      console.log('🔍 VERIFY - Total amount:', requestBody.totalAmount, typeof requestBody.totalAmount);
      
      // 🔍 EXACT CALL - Log exactly what we're passing to invoke()
      const invokePayload = {
        body: requestBody
      };
      console.log('🔍 EXACT CALL - What we pass to invoke():', {
        functionName: 'create-order',
        bodyType: typeof invokePayload.body,
        bodyIsObject: typeof invokePayload.body === 'object',
        bodyKeys: Object.keys(invokePayload.body),
        bodyStringified: JSON.stringify(invokePayload.body, null, 2)
      });
      
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
        body: requestBody
      });

      // Step 6: Handle order creation errors
      if (orderError) {
        console.error('❌ Order creation failed:', {
          error: orderError,
          message: orderError.message,
          context: orderError.context,
          status: orderError.status,
          requestPayload: {
            itemsCount: requestBody.items.length,
            totalAmount: requestBody.totalAmount,
            itemsStructure: requestBody.items.map(item => ({
              artworkId: item.artworkId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        });

        // Extract detailed error message from response
        let errorMessage = "Unable to create order. Please try again.";
        if (orderError.message) {
          errorMessage = orderError.message;
        }
        
        // Check if error response contains details
        if (orderError.context && typeof orderError.context === 'object') {
          const errorDetails = orderError.context as Record<string, unknown>;
          if (errorDetails.error) {
            errorMessage = String(errorDetails.error);
          }
          if (errorDetails.details && typeof errorDetails.details === 'object') {
            const details = errorDetails.details as Record<string, unknown>;
            console.error('Error details:', details);
          }
        }

        toast({
          variant: "destructive",
          title: "Acquisition Unsuccessful",
          description: errorMessage,
        });
        return;
      }

      // Step 7: Validate order response
      if (!orderData) {
        console.error('❌ No order data received from server');
        toast({
          variant: "destructive",
          title: "Acquisition Unsuccessful",
          description: "Invalid response from server. Please try again.",
        });
        return;
      }

      // Check if response contains an error (sometimes errors are returned in data field)
      if (typeof orderData === 'object' && 'error' in orderData && orderData.error) {
        const errorResponse = orderData as { error: string; details?: Record<string, unknown>; timestamp?: string };
        console.error('❌ Error in response data:', errorResponse);
        toast({
          variant: "destructive",
          title: "Acquisition Unsuccessful",
          description: errorResponse.error || "Unable to create order. Please try again.",
        });
        return;
      }

      console.log('✅ Order created successfully:', {
        razorpayOrderId: orderData.razorpay_order_id,
        amount: orderData.amount,
        amountInRupees: `₹${(orderData.amount / 100).toFixed(2)}`,
        currency: orderData.currency,
        keyId: orderData.key_id ? `${orderData.key_id.slice(0, 8)}...${orderData.key_id.slice(-4)}` : 'MISSING',
        orderId: orderData.order_id
      });

      // Validate required fields in response
      if (!orderData.razorpay_order_id || !orderData.amount || !orderData.key_id) {
        console.error('❌ Invalid order response - missing required fields:', {
          hasRazorpayOrderId: !!orderData.razorpay_order_id,
          hasAmount: !!orderData.amount,
          hasKeyId: !!orderData.key_id,
          hasOrderId: !!orderData.order_id,
          orderData
        });
        toast({
          variant: "destructive",
          title: "Acquisition Unsuccessful",
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

      // Step 8: Wait for Razorpay script to load if not already loaded
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

      // Step 9: Initialize Razorpay checkout with backend response
      const options: RazorpayOptions = {
        key: orderData.key_id, // Use key_id from backend (LIVE key)
        amount: orderData.amount, // Amount in paise (from backend)
        currency: orderData.currency || 'INR',
        name: "Fameuxarte",
        order_id: orderData.razorpay_order_id,
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            console.log('💳 Payment response received:', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              hasSignature: !!response.razorpay_signature
            });

            // Verify payment with backend
            console.log('🔍 Verifying payment with backend...');
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            });

            if (verifyError) {
              console.error('❌ Payment verification failed:', {
                error: verifyError,
                message: verifyError.message,
                context: verifyError.context
              });
              toast({
                variant: "destructive",
                title: "Ownership Confirmation Unsuccessful",
                description: verifyError.message || "We could not confirm your ownership. Please contact support.",
              });
              navigate('/payment-failed');
              return;
            }

            if (!verifyData || !verifyData.success) {
              console.error('❌ Payment verification returned failure:', verifyData);
              toast({
                variant: "destructive",
                title: "Ownership Confirmation Unsuccessful",
                description: "Ownership could not be verified. Please contact support.",
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
                console.error(`❌ Failed to remove item ${item.id} from cart:`, removeError);
                // Continue removing other items even if one fails
              }
            }
            console.log('✅ Cart cleared successfully');

            toast({
title: "Acquisition Confirmed",
            description: "Your acquisition has been confirmed. You will receive a confirmation email shortly.",
            });

            console.log('=== CHECKOUT PROCESS SUCCESS ===');
            
            // Redirect to order success page with order_id from backend
            const orderId = orderData.order_id;
            if (orderId) {
              navigate(`/order-success?order_id=${orderId}`);
            } else {
              console.warn('⚠️ No order_id in response, redirecting without query param');
              navigate('/order-success');
            }
          } catch (error) {
            console.error('❌ Error in payment handler:', {
              error,
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            });
            toast({
              variant: "destructive",
title: "Ownership Confirmation Error",
            description: "An error occurred while confirming ownership. Please contact support if the amount was deducted.",
            });
            navigate('/payment-failed');
          }
        },
        modal: {
          ondismiss: function() {
            console.log('⚠️ User cancelled payment');
            toast({
              variant: "destructive",
title: "Acquisition Cancelled",
            description: "You cancelled the acquisition process.",
            });
            navigate('/payment-failed');
          }
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
        title: "Acquisition Unsuccessful",
        description: error instanceof Error ? error.message : "Unable to complete your acquisition. Please try again.",
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
      <div className="min-h-screen bg-obsidian text-linen">
        {/* HomeNav for consistent navigation */}
        <HomeNav />

        {/* Page header */}
        <header className="border-b border-b-[0.5px] border-border-faint bg-obsidian px-4 sm:px-6 py-8 sm:py-12">
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
              Secure acquisition
            </div>
            <h1 className="text-[26px] sm:text-[34px] font-medium leading-[1.12] tracking-[-0.025em] text-linen">
              Confirm your collection
            </h1>
            <p className="mt-2 text-[13px] text-stone">
              Powered by Razorpay · End-to-end encrypted
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
          <div className="space-y-4 sm:space-y-6">
            {/* Order summary card */}
            <div className="rounded-[10px] border border-border-subtle bg-surface-2 p-4 sm:p-6">
              <h2 className="mb-4 text-[16px] sm:text-[18px] font-medium tracking-[-0.02em] text-linen">
                Acquisition Summary
              </h2>
              {items.length === 0 ? (
                <p className="text-[14px] text-stone">Your collection is empty.</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 border-b border-border-faint pb-3 last:border-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-linen line-clamp-1">{item.artwork.title}</p>
                          <p className="text-[12px] text-[#666]">Qty: {item.quantity}</p>
                        </div>
                        <p className="shrink-0 text-[14px] font-medium text-linen">{formatCurrency(item.artwork.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border-faint pt-4">
                    <span className="text-[13px] text-stone">Total investment</span>
                    <span className="text-[22px] font-semibold tracking-[-0.02em] text-gold">{formatCurrency(totalAmount)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "ArtGuard verified" },
                { label: "Secure payment" },
                { label: "Ownership certificate" },
              ].map((item) => (
                <div key={item.label} className="rounded-[8px] border border-border-subtle bg-surface-2 px-2 py-3">
                  <p className="text-[10px] leading-[1.5] text-[#666]">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Pay button */}
            <Button
              className="h-12 sm:h-14 w-full rounded-[6px] bg-linen text-[13px] sm:text-[14px] font-medium text-obsidian hover:bg-gold transition-colors"
              onClick={handlePayment}
              disabled={isProcessing || items.length === 0}
            >
              {isProcessing
                ? "Confirming ownership…"
                : `Confirm Ownership — ${formatCurrency(totalAmount)}`}
            </Button>

            <p className="text-center text-[11px] leading-[1.6] text-[#555]">
              By proceeding you agree to Fameuxarte's Terms of Service. Payments are processed securely via Razorpay.
            </p>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default Checkout;
