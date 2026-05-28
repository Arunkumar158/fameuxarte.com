const categories = ["All articles", "Art intelligence", "Collecting guide", "Artist spotlight", "Market insights", "ArtGuard"];

const CategoryFilters = () => {
  return (
    <section className="border-b border-border-faint bg-surface-1 px-6 py-4">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
        {categories.map((category, index) => (
          <button
            key={category}
            type="button"
            className={`shrink-0 rounded-[999px] border px-3 py-2 text-[12px] transition-colors ${
              index === 0
                ? "border-gold/30 bg-gold/10 text-gold"
                : "border-border-subtle bg-transparent text-[#666] hover:text-stone"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryFilters;

