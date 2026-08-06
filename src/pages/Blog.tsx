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

interface BlogListResponse {
  posts: BlogPost[];
  totalCount: number;
}

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const getReadTime = (content: string) => Math.max(4, Math.ceil(stripHtml(content || "").split(/\s+/).filter(Boolean).length / 180));

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(() => {
    const p = Number(searchParams.get("page")) || 1;
    return Math.max(1, Math.floor(p));
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts-unified", page],
    queryFn: async (): Promise<BlogListResponse> => {
      const from = (page - 1) * BLOGS_PER_PAGE;
      const to = from + BLOGS_PER_PAGE - 1;

      // 1. Fetch from Insights (Single Source of Truth)
      const { data: insightsRows, error: insightsError, count: insightsCount } = await supabase
        .from("insights")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(from, to);

      if (insightsCount && insightsCount > 0) {
        const posts: BlogPost[] = (insightsRows || []).map(row => ({
          id: row.id,
          title: row.title || "",
          slug: row.slug || row.id,
          category: row.category || "Art Market",
          excerpt: row.excerpt || stripHtml(row.content || "").substring(0, 160) + "...",
          content: row.content || "",
          featured_image: row.featured_image || null,
          author: {
            name: row.profiles?.full_name || "Fameuxarte Team",
            avatar: row.profiles?.avatar_url || null,
          },
          published_at: row.published_at || row.created_at || new Date().toISOString(),
          read_time: getReadTime(row.content || ""),
        }));
        
        return { posts, totalCount: insightsCount };
      }

      // 2. Fallback to Legacy Blogs if no insights are published
      const { data: blogsRows, error: blogsError, count: blogsCount } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `, { count: "exact" })
        .order("published_at", { ascending: false })
        .range(from, to);

      if (blogsError) throw blogsError;

      const posts: BlogPost[] = (blogsRows || []).map(row => ({
        id: row.id,
        title: row.title || "",
        slug: row.Slug || row.id,
        category: "Art Intelligence",
        excerpt: stripHtml(row.content || "").substring(0, 160) + "...",
        content: row.content || "",
        featured_image: row.image_url || null,
        author: {
          name: row.profiles?.full_name || "Fameuxarte Team",
          avatar: row.profiles?.avatar_url || null,
        },
        published_at: row.published_at || row.created_at,
        read_time: getReadTime(row.content || ""),
      }));

      return { posts, totalCount: blogsCount || 0 };
    },
  });

  const posts = data?.posts ?? [];
  const journalPosts = posts.length ? posts : PLACEHOLDER_POSTS;
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
              <div key={i} className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface-2 p-4 animate-pulse">
                <div className="h-48 w-full rounded bg-surface-3" />
                <div className="h-6 w-3/4 rounded bg-surface-3" />
                <div className="h-4 w-full rounded bg-surface-3" />
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
