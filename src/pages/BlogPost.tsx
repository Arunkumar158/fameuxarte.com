import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";
import { generateBlogPostStructuredData } from "@/lib/seo";
import ArticleHeader from "@/components/blog/ArticleHeader";
import ArticleHero from "@/components/blog/ArticleHero";
import ArticleBody from "@/components/blog/ArticleBody";
import RelatedPosts from "@/components/blog/RelatedPosts";
import CommentBox from "@/components/blog/CommentBox";
import JournalShellStyles from "@/components/blog/JournalShellStyles";
import type { BlogPost as JournalPost } from "@/components/blog/types";
import { PLACEHOLDER_POSTS } from "@/components/blog/types";

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const getExcerpt = (content: string, title: string) => {
  const cleanContent = stripHtml(content) || title;
  return cleanContent.length > 160 ? `${cleanContent.substring(0, 157)}...` : cleanContent;
};

const getReadTime = (content: string) => Math.max(4, Math.ceil(stripHtml(content).split(/\s+/).filter(Boolean).length / 180));

const toJournalPost = (post: Record<string, any>): JournalPost => ({
  id: post.id,
  title: post.title,
  slug: post.Slug || post.id,
  category: "Art intelligence",
  excerpt: getExcerpt(post.content || "", post.title),
  content: post.content || "",
  featured_image: post.image_url || null,
  author: {
    name: post.profiles?.full_name || "Fameuxarte Team",
    avatar: post.profiles?.avatar_url || null,
  },
  published_at: post.published_at || post.created_at,
  read_time: getReadTime(post.content || ""),
});

const BlogPost = () => {
  const { slug } = useParams();

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data: slugData } = await supabase
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

      if (slugData) return slugData;

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
    },
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
    enabled: !!post?.id,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ["blog-related", post?.id],
    queryFn: async () => {
      if (!post?.id) return [];

      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .neq("id", post.id)
        .order("published_at", { ascending: false })
        .limit(2);

      if (error) throw error;
      return data.map(toJournalPost);
    },
    enabled: !!post?.id,
  });

  if (isLoadingPost) return <div className="min-h-screen bg-obsidian px-6 py-12 text-linen">Loading...</div>;
  if (!post) return <div className="min-h-screen bg-obsidian px-6 py-12 text-linen">Article not found</div>;

  void comments;
  void isLoadingComments;
  void refetchComments;

  const journalPost = toJournalPost(post);

  const structuredData = generateBlogPostStructuredData({
    title: post.title,
    description: journalPost.excerpt,
    image: post.image_url || "/placeholder.svg",
    author: post.profiles?.full_name || "Fameuxarte Team",
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
  });

  return (
    <div className="min-h-screen bg-obsidian">
      <JournalShellStyles />
      <SEO
        title={`${post.title} | Fameuxarte Art Journal`}
        description={journalPost.excerpt}
        canonicalUrl={`/blog/${post.Slug || post.id}`}
        ogImage={post.image_url}
        type="article"
        structuredData={structuredData}
      />
      <nav className="flex items-center justify-between border-b border-border-faint bg-obsidian px-6 py-[14px]">
        <Link to="/" className="text-[14px] font-medium tracking-[-0.01em] text-linen">
          Fameuxarte
        </Link>
        <Link to="/blog" className="inline-flex items-center gap-2 text-[12px] text-[#666] transition-colors hover:text-gold">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Journal
        </Link>
      </nav>
      <article>
        <ArticleHeader post={journalPost} />
        <ArticleHero post={journalPost} />
        <ArticleBody content={journalPost.content} />
        <RelatedPosts posts={relatedPosts} />
        <CommentBox />
      </article>
    </div>
  );
};

export default BlogPost;
