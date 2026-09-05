// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

declare const Deno: {
  env: { get(key: string): string | undefined };
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // ── 1. Verify caller is an authenticated admin ─────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Create a client using the caller's JWT to verify their identity
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Use service role to check the profile role (bypasses RLS)
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      console.error("❌ Non-admin attempted broadcast:", user.id, profile?.role);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Parse and validate request body ────────────────────────────────
    const body = await req.json();
    const { audience, title, message, type = "BROADCAST", metadata = {} } = body;

    if (!audience || !title?.trim() || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: "audience, title, and message are required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!["all", "artists", "customers"].includes(audience)) {
      return new Response(
        JSON.stringify({ error: "audience must be 'all', 'artists', or 'customers'" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Fetch target user IDs ───────────────────────────────────────────
    let profilesQuery = adminClient.from("profiles").select("id, role");

    if (audience === "artists") {
      profilesQuery = profilesQuery.eq("role", "artist");
    } else if (audience === "customers") {
      profilesQuery = profilesQuery.neq("role", "artist").neq("role", "admin");
    }
    // 'all' fetches everyone (including artists + customers but NOT admin for safety)
    if (audience === "all") {
      profilesQuery = profilesQuery.neq("role", "admin");
    }

    const { data: profiles, error: profilesError } = await profilesQuery;

    if (profilesError) {
      console.error("❌ Failed to fetch profiles:", profilesError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch target users" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users matched the audience filter", count: 0 }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    console.log(`📢 Broadcast to ${profiles.length} users (audience: ${audience})`);

    // ── 4. Batch insert notifications ─────────────────────────────────────
    // Insert in batches of 100 to avoid large payload issues
    const BATCH_SIZE = 100;
    const now = new Date().toISOString();
    let successCount = 0;

    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = profiles.slice(i, i + BATCH_SIZE);
      const notifications = batch.map((p: { id: string }) => ({
        user_id: p.id,
        title: title.trim(),
        message: message.trim(),
        type: type,
        priority: "normal",
        metadata: {
          ...metadata,
          broadcast: true,
          sent_by: user.id,
          audience: audience,
        },
        created_at: now,
      }));

      const { error: insertError, count } = await adminClient
        .from("notifications")
        .insert(notifications)
        .select("id", { count: "exact" });

      if (insertError) {
        console.error(`❌ Batch ${i / BATCH_SIZE + 1} insert failed:`, insertError.message);
      } else {
        successCount += count ?? batch.length;
      }
    }

    console.log(`✅ Broadcast complete: ${successCount}/${profiles.length} notifications sent`);

    return new Response(
      JSON.stringify({
        success: true,
        count: successCount,
        total: profiles.length,
        audience,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("❌ broadcast-notification error:", err.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
