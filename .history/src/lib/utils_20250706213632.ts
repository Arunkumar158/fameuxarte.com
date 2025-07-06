import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract the relative path from a full URL or path
 * @param imagePath - The image path which might be a full URL or relative path
 * @returns string - The cleaned relative path for Supabase storage
 */
export const extractRelativePath = (imagePath: string): string => {
  if (!imagePath) return '';
  
  let cleanPath = imagePath.trim();
  
  // If it's already a relative path (no protocol), just clean it
  if (!cleanPath.startsWith('http://') && !cleanPath.startsWith('https://')) {
    // Remove bucket prefix if present
    if (cleanPath.startsWith('artworks/')) {
      cleanPath = cleanPath.replace('artworks/', '');
    }
    // Remove leading slash if present
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    return cleanPath;
  }
  
  // Handle full URLs
  try {
    const url = new URL(cleanPath);
    
    // Extract path from Supabase storage URLs
    // Example: https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/image.jpg
    const pathSegments = url.pathname.split('/');
    const storageIndex = pathSegments.findIndex(segment => segment === 'storage');
    
    if (storageIndex !== -1 && pathSegments[storageIndex + 3] === 'artworks') {
      // Extract everything after 'artworks/' in the path
      const artworksIndex = pathSegments.indexOf('artworks');
      if (artworksIndex !== -1 && artworksIndex + 1 < pathSegments.length) {
        return pathSegments.slice(artworksIndex + 1).join('/');
      }
    }
    
    // Fallback: try to extract filename from path
    const filename = pathSegments[pathSegments.length - 1];
    if (filename && filename.includes('.')) {
      return filename;
    }
    
    // Last resort: return the full pathname without leading slash
    return url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
  } catch (error) {
    console.error('❌ Error parsing URL:', error);
    // If URL parsing fails, treat as relative path
    return cleanPath.replace(/^\/+/, ''); // Remove leading slashes
  }
};

/**
 * Generate a signed URL for artwork images
 * @param imagePath - The image path from the database (might be full URL or relative path)
 * @returns Promise<string | null> - The signed URL or null if error
 */
export const getArtworkImageUrl = async (imagePath: string | null): Promise<string | null> => {
  if (!imagePath) return null;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Extract the relative path from the image path
    const relativePath = extractRelativePath(imagePath);
    
    if (!relativePath) {
      console.error('❌ No valid relative path extracted from:', imagePath);
      return null;
    }
    
    console.log('🔍 Generating signed URL for:', { 
      originalPath: imagePath, 
      relativePath,
      bucket: 'artworks'
    });
    
    // Try signed URL first
    const { data, error } = await supabase.storage
      .from("artworks")
      .createSignedUrl(relativePath, 3600); // 1 hour expiry

    if (error) {
      console.error("❌ Error generating signed URL:", error);
      
      // Fallback: try public URL
      console.log('🔄 Trying public URL as fallback...');
      const { data: publicData } = supabase.storage
        .from("artworks")
        .getPublicUrl(relativePath);
      
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
