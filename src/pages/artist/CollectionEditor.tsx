import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Upload, 
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

const CollectionEditor = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [selectedFile]);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!isEditMode || !user) return;
      
      try {
        const { data, error } = await supabase
          .from("artist_collections")
          .select("*")
          .eq("id", id)
          .eq("artist_id", user.id)
          .single();
          
        if (error) throw error;
        
        setTitle(data.title || "");
        setDescription(data.description || "");
        setSeoDescription(data.seo_description || "");
        setExistingImage(data.cover_image || null);
        
      } catch (error) {
        console.error("Error fetching collection:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load collection details.",
        });
        navigate("/artist/collections");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollection();
  }, [id, isEditMode, user, navigate, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    event.target.value = "";
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!title.trim()) {
      toast({ variant: "destructive", title: "Title required", description: "Please enter a title." });
      return;
    }

    setIsSaving(true);

    try {
      let finalImage = existingImage;

      // Upload new image
      if (selectedFile) {
        const ext = selectedFile.name.split(".").pop();
        const filePath = `${user.id}/collections/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("artworks")
          .upload(filePath, selectedFile, { upsert: false });

        if (uploadError) throw uploadError;
        finalImage = filePath;
      }

      const slug = isEditMode ? undefined : generateSlug(title);
      
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        seo_description: seoDescription.trim() || null,
        cover_image: finalImage,
      };

      if (isEditMode) {
        const { error } = await supabase.from("artist_collections").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("artist_collections").insert({
          ...payload,
          artist_id: user.id,
          slug: slug as string,
        });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Collection ${isEditMode ? 'updated' : 'created'} successfully.`,
      });

      navigate("/artist/collections");
    } catch (err) {
      console.error("Save error:", err);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this collection? Artworks will remain but lose this collection association.")) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from("artist_collections").delete().eq("id", id);
      if (error) throw error;
      
      toast({
        title: "Collection deleted",
        description: "The collection has been successfully removed.",
      });
      navigate("/artist/collections");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete collection.",
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" className="h-8 w-8 p-0 text-stone hover:bg-surface-2 hover:text-linen">
          <Link to="/artist/collections">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-linen">
            {isEditMode ? "Edit Collection" : "Create New Collection"}
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[12px] text-stone">Collection Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[12px] text-stone">Description</Label>
              <Textarea id="description" rows={4} placeholder="What is this collection about?" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seo_description" className="text-[12px] text-stone">SEO Description (Optional)</Label>
              <Textarea id="seo_description" rows={2} placeholder="A short description for search engines." value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} disabled={isSaving} className="border-border-subtle bg-obsidian text-linen" />
            </div>
          </div>
        </section>

        <section className="rounded-[8px] border border-border-subtle bg-surface-2 p-5">
          <h2 className="mb-4 text-[14px] font-medium text-linen">Cover Image</h2>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative aspect-[16/9] w-full max-w-[320px] shrink-0 overflow-hidden rounded-[8px] border border-border-subtle bg-surface-3">
              {(preview || existingImage) ? (
                <img 
                  src={preview || `https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/${existingImage}`} 
                  alt="Cover" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-stone/50" />
                </div>
              )}
            </div>
            
            <div className="space-y-4 flex-1">
              <p className="text-[13px] text-stone">
                Upload a cover image that represents this collection. This image will be used when sharing the collection link.
              </p>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-[6px] border border-dashed border-gold/30 bg-gold/5 px-4 py-2.5 text-[12px] font-medium text-stone hover:border-gold hover:text-gold disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Select Image
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isSaving} />
            </div>
          </div>
        </section>

        <div className="flex items-center pt-4">
          {isEditMode && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isSaving}
              className="mr-auto border-red-900/50 text-red-500 hover:bg-red-900/20 hover:text-red-400"
            >
              Delete Collection
            </Button>
          )}
          <div className="flex justify-end gap-3 ml-auto">
            <Button 
              asChild
              variant="outline" 
              className="border-border-subtle text-stone hover:bg-surface-3 hover:text-linen"
              disabled={isSaving}
            >
               <Link to="/artist/collections">Cancel</Link>
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !title.trim()} 
              className="bg-gold text-obsidian hover:bg-linen"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditMode ? "Save Changes" : "Create Collection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionEditor;
