import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  EyeOff, 
  Image as ImageIcon,
  Loader2,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ArtworksList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: artworks, isLoading, refetch } = useQuery({
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this artwork? This cannot be undone.")) return;
    
    try {
      const { error } = await supabase.from("artworks").delete().eq("id", id);
      if (error) throw error;
      
      toast({
        title: "Artwork deleted",
        description: "The artwork has been successfully removed.",
      });
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete artwork.",
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("artworks").update({ status }).eq("id", id);
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Artwork is now ${status}.`,
      });
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status.",
      });
    }
  };

  const filteredArtworks = artworks?.filter((artwork) => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || artwork.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-linen">My Artworks</h1>
          <p className="mt-1 text-sm text-stone">Manage your portfolio, update pricing, and track availability.</p>
        </div>
        <Button asChild className="bg-gold text-obsidian hover:bg-linen">
          <Link to="/artist/artworks/new">
            <Plus className="mr-2 h-4 w-4" />
            Upload Artwork
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-[8px] border border-border-subtle bg-surface-2 p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <Input 
            placeholder="Search artworks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border-subtle bg-obsidian pl-9 text-linen" 
          />
        </div>
        <div className="flex gap-2">
          {['all', 'available', 'draft', 'sold', 'hidden'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                statusFilter === status 
                  ? "bg-gold/10 text-gold border border-gold/20" 
                  : "bg-transparent text-stone border border-transparent hover:bg-surface-3 hover:text-linen"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[8px] border border-border-subtle bg-surface-2 overflow-hidden">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : filteredArtworks && filteredArtworks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone">
              <thead className="border-b border-border-faint bg-surface-1 text-[11px] uppercase tracking-wider text-[#666]">
                <tr>
                  <th className="px-6 py-4 font-medium">Artwork</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-faint bg-surface-2">
                {filteredArtworks.map((artwork) => (
                  <tr key={artwork.id} className="transition-colors hover:bg-surface-3/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[4px] bg-surface-3">
                          {artwork.image_path ? (
                            <img 
                              src={`https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/${artwork.image_path}`} 
                              alt={artwork.title} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="m-auto h-5 w-5 text-stone h-full" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-linen">{artwork.title}</div>
                          <div className="text-[12px] text-stone">{new Date(artwork.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        artwork.status === 'available' ? 'bg-verified/10 text-verified' : 
                        artwork.status === 'sold' ? 'bg-blue-500/10 text-blue-400' :
                        artwork.status === 'draft' ? 'bg-gold/10 text-gold' :
                        'bg-surface-3 text-stone'
                      }`}>
                        {artwork.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-linen">{formatCurrency(artwork.price)}</td>
                    <td className="px-6 py-4">{artwork.category || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-stone hover:bg-surface-3 hover:text-linen">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 border-border-subtle bg-surface-2 text-linen">
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-surface-3">
                            <Link to={`/artist/artworks/${artwork.id}/edit`} className="flex items-center">
                              <Edit className="mr-2 h-4 w-4 text-stone" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          
                          {artwork.status === 'available' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(artwork.id, 'hidden')} className="cursor-pointer focus:bg-surface-3">
                              <EyeOff className="mr-2 h-4 w-4 text-stone" />
                              Hide Artwork
                            </DropdownMenuItem>
                          )}
                          
                          {artwork.status === 'hidden' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(artwork.id, 'available')} className="cursor-pointer focus:bg-surface-3">
                              <EyeOff className="mr-2 h-4 w-4 text-stone" />
                              Make Available
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem onClick={() => handleDelete(artwork.id)} className="cursor-pointer text-red-400 focus:bg-surface-3 focus:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-3 text-stone">
              <ImageIcon className="h-8 w-8" />
            </div>
            <h4 className="mb-2 text-base font-medium text-linen">No artworks found</h4>
            <p className="mb-6 max-w-sm text-sm text-stone">
              {searchQuery || statusFilter !== 'all' 
                ? "Try adjusting your search or filters to find what you're looking for." 
                : "You haven't uploaded any artworks yet. Get started by adding your first piece."}
            </p>
            {(!searchQuery && statusFilter === 'all') && (
              <Button asChild className="bg-gold text-obsidian hover:bg-linen">
                <Link to="/artist/artworks/new">Upload Artwork</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtworksList;
