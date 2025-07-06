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
    const { data, error } = await supabase.storage
      .from("artworks")
      .createSignedUrl(imagePath, 3600); // 1 hour expiry

    if (error) {
      console.error("Error generating signed URL:", error);
      return null;
    }
    
    return data?.signedUrl || null;
  } catch (err) {
    console.error("Error in signed URL generation:", err);
    return null;
  }
};
