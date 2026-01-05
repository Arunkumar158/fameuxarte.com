// @ts-expect-error - Deno standard library import
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-expect-error - Deno npm: specifier
import Razorpay from "npm:razorpay@2.9.2";

// Deno global type declaration
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

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
  details?: Record<string, unknown>;
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
    console.log('=== CREATE ORDER REQUEST START ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // Parse request payload ONCE
    let requestPayload: OrderRequest;
    try {
      // Clone request to read body for logging without consuming the stream
      const clonedReq = req.clone();
      const rawBody = await clonedReq.text();
      console.log('Raw request body (first 1000 chars):', rawBody.substring(0, 1000));
      console.log('Raw request body length:', rawBody.length);
      
      // Parse the original request
      requestPayload = await req.json();
      console.log('✅ Successfully parsed JSON payload');
      console.log('Parsed payload type:', typeof requestPayload);
      console.log('Parsed payload keys:', Object.keys(requestPayload));
    } catch (parseError) {
      console.error('❌ Failed to parse request JSON:', parseError);
      if (parseError instanceof Error) {
        console.error('Parse error message:', parseError.message);
        console.error('Parse error stack:', parseError.stack);
      }
      // Try to get raw body for debugging if possible
      try {
        const clonedReq = req.clone();
        const rawBody = await clonedReq.text();
        console.error('Raw body that failed to parse (first 1000 chars):', rawBody.substring(0, 1000));
      } catch (e) {
        console.error('Could not read raw body for debugging');
      }
      throw new Error('Invalid JSON payload');
    }
    
    // Get Razorpay environment variables (LIVE KEYS)
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    console.log('Razorpay Configuration:', {
      key_id: keyId ? `${keyId.slice(0, 8)}...${keyId.slice(-4)}` : 'NOT SET',
      key_secret: keySecret ? `${keySecret.slice(0, 4)}...${keySecret.slice(-4)}` : 'NOT SET',
      environment: keyId?.startsWith('rzp_live_') ? 'LIVE' : keyId?.startsWith('rzp_test_') ? 'TEST' : 'UNKNOWN'
    });

    // Validate Razorpay credentials first
    if (!keyId || !keySecret) {
      console.error('❌ Razorpay credentials not configured in environment variables');
      throw new Error('Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Supabase Edge Function secrets.');
    }

    // Ensure we're using LIVE keys
    if (!keyId.startsWith('rzp_live_')) {
      console.warn('⚠️ WARNING: Not using live Razorpay key. Expected rzp_live_* but got:', keyId?.slice(0, 8));
    }

    // Log request payload structure (without sensitive data)
    console.log('Request payload received:', {
      itemsCount: requestPayload.items?.length || 0,
      totalAmount: requestPayload.totalAmount,
      totalAmountType: typeof requestPayload.totalAmount,
      orderId: requestPayload.orderId,
      itemsStructure: requestPayload.items?.map((item: OrderItem, idx: number) => ({
        index: idx,
        hasArtwork: !!item.artwork,
        artworkId: item.artwork?.id || 'MISSING',
        artworkTitle: item.artwork?.title || 'MISSING',
        artworkPrice: item.artwork?.price ?? 'MISSING',
        artworkPriceType: typeof item.artwork?.price,
        quantity: item.quantity ?? 'MISSING',
        quantityType: typeof item.quantity
      }))
    });
    
    const { items, totalAmount: rawTotalAmount, orderId } = requestPayload;
    
    // Handle potential string-to-number conversion for totalAmount
    let totalAmount: number;
    if (typeof rawTotalAmount === 'string') {
      console.log('⚠️ totalAmount is a string, converting to number:', rawTotalAmount);
      totalAmount = parseFloat(rawTotalAmount);
      if (isNaN(totalAmount)) {
        throw new Error(`Invalid total amount: cannot convert "${rawTotalAmount}" to a number`);
      }
    } else if (typeof rawTotalAmount === 'number') {
      totalAmount = rawTotalAmount;
    } else {
      throw new Error(`Invalid total amount type: expected number or string, got ${typeof rawTotalAmount}`);
    }

    // Enhanced validation with detailed errors
    if (totalAmount === undefined || totalAmount === null) {
      console.error('❌ Validation failed: Total amount is missing');
      throw new Error('Total amount is required');
    }
    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      console.error('❌ Validation failed: Invalid total amount:', totalAmount);
      throw new Error(`Invalid total amount: ${totalAmount}. Amount must be a positive number.`);
    }

    if (!items) {
      console.error('❌ Validation failed: Items array is missing');
      throw new Error('Items array is required');
    }
    if (!Array.isArray(items)) {
      console.error('❌ Validation failed: Items is not an array:', typeof items);
      throw new Error('Items must be an array');
    }
    if (items.length === 0) {
      console.error('❌ Validation failed: Items array is empty');
      throw new Error('Items array cannot be empty');
    }

    // Validate items structure with better error messages and type coercion
    const validatedItems: OrderItem[] = items.map((item: any, index: number) => {
      const missingFields: string[] = [];
      
      // Check if artwork object exists
      if (!item.artwork || typeof item.artwork !== 'object') {
        console.error(`❌ Item ${index} validation failed: Missing artwork object`);
        console.error(`Item structure:`, JSON.stringify(item, null, 2));
        throw new Error(
          `Invalid item at index ${index}: missing artwork object. ` +
          `Received: ${JSON.stringify(item)}`
        );
      }
      
      // Check for required fields with clear error messages
      if (!item.artwork.id) {
        missingFields.push('artwork.id');
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
        console.error(`❌ Item ${index} validation failed: Missing fields:`, missingFields);
        console.error(`Item structure:`, JSON.stringify(item, null, 2));
        throw new Error(
          `Invalid item at index ${index}: missing ${missingFields.join(', ')}. ` +
          `Item structure: ${JSON.stringify(item, null, 2)}`
        );
      }

      // Handle type coercion for price (string to number)
      let price: number;
      if (typeof item.artwork.price === 'string') {
        console.log(`⚠️ Item ${index} price is a string, converting:`, item.artwork.price);
        price = parseFloat(item.artwork.price);
        if (isNaN(price)) {
          throw new Error(
            `Invalid item at index ${index}: artwork.price cannot be converted to number: "${item.artwork.price}"`
          );
        }
      } else if (typeof item.artwork.price === 'number') {
        price = item.artwork.price;
      } else {
        throw new Error(
          `Invalid item at index ${index}: artwork.price must be a number or numeric string, got ${typeof item.artwork.price}`
        );
      }

      // Validate price value
      if (price <= 0 || !isFinite(price)) {
        console.error(`❌ Item ${index} validation failed: Invalid price value:`, price);
        throw new Error(
          `Invalid item at index ${index}: artwork.price must be a positive number, got ${price}`
        );
      }

      // Handle type coercion for quantity (string to number)
      let quantity: number;
      if (typeof item.quantity === 'string') {
        console.log(`⚠️ Item ${index} quantity is a string, converting:`, item.quantity);
        quantity = parseInt(item.quantity, 10);
        if (isNaN(quantity)) {
          throw new Error(
            `Invalid item at index ${index}: quantity cannot be converted to integer: "${item.quantity}"`
          );
        }
      } else if (typeof item.quantity === 'number') {
        quantity = item.quantity;
      } else {
        throw new Error(
          `Invalid item at index ${index}: quantity must be a number or numeric string, got ${typeof item.quantity}`
        );
      }

      // Validate quantity value
      if (quantity <= 0 || !Number.isInteger(quantity) || !isFinite(quantity)) {
        console.error(`❌ Item ${index} validation failed: Invalid quantity value:`, quantity);
        throw new Error(
          `Invalid item at index ${index}: quantity must be a positive integer, got ${quantity}`
        );
      }
      
      // Return validated and normalized item
      const validatedItem: OrderItem = {
        artwork: {
          id: String(item.artwork.id), // Ensure string
          title: String(item.artwork.title), // Ensure string
          price: price // Ensure number
        },
        quantity: quantity // Ensure integer
      };
      
      // Log validated item for debugging
      console.log(`✅ Item ${index} validated:`, {
        artworkId: validatedItem.artwork.id,
        title: validatedItem.artwork.title,
        price: validatedItem.artwork.price,
        quantity: validatedItem.quantity
      });
      
      return validatedItem;
    });

    // Initialize Razorpay client with LIVE credentials
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Convert INR amount to paise (smallest currency unit)
    // Example: ₹499.00 → 49900 paise
    const orderAmount = Math.round(totalAmount * 100);
    const orderReceipt = orderId ? `order_${orderId}` : `order_${Date.now()}`;

    console.log('Creating Razorpay order with LIVE API:', {
      amount: orderAmount,
      amountInRupees: `₹${totalAmount.toFixed(2)}`,
      currency: 'INR',
      receipt: orderReceipt,
      itemCount: validatedItems.length
    });

    // Create order using Razorpay Orders API
    let order: {
      id: string;
      amount: number;
      currency: string;
      receipt: string;
      status: string;
      created_at: number;
    };
    try {
      order = await razorpay.orders.create({
        amount: orderAmount, // Amount in paise
        currency: 'INR',
        receipt: orderReceipt,
        notes: {
          orderId: orderId || '',
          itemCount: String(validatedItems.length),
          items: JSON.stringify(validatedItems.map((item: OrderItem) => ({
            id: item.artwork.id,
            title: item.artwork.title,
            quantity: item.quantity,
            price: item.artwork.price
          })))
        }
      });
    } catch (razorpayError: unknown) {
      const errorMessage = razorpayError instanceof Error 
        ? razorpayError.message 
        : 'Failed to create order';
      const errorDetails = razorpayError && typeof razorpayError === 'object' && 'error' in razorpayError
        ? razorpayError.error
        : razorpayError;
      const statusCode = razorpayError && typeof razorpayError === 'object' && 'statusCode' in razorpayError
        ? razorpayError.statusCode
        : undefined;
      const description = razorpayError && typeof razorpayError === 'object' && 'description' in razorpayError
        ? razorpayError.description
        : undefined;
      
      console.error('❌ Razorpay API error:', {
        message: errorMessage,
        error: errorDetails,
        statusCode,
        description
      });
      throw new Error(`Razorpay API error: ${errorMessage}`);
    }

    console.log('✅ Razorpay order created successfully:', {
      orderId: order.id,
      amount: order.amount,
      amountInRupees: `₹${(order.amount / 100).toFixed(2)}`,
      currency: order.currency,
      status: order.status,
      receipt: order.receipt,
      createdAt: new Date(order.created_at * 1000).toISOString()
    });

    // Prepare response with LIVE key_id
    const response: OrderResponse = {
      id: order.id,
      amount: order.amount, // Amount in paise (already from Razorpay)
      currency: order.currency || 'INR',
      receipt: order.receipt,
      key_id: keyId, // LIVE key_id for frontend
    };

    console.log('=== CREATE ORDER REQUEST SUCCESS ===');
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    // Enhanced error logging
    console.error('❌ Error creating order:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });

    let errorMessage = 'Failed to create order';
    let errorDetails: Record<string, unknown> | undefined = undefined;
    let statusCode = 400;

    // Handle specific error types
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('Payment gateway not configured')) {
        errorDetails = {
          issue: 'Razorpay credentials not configured properly',
          keyIdSet: Boolean(Deno.env.get('RAZORPAY_KEY_ID')),
          keySecretSet: Boolean(Deno.env.get('RAZORPAY_KEY_SECRET')),
          instructions: 'Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Supabase Edge Function secrets'
        };
        statusCode = 500;
      } else if (error.message.includes('Invalid total amount') || error.message.includes('missing required fields')) {
        statusCode = 400;
      } else if (error.message.includes('Items array')) {
        statusCode = 400;
      } else if (error.message.includes('Razorpay API error')) {
        // Razorpay API errors
        errorMessage = 'Payment gateway error';
        errorDetails = {
          originalError: error.message
        };
        statusCode = 502;
      } else if (error.message.includes('Invalid JSON')) {
        statusCode = 400;
      }
    }

    const errorResponse: ErrorResponse = {
      error: errorMessage,
      ...(errorDetails && { details: errorDetails }),
      timestamp: new Date().toISOString(),
    };

    console.error('=== CREATE ORDER REQUEST FAILED ===');
    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: statusCode,
      }
    );
  }
});
