import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

interface SEOChecklistProps {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  category: string;
  keyTakeaways: string[];
  faq: Array<{ question: string; answer: string }>;
  ctaLabel: string;
  ctaUrl: string;
  keywords: string;
  canonicalUrl: string;
}

interface CheckResult {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail" | "info";
  message: string;
}

const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const countWords = (content: string) =>
  stripHtml(content).split(/\s+/).filter(Boolean).length;

const hasH2 = (content: string) => /<h2[\s>]/i.test(content);
const hasInternalLinks = (content: string) => {
  const matches = content.match(/href="([^"]+)"/g) || [];
  return matches.some(href => !href.includes("http") || href.includes("fameuxarte.com"));
};

export const useSEOScore = (props: SEOChecklistProps) => {
  return useMemo(() => {
    const checks: CheckResult[] = [];
    const {
      title, slug, excerpt, content, metaTitle, metaDescription,
      featuredImage, category, keyTakeaways, faq, ctaLabel, ctaUrl,
      keywords, canonicalUrl,
    } = props;

    const wordCount = countWords(content);

    // ── CRITICAL (fail if missing) ──
    checks.push({
      id: "title",
      label: "Article title",
      status: title.trim() ? "pass" : "fail",
      message: title.trim()
        ? `Title: "${title.substring(0, 60)}${title.length > 60 ? "…" : ""}"`
        : "Title is required before publishing.",
    });

    checks.push({
      id: "slug",
      label: "URL slug",
      status: slug.trim() && /^[a-z0-9-]+$/.test(slug) ? "pass" : "fail",
      message: slug.trim()
        ? /^[a-z0-9-]+$/.test(slug)
          ? `Slug: /${slug}`
          : "Slug must only contain lowercase letters, numbers, and hyphens."
        : "A URL slug is required.",
    });

    checks.push({
      id: "h1",
      label: "H1 (article title)",
      status: title.trim() ? "pass" : "fail",
      message: "H1 is derived from the article title field.",
    });

    // ── SEO FIELDS ──
    const metaTitleLen = (metaTitle || title).trim().length;
    checks.push({
      id: "meta_title",
      label: "SEO title",
      status: metaTitleLen >= 30 && metaTitleLen <= 65 ? "pass" : metaTitleLen === 0 ? "warn" : "warn",
      message: metaTitleLen
        ? `${metaTitleLen} chars ${metaTitleLen < 30 ? "— too short (30–65 recommended)" : metaTitleLen > 65 ? "— too long (65 max recommended)" : "✓"}`
        : "No SEO title set — article title will be used as fallback.",
    });

    const metaDescLen = metaDescription.trim().length;
    checks.push({
      id: "meta_description",
      label: "Meta description",
      status: metaDescLen >= 100 && metaDescLen <= 160 ? "pass" : metaDescLen === 0 ? "warn" : "warn",
      message: metaDescLen
        ? `${metaDescLen} chars ${metaDescLen < 100 ? "— too short (100–160 recommended)" : metaDescLen > 160 ? "— too long (max 160)" : "✓"}`
        : "Meta description is missing — search engines will auto-select snippet.",
    });

    checks.push({
      id: "canonical",
      label: "Canonical URL",
      status: canonicalUrl.trim() || slug.trim() ? "pass" : "warn",
      message: canonicalUrl.trim()
        ? `Canonical: ${canonicalUrl}`
        : slug.trim()
        ? `Canonical will be: /blog/${slug}`
        : "No canonical URL set.",
    });

    // ── CONTENT ──
    const excerptLen = excerpt.trim().length;
    checks.push({
      id: "excerpt",
      label: "Excerpt / description",
      status: excerptLen >= 60 && excerptLen <= 200 ? "pass" : excerptLen === 0 ? "warn" : "warn",
      message: excerptLen
        ? `${excerptLen} chars ${excerptLen < 60 ? "— too short" : excerptLen > 200 ? "— consider trimming" : "✓"}`
        : "Excerpt missing — helps social sharing and card display.",
    });

    checks.push({
      id: "word_count",
      label: "Article length",
      status: wordCount >= 600 ? "pass" : wordCount >= 300 ? "warn" : "fail",
      message:
        wordCount >= 600
          ? `${wordCount} words ✓`
          : wordCount >= 300
          ? `${wordCount} words — consider expanding to 600+ for better SEO`
          : `${wordCount} words — article is very short (300+ recommended)`,
    });

    checks.push({
      id: "h2",
      label: "H2 headings",
      status: content.trim() && hasH2(content) ? "pass" : content.trim() ? "warn" : "info",
      message: hasH2(content)
        ? "H2 headings found — TOC will be generated ✓"
        : content.trim()
        ? "No H2 headings found — add section headings for TOC and readability"
        : "Write content to check headings.",
    });

    checks.push({
      id: "category",
      label: "Category",
      status: category.trim() ? "pass" : "warn",
      message: category.trim() ? `Category: ${category}` : "No category selected.",
    });

    checks.push({
      id: "keywords",
      label: "Keywords",
      status: keywords.trim() ? "pass" : "warn",
      message: keywords.trim() ? `Keywords: ${keywords}` : "No keywords set.",
    });

    // ── MEDIA ──
    checks.push({
      id: "hero_image",
      label: "Hero image",
      status: featuredImage.trim() ? "pass" : "warn",
      message: featuredImage.trim()
        ? "Hero image set ✓"
        : "No hero image — add one for social sharing and visual appeal.",
    });

    // ── EDITORIAL BLOCKS ──
    checks.push({
      id: "key_takeaways",
      label: "Key Takeaways",
      status: keyTakeaways.filter(Boolean).length >= 3 ? "pass" : keyTakeaways.filter(Boolean).length > 0 ? "warn" : "info",
      message:
        keyTakeaways.filter(Boolean).length >= 3
          ? `${keyTakeaways.filter(Boolean).length} takeaways ✓`
          : keyTakeaways.filter(Boolean).length > 0
          ? `Only ${keyTakeaways.filter(Boolean).length} — 3–7 recommended`
          : "No Key Takeaways — adds reader value and dwell time.",
    });

    checks.push({
      id: "faq",
      label: "FAQ section",
      status: faq.filter(f => f.question && f.answer).length >= 2 ? "pass" : faq.length > 0 ? "warn" : "info",
      message:
        faq.filter(f => f.question && f.answer).length >= 2
          ? `${faq.filter(f => f.question && f.answer).length} FAQ items — FAQPage schema will be injected ✓`
          : faq.length > 0
          ? "FAQ incomplete — add at least 2 Q&A pairs for schema eligibility"
          : "No FAQ — consider adding for rich results.",
    });

    checks.push({
      id: "cta",
      label: "Commerce CTA",
      status: ctaLabel.trim() && ctaUrl.trim() ? "pass" : "info",
      message:
        ctaLabel.trim() && ctaUrl.trim()
          ? `CTA: "${ctaLabel}" → ${ctaUrl}`
          : "No CTA — add a commerce link to turn readers into collectors.",
    });

    checks.push({
      id: "internal_links",
      label: "Internal links",
      status: content.trim() && hasInternalLinks(content) ? "pass" : content.trim() ? "warn" : "info",
      message: hasInternalLinks(content)
        ? "Internal links found ✓"
        : content.trim()
        ? "No internal links detected — link to artworks, artists, or other articles"
        : "Write content to check links.",
    });

    // ── SCORE CALCULATION ──
    const weights: Record<string, number> = {
      title: 10, slug: 8, meta_title: 8, meta_description: 10, canonical: 4,
      excerpt: 6, word_count: 10, h2: 8, category: 4, keywords: 4,
      hero_image: 8, key_takeaways: 6, faq: 5, cta: 4, internal_links: 5,
    };

    const scoreMap: Record<string, number> = { pass: 1, warn: 0.5, fail: 0, info: 0.75 };
    let totalWeight = 0;
    let earned = 0;
    checks.forEach(c => {
      const w = weights[c.id] ?? 4;
      totalWeight += w;
      earned += w * scoreMap[c.status];
    });

    const score = Math.round((earned / totalWeight) * 100);

    return { checks, score, wordCount };
  }, [props]);
};

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

