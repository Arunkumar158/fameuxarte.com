import { formatArticleDate, getInitials } from "./format";
import type { BlogPost } from "./types";

interface ArticleHeaderProps {
  post: BlogPost;
}

const ArticleHeader = ({ post }: ArticleHeaderProps) => {
  const authorName = post.author?.name || "Fameuxarte Team";

  return (
    <header className="mx-auto max-w-[680px] px-6 py-10">
      <div className="mb-3 text-[11px] uppercase tracking-[0.1em] text-gold">{post.category}</div>
      <h1 className="text-[32px] font-medium leading-tight tracking-[-0.025em] text-linen">{post.title}</h1>
      <p className="mt-4 text-[15px] leading-[1.8] text-[#888]">{post.excerpt}</p>
      <div className="mt-6 flex items-center gap-3 text-[12px] text-[#555]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-verified/20 text-[12px] font-medium text-verified">
          {getInitials(authorName)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span>{authorName}</span>
          <span>-</span>
          <time dateTime={post.published_at}>{formatArticleDate(post.published_at)}</time>
          <span>-</span>
          <span>{post.read_time} min read</span>
        </div>
      </div>
    </header>
  );
};

export default ArticleHeader;

