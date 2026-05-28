import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { formatArticleDate } from "./format";
import type { BlogPost } from "./types";

interface FeaturedPostProps {
  post: BlogPost;
}

const FeaturedPost = ({ post }: FeaturedPostProps) => {
  return (
    <section className="bg-obsidian px-6 pt-8">
      <article className="mx-auto grid max-w-6xl overflow-hidden rounded-xl border border-border-subtle bg-surface-2 md:grid-cols-[1.2fr_1fr]">
        <Link to={`/blog/${post.slug}`} className="group relative block aspect-[16/10] overflow-hidden">
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,#141414,#0d0d0d_55%,#1b1811)]" />
          )}
          <span className="absolute left-4 top-4 rounded-[999px] bg-gold px-3 py-1 text-[11px] font-medium text-obsidian">
            Featured
          </span>
        </Link>

        <div className="flex flex-col justify-center p-6 md:p-8">
          <div className="mb-3 text-[11px] uppercase tracking-[0.1em] text-gold">{post.category}</div>
          <h2 className="mb-4 text-[22px] font-medium leading-tight tracking-[-0.015em] text-linen md:text-[32px] md:tracking-[-0.025em]">
            <Link to={`/blog/${post.slug}`} className="transition-colors hover:text-gold">
              {post.title}
            </Link>
          </h2>
          <p className="mb-5 text-[15px] leading-[1.8] text-[#666]">{post.excerpt || post.content}</p>
          <div className="mb-6 flex flex-wrap items-center gap-3 text-[12px] text-[#555]">
            <span>{post.author?.name || "Fameuxarte Team"}</span>
            <span>-</span>
            <time dateTime={post.published_at}>{formatArticleDate(post.published_at)}</time>
            <span>-</span>
            <span>{post.read_time} min read</span>
          </div>
          <Link to={`/blog/${post.slug}`} className="inline-flex w-fit items-center gap-2 text-[13px] text-gold">
            Read the full article <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </section>
  );
};

export default FeaturedPost;

