import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import SectionTitle from "@/components/shared/SectionTitle";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { SEO } from "@/components/SEO";

const Blog = () => {
  const { data: posts, isLoading: initialLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `, { count: "exact" })
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

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
        {initialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : !posts?.length ? (
          <div className="text-center text-gray-500">No blog posts available</div>
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
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Blog;
