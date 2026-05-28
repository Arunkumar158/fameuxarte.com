interface LoadMoreButtonProps {
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
}

const LoadMoreButton = ({ onLoadMore, loading = false, hasMore = true }: LoadMoreButtonProps) => {
  if (!hasMore) return null;

  return (
    <div className="border-t border-t-[0.5px] border-border-faint bg-surface-1 px-6 py-10">
      <div className="text-center">
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="rounded-md bg-linen px-6 py-[11px] text-[13px] font-medium text-obsidian transition-colors hover:bg-gold disabled:opacity-50"
        >
          {loading ? "Loading more..." : "Load more artworks"}
        </button>
      </div>
    </div>
  );
};

export default LoadMoreButton;
