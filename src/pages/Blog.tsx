import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Pagination from "@/components/shared/Pagination";
import { SEO } from "@/components/SEO";
import HomeNav from "@/components/home/HomeNav";
import BlogHeader from "@/components/blog/BlogHeader";
import CategoryFilters from "@/components/blog/CategoryFilters";
import FeaturedPost from "@/components/blog/FeaturedPost";
import BlogGrid from "@/components/blog/BlogGrid";
import JournalShellStyles from "@/components/blog/JournalShellStyles";
import type { BlogPost } from "@/components/blog/types";
import { PLACEHOLDER_FEATURED, PLACEHOLDER_POSTS } from "@/components/blog/types";

const BLOGS_PER_PAGE = 6;
const JournalNav = HomeNav as React.ComponentType<{ activeLink?: string }>;

interface BlogAuthorProfile {
  full_name: string | null;
  avatar_url: string | null;
}

export interface BlogPostListItem {
  id: string;
  title: string;
  content: string;
  Slug: string;
  image_url: string | null;
  published_at: string;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  profiles: BlogAuthorProfile | null;
}

interface BlogListResponse {
  posts: BlogPostListItem[];
  totalCount: number;
}

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const getExcerpt = (content: string) => {
  const cleanContent = stripHtml(content);
  return cleanContent.length > 160 ? `${cleanContent.substring(0, 157)}...` : cleanContent;
};

const getReadTime = (content: string) => Math.max(4, Math.ceil(stripHtml(content).split(/\s+/).filter(Boolean).length / 180));

const toJournalPost = (post: BlogPostListItem): BlogPost => ({
  id: post.id,
  title: post.title,
  slug: post.Slug || post.id,
  category: "Art intelligence",
  excerpt: getExcerpt(post.content),
  content: post.content,
  featured_image: post.image_url,
  author: {
    name: post.profiles?.full_name || "Fameuxarte Team",
    avatar: post.profiles?.avatar_url || null,
  },
  published_at: post.published_at || post.created_at,
  read_time: getReadTime(post.content),
});

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(() => {
    const p = Number(searchParams.get("page")) || 1;
    return Math.max(1, Math.floor(p));
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts", page],
    queryFn: async (): Promise<BlogListResponse> => {
      const from = (page - 1) * BLOGS_PER_PAGE;
      const to = from + BLOGS_PER_PAGE - 1;

      const { data: rows, error, count } = await supabase
        .from("blogs")
        .select(
          `
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `,
          { count: "exact" }
        )
        .order("published_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        posts: (rows ?? []) as BlogPostListItem[],
        totalCount: count ?? 0,
      };
    },
  });

  const posts = data?.posts ?? [];
  const journalPosts = posts.length ? posts.map(toJournalPost) : PLACEHOLDER_POSTS;
  const featuredPost = journalPosts[0] || PLACEHOLDER_FEATURED;
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / BLOGS_PER_PAGE));

  useEffect(() => {
    if (totalCount === 0) return;
    if (page > totalPages) {
      setSearchParams({ page: String(totalPages) }, { replace: true });
    }
  }, [page, totalPages, totalCount, setSearchParams]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
  };

  return (
    <div className="min-h-screen bg-obsidian">
      <JournalShellStyles />
      <SEO
        title="Art Journal | Fameuxarte"
        description="Explore art trends, artist profiles, and collecting guides in the Fameuxarte Art Journal."
        canonicalUrl="/blog"
        type="website"
      />
      <JournalNav activeLink="Journal" />
      <BlogHeader />
      <CategoryFilters />
      {isLoading ? (
        <section className="bg-obsidian px-4 sm:px-6 py-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2">
            {[...Array(BLOGS_PER_PAGE)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface-2 p-4">
                <div className="h-48 w-full animate-pulse rounded bg-surface-3" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-surface-3" />
                <div className="h-4 w-full animate-pulse rounded bg-surface-3" />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          <FeaturedPost post={featuredPost} />
          <BlogGrid posts={journalPosts} />
        </>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center bg-obsidian px-6 pb-12">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};

export default Blog;
