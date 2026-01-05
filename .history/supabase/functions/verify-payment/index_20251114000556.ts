// @ts-expect-error - Deno standard library import
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-expect-error - Deno npm: specifier
import Razorpay from "npm:razorpay@2.9.2";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Deno global type declaration
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Supabase configuration from environment
const supabaseUrl = Deno.env.get('SUPABASE_URL') || "https://oqslvwynlppuacdrhlxl.supabase.co";
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== VERIFY PAYMENT REQUEST START ===');
    console.log('Request method:', req.method);

    // Parse request payload
    let requestPayload;
    try {
      requestPayload = await req.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request JSON:', parseError);
      throw new Error('Invalid JSON payload');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = requestPayload;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ Missing required payment fields:', {
        hasOrderId: !!razorpay_order_id,
        hasPaymentId: !!razorpay_payment_id,
        hasSignature: !!razorpay_signature
      });
      throw new Error('Missing required payment verification fields');
    }

    console.log('Payment verification request:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      hasSignature: !!razorpay_signature
    });

    // Get Razorpay LIVE credentials
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    console.log('Razorpay Configuration:', {
      key_id: keyId ? `${keyId.slice(0, 8)}...${keyId.slice(-4)}` : 'NOT SET',
      environment: keyId?.startsWith('rzp_live_') ? 'LIVE' : 'UNKNOWN'
    });

    if (!keyId || !keySecret) {
      console.error('❌ Razorpay credentials not configured');
      throw new Error('Payment gateway not configured');
    }

    // Initialize Razorpay client with LIVE credentials
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Verify payment signature using Razorpay webhook verification
    let isValid = false;
    try {
      isValid = razorpay.webhooks.verifyPaymentSignature({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
      });
    } catch (verifyError: unknown) {
      const errorMessage = verifyError instanceof Error 
        ? verifyError.message 
        : 'Unknown error';
      const errorDetails = verifyError && typeof verifyError === 'object' && 'error' in verifyError
        ? verifyError.error
        : verifyError;
      
      console.error('❌ Signature verification error:', {
        message: errorMessage,
        error: errorDetails
      });
      throw new Error(`Signature verification failed: ${errorMessage}`);
    }

    if (!isValid) {
      console.error('❌ Invalid payment signature');
      throw new Error('Invalid payment signature');
    }

    console.log('✅ Payment signature verified successfully');

    // Initialize Supabase client
    if (!supabaseServiceKey) {
      console.error('❌ Supabase service role key not configured');
      throw new Error('Database service not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update order status in Supabase
    // Note: The order_id in Supabase might be different from Razorpay order_id
    // We'll try to match by razorpay_order_id if that column exists, or by id
    console.log('Updating order in Supabase:', {
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });

    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        payment_intent_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select();

    // If update by razorpay_order_id fails, try by id
    if (updateError || !updateData || updateData.length === 0) {
      console.log('⚠️ Update by razorpay_order_id failed, trying by id:', updateError?.message);
      const { data: updateData2, error: updateError2 } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          payment_intent_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', razorpay_order_id)
        .select();

      if (updateError2) {
        console.error('❌ Failed to update order in Supabase:', updateError2);
        // Don't throw - payment is verified, just log the database error
        console.warn('⚠️ Payment verified but order update failed. Payment ID:', razorpay_payment_id);
      } else {
        console.log('✅ Order updated in Supabase:', updateData2);
      }
    } else {
      console.log('✅ Order updated in Supabase:', updateData);
    }

    console.log('=== VERIFY PAYMENT REQUEST SUCCESS ===');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error verifying payment:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });

    const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
    
    console.error('=== VERIFY PAYMENT REQUEST FAILED ===');
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
