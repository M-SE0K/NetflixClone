import { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '../components/Header';
import MovieGrid from '../components/MovieGrid';
import useDebounce from '../hooks/useDebounce';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { searchMovies, getGenres, getMoviesByGenre, getMoviesByGenres, GENRE_IDS } from '../api/tmdb';

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

const SearchSection = styled.div`
  margin-bottom: 30px;
`;

const SearchTitle = styled.h1`
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  max-width: 600px;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #888;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #e50914;
    background: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: #888;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const GenreFilterSection = styled.div`
  margin-bottom: 24px;
`;

const GenreLabel = styled.p`
  color: #888;
  font-size: 14px;
  margin-bottom: 12px;
`;

const GenreList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const GenreButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.$isActive ? '#e50914' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$isActive ? '#e50914' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 20px;
  color: ${props => props.$isActive ? '#fff' : '#b3b3b3'};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isActive ? '#b20710' : 'rgba(255, 255, 255, 0.2)'};
    color: #fff;
  }
`;

const ResultsSection = styled.div``;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  gap: 12px;
`;

const ResultsTitle = styled.h2`
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;

  span {
    color: #e50914;
  }
`;

const ResultsCount = styled.p`
  color: #888;
  font-size: 14px;

  span {
    color: #e50914;
    font-weight: 600;
  }
`;

const PresetBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  margin-top: 6px;
  background: rgba(229, 9, 20, 0.12);
  color: #ff6b6b;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
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
  min-height: 300px;
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  color: #fff;
  font-size: 20px;
  margin-bottom: 8px;
`;

const EmptyText = styled.p`
  color: #888;
  font-size: 14px;
  max-width: 400px;
`;

const SuggestionSection = styled.div`
  margin-top: 40px;
`;

const SuggestionTitle = styled.h3`
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 16px;
`;

// 정렬/필터 컨트롤
const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const ControlLabel = styled.span`
  color: #b3b3b3;
  font-size: 13px;
`;

const SelectSmall = styled.select`
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
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

const ResetButton = styled.button`
  padding: 8px 12px;
  background: #e50914;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background:rgb(255, 100, 100);
    border-color:rgb(119, 22, 22);
  }
