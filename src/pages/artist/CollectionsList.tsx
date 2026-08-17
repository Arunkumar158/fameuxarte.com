import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit,
  Loader2,
  Trash2,
  FolderOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CollectionsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: collections, isLoading, refetch } = useQuery({
    queryKey: ["artist-collections", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("artist_collections" as any)
        .select(`
          *,
          artworks(count)
        `)
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection? Artworks will remain but lose this collection association.")) return;
    
    try {
      const { error } = await supabase.from("artist_collections" as any).delete().eq("id", id);
      if (error) throw error;
      
      toast({
        title: "Collection deleted",
        description: "The collection has been successfully removed.",
      });
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete collection.",
      });
    }
  };

  const filteredCollections = collections?.filter((c: any) => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-linen">Collections</h1>
          <p className="mt-1 text-sm text-stone">Group your artworks into cohesive series or exhibitions.</p>
        </div>
        <Button asChild className="bg-gold text-obsidian hover:bg-linen">
          <Link to="/artist/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Collection
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-[8px] border border-border-subtle bg-surface-2 p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <Input 
            placeholder="Search collections..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border-subtle bg-obsidian pl-9 text-linen" 
          />
        </div>
      </div>

      <div className="rounded-[8px] border border-border-subtle bg-surface-2 overflow-hidden">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : filteredCollections && filteredCollections.length > 0 ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="group relative overflow-hidden rounded-[8px] border border-border-faint bg-obsidian transition-colors hover:border-gold/30">
                <div className="aspect-[16/9] w-full overflow-hidden bg-surface-3 relative">
                  {collection.cover_image ? (
                     <img 
                       src={`https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/${collection.cover_image}`} 
                       alt={collection.title} 
                       className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                     />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone">
                      <FolderOpen className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="h-8 w-8 rounded-full bg-black/50 p-0 text-white hover:bg-black/80">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 border-border-subtle bg-surface-2 text-linen">
                        <DropdownMenuItem asChild className="cursor-pointer focus:bg-surface-3">
                          <Link to={`/artist/collections/${collection.id}/edit`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4 text-stone" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(collection.id)} className="cursor-pointer text-red-400 focus:bg-surface-3 focus:text-red-400">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 text-sm font-medium text-linen truncate">{collection.title}</h3>
                  <div className="flex items-center justify-between text-[11px] text-[#666]">
                    <span>{collection.artworks?.[0]?.count || 0} Artworks</span>
                    <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-3 text-stone">
              <FolderOpen className="h-8 w-8" />
            </div>
            <h4 className="mb-2 text-base font-medium text-linen">No collections found</h4>
            <p className="mb-6 max-w-sm text-sm text-stone">
              {searchQuery
                ? "No collections match your search." 
                : "Organize your artworks into curated series or thematic collections."}
            </p>
            {!searchQuery && (
              <Button asChild className="bg-gold text-obsidian hover:bg-linen">
                <Link to="/artist/collections/new">Create Collection</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsList;
