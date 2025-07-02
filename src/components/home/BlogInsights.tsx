
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BlogInsights = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["featured-blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="section-padding bg-gradient-to-b from-brand-black to-black/95">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
              Art <span className="text-gradient">Insights</span>
            </h2>
            <p className="text-lg text-gray-300">Loading blog posts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!posts?.length) {
    return (
      <section className="section-padding bg-gradient-to-b from-brand-black to-black/95">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
              Art <span className="text-gradient">Insights</span>
            </h2>
            <p className="text-lg text-gray-300">No blog posts available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gradient-to-b from-brand-black to-black/95">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
            Art <span className="text-gradient">Insights</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-brand-red to-brand-blue mx-auto mb-6"></div>
          <p className="text-lg max-w-2xl mx-auto text-gray-300 animate-slide-up delay-100">
            Discover perspectives, analyses, and stories from the world of fine art
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {posts.map((post, index) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.Slug || post.id}`}
              className="glass-card rounded-lg overflow-hidden group card-hover animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="h-48 overflow-hidden bg-muted">
                {post.image_url && (
                  <img 
                    src={post.image_url}
                    alt={`Featured image for ${post.title}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString()}</time>
                  </div>
                </div>
                <h3 className="font-heading text-xl mb-2 group-hover:text-brand-red transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                  {post.content}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{post.profiles?.full_name || 'Anonymous'}</span>
                  <span className="text-brand-blue group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Read More <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild className="bg-brand-blue hover:bg-brand-blue/90">
            <Link to="/blog">View All Articles</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogInsights;
