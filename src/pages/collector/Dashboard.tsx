import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Image as ImageIcon, ShieldCheck, ShoppingBag, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: orders } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("orders").select("total_amount, status").eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: certificates } = useQuery({
    queryKey: ["user-certificates", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("certificates").select("id").eq("collector_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: likedItems } = useQuery({
    queryKey: ["liked-items", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("liked_items").select("artwork_id").eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const firstName = profile?.full_name?.split(" ")[0] || "Collector";
  const artworksCount = orders?.length || 0; // Assuming each order has artworks
  const certificatesCount = certificates?.length || 0;
  const totalValue = orders?.reduce((acc, order) => acc + Number(order.total_amount || 0), 0) || 0;
  const inTransitCount = orders?.filter((o) => o.status === "processing" || o.status === "shipped").length || 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[20px] bg-surface-2 p-8 md:p-12 border border-border-subtle">
        <div className="absolute top-0 right-0 opacity-10 mix-blend-overlay">
          {/* Abstract pattern placeholder */}
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="200" fill="url(#paint0_radial)" />
            <defs>
              <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 200) rotate(90) scale(200)">
                <stop stopColor="#FFD700" />
                <stop offset="1" stopColor="#FFD700" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-[14px] font-medium tracking-[0.1em] text-gold uppercase">Welcome back</p>
          <h1 className="mb-4 text-[32px] md:text-[42px] font-medium tracking-tight text-linen">
            Good Evening, {firstName}
          </h1>
          <p className="mb-8 text-[16px] text-stone">
            Continue building your art collection.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-[12px] text-stone mb-1">Original Artworks</p>
              <p className="text-[24px] font-medium text-linen">{artworksCount}</p>
            </div>
            <div>
              <p className="text-[12px] text-stone mb-1">Certificates</p>
              <p className="text-[24px] font-medium text-linen">{certificatesCount}</p>
            </div>
            <div>
              <p className="text-[12px] text-stone mb-1">Collection Value</p>
              <p className="text-[24px] font-medium text-gold">{formatCurrency(totalValue)}</p>
            </div>
            <div>
              <p className="text-[12px] text-stone mb-1">In Transit</p>
              <p className="text-[24px] font-medium text-linen">{inTransitCount}</p>
            </div>
          </div>

          <Link
            to="/artworks"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-[14px] font-medium text-obsidian transition-transform hover:scale-105"
          >
            Continue Exploring <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/collector/collection" className="group rounded-[12px] border border-border-subtle bg-surface-1 p-6 transition-colors hover:border-gold/50 hover:bg-surface-2">
          <ImageIcon className="mb-4 h-6 w-6 text-gold transition-transform group-hover:scale-110" />
          <h3 className="mb-1 text-[16px] font-medium text-linen">My Collection</h3>
          <p className="text-[13px] text-stone">View your acquired artworks</p>
        </Link>
        <Link to="/collector/orders" className="group rounded-[12px] border border-border-subtle bg-surface-1 p-6 transition-colors hover:border-gold/50 hover:bg-surface-2">
          <ShoppingBag className="mb-4 h-6 w-6 text-gold transition-transform group-hover:scale-110" />
          <h3 className="mb-1 text-[16px] font-medium text-linen">Orders & Tracking</h3>
          <p className="text-[13px] text-stone">Track your recent purchases</p>
        </Link>
        <Link to="/collector/certificates" className="group rounded-[12px] border border-border-subtle bg-surface-1 p-6 transition-colors hover:border-gold/50 hover:bg-surface-2">
          <ShieldCheck className="mb-4 h-6 w-6 text-gold transition-transform group-hover:scale-110" />
          <h3 className="mb-1 text-[16px] font-medium text-linen">Certificates</h3>
          <p className="text-[13px] text-stone">Access authenticity documents</p>
        </Link>
        <Link to="/collector/wishlist" className="group rounded-[12px] border border-border-subtle bg-surface-1 p-6 transition-colors hover:border-gold/50 hover:bg-surface-2">
          <Heart className="mb-4 h-6 w-6 text-gold transition-transform group-hover:scale-110" />
          <h3 className="mb-1 text-[16px] font-medium text-linen">Wishlist</h3>
          <p className="text-[13px] text-stone">Review your favorite pieces</p>
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;
