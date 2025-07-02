import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CommentForm from "@/components/blog/CommentForm";
import { SEO } from "@/components/SEO";
import { generateBlogPostStructuredData } from "@/lib/seo";

const BlogPost = () => {
  const { slug } = useParams();
  
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      // Try to fetch by slug first
      const { data: slugData, error: slugError } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .eq("Slug", slug)
        .maybeSingle();
      
      // If found by slug, return it
      if (slugData) return slugData;
      
      // If not found by slug, try by id (for backward compatibility)
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .eq("id", slug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: comments, isLoading: isLoadingComments, refetch: refetchComments } = useQuery({
    queryKey: ["blog-comments", post?.id],
    queryFn: async () => {
      if (!post?.id) return [];
      
      const { data, error } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("blog_id", post.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!post?.id
  });

  if (isLoadingPost) return <MainLayout><div className="container py-12">Loading...</div></MainLayout>;
  if (!post) return <MainLayout><div className="container py-12">Post not found</div></MainLayout>;

  const excerpt = post.content.split('\n')[0] || post.title;
  const postDescription = excerpt.length > 160 ? excerpt.substring(0, 157) + '...' : excerpt;

  const structuredData = generateBlogPostStructuredData({
    title: post.title,
    description: postDescription,
    image: post.image_url || '/placeholder.svg',
    author: post.profiles?.full_name || 'Anonymous',
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
  });

  return (
    <MainLayout>
      <SEO
        title={`${post.title} | Fameuxarte Blog`}
        description={postDescription}
        canonicalUrl={`/blog/${post.Slug || post.id}`}
        ogImage={post.image_url}
        type="article"
        structuredData={structuredData}
      />
      <article className="container py-12 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/blog">
            <Button variant="ghost" className="flex items-center gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to all posts
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <span>By {post.profiles?.full_name || 'Anonymous'}</span>
            </div>
            <span>•</span>
            <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString()}</time>
          </div>
        </div>

        {post.image_url && (
          <img
            src={post.image_url}
            alt={`Featured image for ${post.title}`}
            className="w-full aspect-video object-cover rounded-lg mb-8"
            loading="lazy"
          />
        )}
        
        <div className="prose prose-invert max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-lg leading-relaxed">{paragraph}</p>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Comments</h2>
          
          <div className="mb-12">
            <CommentForm blogId={post.id} onCommentAdded={refetchComments} />
          </div>

          {isLoadingComments ? (
            <div>Loading comments...</div>
          ) : (
            <div className="space-y-8">
              {comments?.map((comment) => (
                <div key={comment.id} className="border-b pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{comment.name}</h3>
                      <time className="text-sm text-muted-foreground" dateTime={comment.created_at}>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                  <p className="text-gray-300">{comment.comment}</p>
                </div>
              ))}
              {comments?.length === 0 && (
                <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
              )}
            </div>
          )}
        </div>
      </article>
    </MainLayout>
  );
};

export default BlogPost;
