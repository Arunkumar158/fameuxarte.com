import type { ReactNode } from "react";

// ──────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────

/**
 * Converts heading text to a stable, URL-safe anchor ID.
 * e.g. "How to Choose Artwork" → "how-to-choose-artwork"
 */
export const headingToId = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);

/**
 * Injects deterministic `id` attributes on every <h2> and <h3> inside an
 * HTML string. Handles duplicate headings by appending -2, -3, etc.
 */
export const injectHeadingIds = (html: string): string => {
  const seen: Record<string, number> = {};

  return html.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tag, attrs, inner) => {
    // Strip any existing id attribute before reassigning
    const cleanAttrs = attrs.replace(/\s*id="[^"]*"/gi, "");
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = headingToId(text);

    if (!id) id = "heading";

    if (seen[id]) {
      seen[id]++;
      id = `${id}-${seen[id]}`;
    } else {
      seen[id] = 1;
    }

    return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
  });
};

/**
 * Lightweight HTML sanitizer that removes dangerous tags and attributes.
 * Allows all standard rich-text formatting used by Tiptap.
 *
 * Since content is authored by admins only (not public submissions),
 * this is a belt-and-suspenders measure rather than a critical security boundary.
 */
const DANGEROUS_TAGS = /(<\s*)(script|style|iframe|object|embed|form|input|button|meta|link|base)(\s|>|\/)/gi;
const ON_EVENT_ATTRS = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
const JS_HREF = /href\s*=\s*["']\s*javascript:[^"']*["']/gi;
const DATA_HREF = /href\s*=\s*["']\s*data:[^"']*["']/gi;

export const sanitizeHtml = (html: string): string =>
  html
    .replace(DANGEROUS_TAGS, "<!-- removed -->")
    .replace(ON_EVENT_ATTRS, "")
    .replace(JS_HREF, 'href="#"')
    .replace(DATA_HREF, 'href="#"');

// ──────────────────────────────────────────────────────────
// Markdown-like plain text renderer (fallback)
// ──────────────────────────────────────────────────────────

const renderPlainContent = (content: string): ReactNode[] => {
  const seen: Record<string, number> = {};

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      if (line.startsWith("## ")) {
        const text = line.substring(3);
        let id = headingToId(text);
        if (seen[id]) { seen[id]++; id = `${id}-${seen[id]}`; } else { seen[id] = 1; }
        return <h2 key={index} id={id} className="scroll-mt-24">{text}</h2>;
      }
      if (line.startsWith("### ")) {
        const text = line.substring(4);
        let id = headingToId(text);
        if (seen[id]) { seen[id]++; id = `${id}-${seen[id]}`; } else { seen[id] = 1; }
        return <h3 key={index} id={id} className="scroll-mt-24">{text}</h3>;
      }
      if (line.startsWith("> ")) {
        return <blockquote key={index}>{line.substring(2)}</blockquote>;
      }
      return <p key={index}>{line}</p>;
    });
};

// ──────────────────────────────────────────────────────────
// ArticleBody Component
// ──────────────────────────────────────────────────────────

interface ArticleBodyProps {
  content: string;
}

const ArticleBody = ({ content }: ArticleBodyProps) => {
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(content);

  // Sanitize then inject heading IDs for TOC compatibility
  const processedHtml = hasHtml
    ? injectHeadingIds(sanitizeHtml(content))
    : "";

  return (
    <section className="mx-auto max-w-[680px] px-6 py-10">
      <div
        className={[
          "article-content",
          "text-[#999]",
          // Anchors
          "[&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors [&_a:hover]:text-linen",
          // Headings — scroll-mt so sticky nav doesn't cover them
          "[&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-[22px] [&_h2]:font-medium [&_h2]:tracking-[-0.015em] [&_h2]:text-linen [&_h2]:scroll-mt-24",
          "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-[18px] [&_h3]:font-medium [&_h3]:text-linen [&_h3]:scroll-mt-24",
          "[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-[15px] [&_h4]:font-semibold [&_h4]:text-linen/80 [&_h4]:scroll-mt-24",
          // Paragraphs
          "[&_p]:mb-[18px] [&_p]:text-[15px] [&_p]:leading-[1.85]",
          // Lists
          "[&_ul]:mb-6 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1",
          "[&_ol]:mb-6 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1",
          "[&_li]:text-[15px] [&_li]:leading-[1.8]",
          // Blockquote
          "[&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-gold [&_blockquote]:pl-5 [&_blockquote]:text-[18px] [&_blockquote]:leading-[1.7] [&_blockquote]:text-stone [&_blockquote]:italic",
          // Images
          "[&_img]:rounded-lg [&_img]:my-8 [&_img]:w-full [&_img]:h-auto",
          // Horizontal rule
          "[&_hr]:my-10 [&_hr]:border-border-subtle",
          // Code
          "[&_code]:bg-surface-3 [&_code]:text-linen [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono",
          // Tables
          "[&_table]:w-full [&_table]:my-6 [&_table]:border-collapse",
          "[&_th]:text-left [&_th]:py-2 [&_th]:px-3 [&_th]:border-b [&_th]:border-border-subtle [&_th]:text-linen [&_th]:text-sm [&_th]:font-medium",
          "[&_td]:py-2 [&_td]:px-3 [&_td]:border-b [&_td]:border-border-faint [&_td]:text-sm",
          "[&_strong]:text-linen [&_strong]:font-medium",
          "[&_em]:text-stone",
        ].join(" ")}
        dangerouslySetInnerHTML={hasHtml ? { __html: processedHtml } : undefined}
      >
        {!hasHtml ? renderPlainContent(content) : null}
      </div>
    </section>
  );
};

export default ArticleBody;
