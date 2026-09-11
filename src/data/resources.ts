export type ProductCategory = "Calculator" | "Template" | "Ebook" | "Swipe File" | "Other";

export interface DigitalProduct {
  id: string;
  title: string;
  shortDescription: string;
  price: string;
  currency: string;
  image?: string;
  category: ProductCategory;
  badge?: string;
  externalUrl?: string; // If undefined, show "Coming Soon"
  featured?: boolean;
}

export const digitalProducts: DigitalProduct[] = [
  {
    id: "art-pricing-calculator",
    title: "Art Pricing Calculator",
    shortDescription: "Estimate artwork prices with a practical pricing framework.",
    price: "₹499",
    currency: "INR",
    category: "Calculator",
    badge: "Popular",
    featured: true,
  },
  {
    id: "artist-notion-os",
    title: "Artist Notion OS",
    shortDescription: "Organize your artwork, ideas, content, clients, and creative workflow.",
    price: "₹999",
    currency: "INR",
    category: "Template",
  },
  {
    id: "artist-ebook",
    title: "Artist Business Guide",
    shortDescription: "A practical guide to building a stronger professional art practice.",
    price: "₹499",
    currency: "INR",
    category: "Ebook",
  },
  {
    id: "copy-swipe-file",
    title: "Artist Copy Swipe File",
    shortDescription: "Ready-to-adapt copy ideas for artwork listings, social posts, emails, and promotions.",
    price: "₹299",
    currency: "INR",
    category: "Swipe File",
  }
];
