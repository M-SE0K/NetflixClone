import { useState, useEffect, useCallback, useRef } from 'react';
import type { TMDBResponse, Movie } from '../types';

interface UseInfiniteScrollOptions {
  initialPage?: number;
  threshold?: number;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  data: Movie[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  totalPages: number;
  totalResults: number;
  loadMoreRef: (node: HTMLDivElement | null) => void;
  loadMore: () => Promise<void>;
  refresh: () => void;
  setData: React.Dispatch<React.SetStateAction<Movie[]>>;
}

/**
 * 무한 스크롤 커스텀 훅
 */
const useInfiniteScroll = (
  fetchFunction: (page: number) => Promise<TMDBResponse<Movie>>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn => {
  const {
    initialPage = 1,
    enabled = true
  } = options;

  const [data, setData] = useState<Movie[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // 데이터 초기 로드
  const loadInitialData = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction(initialPage);
      setData(result.results || []);
      setTotalPages(result.total_pages || 0);
      setTotalResults(result.total_results || 0);
      setHasMore(initialPage < (result.total_pages || 0));
      setPage(initialPage);
    } catch (err) {
      setError((err as Error).message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, initialPage, enabled]);

  // 다음 페이지 로드
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !enabled) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const result = await fetchFunction(nextPage);
      
      setData(prev => [...prev, ...(result.results || [])]);
      setPage(nextPage);
      setHasMore(nextPage < (result.total_pages || 0));
    } catch (err) {
      setError((err as Error).message || '추가 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchFunction, page, hasMore, isLoadingMore, enabled]);

  // 데이터 리셋 및 새로고침
  const refresh = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    loadInitialData();
  }, [loadInitialData, initialPage]);

  // Intersection Observer (callback ref 방식)
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!enabled || !node) return;

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '100px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    }, observerOptions);

    observer.observe(node);
    observerRef.current = observer;
  }, [enabled, hasMore, isLoadingMore, loadMore]);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    page,
    totalPages,
    totalResults,
    loadMoreRef,
    loadMore,
    refresh,
    setData
  };
};

export default useInfiniteScroll;

