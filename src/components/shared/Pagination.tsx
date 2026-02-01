import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Reusable page-based pagination: Previous / page numbers / Next. Active page highlighted; Prev/Next disabled at bounds. */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;
  // When many pages, show a sliding window of page numbers (e.g. 1 ... 4 5 6 ... 10).
  let visiblePages = pages;
  if (totalPages > maxVisiblePages) {
    const start = Math.max(
      Math.min(
        currentPage - Math.floor(maxVisiblePages / 2),
        totalPages - maxVisiblePages + 1
      ),
      1
    );
    visiblePages = pages.slice(start - 1, start + maxVisiblePages - 1);
  }

  return (
    <nav
      className={cn("flex items-center justify-center gap-2", className)}
      aria-label="Pagination"
    >
      {/* Previous: disabled on first page. */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages[0] > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            className="h-8 w-8"
          >
            1
          </Button>
          {visiblePages[0] > 2 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}
        </>
      )}

      {/* Page numbers: active page uses brand-red (Fameuxarte dark theme). */}
      {visiblePages.map((p) => (
        <Button
          key={p}
          variant={currentPage === p ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(p)}
          className={cn(
            "h-8 w-8",
            currentPage === p &&
              "bg-brand-red border-brand-red text-white hover:bg-brand-red/90 hover:text-white"
          )}
          aria-label={currentPage === p ? `Page ${p} (current)` : `Page ${p}`}
          aria-current={currentPage === p ? "page" : undefined}
        >
          {p}
        </Button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="h-8 w-8"
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Next: disabled on last page. */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default Pagination; 