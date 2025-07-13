import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Edit, 
  Calendar, 
  Plus 
} from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import ArtworkCard from "@/components/shared/ArtworkCard";
import { useArtworkImage } from "@/hooks/useArtworkImage";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

// Component to handle individual liked item with proper image loading
const LikedItemCard = ({ item }: { item: {
  artwork_id: string;
  artworks?: {
    id: string;
    title: string | null;
    artist_id: string | null;
    price: number | null;
    image_path: string | null;
    category: string | null;
    slug: string | null;
  } | null;
} }) => {
  const { imageUrl } = useArtworkImage(item.artworks?.image_path);
  
  return (
    <ArtworkCard
      key={item.artwork_id}
      artwork={{
        id: item.artworks?.id,
        slug: item.artworks?.slug,
        title: item.artworks?.title || "Unknown Title",
        artist: item.artworks?.artist_id || "Unknown Artist",
        price: item.artworks?.price || 0,
        image: imageUrl,
        category: item.artworks?.category || "Uncategorized"
      }}
    />
  );
};

// Helper function to format currency in INR
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const Account = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      
      // Initialize form data with profile data
      setFullName(data.full_name || "");
      setPhoneNumber(data.phone_number || "");
      
      return data as Profile;
    },
    enabled: !!user
  });

  // Fetch order history data
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["user-orders", user?.id],
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
            artwork_id,
            artworks:artworks (
              title,
              category
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString()
        })
        .eq("id", user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      setEditMode(false);
      refetchProfile();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
      });
    }
  };

  // Handle reorder
  const handleReorder = (orderId: string) => {
    toast({
      title: "Reorder initiated",
      description: `Reordering items from order #${orderId.slice(0, 8)}...`,
    });
    // Implement actual reorder functionality here
  };

  const { data: likedItems, isLoading: likesLoading } = useQuery({
    queryKey: ["liked-items", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("liked_items")
        .select(`
          artwork_id,
          artworks (
            id,
            title,
            artist_id,
            price,
            category,
            image_path
          )
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Please sign in to view your account.</p>
        </div>
      </MainLayout>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "??";

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8">
          {/* Profile Section */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2">{profile?.full_name || "Art Enthusiast"}</h2>
                  <div className="text-muted-foreground mb-4">
                    <p>{user.email}</p>
                    <p>{profile?.phone_number || "No phone number added"}</p>
                  </div>
                  
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} variant="outline" className="gap-2">
                      <Edit size={16} />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateProfile}>Save Changes</Button>
                        <Button onClick={() => setEditMode(false)} variant="outline">Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order History Section */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingBag size={20} />
                  Order History
                </h3>
              </div>
              
              {ordersLoading ? (
                <p className="text-muted-foreground">Loading order history...</p>
              ) : orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>Your recent orders</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" className="p-0 h-auto">
                                  {order.order_items?.length || 0} items
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Order Details</DialogTitle>
                                  <DialogDescription>
                                    Order placed on {new Date(order.created_at).toLocaleDateString()}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3">
                                  {order.order_items?.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                      <div>
                                        <p className="font-medium">{item.artworks?.title || "Unknown Artwork"}</p>
                                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                      </div>
                                      <p className="font-medium">{formatCurrency(Number(item.price_at_purchase))}</p>
                                    </div>
                                  ))}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">View Invoice</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(order.total_amount))}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold 
                              ${order.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'}`}>
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleReorder(order.id)}
                              className="h-8"
                            >
                              Reorder
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                  <Button variant="outline" className="mt-4">Browse Artworks</Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Liked Artworks Section */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Heart size={20} />
                  Liked Artworks
                </h3>
              </div>
              
              {likesLoading ? (
                <p className="text-muted-foreground">Loading liked artworks...</p>
              ) : likedItems && likedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {likedItems.map((item) => (
                    <LikedItemCard key={item.artwork_id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven't liked any artworks yet.</p>
                  <Button variant="outline" className="mt-4">Discover Artworks</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;
