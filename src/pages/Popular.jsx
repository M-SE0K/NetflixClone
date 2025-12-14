import { useState, useCallback, useMemo, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '../components/Header';
import MovieTable from '../components/MovieTable';
import MovieGrid from '../components/MovieGrid';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { getPopularMovies, getPopularMoviesSorted, getGenres } from '../api/tmdb';
import PopularFilters from '../components/PopularFilters';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: #141414;
  animation: ${fadeIn} 0.5s ease;
`;

const MainContent = styled.main`
  padding: 88px 4% 50px;

  @media (max-width: 768px) {
    padding: 76px 3% 30px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PageDescription = styled.p`
  color: #888;
  font-size: 14px;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-left: auto;
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background: ${props => props.$isActive ? '#e50914' : 'transparent'};
  border: none;
  color: ${props => props.$isActive ? '#fff' : '#888'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  gap: 6px;

  &:hover {
    background: ${props => props.$isActive ? '#e50914' : 'rgba(255,255,255,0.1)'};
    color: #fff;
  }
`;

const Select = styled.select`
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:hover, &:focus {
    border-color: #e50914;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const ResultInfo = styled.div`
  color: #888;
  font-size: 14px;
  
  span {
    color: #e50914;
    font-weight: 600;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background-color: ;
  background: #e50914;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s; 

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #e50914;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #e50914;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #e50914;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  color: #fff;
  flex-wrap: wrap;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 72px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #e50914;
    border-color: #e50914;
  }
`;

const TopButton = styled.button`
  position: fixed;
  right: 20px;
  bottom: 20px;
  padding: 12px 14px;
  border: none;
  border-radius: 50%;
  background: #e50914;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s, background 0.2s;
  z-index: 50;

  &:hover {
    transform: translateY(-2px);
    background: #f40612;
  }
`;

const LoadMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px 0 10px;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: conic-gradient(from 90deg, rgba(229, 9, 20, 0.9), rgba(255, 255, 255, 0.1), rgba(229, 9, 20, 0.9));
  mask: radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 8px));
  animation: ${spin} 1s linear infinite;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
`;

const LoadingText = styled.p`
  color: #888;
  font-size: 14px;
  letter-spacing: 0.4px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;


const PendingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 5;
  pointer-events: none;
`;

const PendingCard = styled.div`
  background: rgba(20, 20, 20, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 16px;
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.5);
`;

const PendingDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e50914;
  animation: ${pulse} 1s infinite;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 20px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.p`
  color: #e50914;
  font-size: 16px;
  margin-bottom: 16px;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: #e50914;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f40612;
    transform: scale(1.05);
  }
`;

const VIEW_MODES = {
  GRID: 'grid',
  TABLE: 'table'
};

const SORT_OPTIONS = [
  { value: 'popularity', label: '인기도순' },
  { value: 'vote_average', label: '평점순' },
  { value: 'release_date', label: '개봉일순' },
  { value: 'title', label: '제목순' }
];

const ORIGIN_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'kr', label: '한국만' },
  { value: 'foreign', label: '해외만' }
];

const GRID_PAGE_SIZE = 4;

