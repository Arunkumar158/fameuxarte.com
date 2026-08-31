import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import { ArrowLeft, Plus, Trash2, ExternalLink, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ImageUploader from "@/components/blog/ImageUploader";
import SEOChecklist from "@/components/blog/SEOChecklist";
import type { FAQItem } from "@/components/blog/types";

// ──────────────────────────────────────────────────────────
// Tiptap Toolbar
// ──────────────────────────────────────────────────────────

const ToolbarButton = ({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
      active
        ? "bg-slate-800 text-white"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`}
  >
    {children}
  </button>
);

// ──────────────────────────────────────────────────────────
// Main Editor
// ──────────────────────────────────────────────────────────

export default function InsightsEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === "new" || !id;

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // ── Core fields ──
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");

  // ── Media ──
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [featuredImageCaption, setFeaturedImageCaption] = useState("");

  // ── SEO fields ──
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [schemaType, setSchemaType] = useState("BlogPosting");

  // ── Editorial blocks ──
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(["", "", ""]);
  const [faq, setFaq] = useState<FAQItem[]>([{ question: "", answer: "" }]);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [ctaDescription, setCtaDescription] = useState("");

  // ── Tiptap editor ──
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: "rounded-lg my-4 max-w-full" } }),
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline" } }),
    ],
    content: "",
    editorProps: {
      attributes: {
        "data-admin": "true",
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[400px] p-4 rounded-md border border-slate-200 bg-white text-slate-900 leading-relaxed font-sans",
        style: "color: #0f172a !important;",
      },
    },
  });

  // ──────────────────────────────────────────────────────────
  // Load existing insight
  // ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isNew && id) {
      fetchInsight(id);
    }
  }, [id, isNew]);

  const fetchInsight = async (insightId: string) => {
    setIsLoading(true);
    let data: any = null;

    try {
      const { data: insightData } = await supabase
        .from("insights")
        .select("*")
        .eq("id", insightId)
        .maybeSingle();

      data = insightData;
    } catch {}

    if (!data) {
      try {
        const { data: blogData } = await supabase
          .from("blogs")
          .select("*")
          .eq("id", insightId)
          .maybeSingle();

        if (blogData) {
          data = {
            id: blogData.id,
            title: blogData.title,
            slug: blogData.Slug || blogData.slug,
            content: blogData.content,
            featured_image: blogData.image_url,
            status: "published",
            excerpt: blogData.content?.replace(/<[^>]+>/g, " ").substring(0, 160) + "...",
            meta_title: blogData.title,
          };
        }
      } catch {}
    }

    if (!data) {
      toast.error("Failed to load article");
      navigate("/admin/insights");
      return;
    }

    if (data) {
      setTitle(data.title || "");
      setSlug(data.slug || "");
      setExcerpt(data.excerpt || "");
      setCategory(data.category || "");
      setTags(data.tags ? (data.tags as string[]).join(", ") : "");
      setStatus(data.status || "draft");

      setFeaturedImage(data.featured_image || "");
      setMetaTitle(data.meta_title || "");
      setMetaDescription(data.meta_description || "");
      setCanonicalUrl(data.canonical_url || "");
      setKeywords(data.keywords ? (data.keywords as string[]).join(", ") : "");
      setOgImage(data.og_image || "");
      setSchemaType(data.schema_type || "BlogPosting");

      // Editorial blocks
      const rawTakeaways = (data as any).key_takeaways as string[] | null;
      setKeyTakeaways(rawTakeaways?.length ? rawTakeaways : ["", "", ""]);

      let parsedFaq: FAQItem[] = [{ question: "", answer: "" }];
      try {
        const rawFaq = (data as any).faq;
        if (Array.isArray(rawFaq) && rawFaq.length > 0) {
          parsedFaq = rawFaq.filter((f: any) => f?.question !== undefined);
        }
      } catch {}
      setFaq(parsedFaq);

      setCtaLabel((data as any).cta_label || "");
      setCtaUrl((data as any).cta_url || "");
      setCtaDescription((data as any).cta_description || "");

      if (editor) {
        editor.commands.setContent(data.content || "");
      }
    }
    setIsLoading(false);
  };

  // ──────────────────────────────────────────────────────────
  // Key Takeaways helpers
  // ──────────────────────────────────────────────────────────

  const updateTakeaway = (index: number, value: string) => {
    setKeyTakeaways(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addTakeaway = () => {
    if (keyTakeaways.length < 7) {
      setKeyTakeaways(prev => [...prev, ""]);
    } else {
      toast.info("Maximum 7 Key Takeaways recommended.");
    }
  };

  const removeTakeaway = (index: number) => {
    setKeyTakeaways(prev => prev.filter((_, i) => i !== index));
  };

  // ──────────────────────────────────────────────────────────
  // FAQ helpers
  // ──────────────────────────────────────────────────────────

  const updateFaq = (index: number, field: keyof FAQItem, value: string) => {
    setFaq(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addFaqItem = () => {
    setFaq(prev => [...prev, { question: "", answer: "" }]);
  };

  const removeFaqItem = (index: number) => {
    setFaq(prev => prev.filter((_, i) => i !== index));
  };

  // ──────────────────────────────────────────────────────────
  // Slug generation
  // ──────────────────────────────────────────────────────────

  const generateSlug = useCallback(() => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 80);
    setSlug(generated);
  }, [title]);

  // ──────────────────────────────────────────────────────────
  // Save
  // ──────────────────────────────────────────────────────────

  const handleSave = async (saveAsStatus?: string) => {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required. Generate one from the title.");
      return;
    }

    setIsSaving(true);

    const contentHtml = editor?.getHTML() || "";
    const finalStatus = saveAsStatus || status;
    const cleanTakeaways = keyTakeaways.filter(t => t.trim());
    const cleanFaq = faq.filter(f => f.question.trim() && f.answer.trim());
    const wordCount = contentHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    const payload: Record<string, any> = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: contentHtml,
      featured_image: featuredImage.trim() || null,
      category: category.trim() || "Art Intelligence",
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      status: finalStatus,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      canonical_url: canonicalUrl.trim() || `/blog/${slug.trim()}`,
      keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
      og_image: ogImage.trim() || featuredImage.trim() || null,
      schema_type: schemaType,
      author_id: user?.id,
      published_at: finalStatus === "published" ? new Date().toISOString() : null,
      // Editorial blocks
      key_takeaways: cleanTakeaways,
      faq: cleanFaq,
      cta_label: ctaLabel.trim() || null,
      cta_url: ctaUrl.trim() || null,
      cta_description: ctaDescription.trim() || null,
      read_time: Math.max(4, Math.ceil(wordCount / 180)),
    };

    let saved = false;

    // 1. Try saving to insights table
    try {
      let result;
      if (isNew) {
        result = await supabase.from("insights").insert([payload]).select().single();
      } else {
        result = await supabase
          .from("insights")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
      }

      if (!result.error) {
        saved = true;
        toast.success(finalStatus === "published" ? "Article published to Journal!" : "Draft saved.");
        if (isNew && result.data) {
          navigate(`/admin/insights/${result.data.id}`, { replace: true });
        }
      }
    } catch {}

    // 2. Fallback to blogs table if insights table is not yet deployed
    if (!saved) {
      try {
        const blogPayload: Record<string, any> = {
          title: title.trim(),
          Slug: slug.trim(),
          content: contentHtml,
          image_url: featuredImage.trim() || null,
          author_id: user?.id,
          published_at: new Date().toISOString(),
        };

        let bResult;
        if (isNew) {
          bResult = await supabase.from("blogs").insert([blogPayload]).select().single();
        } else {
          bResult = await supabase.from("blogs").update(blogPayload).eq("id", id).select().single();
        }

        if (!bResult.error) {
          saved = true;
          toast.success(finalStatus === "published" ? "Article published to Journal!" : "Draft saved.");
          if (isNew && bResult.data) {
            navigate(`/admin/insights/${bResult.data.id}`, { replace: true });
          }
        } else {
          toast.error(bResult.error.message);
        }
      } catch (err: any) {
        toast.error("Failed to save article. Please check database permissions.");
      }
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const contentHtml = editor?.getHTML() || "";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/insights")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isNew ? "Create Article" : "Edit Article"}
            </h2>
            {!isNew && slug && (
              <Link
                to={`/blog/${slug}`}
                target="_blank"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
              >
                <ExternalLink className="w-3 h-3" />
                Preview article
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="border-slate-200 text-slate-700"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave("published")}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left column: Content ── */}
        <div className="xl:col-span-2 space-y-6">
          <Tabs defaultValue="content">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="editorial">Editorial Blocks</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* ── CONTENT TAB ── */}
            <TabsContent value="content" className="space-y-4">
              {/* Title */}
              <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium" htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter a compelling article title..."
                    className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-lg"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-900 font-medium" htmlFor="slug">
                      URL Slug <span className="text-red-500">*</span>
                    </Label>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={generateSlug}>
                      Generate from title
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">/blog/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-"))}
                      placeholder="article-url-slug"
                      className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium" htmlFor="excerpt">
                    Excerpt{" "}
                    <span className="text-slate-400 font-normal text-xs">(60–200 chars recommended)</span>
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    rows={2}
                    placeholder="Brief summary shown on article cards and social shares..."
                    className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400"
                  />
                  <div className="text-xs text-slate-400 text-right">{excerpt.length} chars</div>
                </div>
              </div>

              {/* Rich text editor */}
              <div className="bg-white p-6 rounded-lg border shadow-sm space-y-3">
                <Label className="text-slate-900 font-medium">Article Content</Label>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-t-md border-b-0">
                  <ToolbarButton active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>B</ToolbarButton>
                  <ToolbarButton active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>I</ToolbarButton>
                  <div className="w-px h-5 bg-slate-200 mx-1 self-center" />
                  <ToolbarButton active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
                  <ToolbarButton active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
                  <ToolbarButton active={editor?.isActive("heading", { level: 4 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}>H4</ToolbarButton>
                  <div className="w-px h-5 bg-slate-200 mx-1 self-center" />
                  <ToolbarButton active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
                  <ToolbarButton active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
                  <ToolbarButton active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>Quote</ToolbarButton>
                  <div className="w-px h-5 bg-slate-200 mx-1 self-center" />
                  <ToolbarButton
                    onClick={() => {
                      const url = window.prompt("Enter link URL:");
                      if (url) editor?.chain().focus().setLink({ href: url }).run();
                    }}
                  >
                    Link
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => {
                      const url = window.prompt("Enter image URL:");
                      const alt = window.prompt("Enter alt text (required for SEO):") || "";
                      if (url) editor?.chain().focus().setImage({ src: url, alt }).run();
                    }}
                  >
                    Image
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
                    ─
                  </ToolbarButton>
                  <ToolbarButton active={editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()}>Code</ToolbarButton>
                </div>
                <EditorContent editor={editor} className="admin-editor text-slate-900" />
                <div className="text-xs text-slate-400 text-right">
                  H2/H3 headings will be picked up by the automatic Table of Contents.
                </div>
              </div>

              {/* Hero image */}
              <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-900">Hero Image</h3>
                <ImageUploader
                  value={featuredImage}
                  altText={featuredImageAlt}
                  caption={featuredImageCaption}
                  onChange={setFeaturedImage}
                  onAltChange={setFeaturedImageAlt}
                  onCaptionChange={setFeaturedImageCaption}
                  label="Hero Image"
                  bucket="blog-images"
                  folder="hero"
                />
              </div>
            </TabsContent>

            {/* ── EDITORIAL BLOCKS TAB ── */}
            <TabsContent value="editorial" className="space-y-4">
              {/* Key Takeaways */}
              <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Key Takeaways</h3>
                    <p className="text-xs text-slate-500 mt-0.5">3–7 bullet points shown above the article. Keep each to one sentence.</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${keyTakeaways.filter(Boolean).length >= 3 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {keyTakeaways.filter(Boolean).length}/7
                  </span>
                </div>
                <div className="space-y-2">
                  {keyTakeaways.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={e => updateTakeaway(index, e.target.value)}
                        placeholder={`Takeaway ${index + 1}...`}
                        className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
                        maxLength={140}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTakeaway(index)}
                        className="text-slate-400 hover:text-red-500 flex-shrink-0"
                        aria-label="Remove takeaway"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {keyTakeaways.length < 7 && (
                    <Button type="button" variant="outline" size="sm" onClick={addTakeaway} className="mt-1 border-dashed">
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Takeaway
                    </Button>
                  )}
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900">FAQ Section</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    2+ Q&A pairs unlock FAQPage structured data for rich search results.
                  </p>
                </div>
                <div className="space-y-4">
                  {faq.map((item, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 p-4 space-y-2 relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          FAQ {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFaqItem(index)}
                          className="w-6 h-6 text-slate-400 hover:text-red-500"
                          aria-label="Remove FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={item.question}
                        onChange={e => updateFaq(index, "question", e.target.value)}
                        placeholder="Question..."
                        className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
                      />
                      <Textarea
                        value={item.answer}
                        onChange={e => updateFaq(index, "answer", e.target.value)}
                        placeholder="Answer..."
                        rows={2}
                        className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addFaqItem} className="border-dashed">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add FAQ Item
                  </Button>
                </div>
              </div>

              {/* Commerce CTA */}
              <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900">Commerce CTA</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Shown after the article body. Link readers to artworks, artists, or collections.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-slate-700 text-sm">CTA Headline</Label>
                    <Input
                      value={ctaLabel}
                      onChange={e => setCtaLabel(e.target.value)}
                      placeholder='e.g. "Explore Original Indian Art"'
                      className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-700 text-sm">Destination URL</Label>
                    <Input
                      value={ctaUrl}
                      onChange={e => setCtaUrl(e.target.value)}
                      placeholder="/artworks, /artists, /collections/abstract, etc."
                      className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm font-mono"
                    />
                    <p className="text-xs text-slate-400">Internal: /artworks · /artists · /collections/:slug · /style/abstract</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-700 text-sm">Subtitle (optional)</Label>
                    <Input
                      value={ctaDescription}
                      onChange={e => setCtaDescription(e.target.value)}
                      placeholder="e.g. Discover original artworks from emerging artists."
                      className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── SEO TAB ── */}
            <TabsContent value="seo" className="space-y-4">
              <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-3 mb-4">SEO Configuration</h3>

                {/* Meta title */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-900 font-medium text-sm" htmlFor="meta_title">
                      SEO Title
                    </Label>
                    <span className={`text-xs ${(metaTitle || title).length > 65 ? "text-red-500" : (metaTitle || title).length < 30 ? "text-amber-500" : "text-emerald-600"}`}>
                      {(metaTitle || title).length}/65
                    </span>
                  </div>
                  <Input
                    id="meta_title"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    placeholder={title || "Article title will be used as fallback"}
                    className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400"
                  />
                </div>

                {/* Meta description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-900 font-medium text-sm" htmlFor="meta_description">
                      Meta Description
                    </Label>
                    <span className={`text-xs ${metaDescription.length > 160 ? "text-red-500" : metaDescription.length < 100 ? "text-amber-500" : "text-emerald-600"}`}>
                      {metaDescription.length}/160
                    </span>
                  </div>
                  <Textarea
                    id="meta_description"
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    rows={2}
                    placeholder="Compelling 100–160 char description for search engines..."
                    className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400"
                  />
                </div>

                {/* Canonical URL */}
                <div className="space-y-1.5">
                  <Label className="text-slate-900 font-medium text-sm" htmlFor="canonical_url">
                    Canonical URL
                  </Label>
                  <Input
                    id="canonical_url"
                    value={canonicalUrl}
                    onChange={e => setCanonicalUrl(e.target.value)}
                    placeholder={slug ? `/blog/${slug}` : "/blog/article-slug"}
                    className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 font-mono text-sm"
                  />
                </div>

                {/* Keywords */}
                <div className="space-y-1.5">
                  <Label className="text-slate-900 font-medium text-sm" htmlFor="keywords">
                    Keywords{" "}
                    <span className="text-slate-400 font-normal">(comma-separated)</span>
                  </Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    placeholder="e.g. Indian art, abstract paintings, original artwork"
                    className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400"
                  />
                </div>

                {/* OG image + schema type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-900 font-medium text-sm">Social Image URL</Label>
                    <Input
                      value={ogImage}
                      onChange={e => setOgImage(e.target.value)}
                      placeholder="Defaults to hero image"
                      className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-900 font-medium text-sm">Schema Type</Label>
                    <Select value={schemaType} onValueChange={setSchemaType}>
                      <SelectTrigger className="bg-white text-slate-900 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BlogPosting">BlogPosting</SelectItem>
                        <SelectItem value="Article">Article</SelectItem>
                        <SelectItem value="NewsArticle">NewsArticle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">
          {/* Publish settings */}
          <div className="bg-white p-5 rounded-lg border shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Publish</h3>
            <div className="space-y-2">
              <Label className="text-slate-900 font-medium text-sm">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-white text-slate-900 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving} size="sm" className="flex-1">
                {isSaving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />} Draft
              </Button>
              <Button onClick={() => handleSave("published")} disabled={isSaving} size="sm" className="flex-1">
                {isSaving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />} Publish
              </Button>
            </div>
          </div>

          {/* Category + tags */}
          <div className="bg-white p-5 rounded-lg border shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Categorization</h3>
            <div className="space-y-2">
              <Label className="text-slate-900 font-medium text-sm">Category</Label>
              <Input
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Collecting Guide"
                className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900 font-medium text-sm">
                Tags{" "}
                <span className="text-slate-400 font-normal">(comma-separated)</span>
              </Label>
              <Input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g. abstract, painting, guide"
                className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 text-sm"
              />
            </div>
          </div>

          {/* SEO Checklist */}
          <div className="bg-white p-5 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-slate-900 border-b pb-2 mb-4">SEO Quality</h3>
            <SEOChecklist
              title={title}
              slug={slug}
              excerpt={excerpt}
              content={contentHtml}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              featuredImage={featuredImage}
              category={category}
              keyTakeaways={keyTakeaways}
              faq={faq}
              ctaLabel={ctaLabel}
              ctaUrl={ctaUrl}
              keywords={keywords}
              canonicalUrl={canonicalUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
