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
    // Parse request payload ONCE
    const requestPayload = await req.json();
    
    // Get Razorpay environment variables
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    console.log('Razorpay Configuration:', {
      key_id: keyId ? `${keyId.slice(0,6)}...${keyId.slice(-4)}` : 'Not set',
      key_secret: keySecret ? `${keySecret.slice(0,4)}...${keySecret.slice(-4)}` : 'Not set',
      environment: keyId?.startsWith('rzp_live_') ? 'LIVE' : 'TEST'
    });

    // Log request payload
    console.log('Request payload:', {
      items: requestPayload.items?.length,
      totalAmount: requestPayload.totalAmount,
      orderId: requestPayload.orderId
    });
    
    const { items, totalAmount, orderId } = requestPayload;
    
    // Validate Razorpay credentials first
    if (!keyId || !keySecret) {
      console.error('Razorpay credentials not configured');
      throw new Error('Payment gateway not configured');
    }

    // Enhanced validation with detailed errors
    if (totalAmount === undefined || totalAmount === null) {
      throw new Error('Total amount is required');
    }
    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      throw new Error(`Invalid total amount: ${totalAmount}. Amount must be a positive number.`);
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

    // Validate items structure with better error messages
    items.forEach((item: any, index: number) => {
      const missingFields = [];
      
      if (!item.artwork) {
        throw new Error(`Item at index ${index} is missing 'artwork' object`);
      }
      
      if (!item.artwork.id) missingFields.push('artwork.id');
      if (!item.artwork.title) missingFields.push('artwork.title');
      if (!item.artwork.price) missingFields.push('artwork.price');
      if (!item.quantity) missingFields.push('quantity');
      
      if (missingFields.length > 0) {
        throw new Error(
          `Item at index ${index} is missing required fields: ${missingFields.join(', ')}. ` +
          `Received: ${JSON.stringify(item)}`
        );
      }

      // Validate types
      if (typeof item.artwork.price !== 'number' || item.artwork.price <= 0) {
        throw new Error(`Item at index ${index} has invalid price: ${item.artwork.price}`);
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new Error(`Item at index ${index} has invalid quantity: ${item.quantity}`);
      }
    });

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderAmount = Math.round(totalAmount * 100);
    const orderReceipt = orderId ? `order_${orderId}` : `order_${Date.now()}`;

    console.log('Creating Razorpay order:', {
      amount: orderAmount,
      currency: 'INR',
      receipt: orderReceipt
    });

    const order = await razorpay.orders.create({
      amount: orderAmount, // Convert to smallest currency unit (paise)
      currency: 'INR',
      receipt: orderReceipt,
      notes: {
        orderId: orderId || '',
        itemCount: items.length,
        items: JSON.stringify(items.map((item: any) => ({
          id: item.artwork.id,
          title: item.artwork.title,
          quantity: item.quantity,
          price: item.artwork.price
        })))
      }
    });

    console.log('Razorpay order created successfully:', {
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
        key_id: keyId,
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
    let errorDetails: Record<string, any> = {};
    let statusCode = 400;

    // Handle specific error types
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('Payment gateway not configured')) {
        errorDetails = {
          issue: 'Razorpay credentials not configured properly',
          keyIdSet: Boolean(Deno.env.get('RAZORPAY_KEY_ID')),
          keySecretSet: Boolean(Deno.env.get('RAZORPAY_KEY_SECRET'))
        };
        statusCode = 500;
      } else if (error.message.includes('Invalid total amount') || error.message.includes('missing required fields')) {
        statusCode = 400;
      } else if (error.message.includes('Items array')) {
        statusCode = 400;
      } else if (error.message.toLowerCase().includes('razorpay') || error.message.includes('API')) {
        // Razorpay API errors
        errorMessage = 'Payment gateway error';
        errorDetails = {
          originalError: error.message
        };
        statusCode = 502;
      }
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: statusCode,
      }
    );
  }
});