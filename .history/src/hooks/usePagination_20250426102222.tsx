
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface UsePaginationProps {
  initialLimit?: number;
  initialPage?: number;
}

export const usePagination = ({ initialLimit = 6, initialPage = 0 }: UsePaginationProps = {}) => {
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadMore = async () => {
    setPage(prev => prev + 1);
  };

  const calculateRange = () => {
    const from = page * initialLimit;
    const to = from + initialLimit - 1;
    return { from, to };
  };

  return {
    page,
    setPage,
    hasMore,
    setHasMore,
    isLoading,
    setIsLoading,
    loadMore,
    calculateRange,
    limit: initialLimit
  };
};
