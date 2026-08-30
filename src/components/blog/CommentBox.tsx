import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { MessageSquare, User } from "lucide-react";

interface CommentBoxProps {
  postId: string;
}

interface CommentItem {
  id: string;
  name: string;
  comment: string;
  created_at: string;
}

const CommentBox = ({ postId }: CommentBoxProps) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    if (!postId) return;
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("blog_comments")
        .select("id, name, comment, created_at")
        .eq("blog_id", postId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setComments(data as CommentItem[]);
      }
    } catch {
      // Gracefully handle if comments table isn't accessible
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    // Basic email validation if provided
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        blog_id: postId,
        name: name.trim() || "Anonymous",
        email: email.trim() || null,
        comment: comment.trim(),
      };

      const { error } = await supabase.from("blog_comments").insert([payload]);

      if (error) throw error;

      setSubmitted(true);
      setName("");
      setEmail("");
      setComment("");
      toast.success("Comment posted successfully!");
      fetchComments();
    } catch (err: any) {
      console.error("Comment submission error:", err);
      toast.error("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-[880px] border-t border-border-faint px-6 py-12" id="comments">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-gold" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
            Discussion
          </span>
        </div>
        <h2 className="font-serif text-[28px] font-bold tracking-tight text-linen">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h2>
        <p className="text-sm text-[#888] mt-1">
          Share your perspectives, critique, or questions with the Fameuxarte collector community.
        </p>
      </div>

      {/* ── Existing Comments List ── */}
      {comments.length > 0 && (
        <div className="space-y-4 mb-12">
          {comments.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border-subtle bg-surface-2/40 p-5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-surface-3 border border-border-subtle flex items-center justify-center text-linen/70">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-linen">{item.name}</div>
                    <time className="text-xs text-[#666]" dateTime={item.created_at}>
                      {format(new Date(item.created_at), "MMM d, yyyy")}
                    </time>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#999] leading-relaxed pl-10">
                {item.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Comment Submission Form ── */}
      {submitted ? (
        <div className="rounded-xl border border-gold/20 bg-gold/5 px-6 py-8 text-center">
          <div className="text-gold text-3xl mb-3">✓</div>
          <h3 className="text-linen font-medium text-lg mb-2">Thank you for your comment!</h3>
          <p className="text-[#888] text-sm">
            Your comment has been submitted to the discussion.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-5 text-sm text-gold hover:underline"
          >
            Leave another comment
          </button>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="comment-name" className="text-sm font-medium text-linen/80">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="comment-name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-md border border-white/10 bg-[#18181b] px-4 py-3 text-linen placeholder-[#888] focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="comment-email" className="text-sm font-medium text-linen/80">
                Email <span className="text-slate-500 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="email"
                id="comment-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-md border border-white/10 bg-[#18181b] px-4 py-3 text-linen placeholder-[#888] focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment-text" className="text-sm font-medium text-linen/80">
              Comment <span className="text-red-400">*</span>
            </label>
            <textarea
              id="comment-text"
              required
              rows={5}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your thoughts on this article..."
              className="w-full resize-none rounded-md border border-white/10 bg-[#18181b] px-4 py-3 text-linen placeholder-[#888] focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
            />
          </div>

          <div className="flex justify-start">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-white px-8 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default CommentBox;
