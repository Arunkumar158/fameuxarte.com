import React from "react";

const CommentBox = () => {
  return (
    <section className="mx-auto max-w-[880px] border-t border-border-faint px-6 py-12">
      <div className="mb-8">
        <h2 className="mb-2 font-serif text-[28px] font-bold tracking-tight text-linen">
          Join the Discussion
        </h2>
        <p className="text-sm text-[#888]">
          Your email address will not be published. Required fields are marked *
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="sr-only">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              placeholder="Name *"
              className="w-full rounded-md border border-white/10 bg-[#18181b] px-4 py-3 text-linen placeholder-[#888] focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="sr-only">
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="Email *"
              className="w-full rounded-md border border-white/10 bg-[#18181b] px-4 py-3 text-linen placeholder-[#888] focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="sr-only">
            Comment *
          </label>
          <textarea
            id="comment"
            required
            rows={6}
            placeholder="Comment *"
            className="w-full resize-none rounded-md border border-white/10 bg-[#18181b] px-4 py-3 text-linen placeholder-[#888] focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
          ></textarea>
        </div>

        <div className="flex justify-start">
          <button
            type="submit"
            className="rounded-md bg-white px-8 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200"
          >
            Post Comment
          </button>
        </div>
      </form>
    </section>
  );
};

export default CommentBox;
