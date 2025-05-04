import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

const LoadMoreButton = ({ onClick, isLoading, hasMore }: LoadMoreButtonProps) => {
  if (!hasMore) return null;

  return (
    <div className="mt-8 text-center">
      <Button
        onClick={onClick}
        disabled={isLoading}
        variant="outline"
        size="lg"
        className="min-w-[200px] rounded-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
};

export default LoadMoreButton;
