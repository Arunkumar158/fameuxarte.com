interface CategoryFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilters = ({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFiltersProps) => {
  const allCategories = ["All", ...categories];

  return (
    <section className="border-b border-border-faint bg-surface-1 px-6 py-4">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
        {allCategories.map(category => {
          const isActive =
            category === "All" ? !activeCategory : category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`shrink-0 rounded-[999px] border px-3 py-2 text-[12px] transition-colors ${
                isActive
                  ? "border-gold/30 bg-gold/10 text-gold"
                  : "border-border-subtle bg-transparent text-[#666] hover:text-stone hover:border-border-subtle/80"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryFilters;
