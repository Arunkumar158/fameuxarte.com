import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Razorpay from "npm:razorpay@2.9.2";

// Type definitions for request and response
interface OrderItem {
  artwork: {
    id: string;
    title: string;
    price: number;
  };
  quantity: number;
}

interface OrderRequest {
  items: OrderItem[];
  totalAmount: number;
  orderId?: string;
}

interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  key_id: string;
}

interface ErrorResponse {
  error: string;
  details?: Record<string, any>;
  timestamp: string;
}

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

    // Log request payload structure (without sensitive data)
    console.log('Request payload received:', {
      itemsCount: requestPayload.items?.length || 0,
      totalAmount: requestPayload.totalAmount,
      orderId: requestPayload.orderId,
      itemsStructure: requestPayload.items?.map((item: any, idx: number) => ({
        index: idx,
        hasArtwork: !!item.artwork,
        artworkId: item.artwork?.id || 'MISSING',
        artworkTitle: item.artwork?.title || 'MISSING',
        artworkPrice: item.artwork?.price ?? 'MISSING',
        quantity: item.quantity ?? 'MISSING'
      }))
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
      const missingFields: string[] = [];
      
      // Check if artwork object exists
      if (!item.artwork || typeof item.artwork !== 'object') {
        throw new Error(
          `Invalid item at index ${index}: missing artwork object. ` +
          `Received: ${JSON.stringify(item)}`
        );
      }
      
      // Check for required fields with clear error messages
      if (!item.artwork.id) {
        missingFields.push('artwork.id (artworkId)');
      }
      if (item.artwork.title === undefined || item.artwork.title === null || item.artwork.title === '') {
        missingFields.push('artwork.title');
      }
      if (item.artwork.price === undefined || item.artwork.price === null) {
        missingFields.push('artwork.price');
      }
      if (item.quantity === undefined || item.quantity === null) {
        missingFields.push('quantity');
      }
      
      if (missingFields.length > 0) {
        throw new Error(
          `Invalid item at index ${index}: missing ${missingFields.join(', ')}. ` +
          `Item structure: ${JSON.stringify(item, null, 2)}`
        );
      }

      // Validate types
      if (typeof item.artwork.price !== 'number' || item.artwork.price <= 0) {
        throw new Error(
          `Invalid item at index ${index}: artwork.price must be a positive number, got ${typeof item.artwork.price} (${item.artwork.price})`
        );
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        throw new Error(
          `Invalid item at index ${index}: quantity must be a positive integer, got ${typeof item.quantity} (${item.quantity})`
        );
      }
      
      // Log validated item for debugging
      console.log(`Item ${index} validated:`, {
        artworkId: item.artwork.id,
        title: item.artwork.title,
        price: item.artwork.price,
        quantity: item.quantity
      });
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