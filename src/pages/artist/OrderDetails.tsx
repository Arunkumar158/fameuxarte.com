import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sendNotification } from "@/lib/notifications";
import { trackEvent } from "@/lib/analytics";
import { ArrowLeft, Package, Truck, CheckCircle2, AlertCircle, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArtistOrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [shippingProvider, setShippingProvider] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");

  const { data: orderItem, isLoading } = useQuery({
    queryKey: ["artist-order-details", id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          artworks!inner(
            title,
            image_path,
            artist_id
          ),
          orders (
            id,
            created_at,
            status,
            user_id,
            shipping_address,
            profiles (
              full_name,
              email
            )
          )
        `)
        .eq('id', id)
        .eq('artworks.artist_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setShippingProvider(data.shipping_provider || "");
        setTrackingNumber(data.tracking_number || "");
        setTrackingUrl(data.tracking_url || "");
        setShippingNotes(data.shipping_notes || "");
      }
      
      return data;
    },
    enabled: !!user && !!id
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, extraData = {} }: { status: string, extraData?: any }) => {
      const updateData = {
        fulfillment_status: status,
        [`\${status}_at`]: new Date().toISOString(),
        ...extraData
      };
      
      const { error } = await supabase
        .from('order_items')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Also send notification to the collector
      if (orderItem && orderItem.orders?.user_id) {
        // We will just do the basic notification for now
        // The real email HTML can be imported from email-templates
        let title = '';
        let message = '';
        let type: any = '';
        
        switch (status) {
          case 'accepted':
            title = 'Order Accepted';
            message = `Your order for ${orderItem.artworks?.title} has been accepted by the artist.`;
            type = 'order_accepted';
            break;
          case 'shipped':
            title = 'Artwork Shipped';
            message = `Your artwork ${orderItem.artworks?.title} is on its way!`;
            type = 'order_shipped';
            break;
          case 'delivered':
            title = 'Artwork Delivered';
            message = `Your artwork ${orderItem.artworks?.title} has been delivered.`;
            type = 'order_delivered';
            break;
        }
        
        if (title) {
          await sendNotification({
            userId: orderItem.orders.user_id,
            title,
            message,
            type,
            metadata: { order_item_id: id }
          });
        }
      }
      
      return status;
    },
    onSuccess: (status) => {
      queryClient.invalidateQueries({ queryKey: ["artist-order-details", id] });
      queryClient.invalidateQueries({ queryKey: ["artist-orders"] });
      toast.success(`Order marked as ${status}`);

      // Track the fulfillment event in PostHog
      trackEvent(`fulfillment_status_${status}`, {
        order_item_id: id,
        artist_id: user?.id,
        new_status: status
      });
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });

  const handleUpdateShipping = () => {
    updateStatusMutation.mutate({
      status: 'shipped',
      extraData: {
        shipping_provider: shippingProvider,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        shipping_notes: shippingNotes
      }
    });
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-[400px] w-full" /></div>;
  }

  if (!orderItem) {
    return <div>Order not found or you don't have permission to view it.</div>;
  }

  const buyer = orderItem.orders?.profiles as any;
  const shippingAddress = orderItem.orders?.shipping_address as any;
  const status = orderItem.fulfillment_status;

  const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'packed', 'shipped', 'delivered', 'completed'];
  const currentStepIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/artist/orders">
          <Button variant="ghost" size="icon" className="text-stone hover:text-linen">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium tracking-tight text-linen">Order #{orderItem.order_id.slice(0, 8)}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-3 text-linen">
              {status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-stone mt-1">{formatDate(orderItem.created_at)}</p>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-surface-1 border border-border-faint rounded-xl p-6 mb-8">
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-surface-3">
            <div 
              style={{ width: `${Math.max(5, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gold transition-all duration-500"
            ></div>
          </div>
          <div className="flex justify-between text-xs text-stone font-medium">
            <span className={currentStepIndex >= 0 ? "text-gold" : ""}>Pending</span>
            <span className={currentStepIndex >= 1 ? "text-gold" : ""}>Accepted</span>
            <span className={currentStepIndex >= 3 ? "text-gold" : ""}>Packed</span>
            <span className={currentStepIndex >= 4 ? "text-gold" : ""}>Shipped</span>
            <span className={currentStepIndex >= 5 ? "text-gold" : ""}>Delivered</span>
          </div>
        </div>
        
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {status === 'pending' && (
            <Button onClick={() => updateStatusMutation.mutate({ status: 'accepted' })} className="bg-gold text-obsidian hover:bg-gold/90">
              Accept Order
            </Button>
          )}
          {status === 'accepted' && (
            <Button onClick={() => updateStatusMutation.mutate({ status: 'preparing' })} className="bg-linen text-obsidian">
              Mark as Preparing
            </Button>
          )}
          {status === 'preparing' && (
            <Button onClick={() => updateStatusMutation.mutate({ status: 'packed' })} className="bg-linen text-obsidian">
              Mark as Packed
            </Button>
          )}
          {status === 'packed' && (
            <div className="text-sm text-stone text-center w-full">
              Please enter shipping details below to mark as shipped.
            </div>
          )}
          {status === 'shipped' && (
            <Button onClick={() => updateStatusMutation.mutate({ status: 'delivered' })} variant="outline" className="border-gold text-gold hover:bg-gold/10">
              Mark as Delivered
            </Button>
          )}
          {status === 'delivered' && (
            <Button onClick={() => updateStatusMutation.mutate({ status: 'completed' })} className="bg-green-600 hover:bg-green-700 text-white">
              Complete Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface-1 border border-border-faint rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-faint">
              <h2 className="font-medium text-linen">Artwork Details</h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row gap-6">
              <div className="h-32 w-32 rounded bg-surface-3 overflow-hidden flex-shrink-0">
                {orderItem.artworks?.image_path ? (
                  <img src={orderItem.artworks.image_path} alt={orderItem.artworks.title} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-10 w-10 text-stone m-11" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-linen">{orderItem.artworks?.title}</h3>
                <p className="text-stone text-sm mt-1">Item ID: {orderItem.id}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-stone">Price</span>
                  <span className="text-linen font-medium">{formatCurrency(orderItem.price_at_purchase)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-stone">Quantity</span>
                  <span className="text-linen font-medium">{orderItem.quantity}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border-faint flex items-center justify-between">
                  <span className="text-stone font-medium">Total</span>
                  <span className="text-gold font-medium text-lg">{formatCurrency(orderItem.price_at_purchase * orderItem.quantity)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-1 border border-border-faint rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-faint">
              <h2 className="font-medium text-linen">Shipping Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-stone">Courier Company</Label>
                  <Input 
                    id="provider"
                    placeholder="e.g. FedEx, DHL, UPS" 
                    className="bg-surface-2 border-border-subtle"
                    value={shippingProvider}
                    onChange={(e) => setShippingProvider(e.target.value)}
                    disabled={status === 'delivered' || status === 'completed' || status === 'cancelled'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracking" className="text-stone">Tracking Number</Label>
                  <Input 
                    id="tracking"
                    placeholder="Tracking Number" 
                    className="bg-surface-2 border-border-subtle"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    disabled={status === 'delivered' || status === 'completed' || status === 'cancelled'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url" className="text-stone">Tracking URL (Optional)</Label>
                <Input 
                  id="url"
                  placeholder="https://..." 
                  className="bg-surface-2 border-border-subtle"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  disabled={status === 'delivered' || status === 'completed' || status === 'cancelled'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-stone">Shipping Notes</Label>
                <Textarea 
                  id="notes"
                  placeholder="Any notes for the buyer..." 
                  className="bg-surface-2 border-border-subtle min-h-[100px]"
                  value={shippingNotes}
                  onChange={(e) => setShippingNotes(e.target.value)}
                  disabled={status === 'delivered' || status === 'completed' || status === 'cancelled'}
                />
              </div>
              
              {(status === 'packed' || status === 'shipped') && (
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleUpdateShipping} 
                    className="bg-gold text-obsidian hover:bg-gold/90"
                    disabled={updateStatusMutation.isPending}
                  >
                    {status === 'shipped' ? 'Update Shipping Info' : 'Mark as Shipped'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-surface-1 border border-border-faint rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-faint">
              <h2 className="font-medium text-linen">Customer Details</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xs font-medium text-stone uppercase tracking-wider mb-2">Contact</h3>
                <p className="text-sm text-linen font-medium">{buyer?.full_name || 'Guest User'}</p>
                <p className="text-sm text-[#888]">{buyer?.email}</p>
              </div>
              
              <div>
                <h3 className="text-xs font-medium text-stone uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Shipping Address
                </h3>
                {shippingAddress ? (
                  <div className="text-sm text-linen space-y-1">
                    <p>{shippingAddress.line1}</p>
                    {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
                    <p>{shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-stone italic">No shipping address provided</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface-1 border border-border-faint rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-faint">
              <h2 className="font-medium text-linen">Timeline</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1"><Clock className="h-4 w-4 text-stone" /></div>
                  <div>
                    <p className="text-sm text-linen">Order Placed</p>
                    <p className="text-xs text-stone">{formatDate(orderItem.created_at)}</p>
                  </div>
                </div>
                {orderItem.accepted_at && (
                  <div className="flex gap-3">
                    <div className="mt-1"><CheckCircle2 className="h-4 w-4 text-blue-400" /></div>
                    <div>
                      <p className="text-sm text-linen">Order Accepted</p>
                      <p className="text-xs text-stone">{formatDate(orderItem.accepted_at)}</p>
                    </div>
                  </div>
                )}
                {orderItem.packed_at && (
                  <div className="flex gap-3">
                    <div className="mt-1"><Package className="h-4 w-4 text-amber-400" /></div>
                    <div>
                      <p className="text-sm text-linen">Packed</p>
                      <p className="text-xs text-stone">{formatDate(orderItem.packed_at)}</p>
                    </div>
                  </div>
                )}
                {orderItem.shipped_at && (
                  <div className="flex gap-3">
                    <div className="mt-1"><Truck className="h-4 w-4 text-blue-400" /></div>
                    <div>
                      <p className="text-sm text-linen">Shipped</p>
                      <p className="text-xs text-stone">{formatDate(orderItem.shipped_at)}</p>
                    </div>
                  </div>
                )}
                {orderItem.delivered_at && (
                  <div className="flex gap-3">
                    <div className="mt-1"><CheckCircle2 className="h-4 w-4 text-green-400" /></div>
                    <div>
                      <p className="text-sm text-linen">Delivered</p>
                      <p className="text-xs text-stone">{formatDate(orderItem.delivered_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
