import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextBanner, resetBanner } from '../store';
import styled, { keyframes } from 'styled-components';
import Header from '../components/Header';
import Banner from '../components/Banner';
import MovieRow from '../components/MovieRow';
import { getHomePageData, getImageUrl } from '../api/tmdb';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at 20% 20%, rgba(229, 9, 20, 0.08), transparent 30%),
              radial-gradient(circle at 80% 10%, rgba(109, 109, 110, 0.08), transparent 30%),
              #0f0f0f;
  animation: ${fadeIn} 0.5s ease;
`;

const MainContent = styled.main`
  padding-top: 68px;
  padding-bottom: 50px;

  @media (max-width: 768px) {
    padding-top: 56px;
    padding-bottom: 30px;
  }
`;

const RowsContainer = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 26px;
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 20% 20%, rgba(229, 9, 20, 0.08), transparent 35%),
              radial-gradient(circle at 80% 10%, rgba(109, 109, 110, 0.08), transparent 35%),
              #0f0f0f;
  gap: 20px;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const LoadingSpinner = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: conic-gradient(from 90deg, rgba(229, 9, 20, 0.9), rgba(255, 255, 255, 0.1), rgba(229, 9, 20, 0.9));
  mask: radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 8px));
  animation: ${spin} 1s linear infinite;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
`;

const LoadingText = styled.p`
  color: #fff;
  font-size: 16px;
  animation: ${pulse} 1.5s ease-in-out infinite;
  letter-spacing: 0.5px;
`;

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #141414;
  padding: 20px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h2`
  color: #fff;
  font-size: 24px;
  margin-bottom: 12px;
`;

const ErrorMessage = styled.p`
  color: #b3b3b3;
  font-size: 16px;
  margin-bottom: 24px;
  max-width: 400px;
`;

const RetryButton = styled.button`
  background: #e50914;
  color: #fff;
  border: none;
  padding: 12px 32px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f40612;
    transform: scale(1.05);
  }
`;

const HeroSpacer = styled.div`
  margin-bottom: 18px;
`;

const GlassSection = styled.section`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 18px 18px 6px;
  margin: 0 4% 28px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);

  @media (max-width: 768px) {
    margin: 0 3% 20px;
    padding: 14px 14px 2px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
  padding: 0 6px;
`;

const SectionTitle = styled.h2`
  color: #fff;
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
`;

const SectionSubtitle = styled.span`
  color: #b3b3b3;
  font-size: 0.95rem;
`;

const HighlightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
`;

const HighlightCard = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(34,34,34,0.9), rgba(20,20,20,0.9));
  border: 1px solid rgba(255,255,255,0.06);
  min-height: 130px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  display: grid;
  grid-template-columns: 1fr 1.1fr;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightThumb = styled.div`
  background-image: ${({ $image }) => `url(${$image || ''})`};
  background-size: cover;
  background-position: center;
  filter: saturate(1.1);
  min-height: 120px;
`;

const HighlightBody = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HighlightLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(229, 9, 20, 0.14);
  color: #ff7171;
  font-size: 12px;
  font-weight: 700;
  width: fit-content;
`;

const HighlightTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 1rem;
  line-height: 1.3;
`;

const HighlightMeta = styled.div`
  display: flex;
  gap: 10px;
  color: #cfcfcf;
  font-size: 12px;
  flex-wrap: wrap;
`;

const Dot = styled.span`
  color: #555;
