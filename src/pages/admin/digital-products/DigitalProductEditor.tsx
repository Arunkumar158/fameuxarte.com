import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ImageUploader from "@/components/blog/ImageUploader";

export default function DigitalProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === "new" || !id;

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // Core fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [gumroadUrl, setGumroadUrl] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");

  useEffect(() => {
    if (!isNew && id) {
      fetchProduct(id);
    }
  }, [id, isNew]);

  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("digital_products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setShortDescription(data.short_description || "");
        setDescription(data.description || "");
        setCategory(data.category || "");
        setPrice(data.price?.toString() || "");
        setGumroadUrl(data.gumroad_url || "");
        setStatus(data.status || "draft");
        setIsFeatured(data.is_featured || false);
        setCoverImageUrl(data.cover_image_url || "");
      } else {
        toast.error("Product not found");
        navigate("/admin/digital-products");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load product");
      navigate("/admin/digital-products");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = useCallback(() => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 80);
    setSlug(generated);
  }, [title]);

  const handleSave = async (saveAsStatus?: string) => {
    if (!title.trim() || !slug.trim() || !category.trim()) {
      toast.error("Title, Slug, and Category are required.");
      return;
    }

    setIsSaving(true);
    const finalStatus = saveAsStatus || status;
    const currentUserId = user?.id || (await supabase.auth.getUser()).data.user?.id;

    const payload: any = {
      title: title.trim(),
      slug: slug.trim(),
      short_description: shortDescription.trim() || null,
      description: description.trim() || null,
      category: category.trim(),
      price: price && !isNaN(parseFloat(price)) ? parseFloat(price) : null,
      gumroad_url: gumroadUrl.trim() || null,
      status: finalStatus,
      is_featured: isFeatured,
      cover_image_url: coverImageUrl.trim() || null,
    };

    if (currentUserId) {
      payload.updated_by = currentUserId;
      if (isNew) {
        payload.created_by = currentUserId;
      }
    }

    try {
      if (isNew) {
        const { data, error } = await supabase.from("digital_products").insert([payload]).select().single();
        if (error) throw error;
        toast.success("Product created!");
        navigate(`/admin/digital-products/${data.id}`, { replace: true });
      } else {
        const { error } = await supabase.from("digital_products").update(payload).eq("id", id);
        if (error) throw error;
        toast.success(finalStatus === "published" ? "Product published!" : "Draft saved.");
      }
      setStatus(finalStatus);
    } catch (e: any) {
      console.error("Error saving digital product:", e);
      toast.error(e.message || "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/digital-products")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold text-slate-900">
            {isNew ? "Create Digital Product" : "Edit Digital Product"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave("published")}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-900 font-medium">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Product Title"
                className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="slug" className="text-slate-900 font-medium">Slug *</Label>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary hover:underline" onClick={generateSlug}>
                  Generate from title
                </Button>
              </div>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="product-slug"
                className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 font-mono text-sm focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription" className="text-slate-900 font-medium">Short Description</Label>
              <Textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={3}
                placeholder="Brief summary for product cards..."
                className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-900 font-medium">Full Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Detailed description..."
                className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2 mb-4">Pricing & Delivery</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-slate-900 font-medium">Price (INR)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="499"
                  className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gumroadUrl" className="text-slate-900 font-medium">Gumroad URL</Label>
                <Input
                  id="gumroadUrl"
                  value={gumroadUrl}
                  onChange={(e) => setGumroadUrl(e.target.value)}
                  placeholder="https://gum.co/..."
                  className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Settings</h3>
            <div className="space-y-2">
              <Label className="text-slate-900 font-medium">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white text-slate-900 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-md">
                  <SelectItem value="draft" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900 cursor-pointer">Draft</SelectItem>
                  <SelectItem value="published" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900 cursor-pointer">Published</SelectItem>
                  <SelectItem value="archived" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900 cursor-pointer">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 pt-2">
              <Label className="text-slate-900 font-medium">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white text-slate-900 border-slate-300">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-md">
                  <SelectItem value="Calculator" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900 cursor-pointer">Calculator</SelectItem>
                  <SelectItem value="Template" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900 cursor-pointer">Template</SelectItem>
                  <SelectItem value="Ebook" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900 cursor-pointer">Ebook</SelectItem>
                  <SelectItem value="Swipe File" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900 cursor-pointer">Swipe File</SelectItem>
                  <SelectItem value="Other" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900 cursor-pointer">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isFeatured" className="text-slate-900 font-medium cursor-pointer">Featured Product</Label>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Cover Image</h3>
            <ImageUploader
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              label="Cover"
              bucket="artworks"
              folder={user?.id ? `${user.id}/products` : "products"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
