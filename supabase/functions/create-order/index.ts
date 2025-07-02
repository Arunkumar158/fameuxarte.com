
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
    const { items, totalAmount } = await req.json();
    
    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID') || '',
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') || '',
    });

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Convert to smallest currency unit (paise)
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    return new Response(
      JSON.stringify({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create order' }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
