import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Deno global type declaration
declare const Deno: {
  env: { get(key: string): string | undefined };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── HMAC-SHA256 via native WebCrypto (always available in Deno/Supabase) ─────
// Do NOT use Deno's Node compat crypto — it's unreliable in Supabase Edge runtime.
// Razorpay spec: HMAC_SHA256( order_id + "|" + payment_id, KEY_SECRET ) → hex
async function generateHmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time comparison — prevents timing-based signature oracle attacks
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function jsonError(message: string, status = 400, details = "") {
  return new Response(JSON.stringify({ success: false, error: message, details }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔐 Payment verification started");

    // 1️⃣ Auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("❌ Missing Authorization header");
      return jsonError("Unauthorized – Missing Authorization Header", 401);
    }

    // 2️⃣ Supabase client
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Missing Supabase configuration");
      return jsonError("Server configuration error", 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 3️⃣ Verify user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      console.error("❌ Invalid user token:", userErr?.message);
      return jsonError("Unauthorized – Invalid Token", 401);
    }
    console.log("✅ User verified:", user.id);

    // 4️⃣ Parse body
    // NOTE: Frontend (Checkout.tsx) sends exactly these 3 fields — do not require order_id.
    //       We locate the order via razorpay_order_id (stored during create-order).
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("❌ Missing payment parameters");
      return jsonError("Missing required payment parameters", 400);
    }

    console.log("📋 Payment verification request:", {
      razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id.substring(0, 10) + "...",
    });

    // 5️⃣ Razorpay secret
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_SECRET) {
      console.error("❌ Missing RAZORPAY_KEY_SECRET");
      return jsonError("Server configuration error", 500);
    }

    // 6️⃣ Generate & compare HMAC-SHA256 signature (constant-time)
    const expectedSignature = await generateHmacSha256(
      RAZORPAY_KEY_SECRET,
      `${razorpay_order_id}|${razorpay_payment_id}`
    );

    if (!safeEqual(expectedSignature, razorpay_signature)) {
      console.error("❌ Signature mismatch — payment verification FAILED");

      // Mark this specific order as failed (lookup by razorpay_order_id + user_id for safety)
      await supabase
        .from("orders")
        .update({ status: "failed", payment_status: "failed" })
        .eq("razorpay_order_id", razorpay_order_id)
        .eq("user_id", user.id);

      return jsonError("Payment verification failed – Invalid signature", 400);
    }

    console.log("✅ Signature verified successfully");

    // 7️⃣ Update order — ONLY after signature passes
    //    Match by razorpay_order_id + user_id (no extra order_id field needed from frontend)
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",                           // ✅ correct status value
        payment_status: "completed",              // ✅ dedicated payment_status column
        razorpay_payment_id: razorpay_payment_id, // ✅ correct field name
        payment_signature: razorpay_signature,    // ✅ store for audit trail
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error("❌ Failed to update order:", updateError?.message);
      return jsonError(
        "Payment verified but order update failed. Please contact support.",
        500,
        updateError?.message ?? "No matching order found"
      );
    }

    console.log("✅ Order updated successfully:", {
      order_id: updatedOrder.id,
      status: updatedOrder.status,
      payment_status: updatedOrder.payment_status,
    });

    // 8️⃣ Success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        order_id: updatedOrder.id,
        status: updatedOrder.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Verification error:", message);
    return jsonError("Payment verification failed", 500, message);
  }
});
