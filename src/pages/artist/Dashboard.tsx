import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Palette, 
  Eye, 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  Plus, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: artworks, isLoading: artworksLoading } = useQuery({
    queryKey: ["artist-artworks", user?.id],
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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["artist-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate metrics
  const totalArtworks = artworks?.length || 0;
  const availableArtworks = artworks?.filter(a => a.status === 'available').length || 0;
  const soldArtworks = artworks?.filter(a => a.status === 'sold').length || 0;
  const draftArtworks = artworks?.filter(a => a.status === 'draft').length || 0;
  
  // Calculate profile completion
  const profileFields = [
    profile?.full_name,
    profile?.bio,
    profile?.avatar_url,
    profile?.cover_image,
    profile?.country,
    profile?.city,
    profile?.artist_statement
  ];
  const filledFields = profileFields.filter(field => field && field.trim() !== "").length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100) || 0;

  // Placeholder for revenue (needs order tracking properly)
  const revenue = 0; 
  const totalOrders = 0;

  if (artworksLoading || profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-linen">Business Dashboard</h1>
        <p className="mt-1 text-sm text-stone">Welcome back, {profile?.full_name || "Artist"}. Here's what's happening with your art.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-gold/10 text-gold">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Total Artworks</p>
              <h3 className="text-2xl font-medium text-linen">{totalArtworks}</h3>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-stone border-t border-border-faint pt-3 mt-3">
            <span><span className="text-linen">{availableArtworks}</span> Available</span>
            <span><span className="text-linen">{draftArtworks}</span> Draft</span>
          </div>
        </div>

        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-verified/10 text-verified">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Sold Artworks</p>
              <h3 className="text-2xl font-medium text-linen">{soldArtworks}</h3>
            </div>
          </div>
          <div className="text-xs text-stone border-t border-border-faint pt-3 mt-3">
            Conversion metrics coming soon
          </div>
        </div>

        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-blue-500/10 text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Total Revenue</p>
              <h3 className="text-2xl font-medium text-linen">{formatCurrency(revenue)}</h3>
            </div>
          </div>
          <div className="text-xs text-stone border-t border-border-faint pt-3 mt-3">
            From {totalOrders} orders
          </div>
        </div>

        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-purple-500/10 text-purple-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Portfolio Views</p>
              <h3 className="text-2xl font-medium text-linen">--</h3>
            </div>
          </div>
          <div className="text-xs text-stone border-t border-border-faint pt-3 mt-3">
            Analytics module coming soon
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions & Profile Strength */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
            <h3 className="mb-4 text-[14px] font-medium text-linen">Quick Actions</h3>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start gap-3 bg-gold text-obsidian hover:bg-linen">
                <Link to="/artist/artworks/new">
                  <Plus className="h-4 w-4" />
                  Upload Artwork
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-3 border-border-subtle text-linen hover:bg-surface-3">
                <Link to="/artist/portfolio">
                  <Eye className="h-4 w-4 text-stone" />
                  View Public Portfolio
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-3 border-border-subtle text-linen hover:bg-surface-3">
                <Link to="/artist/settings">
                  <ImageIcon className="h-4 w-4 text-stone" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
            <h3 className="mb-4 text-[14px] font-medium text-linen">Profile Strength</h3>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-stone">Completion</span>
              <span className="font-medium text-linen">{profileCompletion}%</span>
            </div>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-obsidian">
              <div 
                className="h-full bg-gold transition-all duration-500" 
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            {profileCompletion < 100 && (
              <div className="flex items-start gap-3 rounded-[6px] bg-gold/5 p-3 text-[12px] text-stone">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <p>Complete your profile to increase trust and discoverability among collectors.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-5 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-[14px] font-medium text-linen">Recent Artworks</h3>
            <Link to="/artist/artworks" className="text-[12px] text-gold hover:underline">
              View All
            </Link>
          </div>
          
          {artworks && artworks.length > 0 ? (
            <div className="divide-y divide-border-faint">
              {artworks.slice(0, 5).map(artwork => (
                <div key={artwork.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[6px] bg-surface-3">
                    {artwork.image_path ? (
                      <img 
                        src={`https://yidpsnjtqofphtwibxdf.supabase.co/storage/v1/object/public/artworks/${artwork.image_path}`} 
                        alt={artwork.title} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="m-auto h-6 w-6 text-stone" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate text-sm font-medium text-linen">{artwork.title}</h4>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-[#666]">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider ${
                        artwork.status === 'available' ? 'bg-verified/10 text-verified' : 
                        artwork.status === 'sold' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-surface-3 text-stone'
                      }`}>
                        {artwork.status}
                      </span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(artwork.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-linen">{formatCurrency(artwork.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-3 text-stone">
                <Palette className="h-6 w-6" />
              </div>
              <h4 className="mb-2 text-sm font-medium text-linen">No artworks yet</h4>
              <p className="mb-6 text-sm text-stone">Upload your first artwork to start building your portfolio.</p>
              <Button asChild className="bg-gold text-obsidian hover:bg-linen">
                <Link to="/artist/artworks/new">Upload Artwork</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
