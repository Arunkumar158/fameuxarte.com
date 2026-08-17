import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { DiscoveryHead } from "@/platform/discovery/DiscoveryHead";
import { EditorialHero } from "@/components/blog/editorial/EditorialHero";
import { AuthorCard } from "@/components/blog/editorial/AuthorCard";
import { ReadingProgress } from "@/components/blog/editorial/ReadingProgress";
import { TableOfContents } from "@/components/blog/editorial/TableOfContents";
import { SocialShare, MobileSocialShare } from "@/components/blog/editorial/SocialShare";
import { DiscoveryHub } from "@/components/blog/editorial/DiscoveryHub";
import ArticleBody from "@/components/blog/ArticleBody";
import CommentBox from "@/components/blog/CommentBox";
import JournalShellStyles from "@/components/blog/JournalShellStyles";
import { useEffect } from "react";
import { posthog } from "posthog-js";

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const getReadTime = (content: string) => Math.max(4, Math.ceil(stripHtml(content || "").split(/\s+/).filter(Boolean).length / 180));

const BlogPost = () => {
  const { slug } = useParams();

  // Fetch article from blogs table (insights table not yet created in this Supabase instance)
  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post-unified", slug],
    queryFn: async () => {
      // NOTE: insights table query removed — table does not exist in this Supabase instance.
      // To re-enable, create the insights table via migration and add insights lookup here.

      // Query blogs table (try capital-S 'Slug' column first, then lowercase)
      const cleanSlug = (slug || "").replace(/\/+$/, ""); // strip any trailing slashes

      let blogData: any = null;
      const { data: blogByCapSlug } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            avatar_url,
            role,
            bio
          )
        `)
        .eq("Slug", cleanSlug)
        .maybeSingle();

      blogData = blogByCapSlug;

      // If not found with capital-S, try lowercase 'slug' column
      if (!blogData) {
        const query: any = supabase
          .from("blogs")
          .select(`
            *,
            profiles:author_id (
              id,
              full_name,
              avatar_url,
              role,
              bio
            )
          `);
        const { data: blogBySlug } = await query.eq("slug", cleanSlug).maybeSingle();
        blogData = blogBySlug;
      }

      if (blogData) {
        const slugValue = blogData.Slug || blogData.slug || cleanSlug;
        const excerpt = stripHtml(blogData.content || "").substring(0, 160) + "...";
        return {
          source: "blogs",
          id: blogData.id,
          title: blogData.title,
          slug: slugValue,
          category: "Art Intelligence",
          excerpt: excerpt,
          content: blogData.content || "",
          featured_image: blogData.image_url,
          published_at: blogData.published_at || blogData.created_at,
          author: blogData.profiles || { full_name: "Fameuxarte Team" },
          tags: [],
          keywords: [],
          meta_title: blogData.title,
          meta_description: excerpt,
          canonical_url: `/blog/${slugValue}`,
        };
      }

      return null;
    },
  });

  useEffect(() => {
    if (post) {
      try {
        posthog.capture("article_viewed", {
          article_id: post.id,
          title: post.title,
          category: post.category,
        });

        const handleScroll = () => {
          const scrollY = window.scrollY;
          const scrollHeight = document.body.scrollHeight - window.innerHeight;
          const percentage = (scrollY / scrollHeight) * 100;

          if (percentage >= 25 && percentage < 26) posthog.capture("article_scrolled_25", { article_id: post.id });
          if (percentage >= 50 && percentage < 51) posthog.capture("article_scrolled_50", { article_id: post.id });
          if (percentage >= 75 && percentage < 76) posthog.capture("article_scrolled_75", { article_id: post.id });
          if (percentage >= 99) posthog.capture("article_completed", { article_id: post.id });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
      } catch (e) { }
    }
  }, [post]);

  if (isLoading) return <div className="min-h-screen bg-obsidian px-6 py-12 flex items-center justify-center"><div className="animate-pulse w-16 h-16 rounded-full border-4 border-gold border-t-transparent animate-spin" /></div>;
  if (!post) return <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center text-center px-6"><h1 className="text-3xl text-linen font-serif mb-4">Article Not Found</h1><Link to="/blog" className="text-gold hover:underline">Return to Journal</Link></div>;

  const readTime = getReadTime(post.content);

  return (
    <div className="min-h-screen bg-obsidian relative">
      <ReadingProgress />
      <JournalShellStyles />
      
      <DiscoveryHead 
        entityType="blog"
        id={post.id}
        title={post.meta_title}
        description={post.meta_description}
        image={post.featured_image || undefined}
        canonicalUrl={post.canonical_url}
        keywords={post.keywords}
        customMeta={{
          author: post.author?.full_name || "Fameuxarte Team"
        }}
        // The MetadataPipeline will automatically map this to OpenGraph & AI Discovery Tags
      />

      <nav className="flex items-center justify-between border-b border-border-faint bg-obsidian/80 backdrop-blur-md px-6 py-[14px] sticky top-0 z-40">
        <Link to="/" className="text-[14px] font-medium tracking-[-0.01em] text-linen hover:text-gold transition-colors">
          Fameuxarte
        </Link>
        <Link to="/blog" className="inline-flex items-center gap-2 text-[12px] text-[#666] transition-colors hover:text-gold">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Journal
        </Link>
      </nav>

      <EditorialHero 
        title={post.title}
        category={post.category}
        excerpt={post.excerpt}
        imageUrl={post.featured_image}
        publishedAt={post.published_at}
        readTime={readTime}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-12 relative">
        <aside className="w-16 hidden lg:block flex-shrink-0">
          <SocialShare url={post.canonical_url} title={post.title} />
        </aside>

        <article className="flex-1 max-w-3xl min-w-0">
          <ArticleBody content={post.content} />
          
          <MobileSocialShare url={post.canonical_url} title={post.title} />

          <AuthorCard 
            authorId={post.author?.id}
            name={post.author?.full_name || "Fameuxarte Team"}
            avatarUrl={post.author?.avatar_url}
            bio={post.author?.bio}
            role={post.author?.role}
          />
          
          <DiscoveryHub 
            insightId={post.id}
            tags={post.tags}
            keywords={post.keywords}
            category={post.category}
          />
          
          <div className="mt-16">
            <CommentBox />
          </div>
        </article>

        <aside className="w-64 hidden lg:block flex-shrink-0">
          <TableOfContents />
        </aside>
      </div>
    </div>
  );
};

export default BlogPost;
