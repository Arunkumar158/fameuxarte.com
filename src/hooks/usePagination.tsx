import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface UsePaginationProps {
  initialLimit?: number;
  initialPage?: number;
}

export const usePagination = ({ initialLimit = 6, initialPage = 1 }: UsePaginationProps = {}) => {
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  const totalPages = Math.ceil(totalItems / initialLimit);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const calculateRange = () => {
    const from = (page - 1) * initialLimit;
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
    totalItems,
    setTotalItems,
    totalPages,
    goToPage,
    calculateRange,
    limit: initialLimit
  };
};
