interface ViewToggleProps {
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
}

const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex gap-1 rounded-md border border-border-subtle bg-surface-2 p-1">
      <button
        onClick={() => onViewChange("grid")}
        className={`rounded px-3 py-1 text-[11px] transition-colors ${
          view === "grid" ? "bg-obsidian text-linen" : "text-[#666] hover:text-[#888]"
        }`}
        aria-label="Grid view"
      >
        <i className="ti ti-layout-grid" aria-hidden="true" />
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`rounded px-3 py-1 text-[11px] transition-colors ${
          view === "list" ? "bg-obsidian text-linen" : "text-[#666] hover:text-[#888]"
        }`}
        aria-label="List view"
      >
        <i className="ti ti-list" aria-hidden="true" />
      </button>
    </div>
  );
};

export default ViewToggle;