`;

const Home = () => {
  const [movieData, setMovieData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const bannerIndex = useSelector(state => state.ui.bannerIndex);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getHomePageData();
      setMovieData(data);
      dispatch(resetBanner());
    } catch (err) {
      console.error('Failed to fetch home page data:', err);
      setError('영화 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const bannerCandidates = useMemo(() => {
    if (!movieData || !movieData.trending) return [];
    return movieData.trending.slice(0, 5);
  }, [movieData]);

  // 10초 자동 슬라이드 (수동 조작 없음)
  useEffect(() => {
    if (!bannerCandidates.length) return;
    const interval = setInterval(() => {
      dispatch(nextBanner(bannerCandidates.length));
    }, 10000);
    return () => clearInterval(interval);
  }, [bannerCandidates, dispatch]);

  const bannerMovie = bannerCandidates[bannerIndex];

  useEffect(() => {
    fetchData();
  }, []);

  const handleMovieClick = (movie) => {
    // TODO: 영화 상세 모달 또는 페이지 구현
    console.log('Movie clicked:', movie);
  };

  const getHomeThumb = (m) => {
    if (!m) return '';
    return getImageUrl(m.backdrop_path, 'backdrop', 'large') 
        || getImageUrl(m.poster_path, 'poster', 'large')
        || '';
  };

  const highlightItems = useMemo(() => {
    if (!movieData) return [];
    return [
      { label: '오늘의 트렌드', movie: movieData.trending?.[0] },
      { label: '지금 상영', movie: movieData.nowPlaying?.[0] },
      { label: '최고 평점', movie: movieData.topRated?.[0] },
      { label: '곧 만나요', movie: movieData.upcoming?.[0] },
      { label: '액션 한 스푼', movie: movieData.actionMovies?.[0] },
      { label: '웃음 보장', movie: movieData.comedyMovies?.[0] },
    ].filter(item => item.movie);
  }, [movieData]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>영화 정보를 불러오는 중...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>😢</ErrorIcon>
        <ErrorTitle>오류가 발생했습니다</ErrorTitle>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={fetchData}>다시 시도</RetryButton>
      </ErrorContainer>
    );
  }

  if (!movieData) return null;

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        <HeroSpacer>
          <Banner movie={bannerMovie} />
        </HeroSpacer>

        <GlassSection>
          <SectionHeader>
            <SectionTitle>하이라이트 믹스</SectionTitle>
            <SectionSubtitle>오늘의 무드에 어울리는 큐레이션</SectionSubtitle>
          </SectionHeader>
          <HighlightGrid>
            {highlightItems.map((item, idx) => {
              const backdrop = getHomeThumb(item.movie);
              return (
                <HighlightCard key={`${item.label}-${item.movie.id}-${idx}`}>
                  <HighlightThumb $image={backdrop} />
                  <HighlightBody>
                    <HighlightLabel>{item.label}</HighlightLabel>
                    <HighlightTitle>{item.movie.title}</HighlightTitle>
                    <HighlightMeta>
                      {item.movie.vote_average ? <span>⭐ {item.movie.vote_average.toFixed(1)}</span> : null}
                      {item.movie.release_date ? (
                        <>
                          <Dot>•</Dot>
                          <span>{item.movie.release_date.split('-')[0]}</span>
                        </>
                      ) : null}
                      {item.movie.original_language ? (
                        <>
                          <Dot>•</Dot>
                          <span>{(item.movie.original_language || '').toUpperCase()}</span>
                        </>
                      ) : null}
                    </HighlightMeta>
                  </HighlightBody>
                </HighlightCard>
              );
            })}
          </HighlightGrid>
        </GlassSection>
        
        <RowsContainer>
          <MovieRow 
            title="지금 뜨는 콘텐츠"
            movies={movieData.trending}
            isLargeRow
            onMovieClick={handleMovieClick}
          />
          
          <MovieRow 
            title="현재 상영 중"
            movies={movieData.nowPlaying}
            onMovieClick={handleMovieClick}
          />
          
          <MovieRow 
            title="인기 영화"
            movies={movieData.popular}
            onMovieClick={handleMovieClick}
          />
          
          <MovieRow 
            title="최고 평점"
            movies={movieData.topRated}
            isLargeRow
            onMovieClick={handleMovieClick}
          />
          
          <MovieRow 
            title="개봉 예정"
            movies={movieData.upcoming}
            onMovieClick={handleMovieClick}
          />
          
          <MovieRow 
            title="액션 영화"
            movies={movieData.actionMovies}
            onMovieClick={handleMovieClick}
          />
          
          <MovieRow 
            title="코미디 영화"
            movies={movieData.comedyMovies}
            onMovieClick={handleMovieClick}
          />
          
          <MovieRow 
            title="공포 영화"
            movies={movieData.horrorMovies}
            onMovieClick={handleMovieClick}
          />
          
          <MovieRow 
            title="로맨스 영화"
            movies={movieData.romanceMovies}
            isLargeRow
            onMovieClick={handleMovieClick}
          />
          
          <MovieRow 
            title="다큐멘터리"
            movies={movieData.documentaries}
            onMovieClick={handleMovieClick}
          />
        </RowsContainer>
      </MainContent>
    </PageContainer>
  );
};

export default Home;

