import { Link } from "react-router-dom";
import { formatArticleDate } from "./format";
import type { BlogPost } from "./types";

interface BlogCardProps {
  post: BlogPost;
  compact?: boolean;
}

const BlogCard = ({ post, compact = false }: BlogCardProps) => {
  return (
    <Link to={`/blog/${post.slug}`} className="group block h-full">
      <article className="h-full overflow-hidden rounded-lg border border-border-subtle bg-surface-2 transition-colors hover:border-gold/30">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className={`${compact ? "h-[120px]" : "h-[140px]"} w-full object-cover transition-transform duration-700 group-hover:scale-105`}
            loading="lazy"
          />
        ) : (
          <div className={`${compact ? "h-[120px]" : "h-[140px]"} w-full bg-[linear-gradient(135deg,#141414,#0d0d0d)]`} />
        )}
        <div className={compact ? "p-3" : "p-[14px]"}>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] text-[#555]">
            <span>{post.category}</span>
            <span>-</span>
            <time dateTime={post.published_at}>{formatArticleDate(post.published_at)}</time>
            <span>-</span>
            <span>{post.read_time} min</span>
          </div>
          <h2 className="mb-2 line-clamp-2 text-[18px] font-medium leading-snug text-linen transition-colors group-hover:text-gold">
            {post.title}
          </h2>
          <p className="line-clamp-3 text-[13px] leading-[1.75] text-[#666]">{post.excerpt || post.content}</p>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;

