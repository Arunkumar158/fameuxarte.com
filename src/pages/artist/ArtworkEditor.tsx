import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Loader2, 
  Save, 
  Image as ImageIcon 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/utils";
import { ArtistAgreementModal } from "@/components/artist/ArtistAgreementModal";

const ArtworkEditor = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [hasAcceptedAgreement, setHasAcceptedAgreement] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [medium, setMedium] = useState("");
  const [style, setStyle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [tags, setTags] = useState("");
  
  // Dimensions
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [depth, setDepth] = useState("");
  const [unit, setUnit] = useState("in");
  
  // Toggles
  const [certificateIncluded, setCertificateIncluded] = useState(false);
  const [frameIncluded, setFrameIncluded] = useState(false);
  const [status, setStatus] = useState("draft");
  
  // Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [selectedFiles]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('agreement_accepted').eq('id', user.id).single();
      if (data) setHasAcceptedAgreement(!!data.agreement_accepted);
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchArtwork = async () => {
      if (!isEditMode || !user) return;
      
      try {
        const { data, error } = await supabase
          .from("artworks")
          .select("*")
          .eq("id", id)
          .eq("artist_id", user.id)
          .single();
          
        if (error) throw error;
        
        setTitle(data.title || "");
        setPrice(data.price?.toString() || "");
        setCategory(data.category || "");
        setDescription(data.description || "");
        setStory(data.story || "");
        setMedium(data.medium || "");
        setStyle(data.style || "");
        setYear(data.creation_year?.toString() || new Date().getFullYear().toString());
        setTags(data.tags?.join(", ") || "");
        setStatus(data.status || "draft");
        setCertificateIncluded(data.certificate_included || false);
        setFrameIncluded(data.frame_included || false);
        
        if (data.dimensions) {
          const dim = data.dimensions as any;
          setWidth(dim.width?.toString() || "");
          setHeight(dim.height?.toString() || "");
          setDepth(dim.depth?.toString() || "");
          setUnit(dim.unit || "in");
        }
        
        if (data.images && data.images.length > 0) {
          setExistingImages(data.images);
        } else if (data.image_path) {
          setExistingImages([data.image_path]);
        }
        
      } catch (error) {
        console.error("Error fetching artwork:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load artwork details.",
        });
        navigate("/artist/artworks");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtwork();
  }, [id, isEditMode, user, navigate, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    const maxFiles = 10 - existingImages.length;
    if (files.length > maxFiles) {
      toast({
        variant: "destructive",
        title: "Limit exceeded",
        description: `You can only add up to 10 images total. You can add ${maxFiles} more.`,
      });
      setSelectedFiles((prev) => [...prev, ...files].slice(0, maxFiles));
    } else {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
    
    event.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (saveAsStatus: string) => {
    if (!user) return;
    
    if (!title.trim()) {
      toast({ variant: "destructive", title: "Title required", description: "Please enter a title." });
      return;
    }
    if (saveAsStatus === 'available' && existingImages.length === 0 && selectedFiles.length === 0) {
      toast({ variant: "destructive", title: "Image required", description: "Published artworks need at least one image." });
      return;
    }
    if (saveAsStatus === 'available' && (!price || isNaN(Number(price)) || Number(price) <= 0)) {
      toast({ variant: "destructive", title: "Price required", description: "Please enter a valid price to publish." });
      return;
    }

    if (saveAsStatus === 'available' && !hasAcceptedAgreement) {
      setShowAgreementModal(true);
      return;
    }

    await performSave(saveAsStatus);
  };

  const performSave = async (saveAsStatus: string) => {
    setIsSaving(true);
    setUploadProgress(0);

    try {
      let finalImages = [...existingImages];

      // Upload new images
      if (selectedFiles.length > 0) {
        for (let index = 0; index < selectedFiles.length; index++) {
          const file = selectedFiles[index];
          const ext = file.name.split(".").pop();
          const filePath = `${user.id}/${Date.now()}_${index}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("artworks")
            .upload(filePath, file, { upsert: false });

          if (uploadError) throw uploadError;
          finalImages.push(filePath);
          setUploadProgress(Math.round(((index + 1) / selectedFiles.length) * 80));
        }
      }

      const slug = isEditMode ? undefined : generateSlug(title);
      const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t);
      
      const payload = {
        title: title.trim(),
        price: Number(price) || 0,
        category: category.trim() || null,
        description: description.trim() || null,
        story: story.trim() || null,
        medium: medium.trim() || null,
        style: style.trim() || null,
        creation_year: parseInt(year) || null,
        tags: tagsArray,
        image_path: finalImages.length > 0 ? finalImages[0] : null,
        images: finalImages,
        status: saveAsStatus,
        certificate_included: certificateIncluded,
        frame_included: frameIncluded,
        dimensions: {
          width: parseFloat(width) || null,
          height: parseFloat(height) || null,
          depth: parseFloat(depth) || null,
          unit
        }
      };

      if (isEditMode) {
        const { error } = await supabase.from("artworks").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("artworks").insert({
          ...payload,
          artist_id: user.id,
          slug,
        });
        if (error) throw error;
      }

      setUploadProgress(100);
      toast({
        title: "Success",
        description: `Artwork ${isEditMode ? 'updated' : 'created'} successfully.`,
      });

      navigate("/artist/artworks");
    } catch (err) {
      console.error("Save error:", err);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this artwork? This cannot be undone.")) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from("artworks").delete().eq("id", id);
      if (error) throw error;
      
      toast({
        title: "Artwork deleted",
        description: "The artwork has been successfully removed.",
      });
      navigate("/artist/artworks");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete artwork.",
      });
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" className="h-8 w-8 p-0 text-stone hover:bg-surface-2 hover:text-linen">
          <Link to="/artist/artworks">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-linen">
            {isEditMode ? "Edit Artwork" : "Upload New Artwork"}
          </h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main Content Area */}
        <div className="space-y-6">
          <section className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
            <h2 className="mb-4 text-[14px] font-medium text-linen">Basic Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[12px] text-stone">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[12px] text-stone">Price (INR)</Label>
                  <Input id="price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-[12px] text-stone">Year of Creation</Label>
                  <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[12px] text-stone">Category</Label>
                  <Input id="category" placeholder="Painting, Sculpture, Photography..." value={category} onChange={(e) => setCategory(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medium" className="text-[12px] text-stone">Medium</Label>
                  <Input id="medium" placeholder="Oil on Canvas, Bronze..." value={medium} onChange={(e) => setMedium(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
            <h2 className="mb-4 text-[14px] font-medium text-linen">Artwork Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[12px] text-stone">Description</Label>
                <Textarea id="description" rows={3} placeholder="Physical description, condition, context..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story" className="text-[12px] text-stone">The Story Behind the Art</Label>
                <Textarea id="story" rows={4} placeholder="What inspired this piece? What does it mean to you?" value={story} onChange={(e) => setStory(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[12px] text-stone">Dimensions</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Input placeholder="W" type="number" value={width} onChange={(e) => setWidth(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                  <Input placeholder="H" type="number" value={height} onChange={(e) => setHeight(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                  <Input placeholder="D" type="number" value={depth} onChange={(e) => setDepth(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
                  <select 
                    value={unit} 
                    onChange={(e) => setUnit(e.target.value)} 
                    disabled={isSaving}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-border-subtle bg-obsidian px-3 py-2 text-sm text-linen focus:outline-none"
                  >
                    <option value="in">Inches</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-[12px] text-stone">Tags (comma separated)</Label>
                <Input id="tags" placeholder="abstract, modern, blue, landscape" value={tags} onChange={(e) => setTags(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="style" className="text-[12px] text-stone">Style</Label>
                <Input id="style" placeholder="Abstract Expressionism, Minimalist..." value={style} onChange={(e) => setStyle(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <section className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
            <h2 className="mb-4 text-[14px] font-medium text-linen">Images (Max 10)</h2>
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving || (existingImages.length + selectedFiles.length >= 10)}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-[6px] border border-dashed border-gold/30 bg-gold/5 p-4 text-center text-stone hover:border-gold hover:text-gold disabled:opacity-50"
              >
                <Upload className="h-5 w-5" />
                <span className="text-[12px] font-medium">Add Images</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isSaving} />

              <div className="grid grid-cols-3 gap-2">
                {/* Existing Images */}
                {existingImages.map((path, index) => (
                  <div key={path} className="group relative aspect-square overflow-hidden rounded-[4px] border border-border-subtle bg-surface-3">
                    <img src={`https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/${path}`} alt="Existing" className="h-full w-full object-cover" />
                    {index === 0 && <div className="absolute inset-x-0 bottom-0 bg-gold px-1 py-0.5 text-center text-[8px] font-semibold uppercase tracking-[0.08em] text-obsidian">Primary</div>}
                    <button type="button" onClick={() => removeExistingImage(index)} disabled={isSaving} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {/* New Previews */}
                {previews.map((src, index) => (
                  <div key={src} className="group relative aspect-square overflow-hidden rounded-[4px] border border-border-subtle bg-surface-3">
                    <img src={src} alt="Preview" className="h-full w-full object-cover" />
                    {existingImages.length === 0 && index === 0 && <div className="absolute inset-x-0 bottom-0 bg-gold px-1 py-0.5 text-center text-[8px] font-semibold uppercase tracking-[0.08em] text-obsidian">Primary</div>}
                    <button type="button" onClick={() => removeSelectedFile(index)} disabled={isSaving} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {isSaving && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#666]">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-obsidian">
                    <div className="h-full bg-gold transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
            <h2 className="mb-4 text-[14px] font-medium text-linen">Options</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={certificateIncluded} onChange={(e) => setCertificateIncluded(e.target.checked)} disabled={isSaving} className="h-4 w-4 rounded border-border-subtle bg-obsidian accent-gold" />
                <span className="text-[12px] text-stone">Certificate of Authenticity Included</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={frameIncluded} onChange={(e) => setFrameIncluded(e.target.checked)} disabled={isSaving} className="h-4 w-4 rounded border-border-subtle bg-obsidian accent-gold" />
                <span className="text-[12px] text-stone">Frame Included</span>
              </label>
            </div>
          </section>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => handleSave('available')} 
              disabled={isSaving || !title.trim()} 
              className="w-full bg-gold text-obsidian hover:bg-linen"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Publish Artwork
            </Button>
            <Button 
              onClick={() => handleSave('draft')} 
              disabled={isSaving || !title.trim()} 
              variant="outline" 
              className="w-full border-border-subtle text-stone hover:bg-surface-3 hover:text-linen"
            >
              Save as Draft
            </Button>
            {isEditMode && (
              <Button
                onClick={handleDelete}
                disabled={isSaving}
                variant="outline"
                className="w-full border-red-900/50 text-red-500 hover:bg-red-900/20 hover:text-red-400"
              >
                Delete Artwork
              </Button>
            )}
          </div>
        </div>
      </div>
      <ArtistAgreementModal 
        open={showAgreementModal} 
        onOpenChange={setShowAgreementModal} 
        onAccept={() => {
          setHasAcceptedAgreement(true);
          setShowAgreementModal(false);
          performSave('available');
        }} 
      />
    </div>
  );
};

export default ArtworkEditor;
