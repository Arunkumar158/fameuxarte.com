import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Upload,
  X,
  ImagePlus,
  Loader2,
} from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import ArtworkCard from "@/components/shared/ArtworkCard";
import { useArtworkImage } from "@/hooks/useArtworkImage";
import { formatCurrency, generateSlug } from "@/lib/utils";

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



// ─── Upload Artwork Section ─────────────────────────────────────────────────
const UploadArtworkSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Generate previews whenever files change
  useEffect(() => {
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [selectedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    // Allow up to 10 images
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 10));
    // Reset input so the same file can be re-added after removal
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!user) return;
    if (!title.trim()) {
      toast({ variant: "destructive", title: "Title required", description: "Please enter a title for the artwork." });
      return;
    }
    if (selectedFiles.length === 0) {
      toast({ variant: "destructive", title: "Image required", description: "Please select at least one image." });
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({ variant: "destructive", title: "Invalid price", description: "Please enter a valid price." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const imagePaths: string[] = [];
      const total = selectedFiles.length;

      for (let i = 0; i < total; i++) {
        const file = selectedFiles[i];
        const ext = file.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("artworks")
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;
        imagePaths.push(filePath);
        setUploadProgress(Math.round(((i + 1) / total) * 80));
      }

      // Insert artwork record
      const slug = generateSlug(title);
      const { error: insertError } = await supabase.from("artworks").insert({
        title: title.trim(),
        price: Number(price),
        category: category.trim() || null,
        description: description.trim() || null,
        image_path: imagePaths[0],          // backward compat — first image
        images: imagePaths,                  // full gallery array
        artist_id: user.id,
        slug,
      });

      if (insertError) throw insertError;

      setUploadProgress(100);
      toast({ title: "Artwork uploaded!", description: `"${title}" has been added with ${imagePaths.length} image${imagePaths.length > 1 ? "s" : ""}.` });

      // Reset form
      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    } catch (err) {
      console.error("Upload error:", err);
      toast({ variant: "destructive", title: "Upload failed", description: err instanceof Error ? err.message : "An error occurred." });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <ImagePlus size={20} />
            Upload Artwork
          </h3>
          <span className="text-xs text-muted-foreground">Max 10 images per artwork</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left — form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="artworkTitle">Title *</Label>
              <Input id="artworkTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cosmic Reverie" disabled={isUploading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artworkPrice">Price (₹) *</Label>
              <Input id="artworkPrice" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 45000" disabled={isUploading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artworkCategory">Category</Label>
              <Input id="artworkCategory" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Abstract, Landscape" disabled={isUploading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artworkDescription">Description</Label>
              <Textarea id="artworkDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your artwork..." rows={4} disabled={isUploading} />
            </div>
          </div>

          {/* Right — image picker */}
          <div className="space-y-4">
            <Label>Images *</Label>
            {/* Drop zone */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full border-2 border-dashed border-white/20 hover:border-brand-gold/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-brand-gold transition-all duration-200 bg-white/2 hover:bg-brand-gold/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">Click to add images</span>
              <span className="text-xs">JPG, PNG, WebP — up to 10 files</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            {/* Previews grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-brand-gold/80 text-white text-[9px] text-center py-0.5 font-semibold">PRIMARY</div>
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      disabled={isUploading}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                      aria-label={`Remove image ${i + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {isUploading && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-gold rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0 || !title.trim()}
          className="mt-6 btn-primary h-11 px-8"
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading {uploadProgress}%</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" /> Upload Artwork</>
          )}
        </Button>
      </div>
    </div>
  );
};

// ─── Account Component ───────────────────────────────────────────────────────
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
      title: "Acquire again",
      description: `Adding items from acquisition #${orderId.slice(0, 8)} to your collection...`,
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
                  Acquisition History
                </h3>
              </div>
              
              {ordersLoading ? (
                <p className="text-muted-foreground">Loading acquisition history...</p>
              ) : orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>Your recent acquisitions</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
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
                                  <DialogTitle>Acquisition Details</DialogTitle>
                                  <DialogDescription>
                                    Acquisition completed on {new Date(order.created_at).toLocaleDateString()}
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
                              Acquire Again
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You have no acquisitions yet.</p>
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

          {/* Upload Artwork Section */}
          <UploadArtworkSection />
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;
