import BlogCard from "./BlogCard";
import type { BlogPost } from "./types";

interface RelatedPostsProps {
  posts: BlogPost[];
}

const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  if (!posts.length) return null;

  return (
    <section className="mx-auto max-w-[880px] border-t border-border-faint px-6 py-12">
      <h2 className="mb-6 text-[22px] font-medium tracking-[-0.015em] text-linen">Related articles</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.slice(0, 2).map((post) => (
          <BlogCard key={post.id} post={post} compact />
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;

