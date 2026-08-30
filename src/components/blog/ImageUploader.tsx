import { useState, useRef } from "react";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  value: string;
  altText?: string;
  caption?: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  onCaptionChange?: (caption: string) => void;
  label?: string;
  bucket?: string;
  folder?: string;
}

/**
 * ImageUploader — unified image management for the CMS.
 * Supports:
 *   - Direct URL input
 *   - Upload to Supabase Storage
 *   - Alt text (required for accessibility/SEO)
 *   - Optional caption/credit
 */
const ImageUploader = ({
  value,
  altText = "",
  caption = "",
  onChange,
  onAltChange,
  onCaptionChange,
  label = "Image",
  bucket = "blog-images",
  folder = "articles",
}: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      // Fallback: if bucket doesn't exist yet, show URL input guidance
      console.error("Upload error:", err);
      toast.error(`Upload failed: ${err.message || "Check Supabase Storage bucket permissions."}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    onChange("");
    onAltChange?.("");
    onCaptionChange?.("");
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt={altText || label}
            className="w-full h-40 object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            aria-label="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* URL Input + Upload Button */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Enter image URL or upload..."
            className="pl-9 bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-shrink-0 border-slate-200 text-slate-700"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {!isUploading && <span className="ml-1.5 hidden sm:inline">Upload</span>}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload image file"
        />
      </div>

      {/* Alt Text (required for SEO/accessibility) */}
      {onAltChange && (
        <div className="space-y-1">
          <Label className="text-slate-700 text-xs font-medium">
            Alt Text <span className="text-red-500">*</span>{" "}
            <span className="text-slate-400 font-normal">(required for SEO)</span>
          </Label>
          <Input
            value={altText}
            onChange={e => onAltChange(e.target.value)}
            placeholder="Describe the image for screen readers and search engines"
            className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
          />
        </div>
      )}

      {/* Caption / Credit (optional) */}
      {onCaptionChange && (
        <div className="space-y-1">
          <Label className="text-slate-700 text-xs font-medium">
            Caption / Credit{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Input
            value={caption}
            onChange={e => onCaptionChange(e.target.value)}
            placeholder="e.g. 'Oil on canvas, 2023 — Artist Name'"
            className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
