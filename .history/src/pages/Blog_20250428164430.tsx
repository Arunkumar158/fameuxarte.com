
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import SectionTitle from "@/components/shared/SectionTitle";
import { Link } from "react-router-dom";
import LoadMoreButton from "@/components/shared/LoadMoreButton";
import { usePagination } from "@/hooks/usePagination";
import { SEO } from "@/components/SEO";

const Blog = () => {
  const {
    page,
    hasMore,
    setHasMore,
    isLoading,
    setIsLoading,
    loadMore,
    calculateRange,
    limit
  } = usePagination({ initialLimit: 6 });

  const { data: posts, isLoading: initialLoading } = useQuery({
    queryKey: ["blog-posts", page],
    queryFn: async () => {
      const { from, to } = calculateRange();
      setIsLoading(true);
      
      try {
        const { data, error, count } = await supabase
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
        
        if (error) throw error;
        
        // Update hasMore based on count
        if (count) {
          setHasMore((from + limit) < count);
        }
        
        return data || [];
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <MainLayout>
      <SEO
        title="Blog | Gallery Canvas Commerce"
        description="Explore art trends, artist profiles, and collecting guides on the Gallery Canvas Commerce blog. Stay updated on the latest in contemporary art."
        canonicalUrl="/blog"
        type="website"
      />
      <div className="container py-12">
        <SectionTitle
          title="Blog"
          subtitle="Insights and stories from the art world"
        />
        {initialLoading ? (
          <div>Loading blog posts...</div>
        ) : !posts?.length ? (
          <div className="text-center text-gray-500">No blog posts available</div>
        ) : (
          <>
            <div className="grid gap-8">
              {posts.map((post) => (
                <article key={post.id} className="border rounded-lg p-6 card-hover">
                  <Link to={`/blog/${post.Slug || post.id}`} className="block">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={`Featured image for ${post.title}`}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        loading="lazy"
                      />
                    )}
                    <h2 className="text-2xl font-semibold mb-2 hover:text-brand-red transition-colors">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <span>By {post.profiles?.full_name || "Anonymous"}</span>
                      <span>•</span>
                      <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString()}</time>
                    </div>
                    <p className="line-clamp-3">{post.content}</p>
                    <div className="mt-4 text-brand-blue flex items-center gap-1 hover:underline">
                      Read more
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            <LoadMoreButton
              onClick={loadMore}
              isLoading={isLoading}
              hasMore={hasMore}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Blog;
