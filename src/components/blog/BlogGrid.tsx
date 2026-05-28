import BlogCard from "./BlogCard";
import type { BlogPost } from "./types";

interface BlogGridProps {
  posts: BlogPost[];
}

const BlogGrid = ({ posts }: BlogGridProps) => {
  return (
    <section className="bg-obsidian px-6 py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default BlogGrid;

