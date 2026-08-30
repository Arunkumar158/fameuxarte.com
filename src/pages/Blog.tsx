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

// Cached flag to prevent repeated 404s if insights table is not yet deployed on remote DB
let isInsightsAvailable: boolean | null = null;

const CURATED_CATEGORIES = [
  "Art Intelligence",
  "Art History Analysis",
  "Artist Spotlight",
  "Collecting Guide",
  "Market Insights",
];

const stripHtml = (value: string) =>
  value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const getReadTime = (content: string) =>
  Math.max(4, Math.ceil(stripHtml(content || "").split(/\s+/).filter(Boolean).length / 180));

// ──────────────────────────────────────────────────────────
// Blog Listing Page
// ──────────────────────────────────────────────────────────

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(() => {
    const p = Number(searchParams.get("page")) || 1;
    return Math.max(1, Math.floor(p));
  }, [searchParams]);

  const activeCategory = searchParams.get("category") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts-unified", page, activeCategory],
    queryFn: async () => {
      let insightPosts: BlogPost[] = [];
      let dynamicCategories: string[] = [];

      // ── 1. Query insights table if available ──
      if (isInsightsAvailable !== false) {
        try {
          const { data: rows, error } = await supabase
            .from("insights")
            .select("id, title, slug, excerpt, content, featured_image, category, tags, published_at, created_at, read_time")
            .eq("status", "published")
            .order("published_at", { ascending: false });

          if (error) {
            // Table doesn't exist on remote instance
            isInsightsAvailable = false;
          } else if (rows && rows.length > 0) {
            isInsightsAvailable = true;
            insightPosts = rows.map(row => ({
              source: "insights" as const,
              id: row.id,
              title: row.title || "",
              slug: row.slug || row.id,
              category: row.category || "Art Intelligence",
              excerpt:
                row.excerpt ||
                stripHtml(row.content || "").substring(0, 160) + "...",
              content: row.content || "",
              featured_image: row.featured_image || null,
              author: {
                name: "Fameuxarte Team",
                avatar: null,
              },
              published_at: row.published_at || row.created_at,
              read_time: row.read_time || getReadTime(row.content || ""),
              tags: (row.tags as string[]) || [],
            }));

            dynamicCategories = Array.from(
              new Set(rows.map(r => r.category).filter(Boolean))
            ) as string[];
          }
        } catch {
          isInsightsAvailable = false;
        }
      }

      // ── 2. Query production blogs table (safe columns only) ──
      let blogPosts: BlogPost[] = [];
      try {
        const { data: bRows } = await supabase
          .from("blogs")
          .select("id, title, Slug, content, image_url, published_at, created_at")
          .order("published_at", { ascending: false });

        if (bRows && bRows.length > 0) {
          blogPosts = bRows.map((row: any) => ({
            source: "blogs" as const,
            id: row.id,
            title: row.title || "",
            slug: row.Slug || row.slug || row.id,
            category: "Art Intelligence",
            excerpt:
              stripHtml(row.content || "").substring(0, 160) + "...",
            content: row.content || "",
            featured_image: row.image_url || null,
            author: {
              name: "Fameuxarte Team",
              avatar: null,
            },
            published_at: row.published_at || row.created_at,
            read_time: getReadTime(row.content || ""),
          }));
        }
      } catch (e) {
        console.warn("Could not load blogs table:", e);
      }

      // ── 3. Merge with rich placeholder articles ──
      const allPlaceholders = [PLACEHOLDER_FEATURED, ...PLACEHOLDER_POSTS];
      
      // Combine database articles + placeholders (avoiding duplicate slugs)
      const existingSlugs = new Set([...insightPosts, ...blogPosts].map(p => p.slug));
      const nonDuplicatePlaceholders = allPlaceholders.filter(p => !existingSlugs.has(p.slug));

      let allPosts = [...insightPosts, ...blogPosts, ...nonDuplicatePlaceholders];

      // Filter by category in memory (safe and fast)
      if (activeCategory && activeCategory !== "All") {
        allPosts = allPosts.filter(
          p => (p.category || "").toLowerCase() === activeCategory.toLowerCase()
        );
      }

      // Pagination in memory
      const totalCount = allPosts.length;
      const from = (page - 1) * BLOGS_PER_PAGE;
      const paginatedPosts = allPosts.slice(from, from + BLOGS_PER_PAGE);

      // Categories for filter bar
      const categories = Array.from(
        new Set([...CURATED_CATEGORIES, ...dynamicCategories])
      );

      return { posts: paginatedPosts, totalCount, categories };
    },
  });

  const posts = data?.posts ?? [];
  const categories = data?.categories ?? CURATED_CATEGORIES;
  const totalCount = data?.totalCount ?? posts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / BLOGS_PER_PAGE));

  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  useEffect(() => {
    if (totalCount === 0) return;
    if (page > totalPages) {
      setSearchParams(
        activeCategory
          ? { page: String(totalPages), category: activeCategory }
          : { page: String(totalPages) },
        { replace: true }
      );
    }
  }, [page, totalPages, totalCount, activeCategory, setSearchParams]);

  const handlePageChange = (newPage: number) => {
    const params: Record<string, string> = { page: String(newPage) };
    if (activeCategory) params.category = activeCategory;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (category: string) => {
    if (category === activeCategory || category === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
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
      <CategoryFilters
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {isLoading ? (
        <section className="bg-obsidian px-4 sm:px-6 py-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2">
            {[...Array(BLOGS_PER_PAGE)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface-2 p-4 animate-pulse"
              >
                <div className="h-48 w-full rounded bg-surface-3" />
                <div className="h-6 w-3/4 rounded bg-surface-3" />
                <div className="h-4 w-full rounded bg-surface-3" />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          {featuredPost && <FeaturedPost post={featuredPost} />}
          {gridPosts.length > 0 && <BlogGrid posts={gridPosts} />}
          {posts.length === 0 && (
            <div className="text-center py-16 text-[#666]">
              No articles found in this category.
            </div>
          )}
        </>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center bg-obsidian px-6 pb-12">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Blog;
