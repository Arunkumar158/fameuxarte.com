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
    title: "Five things every first-time art collector should know",
    slug: "first-time-collector-guide",
    category: "Collecting guide",
    excerpt: "",
    content: "",
    featured_image: null,
    published_at: "2025-05-15",
    read_time: 8,
  },
  {
    id: "3",
    title: "Riya Menon's journey from Kerala temples to contemporary abstraction",
    slug: "riya-menon-artist-spotlight",
    category: "Artist spotlight",
    excerpt: "",
    content: "",
    featured_image: null,
    published_at: "2025-05-10",
    read_time: 12,
  },
];

