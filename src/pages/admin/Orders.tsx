import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, Truck, CheckCircle2, AlertCircle, ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orderItems, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          artworks (
            title,
            artist_id,
            profiles:artist_id (
              full_name
            )
          ),
          orders (
            id,
            created_at,
            status,
            payment_status,
            profiles (
              full_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-slate-100 text-slate-800';
      case 'accepted':
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-amber-100 text-amber-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': 
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredOrders = orderItems?.filter(item => {
    const artworkTitle = item.artworks?.title || "";
    const artistName = (item.artworks?.profiles as any)?.full_name || "";
    const buyerName = (item.orders?.profiles as any)?.full_name || "";
    
    const searchString = `${artworkTitle} ${artistName} ${buyerName} ${item.order_id}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.fulfillment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Marketplace Orders</h2>
          <p className="text-muted-foreground">Monitor all sales and artist fulfillment across the platform.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by order ID, artwork, artist, or buyer..." 
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white">
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
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-white rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Info</TableHead>
                <TableHead>Artwork & Artist</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">#{item.order_id.slice(0, 8)}</div>
                    <div className="text-xs text-slate-500">{formatDate(item.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{item.artworks?.title}</div>
                    <div className="text-xs text-slate-500">By {(item.artworks?.profiles as any)?.full_name || 'Unknown'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-900">{(item.orders?.profiles as any)?.full_name || 'Guest'}</div>
                    <div className="text-xs text-slate-500">{(item.orders?.profiles as any)?.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-emerald-600">{formatCurrency(item.price_at_purchase * item.quantity)}</div>
                    <div className="text-xs text-slate-500">Qty: {item.quantity}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.fulfillment_status)}`}>
                      {item.fulfillment_status.toUpperCase()}
                    </span>
                    {item.payout_status && (
                      <div className="mt-1">
                        <span className="text-[10px] uppercase text-slate-400">Payout: {item.payout_status}</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No orders found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
