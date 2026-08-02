import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Filter, ArrowRight, Package, Truck, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArtistOrdersList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orderItems, isLoading } = useQuery({
    queryKey: ["artist-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch order items where the artwork belongs to the artist
      // Using a join through artworks
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
            payment_status,
            user_id
          )
        `)
        .eq('artworks.artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending':
      case 'accepted':
      case 'preparing': return <Package className="h-4 w-4 text-blue-400" />;
      case 'packed': return <Package className="h-4 w-4 text-amber-400" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-400" />;
      case 'delivered': 
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <Package className="h-4 w-4 text-stone" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-stone/20 text-stone';
      case 'accepted':
      case 'preparing': return 'bg-blue-500/20 text-blue-400';
      case 'packed': return 'bg-amber-500/20 text-amber-400';
      case 'shipped': return 'bg-blue-500/20 text-blue-400';
      case 'delivered': 
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-stone/20 text-stone';
    }
  };

  const filteredOrders = orderItems?.filter(item => {
    const matchesSearch = item.artworks?.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.fulfillment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-linen">Orders</h1>
          <p className="text-sm text-stone mt-1">Manage fulfillment and track your sales.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
          <Input 
            placeholder="Search by artwork or order ID..." 
            className="pl-10 bg-surface-2 border-border-subtle text-linen"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-surface-2 border-border-subtle text-linen">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="packed">Packed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full bg-surface-2 rounded-lg" />
          ))}
        </div>
      ) : filteredOrders?.length === 0 ? (
        <div className="text-center py-16 bg-surface-2 border border-border-subtle rounded-lg">
          <Package className="h-12 w-12 text-stone mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-linen mb-2">No orders found</h3>
          <p className="text-sm text-stone">You don't have any orders matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-surface-1 border border-border-faint rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2 border-b border-border-faint">
                  <th className="px-6 py-4 text-xs font-medium text-[#888] uppercase tracking-wider">Artwork</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#888] uppercase tracking-wider">Order Date</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#888] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#888] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-medium text-[#888] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-faint">
                {filteredOrders?.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded bg-surface-3 overflow-hidden flex-shrink-0">
                          {item.artworks?.image_path ? (
                            <img src={item.artworks.image_path} alt={item.artworks.title} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-stone m-3" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-linen text-sm">{item.artworks?.title}</div>
                          <div className="text-xs text-stone mt-1">ID: #{item.order_id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-linen">{formatDate(item.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gold">
                        {formatCurrency(item.price_at_purchase * item.quantity)}
                      </div>
                      <div className="text-xs text-stone mt-1">Qty: {item.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.fulfillment_status)}`}>
                          {item.fulfillment_status.charAt(0).toUpperCase() + item.fulfillment_status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/artist/orders/${item.id}`}>
                        <Button variant="ghost" size="sm" className="text-stone hover:text-linen">
                          Manage <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