`;

const ControlsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`;

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isGenreLoading, setIsGenreLoading] = useState(true);
  const [sortField, setSortField] = useState('popularity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [minRating, setMinRating] = useState(0);
  const [presetLabel, setPresetLabel] = useState('');

  // Debounce 적용 (500ms)
  const debouncedQuery = useDebounce(searchQuery, 500);

  // 요일별 추천 장르 프리셋
  const weekdayPreset = useMemo(() => {
    const day = new Date().getDay(); // 0:Sun ... 6:Sat
    switch (day) {
      case 1: // Mon
        return { label: '무료한 월요일은 액션!', genres: [GENRE_IDS.ACTION] };
      case 2: // Tue
        return { label: '화요일엔 코미디!', genres: [GENRE_IDS.COMEDY] };
      case 3: // Wed
        return { label: '수요일엔 미스터리/스릴러', genres: [GENRE_IDS.MYSTERY, GENRE_IDS.THRILLER] };
      case 4: // Thu
        return { label: '목요일엔 SF', genres: [GENRE_IDS.SCIENCE_FICTION] };
      case 5: // Fri
        return { label: '불금에는 로맨스!', genres: [GENRE_IDS.ROMANCE] };
      case 6: // Sat
        return { label: '토요일엔 가족/애니메이션', genres: [GENRE_IDS.FAMILY, GENRE_IDS.ANIMATION] };
      case 0: // Sun
      default:
        return { label: '일요일엔 다큐/드라마', genres: [GENRE_IDS.DOCUMENTARY, GENRE_IDS.DRAMA] };
    }
  }, []);

  // 검색 또는 장르별 영화 가져오기 함수
  const fetchMovies = useCallback(async (page) => {
    if (debouncedQuery.trim()) {
      return searchMovies(debouncedQuery.trim(), page);
    } else if (selectedGenres.length > 0) {
      return getMoviesByGenres(selectedGenres, page);
    }
    return { results: [], total_results: 0, total_pages: 0 };
  }, [debouncedQuery, selectedGenres]);

  // 무한 스크롤 훅
  const {
    data: movies,
    isLoading,
    isLoadingMore,
    hasMore,
    totalResults,
    error,
    loadMoreRef,
    refresh
  } = useInfiniteScroll(fetchMovies, {
    initialPage: 1,
    enabled: !!(debouncedQuery.trim() || selectedGenres.length)
  });

  // 장르 목록 가져오기
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data.genres || []);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      } finally {
        setIsGenreLoading(false);
      }
    };
    fetchGenres();
  }, []);

  // 초기 렌더 시 요일별 추천 장르 적용 (검색어가 비어 있을 때만)
  useEffect(() => {
    if (!searchQuery.trim() && weekdayPreset.genres.length) {
      setSelectedGenres(weekdayPreset.genres);
      setPresetLabel(weekdayPreset.label);
    }
  }, [searchQuery, weekdayPreset]);

  // 검색어 또는 장르 변경 시 새로고침
  useEffect(() => {
    if (debouncedQuery.trim() || selectedGenres.length) {
      refresh();
    }
  }, [debouncedQuery, selectedGenres, refresh]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // 검색어 입력 시 장르 선택 해제
    if (e.target.value.trim()) {
      setSelectedGenres([]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleGenreClick = (genreId) => {
    setSelectedGenres((prev) => {
      const exists = prev.includes(genreId);
      const next = exists ? prev.filter((id) => id !== genreId) : [...prev, genreId];
      return next;
    });
    setSearchQuery(''); // 장르 선택 시 검색어 초기화
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setSortField('popularity');
    setSortOrder('desc');
    setMinRating(0);
    setPresetLabel('');
    refresh();
  };

  const handleSortChange = (e) => setSortField(e.target.value);
  const handleOrderChange = (e) => setSortOrder(e.target.value);
  const handleMinRatingChange = (e) => setMinRating(Number(e.target.value));

  // 정렬/필터 적용된 목록
  const processedMovies = useMemo(() => {
    if (!movies) return [];
    const filtered = movies.filter((m) => (m.vote_average || 0) >= minRating);
    const sorted = [...filtered].sort((a, b) => {
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
    return sorted;
  }, [movies, minRating, sortField, sortOrder]);

  const handleMovieClick = (movie) => {
    console.log('Movie clicked:', movie);
    // TODO: 모달 또는 상세 페이지 연결
  };

  const getResultTitle = () => {
    if (debouncedQuery.trim()) {
      return `"${debouncedQuery}" 검색 결과`;
    }
    if (selectedGenres.length) {
      const names = genres.filter(g => selectedGenres.includes(g.id)).map(g => g.name);
      return names.length ? `${names.join(', ')} 영화` : '선택한 장르 영화';
    }
    return '영화 검색';
  };

  const showResults = !!(debouncedQuery.trim() || selectedGenres.length);
  const showEmptyInitial = !showResults && !isLoading;

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        <SearchSection>
          <SearchTitle>영화 검색</SearchTitle>
          
          <SearchForm onSubmit={(e) => e.preventDefault()}>
            <SearchInputWrapper>
              <SearchIcon>🔍</SearchIcon>
              <SearchInput
                type="text"
                placeholder="영화 제목을 입력하세요..."
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
              />
              <ClearButton 
                type="button"
                $show={searchQuery.length > 0}
                onClick={handleClearSearch}
              >
                ✕
              </ClearButton>
            </SearchInputWrapper>
          </SearchForm>

          <GenreFilterSection>
            <GenreLabel>장르별 탐색 (여러 개 선택 가능)</GenreLabel>
            <GenreList>
              {isGenreLoading ? (
                <LoadingText>장르 로딩 중...</LoadingText>
              ) : (
                genres.map(genre => (
                  <GenreButton
                    key={genre.id}
                    $isActive={selectedGenres.includes(genre.id)}
                    onClick={() => handleGenreClick(genre.id)}
                  >
                    {genre.name}
                  </GenreButton>
                ))
              )}
            </GenreList>
          </GenreFilterSection>
        </SearchSection>

        <ResultsSection>
          {showResults && (
            <ResultsHeader>
              <ResultsTitle>
                {getResultTitle()}
                {presetLabel && (
                  <PresetBadge>{presetLabel}</PresetBadge>
                )}
              </ResultsTitle>
              {totalResults > 0 && (
                <ResultsCount>
                  총 <span>{totalResults.toLocaleString()}</span>개
                </ResultsCount>
              )}
            </ResultsHeader>
          )}

          {/* 정렬/필터 컨트롤 */}
          {showResults && (
            <ControlsRow>
              <ControlsGroup>
                <ControlLabel>정렬</ControlLabel>
                <SelectSmall value={sortField} onChange={handleSortChange}>
                  <option value="popularity">인기순</option>
                  <option value="vote_average">평점순</option>
                  <option value="release_date">개봉일순</option>
                  <option value="title">제목순</option>
                </SelectSmall>

                <ControlLabel>정렬 방향</ControlLabel>
                <SelectSmall value={sortOrder} onChange={handleOrderChange}>
                  <option value="desc">내림차순</option>
                  <option value="asc">오름차순</option>
                </SelectSmall>

                <ControlLabel>최소 평점</ControlLabel>
                <SelectSmall value={minRating} onChange={handleMinRatingChange}>
                  <option value={0}>전체</option>
                  <option value={6}>6.0+</option>
                  <option value={7}>7.0+</option>
                  <option value={8}>8.0+</option>
                  <option value={8.5}>8.5+</option>
                </SelectSmall>
              </ControlsGroup>
              <ResetButton type="button" onClick={handleResetFilters}>
                초기화
              </ResetButton>
            </ControlsRow>
          )}

          {/* 초기 상태 - 검색어/장르 없음 */}
          {showEmptyInitial && (
            <EmptyState>
              <EmptyIcon>🎬</EmptyIcon>
              <EmptyTitle>무엇을 찾고 계신가요?</EmptyTitle>
              <EmptyText>
                영화 제목을 검색하거나, 장르를 선택하여 원하는 영화를 찾아보세요.
              </EmptyText>
            </EmptyState>
          )}

          {/* 로딩 상태 */}
          {isLoading && showResults && (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>검색 중...</LoadingText>
            </LoadingContainer>
          )}

          {/* 검색 결과 */}
          {/* 에러 상태 */}
          {error && (
            <LoadingContainer>
              <LoadingText>오류가 발생했습니다: {error}</LoadingText>
              <ResetButton type="button" onClick={handleResetFilters}>
                다시 시도
              </ResetButton>
            </LoadingContainer>
          )}

          {!isLoading && showResults && !error && (
            <MovieGrid
              movies={processedMovies}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              loadMoreRef={loadMoreRef}
              onMovieClick={handleMovieClick}
              emptyMessage={
                debouncedQuery.trim() 
                  ? `"${debouncedQuery}"에 대한 검색 결과가 없습니다.`
                  : '해당 장르의 영화가 없습니다.'
              }
            />
          )}
        </ResultsSection>
      </MainContent>
    </PageContainer>
  );
};

export default Search;

