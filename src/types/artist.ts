export interface ArtistProfile {
  id: string;
  role: 'customer' | 'artist' | 'admin';
  full_name: string | null;
  avatar_url: string | null;
  cover_image: string | null;
  phone_number: string | null;
  bio: string | null;
  artist_statement: string | null;
  country: string | null;
  city: string | null;
  website: string | null;
  social_links: {
    instagram?: string;
    pinterest?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
  } | null;
  art_styles: string[] | null;
  mediums: string[] | null;
  years_of_experience: number | null;
  created_at: string;
  updated_at: string;
}

export interface ArtistCollection {
  id: string;
  artist_id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  slug: string;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Artwork {
  id: string;
  title: string;
  price: number;
  category: string | null;
  description: string | null;
  image_path: string | null;
  images: string[] | null;
  artist_id: string;
  slug: string;
  status: 'available' | 'sold' | 'reserved' | 'draft' | 'hidden';
  dimensions: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: string;
  } | null;
  medium: string | null;
  orientation: 'portrait' | 'landscape' | 'square' | 'other' | null;
  tags: string[] | null;
  collection_id: string | null;
  story: string | null;
  creation_year: number | null;
  style: string | null;
  certificate_included: boolean;
  frame_included: boolean;
  created_at?: string;
}
