
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Razorpay from "npm:razorpay@2.9.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, totalAmount, orderId } = await req.json();
    
    // Validate required fields
    if (!totalAmount || totalAmount <= 0) {
      throw new Error('Invalid total amount');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid items array');
    }

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID') || '',
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') || '',
    });

    // Validate Razorpay credentials
    if (!Deno.env.get('RAZORPAY_KEY_ID') || !Deno.env.get('RAZORPAY_KEY_SECRET')) {
      console.error('Razorpay credentials not configured');
      throw new Error('Payment gateway not configured');
    }

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Convert to smallest currency unit (paise)
      currency: 'INR',
      receipt: orderId ? `order_${orderId}` : `order_${Date.now()}`,
      notes: {
        orderId: orderId || '',
        items: JSON.stringify(items.map(item => ({
          id: item.artwork.id,
          title: item.artwork.title,
          quantity: item.quantity,
          price: item.artwork.price
        })))
      }
    });

    console.log('Razorpay order created:', order.id);

    return new Response(
      JSON.stringify({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
