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
import ArticleBreadcrumbs from "@/components/blog/ArticleBreadcrumbs";
import KeyTakeaways from "@/components/blog/KeyTakeaways";
import ArticleFAQ from "@/components/blog/ArticleFAQ";
import ArticleCTA from "@/components/blog/ArticleCTA";
import CommentBox from "@/components/blog/CommentBox";
import JournalShellStyles from "@/components/blog/JournalShellStyles";
import type { BlogPost as BlogPostType, FAQItem } from "@/components/blog/types";
import { PLACEHOLDER_FEATURED, PLACEHOLDER_POSTS } from "@/components/blog/types";
import { useEffect } from "react";
import { posthog } from "posthog-js";

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

const stripHtml = (value: string) =>
  value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const getReadTime = (content: string) =>
  Math.max(4, Math.ceil(stripHtml(content || "").split(/\s+/).filter(Boolean).length / 180));

const getWordCount = (content: string) =>
  stripHtml(content || "").split(/\s+/).filter(Boolean).length;

const SITE_URL = import.meta.env.VITE_PUBLIC_APP_URL || "https://fameuxarte.com";

let isInsightsAvailable: boolean | null = null;

// ──────────────────────────────────────────────────────────
// Data fetching — robust multi-source
// ──────────────────────────────────────────────────────────

async function fetchAuthorProfile(authorId?: string) {
  if (!authorId) return null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, bio")
      .eq("id", authorId)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

async function fetchArticleBySlug(slug: string): Promise<BlogPostType | null> {
  const cleanSlug = (slug || "").replace(/\/+$/, "").trim();

  // ── 1. Query production blogs table first (fast, active table) ──
  try {
    let blogData: any = null;

    // Try capital-S Slug column first (database column standard on blogs table)
    const { data: blogByCapSlug } = await supabase
      .from("blogs")
      .select("id, title, Slug, content, image_url, author_id, published_at, created_at")
      .eq("Slug", cleanSlug)
      .maybeSingle();

    blogData = blogByCapSlug;

    // Try lowercase slug column if capital-S didn't match
    if (!blogData) {
      const { data: blogBySlug } = await (supabase
        .from("blogs")
        .select("id, title, Slug, content, image_url, author_id, published_at, created_at") as any)
        .eq("slug", cleanSlug)
        .maybeSingle();
      blogData = blogBySlug;
    }

    if (blogData) {
      const author = await fetchAuthorProfile(blogData.author_id);
      const slugValue = blogData.Slug || blogData.slug || cleanSlug;
      const excerpt =
        stripHtml(blogData.content || "").substring(0, 160) + "...";
      const canonicalPath = `/blog/${slugValue}`;

      return {
        source: "blogs",
        id: blogData.id,
        title: blogData.title || "",
        slug: slugValue,
        category: "Art Intelligence",
        excerpt,
        content: blogData.content || "",
        featured_image: blogData.image_url || null,
        og_image: blogData.image_url || null,
        author: {
          id: author?.id,
          name: author?.full_name || "Fameuxarte Team",
          avatar: author?.avatar_url || null,
          bio: author?.bio,
          role: author?.role,
        },
        published_at: blogData.published_at || blogData.created_at,
        updated_at: blogData.updated_at,
        read_time: getReadTime(blogData.content || ""),
        meta_title: blogData.title || "",
        meta_description: excerpt,
        canonical_url: canonicalPath,
        keywords: [],
        tags: [],
        schema_type: "BlogPosting",
        key_takeaways: [],
        faq: [],
        cta_label: "Explore Original Artworks",
        cta_url: "/artworks",
        cta_description: "Discover curated original contemporary works on Fameuxarte.",
      } as BlogPostType;
    }
  } catch (e) {
    console.warn("Blogs lookup:", e);
  }

  // ── 2. Query insights table if blogs didn't have it and insights is available ──
  if (isInsightsAvailable !== false) {
    try {
      const { data: insightData, error } = await supabase
        .from("insights")
        .select("*")
        .eq("slug", cleanSlug)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        isInsightsAvailable = false;
      } else if (insightData) {
        isInsightsAvailable = true;
        const author = await fetchAuthorProfile(insightData.author_id);
        const canonicalPath = insightData.canonical_url || `/blog/${insightData.slug}`;
        const excerpt =
          insightData.excerpt ||
          stripHtml(insightData.content || "").substring(0, 160) + "...";

        let faq: FAQItem[] = [];
        try {
          if (Array.isArray(insightData.faq)) {
            faq = (insightData.faq as any[])
              .filter(f => f?.question && f?.answer)
              .map(f => ({ question: String(f.question), answer: String(f.answer) }));
          }
        } catch {}

        return {
          source: "insights",
          id: insightData.id,
          title: insightData.title || "",
          slug: insightData.slug || cleanSlug,
          category: insightData.category || "Art Intelligence",
          excerpt,
          content: insightData.content || "",
          featured_image: insightData.featured_image || null,
          og_image: insightData.og_image || insightData.featured_image || null,
          author: {
            id: author?.id,
            name: author?.full_name || "Fameuxarte Team",
            avatar: author?.avatar_url || null,
            bio: author?.bio,
            role: author?.role,
          },
          published_at: insightData.published_at || insightData.created_at,
          updated_at: insightData.updated_at,
          read_time: insightData.read_time || getReadTime(insightData.content || ""),
          meta_title: insightData.meta_title || insightData.title || "",
          meta_description: insightData.meta_description || excerpt,
          canonical_url: canonicalPath,
          keywords: insightData.keywords || [],
          tags: insightData.tags || [],
          schema_type: insightData.schema_type || "BlogPosting",
          key_takeaways: insightData.key_takeaways || [],
          faq,
          cta_label: insightData.cta_label || "",
          cta_url: insightData.cta_url || "",
          cta_description: insightData.cta_description || "",
        } as BlogPostType;
      }
    } catch {
      isInsightsAvailable = false;
    }
  }

  // ── 3. Fallback: Check placeholder/demo posts by slug ──
  const allPlaceholders = [PLACEHOLDER_FEATURED, ...PLACEHOLDER_POSTS];
  const matchedPlaceholder = allPlaceholders.find(
    p => p.slug.toLowerCase() === cleanSlug.toLowerCase() || p.id === cleanSlug
  );

  if (matchedPlaceholder) {
    return matchedPlaceholder;
  }

  return null;
}

