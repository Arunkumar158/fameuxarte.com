import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  ShoppingBag, 
  Eye, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Analytics = () => {
  const { user } = useAuth();
  const [sortParam, setSortParam] = useState<string>('views');

  const { data: artworks, isLoading } = useQuery({
    queryKey: ["artist-analytics-artworks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate top-level metrics
  const soldArtworks = artworks?.filter(a => a.status === 'sold') || [];
  const totalSold = soldArtworks.length;
  const totalRevenue = soldArtworks.reduce((sum, a) => sum + (a.price || 0), 0);
  const avgPrice = totalSold > 0 ? totalRevenue / totalSold : 0;
  
  // For now, views are mocked based on created_at to simulate PostHog data until backend sync is ready.
  // In a production environment, this would come from an aggregated PostHog API endpoint.
  const chartData = (artworks || []).slice(0, 10).map((artwork) => {
    // Generate a pseudo-random but consistent view count based on artwork ID for the mock
    const seed = artwork.id.split('-')[0];
    const mockViews = parseInt(seed, 16) % 1500 + 100; 
    
    return {
      name: artwork.title.length > 15 ? artwork.title.substring(0, 15) + '...' : artwork.title,
      views: mockViews,
      sales: artwork.status === 'sold' ? 1 : 0,
      revenue: artwork.status === 'sold' ? artwork.price : 0,
      originalData: artwork,
      mockViews
    };
  });

  // Sorting logic for the table
  const sortedTableData = [...chartData].sort((a, b) => {
    if (sortParam === 'views') return b.views - a.views;
    if (sortParam === 'revenue') return b.revenue - a.revenue;
    if (sortParam === 'sales') return b.sales - a.sales;
    if (sortParam === 'newest') return new Date(b.originalData.created_at).getTime() - new Date(a.originalData.created_at).getTime();
    if (sortParam === 'oldest') return new Date(a.originalData.created_at).getTime() - new Date(b.originalData.created_at).getTime();
    return 0;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-linen">Analytics</h1>
        <p className="mt-1 text-sm text-stone">Understand your performance and grow your art business.</p>
      </div>

      {/* High Level Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-verified/10 text-verified">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Sold Artworks</p>
              <h3 className="text-2xl font-medium text-linen">{totalSold}</h3>
            </div>
          </div>
          <div className="flex gap-2 text-xs text-stone border-t border-border-faint pt-3 mt-3">
            <span>Based on artwork status</span>
          </div>
        </div>

        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-blue-500/10 text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Total Revenue</p>
              <h3 className="text-2xl font-medium text-linen">
                {totalRevenue > 0 ? formatCurrency(totalRevenue) : '--'}
              </h3>
            </div>
          </div>
          <div className="text-xs text-stone border-t border-border-faint pt-3 mt-3">
            {totalRevenue === 0 ? "Coming Soon" : "Calculated from sold items"}
          </div>
        </div>

        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-purple-500/10 text-purple-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Avg. Selling Price</p>
              <h3 className="text-2xl font-medium text-linen">
                {avgPrice > 0 ? formatCurrency(avgPrice) : '--'}
              </h3>
            </div>
          </div>
          <div className="text-xs text-stone border-t border-border-faint pt-3 mt-3">
            {avgPrice === 0 ? "Coming Soon" : "Overall average"}
          </div>
        </div>

        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-gold/10 text-gold">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Completed Orders</p>
              <h3 className="text-2xl font-medium text-linen">{totalSold}</h3>
            </div>
          </div>
          <div className="text-xs text-stone border-t border-border-faint pt-3 mt-3">
            Matching sold artworks
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <h3 className="mb-6 text-[14px] font-medium text-linen">Which artwork attracts the most attention?</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#2A2A2A' }}
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#F3EFEA' }}
                />
                <Bar dataKey="views" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <h3 className="mb-6 text-[14px] font-medium text-linen">Which artwork converts into sales?</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {totalSold > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#F3EFEA' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} name="Sales" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <p className="text-sm text-stone">Not enough sales data yet.</p>
                <p className="text-xs text-[#666] mt-1">Start promoting your portfolio to generate sales.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Artworks Table */}
      <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5 overflow-hidden">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-[14px] font-medium text-linen">Top Performing Artworks</h3>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-stone">Sort by:</span>
            <div className="flex items-center gap-1 bg-obsidian rounded-[6px] p-1 border border-border-faint">
              <button 
                onClick={() => setSortParam('views')}
                className={`px-3 py-1 rounded-[4px] text-[11px] font-medium transition-colors ${sortParam === 'views' ? 'bg-gold/10 text-gold' : 'text-stone hover:text-linen'}`}
              >
                Views
              </button>
              <button 
                onClick={() => setSortParam('revenue')}
                className={`px-3 py-1 rounded-[4px] text-[11px] font-medium transition-colors ${sortParam === 'revenue' ? 'bg-gold/10 text-gold' : 'text-stone hover:text-linen'}`}
              >
                Revenue
              </button>
              <button 
                onClick={() => setSortParam('newest')}
                className={`px-3 py-1 rounded-[4px] text-[11px] font-medium transition-colors ${sortParam === 'newest' ? 'bg-gold/10 text-gold' : 'text-stone hover:text-linen'}`}
              >
                Newest
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone">
            <thead className="bg-obsidian/50 text-[11px] uppercase tracking-wider text-[#666]">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-[6px] rounded-bl-[6px]">Artwork</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium text-right rounded-tr-[6px] rounded-br-[6px]">Conv. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-faint">
              {sortedTableData.map((item) => {
                const convRate = item.views > 0 ? ((item.sales / item.views) * 100).toFixed(2) : "0.00";
                
                return (
                  <tr key={item.originalData.id} className="hover:bg-surface-3/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[4px] bg-surface-3">
                          {item.originalData.image_path && (
                            <img 
                              src={`https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/${item.originalData.image_path}`} 
                              alt={item.name} 
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium text-linen">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        item.originalData.status === 'available' ? 'bg-verified/10 text-verified' : 
                        item.originalData.status === 'sold' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-surface-3 text-stone'
                      }`}>
                        {item.originalData.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-linen">{item.views.toLocaleString()}</td>
                    <td className="px-4 py-4">{item.sales}</td>
                    <td className="px-4 py-4">{formatCurrency(item.revenue)}</td>
                    <td className="px-4 py-4 text-right text-[#666]">
                      {item.originalData.status === 'sold' ? `${convRate}%` : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sortedTableData.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-stone">No artworks found to analyze.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
