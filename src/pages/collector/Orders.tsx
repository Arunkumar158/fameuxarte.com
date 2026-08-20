import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Check, Package, Truck, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: "ordered", label: "Ordered" },
  { id: "accepted", label: "Artist Accepted" },
  { id: "packed", label: "Packed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" }
];

const getStepIndex = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return 4;
  if (s === "shipped") return 3;
  if (s === "processing" || s === "packed") return 2;
  if (s === "accepted") return 1;
  return 0; // pending or default
};

const Orders = () => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["collector-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          total_amount,
          status,
          order_items (
            id,
            quantity,
            price_at_purchase,
            fulfillment_status,
            tracking_number,
            tracking_url,
            shipping_provider,
            artworks (
              title,
              image_path,
              profiles (
                full_name
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateString));
  };

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "/placeholder.svg";
    return `https://yexjmqhffxukzomkblqj.supabase.co/storage/v1/object/public/artworks/${path}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse bg-surface-2 rounded-[16px] border border-border-subtle" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
        <div className="w-48 h-48 mb-8 opacity-50">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="60" width="100" height="80" rx="4" stroke="#D4AF37" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M50 80 L100 110 L150 80" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="100" y1="110" x2="100" y2="140" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-[28px] font-medium text-linen mb-3">No acquisitions yet.</h2>
        <p className="text-stone max-w-md mb-8">Start your collection by discovering beautiful artworks from talented artists worldwide.</p>
        <Button asChild className="bg-gold text-obsidian hover:bg-linen rounded-full px-8">
          <Link to="/artworks">Explore Artworks</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-medium text-linen">Purchases & Tracking</h1>
        <p className="text-[14px] text-stone">{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</p>
      </div>

      <div className="space-y-8">
        {orders.map((order) => {
          const orderId = String(order.id).split('-')[0].toUpperCase();
          
          return (
            <div key={order.id} className="rounded-[16px] border border-border-subtle bg-surface-1 overflow-hidden">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-faint bg-surface-2 p-6">
                <div>
                  <p className="text-[12px] uppercase tracking-widest text-[#666] mb-1">Order #{orderId}</p>
                  <p className="text-[14px] font-medium text-linen">Placed on {formatDate(order.created_at)}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[12px] uppercase tracking-widest text-[#666] mb-1">Total</p>
                  <p className="text-[16px] font-medium text-gold">{formatCurrency(Number(order.total_amount))}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-border-faint">
                {order.order_items?.map((item) => {
                  const artwork = item.artworks as any;
                  const artistName = artwork?.profiles?.full_name || "Unknown Artist";
                  const currentStepIdx = getStepIndex(item.fulfillment_status || order.status);

                  return (
                    <div key={item.id} className="p-6 lg:p-8 grid lg:grid-cols-[1fr_350px] gap-10">
                      
                      {/* Item Details */}
                      <div className="flex gap-6">
                        <div className="w-24 h-24 shrink-0 rounded-[8px] overflow-hidden bg-surface-3 border border-border-subtle">
                          <img 
                            src={getImageUrl(artwork?.image_path)} 
                            alt={artwork?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-[18px] font-medium text-linen mb-1">{artwork?.title}</h3>
                          <p className="text-[13px] text-stone mb-4">{artistName}</p>
                          <p className="text-[14px] font-medium text-linen">{formatCurrency(Number(item.price_at_purchase))}</p>
                          
                          <div className="mt-6 flex flex-wrap gap-3">
                            <Button variant="outline" size="sm" className="h-8 text-[12px] rounded-full border-border-subtle text-linen hover:bg-surface-3 hover:text-white">
                              View Invoice
                            </Button>
                            {currentStepIdx >= 4 && (
                              <Button variant="outline" size="sm" className="h-8 text-[12px] rounded-full border-gold/30 text-gold hover:bg-gold/10 hover:text-gold">
                                Review Artwork
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timeline & Tracking */}
                      <div className="bg-surface-2 rounded-[12px] p-6 border border-border-subtle">
                        <h4 className="text-[14px] font-medium text-linen mb-6 flex items-center gap-2">
                          <Package className="w-4 h-4 text-gold" />
                          Fulfillment Status
                        </h4>
                        
                        <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border-subtle">
                          {STEPS.map((step, idx) => {
                            const isCompleted = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;
                            
                            return (
                              <div key={step.id} className="relative flex items-center justify-between gap-4 z-10">
                                <div className="flex items-center gap-4">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                    isCompleted ? 'bg-gold border-gold text-obsidian' : 'bg-surface-2 border-border-subtle text-transparent'
                                  }`}>
                                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                                  </div>
                                  <span className={`text-[13px] ${isCompleted ? 'text-linen font-medium' : 'text-[#666]'}`}>
                                    {step.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Tracking Info if Shipped */}
                        {currentStepIdx >= 3 && (item.tracking_number || item.shipping_provider) && (
                          <div className="mt-6 pt-6 border-t border-border-faint">
                            <h5 className="text-[11px] uppercase tracking-wider text-[#666] mb-3">Shipping Details</h5>
                            <div className="bg-surface-3 rounded-[8px] p-4 text-[13px] space-y-2">
                              {item.shipping_provider && (
                                <div className="flex justify-between">
                                  <span className="text-stone">Courier</span>
                                  <span className="text-linen">{item.shipping_provider}</span>
                                </div>
                              )}
                              {item.tracking_number && (
                                <div className="flex justify-between">
                                  <span className="text-stone">Tracking</span>
                                  <span className="text-linen font-mono">{item.tracking_number}</span>
                                </div>
                              )}
                              {item.tracking_url && (
                                <a 
                                  href={item.tracking_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-[12px] text-gold hover:underline"
                                >
                                  Track Package <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