// ──────────────────────────────────────────────────────────
// Page Component
// ──────────────────────────────────────────────────────────

const BlogPost = () => {
  const { slug } = useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post-unified", slug],
    queryFn: () => fetchArticleBySlug(slug || ""),
    enabled: !!slug,
  });

  // PostHog analytics: article_viewed + scroll depth
  useEffect(() => {
    if (!post) return;
    try {
      posthog.capture("article_viewed", {
        article_id: post.id,
        title: post.title,
        category: post.category,
        source: post.source || "editorial",
        has_key_takeaways: (post.key_takeaways?.length ?? 0) > 0,
        has_faq: (post.faq?.length ?? 0) > 0,
        has_cta: !!post.cta_label,
      });

      const handleScroll = () => {
        const scrollY = window.scrollY;
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        const pct = scrollHeight > 0 ? (scrollY / scrollHeight) * 100 : 0;

        if (pct >= 25 && pct < 26) posthog.capture("article_scrolled_25", { article_id: post.id });
        if (pct >= 50 && pct < 51) posthog.capture("article_scrolled_50", { article_id: post.id });
        if (pct >= 75 && pct < 76) posthog.capture("article_scrolled_75", { article_id: post.id });
        if (pct >= 99) posthog.capture("article_completed", { article_id: post.id });
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    } catch {}
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian px-6 py-12 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl text-linen font-serif mb-4">Article Not Found</h1>
        <Link to="/blog" className="text-gold hover:underline">
          Return to Journal
        </Link>
      </div>
    );
  }

  const readTime = post.read_time || getReadTime(post.content);
  const wordCount = getWordCount(post.content);
  const canonicalFull = post.canonical_url?.startsWith("http")
    ? post.canonical_url
    : `${SITE_URL}${post.canonical_url || `/blog/${post.slug}`}`;

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Journal", href: "/blog" },
    ...(post.category ? [{ label: post.category }] : []),
    { label: post.title },
  ];

  return (
    <div className="min-h-screen bg-obsidian relative">
      <ReadingProgress />
      <JournalShellStyles />

      {/* ── SEO Head ── */}
      <DiscoveryHead
        entityType="blog"
        id={post.id}
        slug={post.slug}
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        image={post.og_image || post.featured_image || undefined}
        canonicalUrl={canonicalFull}
        keywords={post.keywords}
        author={post.author?.name || "Fameuxarte Team"}
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        robots="index, follow"
        rawEntity={{
          faq: post.faq,
          wordCount,
          schema_type: post.schema_type,
          keywords: post.keywords,
        }}
        customMeta={{
          author: post.author?.name || "Fameuxarte Team",
        }}
      />

      {/* ── Sticky nav ── */}
      <nav className="flex items-center justify-between border-b border-border-faint bg-obsidian/80 backdrop-blur-md px-6 py-[14px] sticky top-0 z-40">
        <Link to="/" className="text-[14px] font-medium tracking-[-0.01em] text-linen hover:text-gold transition-colors">
          Fameuxarte
        </Link>
        <Link to="/blog" className="inline-flex items-center gap-2 text-[12px] text-[#666] transition-colors hover:text-gold">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Journal
        </Link>
      </nav>

      {/* ── Breadcrumbs ── */}
      <ArticleBreadcrumbs items={breadcrumbs} />

      {/* ── Hero ── */}
      <EditorialHero
        title={post.title}
        category={post.category}
        excerpt={post.excerpt}
        imageUrl={post.featured_image || undefined}
        publishedAt={post.published_at}
        updatedAt={post.updated_at}
        readTime={readTime}
        authorName={post.author?.name}
      />

      {/* ── Key Takeaways (above TOC + content) ── */}
      {post.key_takeaways && post.key_takeaways.length > 0 && (
        <KeyTakeaways items={post.key_takeaways} />
      )}

      {/* ── Main layout: left social rail | article | right TOC ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-12 relative">
        {/* Social share — left rail */}
        <aside className="w-16 hidden lg:block flex-shrink-0">
          <SocialShare
            url={post.canonical_url || `/blog/${post.slug}`}
            title={post.title}
          />
        </aside>

        {/* Article body */}
        <article className="flex-1 max-w-3xl min-w-0">
          <ArticleBody content={post.content} />

          {/* FAQ section (inside article for proper semantics) */}
          {post.faq && post.faq.length > 0 && (
            <ArticleFAQ faqs={post.faq} />
          )}

          {/* Commerce CTA */}
          {post.cta_label && post.cta_url && (
            <ArticleCTA
              label={post.cta_label}
              url={post.cta_url}
              description={post.cta_description}
            />
          )}

          {/* Mobile share */}
          <MobileSocialShare
            url={post.canonical_url || `/blog/${post.slug}`}
            title={post.title}
          />

          {/* Author */}
          <AuthorCard
            authorId={post.author?.id}
            name={post.author?.name || "Fameuxarte Team"}
            avatarUrl={post.author?.avatar || undefined}
            bio={post.author?.bio}
            role={post.author?.role}
          />

          {/* Discovery Hub — related artworks, artists, articles */}
          <DiscoveryHub
            insightId={post.id}
            tags={post.tags || []}
            keywords={post.keywords || []}
            category={post.category}
          />

          {/* Comments */}
          <div className="mt-16">
            <CommentBox postId={post.id} />
          </div>
        </article>

        {/* TOC — right rail */}
        <aside className="w-64 hidden lg:block flex-shrink-0">
          <TableOfContents />
        </aside>
      </div>
    </div>
  );
};

export default BlogPost;
