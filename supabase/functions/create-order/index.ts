
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { default as Razorpay } from "npm:razorpay@2.9.2";

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
    // Log available environment variables (keys only)
    console.log('Available environment variables:', 
      Object.keys(Deno.env.toObject())
        .filter(key => key.includes('RAZORPAY'))
    );

    // Parse and log request payload
    const requestPayload = await req.json();
    console.log('Request payload:', JSON.stringify(requestPayload, null, 2));
    
    const { items, totalAmount, orderId } = requestPayload;
    
    // Enhanced validation with detailed errors
    if (!totalAmount) {
      throw new Error('Total amount is required');
    }
    if (totalAmount <= 0) {
      throw new Error(`Invalid total amount: ${totalAmount}`);
    }

    if (!items) {
      throw new Error('Items array is required');
    }
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }
    if (items.length === 0) {
      throw new Error('Items array cannot be empty');
    }

    // Validate items structure
    items.forEach((item, index) => {
      if (!item.artwork?.id || !item.artwork?.title || !item.artwork?.price || !item.quantity) {
        throw new Error(`Invalid item at index ${index}: ${JSON.stringify(item)}`);
      }
    });

    const razorpay = new Razorpay({
      key_id: Deno.env.get('RAZORPAY_KEY_ID') || '',
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') || '',
    });

    // Validate Razorpay credentials
    if (!Deno.env.get('RAZORPAY_KEY_ID') || !Deno.env.get('RAZORPAY_KEY_SECRET')) {
      console.error('Razorpay credentials not configured');
      throw new Error('Payment gateway not configured');
    }

    console.log('Creating Razorpay order with payload:', {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: orderId ? `order_${orderId}` : `order_${Date.now()}`
    });

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

    console.log('Razorpay API response:', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      createdAt: order.created_at
    });

    return new Response(
      JSON.stringify({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        key_id: Deno.env.get('RAZORPAY_KEY_ID'),
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    // Enhanced error logging
    console.error('Error creating order:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });

    let errorMessage = 'Failed to create order';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    let statusCode = 400;

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Payment gateway not configured')) {
        errorMessage = 'Payment gateway configuration error';
        statusCode = 500;
      } else if (error.message.includes('Invalid total amount')) {
        errorMessage = 'Invalid request data';
        statusCode = 400;
      }
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        requestId: req.headers.get('x-request-id') || undefined
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: statusCode,
      }
    );
  }
});
