const BlogHeader = () => {
  return (
    <header className="border-b border-border-faint bg-obsidian px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 text-[11px] uppercase tracking-[0.1em] text-gold">Journal</div>
        <h1 className="text-[32px] font-medium leading-tight tracking-[-0.025em] text-linen">The Art Journal</h1>
        <p className="mt-3 max-w-[480px] text-[15px] leading-[1.8] text-[#666]">
          Notes on collecting, original art, market signals, artist practice, and intelligent verification.
        </p>
      </div>
    </header>
  );
};

export default BlogHeader;

