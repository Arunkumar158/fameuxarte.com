// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Deno global type declaration
declare const Deno: {
  env: { get(key: string): string | undefined };
};

// ─── HMAC-SHA256 via native WebCrypto ─────
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

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

serve(async (req: Request) => {
  try {
    console.log("🔐 Razorpay webhook received");

    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      console.error("❌ Missing x-razorpay-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error("❌ Missing RAZORPAY_WEBHOOK_SECRET");
      return new Response("Server configuration error", { status: 500 });
    }

    // Read the raw body for signature verification
    const rawBody = await req.text();
    const expectedSignature = await generateHmacSha256(RAZORPAY_WEBHOOK_SECRET, rawBody);

    if (!safeEqual(expectedSignature, signature)) {
      console.error("❌ Webhook signature mismatch");
      return new Response("Invalid signature", { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    console.log("📋 Webhook event:", payload.event);

    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      const paymentEntity = payload.payload.payment.entity;
      const razorpay_order_id = paymentEntity.order_id;
      const razorpay_payment_id = paymentEntity.id;

      if (!razorpay_order_id) {
        console.error("❌ Missing order_id in webhook payload");
        return new Response("Missing order_id", { status: 400 });
      }

      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error("❌ Missing Supabase configuration");
        return new Response("Server configuration error", { status: 500 });
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });

      // Check if order is already paid
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, status, user_id")
        .eq("razorpay_order_id", razorpay_order_id)
        .single();

      if (orderError || !order) {
        console.error("❌ Order not found or error:", orderError?.message);
        return new Response("Order not found", { status: 404 });
      }

      if (order.status === "paid") {
        console.log("✅ Order already processed. Skipping.");
        return new Response("OK", { status: 200 });
      }

      // Update order to paid
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_status: "completed",
          razorpay_payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("❌ Failed to update order:", updateError.message);
        return new Response("Database error", { status: 500 });
      }

      console.log(`✅ Order ${order.id} updated to paid via webhook`);

      // Update artworks to sold
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("artwork_id")
        .eq("order_id", order.id);

      if (orderItems && orderItems.length > 0) {
        const artworkIds = orderItems.map((item: any) => item.artwork_id);
        
        await supabase
          .from("artworks")
          .update({
            status: "sold",
            sold_at: new Date().toISOString(),
            sold_order_id: order.id,
          })
          .in("id", artworkIds);

        console.log(`✅ Marked ${artworkIds.length} artworks as sold.`);

        // Generate Certificates
        for (const artwork_id of artworkIds) {
          try {
            console.log(`📜 Generating certificate for artwork ${artwork_id}...`);
            await fetch(`${SUPABASE_URL}/functions/v1/generate-certificate`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
              },
              body: JSON.stringify({
                artwork_id,
                collector_id: order.user_id
              })
            });
          } catch (certError: any) {
            console.error(`❌ Error calling generate-certificate:`, certError.message);
          }
        }
      }
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Webhook error:", message);
    return new Response("Webhook error", { status: 500 });
  }
});
