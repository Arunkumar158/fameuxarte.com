export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author?: {
    name: string;
    avatar: string | null;
  };
  published_at: string;
  read_time: number;
}

export const PLACEHOLDER_FEATURED: BlogPost = {
  id: "1",
  title: "How AI is reshaping the way we verify original paintings",
  slug: "ai-art-verification",
  category: "Art intelligence",
  excerpt:
    "Traditional authentication relied on expert opinion and provenance documentation. ArtGuard combines both with machine learning pattern analysis.",
  content: "<p>Article content...</p>",
  featured_image: null,
  author: { name: "Fameuxarte Team", avatar: null },
  published_at: "2025-05-20",
  read_time: 6,
};

export const PLACEHOLDER_POSTS: BlogPost[] = [
  {
    id: "2",
    title: "The Rebellion of Light: How 19th-Century Academic Artists Painted the Devil",
    slug: "rebellion-of-light-devil",
    category: "Art History Analysis",
    excerpt: "",
    content: "",
    featured_image: null,
    published_at: "2026-06-02",
    read_time: 7,
  },
  {
    id: "3",
    title: "Beyond the Fallen Angel: The Academic Precision and Legacy of Alexandre Cabanel",
    slug: "beyond-fallen-angel-cabanel",
    category: "Artist Spotlight",
    excerpt: "",
    content: "",
    featured_image: null,
    published_at: "2026-05-24",
    read_time: 11,
  },
];