const Popular = () => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [sortField, setSortField] = useState('popularity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [originFilter, setOriginFilter] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isGenreLoading, setIsGenreLoading] = useState(true);
  // table 전용 상태
  const [tablePageSize, setTablePageSize] = useState(4);
  const [tablePage, setTablePage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [tableTotalPages, setTableTotalPages] = useState(0);
  const [tableTotalResults, setTableTotalResults] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');
  const [tablePending, setTablePending] = useState(false);

  // Infinite Scroll 훅 사용
  const fetchPopularForGrid = useCallback(async (page) => {
    const res = await getPopularMoviesSorted(page, sortField, sortOrder, originFilter);
    const total = res.total_results || 0;
    const totalPages = Math.max(1, Math.ceil(total / GRID_PAGE_SIZE));
    return {
      ...res,
      results: (res.results || []).slice(0, GRID_PAGE_SIZE),
      total_pages: totalPages
    };
  }, [sortField, sortOrder, originFilter]);

  const {
    data: movies,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalResults,
    loadMoreRef,
    loadMore,
    refresh
  } = useInfiniteScroll(fetchPopularForGrid, {
    initialPage: 1,
    enabled: true
  });

  // 장르 목록
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const res = await getGenres();
        setGenres(res.genres || []);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      } finally {
        setIsGenreLoading(false);
      }
    };
    loadGenres();
  }, []);

  // 정렬된 영화 목록
  const sortedMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    
    return [...movies].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // 문자열 정렬 (제목)
      if (sortField === 'title') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal, 'ko')
          : bVal.localeCompare(aVal, 'ko');
      }

      // 날짜 정렬
      if (sortField === 'release_date') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      // 숫자 정렬
      aVal = aVal || 0;
      bVal = bVal || 0;

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [movies, sortField, sortOrder]);

  // 필터 적용 (장르, 최소 평점)
  const filteredMovies = useMemo(() => {
    let result = sortedMovies;

    if (minRating > 0) {
      result = result.filter(m => (m.vote_average || 0) >= minRating);
    }

    if (selectedGenres.length) {
      result = result.filter(m => {
        if (!m.genre_ids) return false;
        return selectedGenres.every(g => m.genre_ids.includes(g));
      });
    }

    return result;
  }, [sortedMovies, minRating, selectedGenres]);

  // 테이블용 데이터 페치 (페이지네이션)
  const fetchTablePage = useCallback(async (page, pageSize = tablePageSize, sortF = sortField, sortO = sortOrder, origin = originFilter) => {
    try {
      setTableLoading(true);
      setTablePending(true);
      setTableError('');
      // 서버 정렬된 페이지를 받아 화면 크기에 맞춰 자름
      const res = await getPopularMoviesSorted(page, sortF, sortO, origin);
      const slice = (res.results || []).slice(0, pageSize);
      setTableData(slice);
      setTableTotalPages(res.total_pages || 0);
      setTableTotalResults(res.total_results || 0);
    } catch (err) {
      setTableError(err.message || '테이블 데이터를 불러오지 못했습니다.');
    } finally {
      setTableLoading(false);
      setTimeout(() => setTablePending(false), 1000); // 최소 1초 대기 화면
    }
  }, [sortField, sortOrder, originFilter, tablePageSize]);

  // 뷰 전환 시 테이블 초기 페이지 로드 및 페이지 리셋
  useEffect(() => {
    if (viewMode === VIEW_MODES.TABLE) {
      setTablePage(1);
    }
  }, [viewMode]);

  // 테이블 페이지/사이즈/정렬 변경 시 데이터 로드
  useEffect(() => {
    if (viewMode === VIEW_MODES.TABLE) {
      fetchTablePage(tablePage, tablePageSize, sortField, sortOrder, originFilter);
    }
  }, [viewMode, tablePage, tablePageSize, sortField, sortOrder, originFilter, fetchTablePage]);

  // 정렬 변경 시 테이블도 정렬 다시 적용 (무한 루프 방지: tableData 비포함)
  useEffect(() => {
    if (viewMode === VIEW_MODES.TABLE) {
      fetchTablePage(tablePage, tablePageSize, sortField, sortOrder, originFilter);
    }
  }, [sortField, sortOrder, viewMode, tablePage, tablePageSize, originFilter, fetchTablePage]);

  // 화면 높이에 맞춰 테이블 페이지 크기 자동 조절 (스크롤 불가 목표)
  useEffect(() => {
    const calcPageSize = () => {
      const viewportH = window.innerHeight || 900;
      const headerReserve = 320; // 헤더/컨트롤 여유 높이
      const rowHeight = 92; // 행 높이 추정 (포스터 68 + 패딩 등)
      const available = Math.max(200, viewportH - headerReserve);
      const size = Math.max(2, Math.floor(available / rowHeight));
      setTablePageSize(Math.min(4, size || 4)); // 최대 4개로 제한
    };
    calcPageSize();
    window.addEventListener('resize', calcPageSize);
    return () => window.removeEventListener('resize', calcPageSize);
  }, []);

  // 테이블 정렬 핸들러
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    // 테이블 뷰일 때는 정렬 변경 시 1페이지로 이동
    if (viewMode === VIEW_MODES.TABLE) {
      setTablePage(1);
    }
  }, [sortField, viewMode]);

  // 드롭다운 정렬 변경
  const handleSortChange = (e) => {
    setSortField(e.target.value);
    setSortOrder('desc');
    if (viewMode === VIEW_MODES.TABLE) {
      setTablePage(1);
    }
  };

  const handleOriginChange = (e) => {
    const value = e.target.value;
    setOriginFilter(value);
    setTablePage(1);
  };

  const handleMinRatingChange = (e) => {
    setMinRating(Number(e.target.value));
  };

  const handleGenreClick = (genreId) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      }
      return [...prev, genreId];
    });
  };

  // 그리드 정렬/필터 변경 시 데이터 리셋
  useEffect(() => {
    refresh();
  }, [sortField, sortOrder, originFilter, refresh]);

  const handleMovieClick = (movie) => {
    console.log('Movie clicked:', movie);
    // TODO: 모달 또는 상세 페이지 연결
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        <PageHeader>
          <PageTitle>대세 콘텐츠</PageTitle>
          <PageDescription>
            지금 가장 인기 있는 영화들을 확인하세요
          </PageDescription>
        </PageHeader>

        <ControlsContainer>
          <LeftControls>
            <ViewToggle>
              <ViewButton 
                $isActive={viewMode === VIEW_MODES.GRID}
                onClick={() => setViewMode(VIEW_MODES.GRID)}
              >
                무한 스크롤
              </ViewButton>
              <ViewButton 
                $isActive={viewMode === VIEW_MODES.TABLE}
                onClick={() => setViewMode(VIEW_MODES.TABLE)}
              >
                테이블
              </ViewButton>
            </ViewToggle>

            <Select value={sortField} onChange={handleSortChange}>
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select value={originFilter} onChange={handleOriginChange}>
              {ORIGIN_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </LeftControls>

        </ControlsContainer>

        <PopularFilters
          totalResults={totalResults}
          minRating={minRating}
          onMinRatingChange={handleMinRatingChange}
          genres={genres}
          selectedGenres={selectedGenres}
          isGenreLoading={isGenreLoading}
          onGenreToggle={handleGenreClick}
          onRefresh={refresh}
          onReset={() => {
            setSortField('popularity');
            setSortOrder('desc');
            setOriginFilter('all');
            setMinRating(0);
            setSelectedGenres([]);
            setTablePage(1);
            refresh();
          }}
          isLoading={isLoading}
        />

        {/* 에러 상태 */}
        {error && (
          <ErrorContainer>
            <ErrorIcon>😢</ErrorIcon>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={refresh}>다시 시도</RetryButton>
          </ErrorContainer>
        )}

        {/* 초기 로딩 */}
        {isLoading && !error && (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>인기 영화를 불러오는 중...</LoadingText>
          </LoadingContainer>
        )}

        {/* 콘텐츠 */}
        {!isLoading && !error && (
          <>
            {viewMode === VIEW_MODES.GRID ? (
              <MovieGrid
                movies={filteredMovies}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                loadMoreRef={loadMoreRef}
                onMovieClick={handleMovieClick}
                emptyMessage="인기 영화가 없습니다."
              />
            ) : (
              <div style={{ position: 'relative' }}>
                <MovieTable
                  movies={tableData}
                  onSort={handleSort}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onMovieClick={handleMovieClick}
                />
                {tablePending && (
                  <PendingOverlay>
                    <PendingCard>
                      <PendingDot />
                      다음 페이지 불러오는 중...
                    </PendingCard>
                  </PendingOverlay>
                )}
              </div>
            )}
            {viewMode === VIEW_MODES.TABLE && tableError && (
              <LoadingContainer>
                <LoadingText>{tableError}</LoadingText>
                <PageButton onClick={() => fetchTablePage(tablePage, tablePageSize)} disabled={tableLoading}>
                  다시 시도
                </PageButton>
              </LoadingContainer>
            )}
            {viewMode === VIEW_MODES.TABLE && (
              <Pagination>
                <PageButton
                  type="button"
                  onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                  disabled={tableLoading || tablePage <= 1}
                >
                  이전
                </PageButton>
                <span>페이지 {tablePage} / {tableTotalPages || 1}</span>
                <PageButton
                  type="button"
                  onClick={() => setTablePage((p) => (tableTotalPages ? Math.min(tableTotalPages, p + 1) : p + 1))}
                  disabled={tableLoading || (tableTotalPages ? tablePage >= tableTotalPages : false)}
                >
                  다음
                </PageButton>
              </Pagination>
            )}
            {viewMode === VIEW_MODES.GRID && (
              <TopButton onClick={scrollToTop}>Top</TopButton>
            )}
          </>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default Popular;

