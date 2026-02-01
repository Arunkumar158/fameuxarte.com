import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import SectionTitle from "@/components/shared/SectionTitle";
import Pagination from "@/components/shared/Pagination";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { SEO } from "@/components/SEO";

// --- Pagination config ---
/** Number of blog posts per page (page-based pagination). Default: 6. */
const BLOGS_PER_PAGE = 6;

/** Profile subset returned by the blogs query join. */
interface BlogAuthorProfile {
  full_name: string | null;
  avatar_url: string | null;
}

/** Blog row as returned by Supabase with author profile join. */
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

/** Response shape from paginated blog fetch (data + total count for pages). */
interface BlogListResponse {
  posts: BlogPostListItem[];
  totalCount: number;
}

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination: single source of truth is URL (?page=1). Persists on refresh and is SEO-friendly.
  const page = useMemo(() => {
    const p = Number(searchParams.get("page")) || 1;
    return Math.max(1, Math.floor(p));
  }, [searchParams]);

  // Fetch only the current page: limit = BLOGS_PER_PAGE, offset = (page - 1) * BLOGS_PER_PAGE.
  // Supabase uses .range(from, to) inclusive; we need total count for page count.
  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts", page],
    queryFn: async (): Promise<BlogListResponse> => {
      const from = (page - 1) * BLOGS_PER_PAGE;
      const to = from + BLOGS_PER_PAGE - 1; // inclusive end index

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
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / BLOGS_PER_PAGE));

  // If user bookmarked ?page=99 and total shrinks, redirect to last valid page (no 404).
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
    <MainLayout>
      <SEO
        title="Blog | Fameuxarte"
        description="Explore art trends, artist profiles, and collecting guides on the Fameuxarte blog. Stay updated on the latest in contemporary art."
        canonicalUrl="/blog"
        type="website"
      />
      <div className="container py-12">
        <SectionTitle
          title="Blog"
          subtitle="Insights and stories from the art world"
        />

        {/* Loading: skeleton grid matching blog card layout (6 placeholders). */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(BLOGS_PER_PAGE)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : !posts.length ? (
          <div className="text-center text-muted-foreground py-12">
            {/* Empty state: no blogs for this page or no blogs at all. */}
            No blogs found
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.Slug || post.id}`}
                  className="group"
                >
                  <article className="h-full bg-card border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-red/20">
                    <div className="h-48 overflow-hidden">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={`Featured image for ${post.title}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        <time dateTime={post.published_at}>
                          {new Date(post.published_at).toLocaleDateString()}
                        </time>
                      </div>
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-brand-red transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.content}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {post.profiles?.full_name || "Anonymous"}
                        </span>
                        <span className="text-brand-blue group-hover:translate-x-1 transition-transform flex items-center gap-1 text-sm">
                          Read More <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination: bottom center. Previous/Next disabled on first/last page; active page highlighted. */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Blog;
