import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  category?: string;
  title: string;
  readTime?: number;
  read_time?: number;
  date?: string;
  published_at?: string;
  created_at?: string;
  Slug?: string;
  image?: string | null;
  featured_image?: string | null;
  image_url?: string | null;
  content?: string;
}

interface JournalSectionProps {
  posts?: BlogPost[];
}

const stripHtml = (value = "") => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const getReadTime = (post: BlogPost) =>
  post.readTime ?? post.read_time ?? Math.max(4, Math.ceil(stripHtml(post.content).split(/\s+/).filter(Boolean).length / 180));

const formatPostDate = (post: BlogPost) => {
  if (post.date) return post.date;

  const date = post.published_at || post.created_at;
  if (!date) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const JournalSection = ({ posts }: JournalSectionProps) => {
  const { data: journalPosts, isLoading } = useQuery({
    queryKey: ["home-journal-posts"],
    enabled: !posts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("id,title,content,Slug,image_url,published_at,created_at")
        .order("published_at", { ascending: false })
        .limit(2);

      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });

  const displayPosts = posts ?? journalPosts ?? [];

  return (
    <section className="bg-transparent px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 text-[11px] font-normal uppercase tracking-[0.14em] text-[#555]">The art journal</div>
            <h2 className="text-[22px] font-medium tracking-[-0.02em] text-linen">Insights for collectors</h2>
          </div>
          <Link to="/blog" className="shrink-0 text-[12px] text-[#555] transition-colors hover:text-gold">
            All articles -&gt;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
          {isLoading &&
            [...Array(2)].map((_, index) => (
              <div key={index} className="h-[205px] animate-pulse rounded-[10px] border border-border-subtle bg-surface-2" />
            ))}

          {!isLoading && displayPosts.length === 0 && (
            <div className="rounded-[10px] border border-border-subtle bg-surface-2 p-[14px] text-[12px] text-[#555] sm:col-span-2">
              No journal articles available at the moment.
            </div>
          )}

          {displayPosts.map((post) => {
            const image = post.featured_image || post.image_url || post.image;
            const date = formatPostDate(post);
            return (
              <article key={post.id} className="overflow-hidden rounded-[10px] border border-border-subtle bg-surface-2">
                {image ? (
                  <img src={image} alt={post.title} className="h-[100px] w-full object-cover" />
                ) : (
                  <div className="h-[100px] w-full bg-surface-3" />
                )}
                <div className="p-[14px]">
                  <div className="mb-[6px] text-[10px] uppercase tracking-[0.1em] text-[#555]">{post.category || "Art journal"}</div>
                  <h3 className="mb-[6px] text-[13px] font-medium leading-[1.4] text-[#d0ccc4]">{post.title}</h3>
                  <p className="text-[11px] text-[#444]">
                    {getReadTime(post)} min read{date ? ` - ${date}` : ""}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JournalSection;
