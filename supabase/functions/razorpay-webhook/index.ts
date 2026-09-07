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

      // Send ORDER_CONFIRMED + PAYMENT_SUCCESS notifications to collector
      // Send ARTWORK_SOLD notification to artist
      // Idempotent: order.status === 'paid' guard above prevents duplicate processing
      if (order.user_id) {
        const now = new Date().toISOString();
        
        // 1. Fetch collector details
        const { data: collector } = await supabase
          .from("profiles")
          .select("full_name, id")
          .eq("id", order.user_id)
          .single();
          
        // Fetch collector email from auth.users (requires service role)
        const { data: { user: authUser } } = await supabase.auth.admin.getUserById(order.user_id);
        const collectorEmail = authUser?.email;

        // 2. Fetch artworks with artist profiles
        const { data: fullItems } = await supabase
          .from("order_items")
          .select(`
            id,
            price_at_purchase,
            quantity,
            artworks:artwork_id (
              id,
              title,
              image_path,
              profiles:artist_id (
                id,
                full_name
              )
            )
          `)
          .eq("order_id", order.id);

        // 3. Prepare line items and calculate totals
        const formattedItems = [];
        let subtotalCents = 0;
        
        for (const item of fullItems || []) {
          const artwork = item.artworks as any;
          const artist = artwork.profiles;
          
          formattedItems.push({
            artwork_title: artwork.title || "Unknown Artwork",
            artist_name: artist?.full_name || "Unknown Artist",
            quantity: item.quantity || 1,
            price: `₹${(item.price_at_purchase || 0).toLocaleString()}`,
            image_url: artwork.image_path ? `${SUPABASE_URL}/storage/v1/object/public/artworks/${artwork.image_path}` : undefined,
          });
          subtotalCents += (item.price_at_purchase || 0) * (item.quantity || 1);
        }
        
        const totalAmountStr = `₹${paymentEntity.amount ? (paymentEntity.amount / 100).toLocaleString() : "—"}`;
        const subtotalStr = `₹${subtotalCents.toLocaleString()}`;
        // Assuming shipping is the difference (rough calculation, normally you'd use order fields)
        const shippingFeeCents = (paymentEntity.amount ? (paymentEntity.amount / 100) : 0) - subtotalCents;
        const shippingStr = shippingFeeCents > 0 ? `₹${shippingFeeCents.toLocaleString()}` : "Free";
        
        // Format shipping address safely
        const addr = order.shipping_address as any;
        let addressStr = "Address provided at checkout";
        if (addr && typeof addr === "object") {
          const parts = [
            addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country
          ].filter(Boolean);
          if (parts.length > 0) addressStr = parts.join(", ");
        }

        const collectorName = collector?.full_name || "Collector";

        // 4. Insert in-app notifications
        await supabase.from("notifications").insert([
          {
            user_id: order.user_id,
            title: "Order Confirmed",
            message: "Your payment was successful and your order has been confirmed. The artist will begin preparing your artwork.",
            type: "ORDER_CONFIRMED",
            priority: "normal",
            metadata: {
              order_id: order.id,
              url: "/collector/orders",
              event_id: `order-confirmed-${order.id}`,
            },
            created_at: now,
          },
          {
            user_id: order.user_id,
            title: "Payment Successful",
            message: `Payment of ${totalAmountStr} received successfully.`,
            type: "PAYMENT_SUCCESS",
            priority: "normal",
            metadata: {
              order_id: order.id,
              payment_id: razorpay_payment_id,
              url: "/collector/orders",
              event_id: `payment-success-${razorpay_payment_id}`,
            },
            created_at: now,
          },
        ]);
        console.log(`🔔 ORDER_CONFIRMED + PAYMENT_SUCCESS in-app notifications sent to ${order.user_id}`);

        // 5. Send Emails via send-email Edge Function
        if (collectorEmail) {
          // Send Order Confirmation
          await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
              type: "order_confirmation",
              to: collectorEmail,
              idempotencyKey: `order_confirmation:${order.id}`,
              relatedUserId: order.user_id,
              relatedOrderId: order.id,
              variables: {
                customer_name: collectorName,
                order_number: order.id.slice(0, 8).toUpperCase(),
                order_date: new Date().toLocaleDateString('en-IN'),
                order_url: "https://fameuxarte.com/collector/orders",
                order_total: totalAmountStr,
                subtotal: subtotalStr,
                shipping_fee: shippingStr,
                payment_status: "Paid",
                artworks: formattedItems,
                shipping_address: addressStr
              }
            })
          });

          // Send Payment Success
          await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
              type: "payment_success",
              to: collectorEmail,
              idempotencyKey: `payment_success:${razorpay_payment_id}`,
              relatedUserId: order.user_id,
              relatedOrderId: order.id,
              variables: {
                customer_name: collectorName,
                order_number: order.id.slice(0, 8).toUpperCase(),
                amount_paid: totalAmountStr,
                payment_date: new Date().toLocaleDateString('en-IN'),
                order_url: "https://fameuxarte.com/collector/orders"
              }
            })
          });
        } else {
          console.warn(`[razorpay-webhook] Could not send email: collector email not found for user ${order.user_id}`);
        }

        // 6. Notify Artists (Artwork Sold)
        for (const item of fullItems || []) {
          const artwork = item.artworks as any;
          const artist = artwork.profiles;
          
          if (artist && artist.id) {
            const { data: { user: artistUser } } = await supabase.auth.admin.getUserById(artist.id);
            if (artistUser?.email) {
              await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({
                  type: "artwork_sold",
                  to: artistUser.email,
                  idempotencyKey: `artwork_sold:${order.id}:${item.id}`,
                  relatedUserId: artist.id,
                  relatedOrderId: order.id,
                  variables: {
                    artist_name: artist.full_name || "Artist",
                    artwork_title: artwork.title || "Unknown Artwork",
                    artwork_image_url: artwork.image_path ? `${SUPABASE_URL}/storage/v1/object/public/artworks/${artwork.image_path}` : undefined,
                    order_reference: order.id.slice(0, 8).toUpperCase(),
                    sale_amount: `₹${(item.price_at_purchase || 0).toLocaleString()}`,
                    dashboard_url: "https://fameuxarte.com/artist/orders"
                  }
                })
              });
            }
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
