import type { BlogPost } from "./types";

interface ArticleHeroProps {
  post: BlogPost;
}

const ArticleHero = ({ post }: ArticleHeroProps) => {
  return (
    <div className="mx-auto aspect-video max-w-[880px] overflow-hidden rounded-xl px-0">
      {post.featured_image ? (
        <img src={post.featured_image} alt={post.title} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-[linear-gradient(135deg,#141414,#0a0a0a_55%,#201b11)]" />
      )}
    </div>
  );
};

export default ArticleHero;

