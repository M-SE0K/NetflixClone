import { useState, useCallback, useMemo, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '../components/Header';
import MovieTable from '../components/MovieTable';
import MovieGrid from '../components/MovieGrid';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { getPopularMovies } from '../api/tmdb';

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
  background: transparent;
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
    background: rgba(255, 255, 255, 0.1);
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

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  width: 50px;
  height: 50px;
  border: 3px solid rgba(229, 9, 20, 0.3);
  border-radius: 50%;
  border-top-color: #e50914;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: #888;
  font-size: 14px;
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

const Popular = () => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [sortField, setSortField] = useState('popularity');
  const [sortOrder, setSortOrder] = useState('desc');
  // table 전용 상태
  const [tablePage, setTablePage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [tableTotalPages, setTableTotalPages] = useState(0);
  const [tableTotalResults, setTableTotalResults] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');

  // Infinite Scroll 훅 사용
  const {
    data: movies,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalResults,
    loadMoreRef,
    refresh
  } = useInfiniteScroll(getPopularMovies, {
    initialPage: 1,
    enabled: true
  });

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

  // 테이블용 데이터 페치 (페이지네이션)
  const fetchTablePage = useCallback(async (page) => {
    try {
      setTableLoading(true);
      setTableError('');
      const res = await getPopularMovies(page);
      const sorted = [...(res.results || [])].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (sortField === 'title') {
          aVal = (aVal || '').toLowerCase();
          bVal = (bVal || '').toLowerCase();
          return sortOrder === 'asc' ? aVal.localeCompare(bVal, 'ko') : bVal.localeCompare(aVal, 'ko');
        }
        if (sortField === 'release_date') {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        }
        aVal = aVal || 0;
        bVal = bVal || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
      setTableData(sorted);
      setTableTotalPages(res.total_pages || 0);
      setTableTotalResults(res.total_results || 0);
    } catch (err) {
      setTableError(err.message || '테이블 데이터를 불러오지 못했습니다.');
    } finally {
      setTableLoading(false);
    }
  }, [sortField, sortOrder]);

  // 뷰 전환 시 테이블 초기 페이지 로드
  useEffect(() => {
    if (viewMode === VIEW_MODES.TABLE) {
      fetchTablePage(tablePage);
    }
  }, [viewMode, tablePage, fetchTablePage]);

  // 정렬 변경 시 테이블도 정렬 다시 적용
  useEffect(() => {
    if (viewMode === VIEW_MODES.TABLE && tableData.length) {
      const resorted = [...tableData].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (sortField === 'title') {
          aVal = (aVal || '').toLowerCase();
          bVal = (bVal || '').toLowerCase();
          return sortOrder === 'asc' ? aVal.localeCompare(bVal, 'ko') : bVal.localeCompare(aVal, 'ko');
        }
        if (sortField === 'release_date') {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        }
        aVal = aVal || 0;
        bVal = bVal || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
      setTableData(resorted);
    }
  }, [sortField, sortOrder, viewMode, tableData]);

  // 테이블 정렬 핸들러
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }, [sortField]);

  // 드롭다운 정렬 변경
  const handleSortChange = (e) => {
    setSortField(e.target.value);
    setSortOrder('desc');
  };

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
                🔲 그리드
              </ViewButton>
              <ViewButton 
                $isActive={viewMode === VIEW_MODES.TABLE}
                onClick={() => setViewMode(VIEW_MODES.TABLE)}
              >
                📋 테이블
              </ViewButton>
            </ViewToggle>

            <Select value={sortField} onChange={handleSortChange}>
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <RefreshButton onClick={refresh} disabled={isLoading}>
              🔄 새로고침
            </RefreshButton>
          </LeftControls>

          <RightControls>
            {totalResults > 0 && (
              <ResultInfo>
                총 <span>{totalResults.toLocaleString()}</span>개의 영화
              </ResultInfo>
            )}
          </RightControls>
        </ControlsContainer>

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
                movies={sortedMovies}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                loadMoreRef={loadMoreRef}
                onMovieClick={handleMovieClick}
                emptyMessage="인기 영화가 없습니다."
              />
            ) : (
              <MovieTable
                movies={tableData}
                onSort={handleSort}
                sortField={sortField}
                sortOrder={sortOrder}
                onMovieClick={handleMovieClick}
              />
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
              <TopButton onClick={scrollToTop}>⇧</TopButton>
            )}
          </>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default Popular;

