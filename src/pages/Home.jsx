import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '../components/Header';
import Banner from '../components/Banner';
import MovieRow from '../components/MovieRow';
import { getHomePageData } from '../api/tmdb';

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
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #141414;
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
  width: 50px;
  height: 50px;
  border: 3px solid rgba(229, 9, 20, 0.3);
  border-radius: 50%;
  border-top-color: #e50914;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: #fff;
  font-size: 16px;
  animation: ${pulse} 1.5s ease-in-out infinite;
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

const Home = () => {
  const [movieData, setMovieData] = useState(null);
  const [bannerMovie, setBannerMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getHomePageData();
      setMovieData(data);
      
      // 트렌딩 영화 중 하나를 배너로 선택
      if (data.trending && data.trending.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(5, data.trending.length));
        setBannerMovie(data.trending[randomIndex]);
      }
    } catch (err) {
      console.error('Failed to fetch home page data:', err);
      setError('영화 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMovieClick = (movie) => {
    // TODO: 영화 상세 모달 또는 페이지 구현
    console.log('Movie clicked:', movie);
  };

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
        <Banner movie={bannerMovie} />
        
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
            title="🎯 개봉 예정"
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