const StatusIcon = ({ status }: { status: CheckResult["status"] }) => {
  if (status === "pass") return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
  if (status === "warn") return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
  if (status === "fail") return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
  return <Info className="w-4 h-4 text-[#666] flex-shrink-0" />;
};

const ScoreRing = ({ score }: { score: number }) => {
  const color =
    score >= 80 ? "#4ade80" : score >= 55 ? "#facc15" : "#f87171";
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1e1e1e" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        <text x="36" y="40" textAnchor="middle" fill={color} fontSize="15" fontWeight="700" fontFamily="Inter, sans-serif">
          {score}
        </text>
      </svg>
      <span className="text-[10px] uppercase tracking-widest text-[#666]">SEO Score</span>
    </div>
  );
};

const SEOChecklist = (props: SEOChecklistProps) => {
  const { checks, score, wordCount } = useSEOScore(props);

  const fails = checks.filter(c => c.status === "fail");
  const warns = checks.filter(c => c.status === "warn");
  const passes = checks.filter(c => c.status === "pass");

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 border">
        <ScoreRing score={score} />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-800">
            {score >= 80 ? "Ready to publish" : score >= 55 ? "Needs improvement" : "Not ready"}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {wordCount} words · {passes.length} passed · {warns.length} warnings · {fails.length} errors
          </div>
        </div>
      </div>

      {/* Checks list */}
      <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
        {checks.map(check => (
          <div
            key={check.id}
            className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm ${
              check.status === "fail"
                ? "bg-red-50 border border-red-100"
                : check.status === "warn"
                ? "bg-amber-50 border border-amber-100"
                : check.status === "pass"
                ? "bg-emerald-50/60 border border-emerald-100/50"
                : "bg-slate-50 border border-slate-100"
            }`}
          >
            <StatusIcon status={check.status} />
            <div className="min-w-0">
              <div className="font-medium text-slate-700 text-[13px]">{check.label}</div>
              <div className="text-slate-500 text-[12px] mt-0.5 leading-relaxed">{check.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SEOChecklist;
