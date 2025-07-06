import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a signed URL for artwork images
 * @param imagePath - The image path from the database
 * @returns Promise<string | null> - The signed URL or null if error
 */
export const getArtworkImageUrl = async (imagePath: string | null): Promise<string | null> => {
  if (!imagePath) return null;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Clean the image path - remove bucket prefix if present
    let cleanPath = imagePath;
    if (imagePath.startsWith('artworks/')) {
      cleanPath = imagePath.replace('artworks/', '');
    }
    
    console.log('🔍 Generating signed URL for:', { originalPath: imagePath, cleanPath });
    
    // Try signed URL first
    const { data, error } = await supabase.storage
      .from("artworks")
      .createSignedUrl(cleanPath, 3600); // 1 hour expiry

    if (error) {
      console.error("❌ Error generating signed URL:", error);
      
      // Fallback: try public URL
      console.log('🔄 Trying public URL as fallback...');
      const { data: publicData } = supabase.storage
        .from("artworks")
        .getPublicUrl(cleanPath);
      
      if (publicData?.publicUrl) {
        console.log('✅ Using public URL as fallback:', publicData.publicUrl);
        return publicData.publicUrl;
      }
      
      return null;
    }
    
    console.log('✅ Generated signed URL:', data?.signedUrl);
    return data?.signedUrl || null;
  } catch (err) {
    console.error("❌ Error in signed URL generation:", err);
    return null;
  }
};

/**
 * Generate a slug from a title
 * @param title - The title to convert to a slug
 * @returns string - The generated slug
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate a unique slug by appending a number if the slug already exists
 * @param title - The title to convert to a slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns string - The unique slug
 */
export const generateUniqueSlug = (title: string, existingSlugs: string[]): string => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Test function to verify Supabase storage access
 * @returns Promise<boolean> - True if storage is accessible
 */
export const testStorageAccess = async (): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // List files in the artworks bucket to test access
    const { data, error } = await supabase.storage
      .from("artworks")
      .list('', { limit: 1 });
    
    if (error) {
      console.error("❌ Storage access test failed:", error);
      return false;
    }
    
    console.log("✅ Storage access test successful:", data);
    return true;
  } catch (err) {
    console.error("❌ Storage access test error:", err);
    return false;
  }
};
