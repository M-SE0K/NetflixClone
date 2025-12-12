import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 무한 스크롤 커스텀 훅
 * @param {Function} fetchFunction - 데이터를 가져오는 함수 (page를 인자로 받음)
 * @param {Object} options - 옵션 설정
 * @returns {Object} - 데이터, 로딩 상태, 에러, 참조 등
 */
const useInfiniteScroll = (fetchFunction, options = {}) => {
  const {
    initialPage = 1,
    threshold = 0.8, // 화면의 80% 스크롤 시 다음 페이지 로드
    enabled = true
  } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

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
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
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
      setError(err.message || '추가 데이터를 불러오는데 실패했습니다.');
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

  // Intersection Observer 설정
  useEffect(() => {
    if (!enabled) return;

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMore, enabled]);

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

