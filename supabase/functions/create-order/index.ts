// @ts-expect-error - Deno standard library import
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
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
  artworkId: string;
  quantity: number;
  price: number;
}

interface OrderRequest {
  items: OrderItem[];
  totalAmount: number;
  orderId?: string;
}

interface OrderResponse {
  razorpay_order_id: string;
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

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 📥 Edge Function received - DEBUG LOG
    const clonedReqForDebug = req.clone();
    let debugBody: unknown;
    try {
      debugBody = await clonedReqForDebug.json();
    } catch (e) {
      debugBody = await clonedReqForDebug.text();
    }
    console.log('📥 Edge Function received:', {
      body: debugBody,
      headers: Object.fromEntries(req.headers.entries()),
      method: req.method
    });

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

    // Get Auth Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized – Missing Authorization Header");
    }

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
        artworkId: item.artworkId || 'MISSING',
        price: item.price ?? 'MISSING',
        priceType: typeof item.price,
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
    // Expected structure: { artworkId: string, quantity: number, price: number }
    const validatedItems: OrderItem[] = items.map((item: unknown, index: number) => {
      // Type guard to ensure item is an object
      if (!item || typeof item !== 'object') {
        throw new Error(`Invalid item at index ${index}: item must be an object`);
      }

      const itemObj = item as Record<string, unknown>;
      const missingFields: string[] = [];

      // Check for required fields: artworkId, quantity, price
      if (!itemObj.artworkId) {
        missingFields.push('artworkId');
      }
      if (itemObj.quantity === undefined || itemObj.quantity === null) {
        missingFields.push('quantity');
      }
      if (itemObj.price === undefined || itemObj.price === null) {
        missingFields.push('price');
      }

      if (missingFields.length > 0) {
        console.error(`❌ Item ${index} validation failed: Missing fields:`, missingFields);
        console.error(`Item structure:`, JSON.stringify(itemObj, null, 2));
        throw new Error(
          `Invalid item at index ${index}: missing ${missingFields.join(', ')}. ` +
          `Item structure: ${JSON.stringify(itemObj, null, 2)}`
        );
      }

      // Validate and coerce artworkId
      const artworkId = String(itemObj.artworkId);
      if (!artworkId || artworkId.trim() === '') {
        throw new Error(`Invalid item at index ${index}: artworkId cannot be empty`);
      }

      // Handle type coercion for price (string to number)
      let price: number;
      if (typeof itemObj.price === 'string') {
        console.log(`⚠️ Item ${index} price is a string, converting:`, itemObj.price);
        price = parseFloat(itemObj.price);
        if (isNaN(price)) {
          throw new Error(
            `Invalid item at index ${index}: price cannot be converted to number: "${itemObj.price}"`
          );
        }
      } else if (typeof itemObj.price === 'number') {
        price = itemObj.price;
      } else {
        throw new Error(
          `Invalid item at index ${index}: price must be a number or numeric string, got ${typeof itemObj.price}`
        );
      }

      // Validate price value
      if (price <= 0 || !isFinite(price)) {
        console.error(`❌ Item ${index} validation failed: Invalid price value:`, price);
        throw new Error(
          `Invalid item at index ${index}: price must be a positive number, got ${price}`
        );
      }

      // Handle type coercion for quantity (string to number)
      let quantity: number;
      if (typeof itemObj.quantity === 'string') {
        console.log(`⚠️ Item ${index} quantity is a string, converting:`, itemObj.quantity);
        quantity = parseInt(itemObj.quantity, 10);
        if (isNaN(quantity)) {
          throw new Error(
            `Invalid item at index ${index}: quantity cannot be converted to integer: "${itemObj.quantity}"`
          );
        }
      } else if (typeof itemObj.quantity === 'number') {
        quantity = itemObj.quantity;
      } else {
        throw new Error(
          `Invalid item at index ${index}: quantity must be a number or numeric string, got ${typeof itemObj.quantity}`
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
        artworkId: artworkId,
        quantity: quantity,
        price: price
      };

      // Log validated item for debugging
      console.log(`✅ Item ${index} validated:`, {
        artworkId: validatedItem.artworkId,
        price: validatedItem.price,
        quantity: validatedItem.quantity
      });

      return validatedItem;
    });

    // 🛑 Duplicate Purchase Protection & User Auth
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // Verify user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      throw new Error("Unauthorized – Invalid Token: " + userErr?.message);
    }
    console.log("✅ User verified:", user.id);

      const artworkIds = validatedItems.map(item => item.artworkId);
      const { data: artworks, error: artworksError } = await supabase
        .from("artworks")
        .select("id, status, reserved_until")
        .in("id", artworkIds);

      if (artworksError) {
        console.error("❌ Failed to verify artwork status:", artworksError.message);
        throw new Error("Failed to verify artwork availability");
      }

      if (artworks) {
        const now = new Date();
        const unavailableArtworks = artworks.filter(a => {
          if (a.status === 'sold') return true;
          if (a.status === 'reserved' && a.reserved_until) {
            const reservedUntil = new Date(a.reserved_until);
            return reservedUntil > now;
          }
          return false;
        });

        if (unavailableArtworks.length > 0) {
          console.error("❌ Attempted to purchase unavailable artwork(s):", unavailableArtworks.map(a => a.id));
          return new Response(
            JSON.stringify({
              error: "One or more artworks are currently unavailable or reserved by another collector. Please try again later.",
              timestamp: new Date().toISOString(),
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 409,
            }
          );
        }
      }

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
            artworkId: item.artworkId,
            quantity: item.quantity,
            price: item.price
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

    // 💾 Insert Order into Database
    const { data: orderRecord, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        razorpay_order_id: order.id
      })
      .select()
      .single();
      
    if (orderErr || !orderRecord) {
      console.error("❌ Failed to insert order:", orderErr);
      throw new Error("Failed to initialize database order");
    }

    // 💾 Insert Order Items into Database
    const orderItemsForDb = validatedItems.map(item => ({
      order_id: orderRecord.id,
      artwork_id: item.artworkId,
      quantity: item.quantity,
      price_at_purchase: item.price,
      fulfillment_status: 'pending',
      payout_status: 'pending'
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsForDb);

    if (itemsErr) {
      console.error("❌ Failed to insert order items:", itemsErr);
      throw new Error("Failed to initialize database order items");
    }
    
    // 💾 Reserve Artworks for 15 minutes
    const reservedUntil = new Date();
    reservedUntil.setMinutes(reservedUntil.getMinutes() + 15);
    
    const { error: reserveError } = await supabase
      .from('artworks')
      .update({
        status: 'reserved',
        reserved_until: reservedUntil.toISOString()
      })
      .in('id', artworkIds);

    if (reserveError) {
      console.error("❌ Failed to reserve artworks:", reserveError);
      // We don't fail the whole request here since Razorpay order is already created,
      // but we log the error for monitoring.
    }
    
    console.log(`✅ Inserted order ${orderRecord.id}, ${orderItemsForDb.length} items, and reserved artworks`);

    // Prepare response with LIVE key_id
    const response: OrderResponse & { order_id: string } = {
      razorpay_order_id: order.id,
      amount: order.amount, // Amount in paise (already from Razorpay)
      currency: order.currency || 'INR',
      receipt: order.receipt,
      key_id: keyId, // LIVE key_id for frontend
      order_id: orderRecord.id, // Internal database ID
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
