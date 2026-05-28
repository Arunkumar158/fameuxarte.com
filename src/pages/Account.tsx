import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Calendar,
  Edit,
  Heart,
  ImagePlus,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Upload,
  User,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
import MainLayout from "@/components/layouts/MainLayout";
import HomeNav from "@/components/home/HomeNav";
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

const getStatusClass = (status: string | null | undefined) => {
  if (status === "completed") return "border-verified/30 bg-verified/10 text-verified";
  if (status === "pending") return "border-gold/30 bg-gold/10 text-gold";
  return "border-border-subtle bg-surface-3 text-stone";
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const LikedItemCard = ({ item }: { item: {
  artwork_id: string;
  artworks?: {
    id: string;
    title: string | null;
    artist_id: string | null;
    price: number | null;
    image_path: string | null;
    category: string | null;
    slug?: string | null;
  } | null;
} }) => {
  const { imageUrl } = useArtworkImage(item.artworks?.image_path);

  return (
    <ArtworkCard
      key={item.artwork_id}
      artwork={{
        id: item.artworks?.id || item.artwork_id,
        slug: item.artworks?.slug,
        title: item.artworks?.title || "Unknown Title",
        artist: item.artworks?.artist_id || "Unknown Artist",
        price: item.artworks?.price || 0,
        image: imageUrl,
        category: item.artworks?.category || "Uncategorized",
      }}
    />
  );
};

const SectionShell = ({
  icon,
  title,
  eyebrow,
  children,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <section className="rounded-[10px] border border-border-subtle bg-surface-2">
    <div className="flex flex-col gap-4 border-b border-b-[0.5px] border-border-faint p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-gold/20 bg-gold/10 text-gold">
          {icon}
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-gold">{eyebrow}</p>
          <h2 className="text-[20px] font-medium tracking-[-0.02em] text-linen">{title}</h2>
        </div>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

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

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [selectedFiles]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 10));
    event.target.value = "";
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

      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const ext = file.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}_${index}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("artworks")
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;
        imagePaths.push(filePath);
        setUploadProgress(Math.round(((index + 1) / selectedFiles.length) * 80));
      }

      const slug = generateSlug(title);
      const { error: insertError } = await supabase.from("artworks").insert({
        title: title.trim(),
        price: Number(price),
        category: category.trim() || null,
        description: description.trim() || null,
        image_path: imagePaths[0],
        images: imagePaths,
        artist_id: user.id,
        slug,
      });

      if (insertError) throw insertError;

      setUploadProgress(100);
      toast({
        title: "Artwork uploaded",
        description: `"${title}" has been added with ${imagePaths.length} image${imagePaths.length > 1 ? "s" : ""}.`,
      });

      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <SectionShell
      icon={<ImagePlus className="h-5 w-5" aria-hidden="true" />}
      eyebrow="Artist tools"
      title="Upload Artwork"
      action={<span className="text-[11px] text-[#666]">Max 10 images per artwork</span>}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="artworkTitle" className="text-[12px] text-stone">Title</Label>
            <Input id="artworkTitle" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Cosmic Reverie" disabled={isUploading} className="border-border-subtle bg-obsidian text-linen" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artworkPrice" className="text-[12px] text-stone">Price (INR)</Label>
            <Input id="artworkPrice" type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="45000" disabled={isUploading} className="border-border-subtle bg-obsidian text-linen" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="artworkCategory" className="text-[12px] text-stone">Category</Label>
            <Input id="artworkCategory" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Abstract, Landscape, Figurative" disabled={isUploading} className="border-border-subtle bg-obsidian text-linen" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="artworkDescription" className="text-[12px] text-stone">Description</Label>
            <Textarea id="artworkDescription" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the medium, story, and condition..." rows={5} disabled={isUploading} className="border-border-subtle bg-obsidian text-linen" />
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-gold/30 bg-gold/5 p-6 text-center text-stone transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload className="h-8 w-8" aria-hidden="true" />
            <span className="text-[13px] font-medium text-linen">Add artwork images</span>
            <span className="text-[11px] text-[#666]">JPG, PNG, or WebP</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isUploading} />

          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {previews.map((src, index) => (
                <div key={src} className="group relative aspect-square overflow-hidden rounded-[6px] border border-border-subtle bg-surface-3">
                  <img src={src} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                  {index === 0 && (
                    <div className="absolute inset-x-0 bottom-0 bg-gold px-1 py-0.5 text-center text-[8px] font-semibold uppercase tracking-[0.08em] text-obsidian">
                      Primary
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-[#666]">
                <span>Uploading</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-obsidian">
                <div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0 || !title.trim()} className="mt-6 h-11 rounded-[6px] bg-gold px-6 text-[12px] font-medium text-obsidian hover:bg-linen">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Uploading {uploadProgress}%
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            Upload Artwork
          </>
        )}
      </Button>
    </SectionShell>
  );
};

const Account = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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

      setFullName(data.full_name || "");
      setPhoneNumber(data.phone_number || "");

      return data as Profile;
    },
    enabled: !!user,
  });

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
    enabled: !!user,
  });

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
            image_path,
            slug
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString(),
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

  const handleReorder = (orderId: string) => {
    toast({
      title: "Acquire again",
      description: `Adding items from acquisition #${orderId.slice(0, 8)} to your collection...`,
    });
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-obsidian text-linen">
          <HomeNav />
          <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
              <User className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mb-3 text-[34px] font-medium tracking-[-0.025em] text-linen">Sign in to view your profile</h1>
            <p className="mb-7 max-w-md text-[14px] leading-[1.7] text-stone">
              Your collector profile, acquisitions, saved artworks, and artist tools live behind your account.
            </p>
            <Button asChild className="h-10 rounded-[6px] bg-gold px-5 text-[12px] font-medium text-obsidian hover:bg-linen">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || "Art Enthusiast";
  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const ordersCount = orders?.length || 0;
  const likedCount = likedItems?.length || 0;
  const totalCollected = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-obsidian text-linen">
        <div className="[&_nav_a[href='/profile']]:text-gold">
          <HomeNav />
        </div>

        <header className="border-b border-b-[0.5px] border-border-faint bg-obsidian px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Avatar className="h-24 w-24 border border-gold/20 bg-surface-2">
                  <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
                  <AvatarFallback className="bg-gold/10 text-[28px] font-medium text-gold">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Collector profile
                  </div>
                  <h1 className="mb-3 text-[34px] font-medium leading-[1.12] tracking-[-0.025em] text-linen md:text-[46px]">
                    {profileLoading ? "Loading profile" : displayName}
                  </h1>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-stone">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gold" aria-hidden="true" />
                      {user.email}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gold" aria-hidden="true" />
                      {profile?.phone_number || "Phone not added"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gold" aria-hidden="true" />
                      Joined {formatDate(profile?.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={() => setEditMode((value) => !value)} className="h-10 rounded-[6px] border border-gold/25 bg-gold/10 px-5 text-[12px] font-medium text-gold hover:bg-gold hover:text-obsidian">
                <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                {editMode ? "Close Editor" : "Edit Profile"}
              </Button>
            </div>

            <div className="mt-8 grid gap-3 border-t border-t-[0.5px] border-border-faint pt-6 sm:grid-cols-3">
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 text-[22px] font-medium tracking-[-0.02em] text-linen">{ordersCount}</div>
                <div className="text-[11px] text-[#666]">Acquisitions</div>
              </div>
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 text-[22px] font-medium tracking-[-0.02em] text-gold">{likedCount}</div>
                <div className="text-[11px] text-[#666]">Saved artworks</div>
              </div>
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 text-[22px] font-medium tracking-[-0.02em] text-linen">{formatCurrency(totalCollected)}</div>
                <div className="text-[11px] text-[#666]">Lifetime value</div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
          {editMode && (
            <SectionShell icon={<Edit className="h-5 w-5" aria-hidden="true" />} eyebrow="Account details" title="Profile Settings">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[12px] text-stone">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} className="border-border-subtle bg-obsidian text-linen" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-[12px] text-stone">Phone number</Label>
                  <Input id="phoneNumber" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className="border-border-subtle bg-obsidian text-linen" />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={handleUpdateProfile} className="h-10 rounded-[6px] bg-gold px-5 text-[12px] font-medium text-obsidian hover:bg-linen">Save Changes</Button>
                <Button onClick={() => setEditMode(false)} variant="outline" className="h-10 rounded-[6px] border-border-subtle bg-transparent px-5 text-[12px] text-stone hover:bg-surface-3 hover:text-linen">Cancel</Button>
              </div>
            </SectionShell>
          )}

          <SectionShell
            icon={<ShoppingBag className="h-5 w-5" aria-hidden="true" />}
            eyebrow="Ownership"
            title="Acquisition History"
            action={
              <Button asChild variant="outline" className="h-9 rounded-[6px] border-border-subtle bg-transparent text-[12px] text-stone hover:bg-surface-3 hover:text-linen">
                <Link to="/artworks">
                  Browse Artworks
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-[8px] bg-surface-3" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <article key={order.id} className="grid gap-4 rounded-[8px] border border-border-subtle bg-obsidian p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[12px] text-gold">#{String(order.id).slice(0, 8)}</span>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] ${getStatusClass(order.status)}`}>
                          {order.status || "processing"}
                        </span>
                      </div>
                      <p className="text-[13px] text-stone">{formatDate(order.created_at)} | {order.order_items?.length || 0} items</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[11px] uppercase tracking-[0.1em] text-[#666]">Total value</p>
                      <p className="text-[18px] font-medium text-linen">{formatCurrency(Number(order.total_amount))}</p>
                    </div>
                    <div className="flex gap-2 md:justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="h-9 rounded-[6px] border-border-subtle bg-transparent text-[12px] text-stone hover:bg-surface-3 hover:text-linen">
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-border-subtle bg-surface-2 text-linen">
                          <DialogHeader>
                            <DialogTitle>Acquisition Details</DialogTitle>
                            <DialogDescription className="text-stone">
                              Completed on {formatDate(order.created_at)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="flex justify-between gap-4 border-b border-b-border-faint pb-3">
                                <div>
                                  <p className="font-medium text-linen">{item.artworks?.title || "Unknown Artwork"}</p>
                                  <p className="text-[12px] text-stone">Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-medium text-gold">{formatCurrency(Number(item.price_at_purchase))}</p>
                              </div>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" className="border-border-subtle bg-transparent text-stone hover:bg-surface-3 hover:text-linen">View Invoice</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button onClick={() => handleReorder(order.id)} className="h-9 rounded-[6px] bg-gold/10 px-4 text-[12px] font-medium text-gold hover:bg-gold hover:text-obsidian">
                        Acquire Again
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[8px] border border-border-subtle bg-obsidian px-5 py-10 text-center">
                <p className="mb-4 text-[14px] text-stone">You have no acquisitions yet.</p>
                <Button asChild className="h-10 rounded-[6px] bg-gold px-5 text-[12px] font-medium text-obsidian hover:bg-linen">
                  <Link to="/artworks">Discover Artworks</Link>
                </Button>
              </div>
            )}
          </SectionShell>

          <SectionShell icon={<Heart className="h-5 w-5" aria-hidden="true" />} eyebrow="Shortlist" title="Liked Artworks">
            {likesLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-xl border border-white/5 bg-brand-dark/80">
                    <div className="aspect-square animate-pulse bg-surface-3" />
                    <div className="space-y-3 p-5">
                      <div className="h-5 w-2/3 animate-pulse rounded bg-surface-3" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-surface-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : likedItems && likedItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {likedItems.slice(0, 6).map((item) => (
                  <LikedItemCard key={item.artwork_id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-[8px] border border-border-subtle bg-obsidian px-5 py-10 text-center">
                <p className="mb-4 text-[14px] text-stone">You have not liked any artworks yet.</p>
                <Button asChild variant="outline" className="h-10 rounded-[6px] border-border-subtle bg-transparent px-5 text-[12px] text-stone hover:bg-surface-3 hover:text-linen">
                  <Link to="/artworks">Start Discovering</Link>
                </Button>
              </div>
            )}
          </SectionShell>

          <UploadArtworkSection />
        </main>
      </div>
    </MainLayout>
  );
};

export default Account;
