import styled, { keyframes } from 'styled-components';
import MovieCard from './MovieCard';
import type { Movie } from '../../types';

interface MovieGridProps {
  movies: Movie[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  loadMoreRef?: (node: HTMLDivElement | null) => void;
  onMovieClick?: (movie: Movie) => void;
  emptyMessage?: string;
}

interface GridItemProps {
  $delay: number;
  $tilt: number;
}

const shuffleIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.96) rotate(-2deg);
  }
  60% {
    opacity: 1;
    transform: translateY(-6px) scale(1.02) rotate(1.5deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  padding: 10px 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
`;

const GridItem = styled.div<GridItemProps>`
  animation: ${shuffleIn} 0.5s ease forwards;
  animation-delay: ${props => props.$delay}ms;
  opacity: 0;
  transform-origin: center;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-8px) scale(1.02) rotate(${props => (props.$tilt ?? 0) * -0.35}deg);
    box-shadow: 0 16px 40px rgba(0,0,0,0.35);
  }
`;

const LoadingContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(229, 9, 20, 0.3);
  border-radius: 50%;
  border-top-color: #e50914;
  animation: ${spin} 1s linear infinite;
`;

const LoadMoreTrigger = styled.div`
  grid-column: 1 / -1;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EndMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 30px;
  color: #888;
  font-size: 14px;
`;

const EmptyMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #888;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  color: #fff;
  font-size: 18px;
  margin-bottom: 8px;
`;

const EmptyText = styled.p`
  font-size: 14px;
`;

const MovieGrid = ({ 
  movies, 
  isLoading = false, 
  isLoadingMore = false, 
  hasMore = false, 
  loadMoreRef,
  onMovieClick,
  emptyMessage = '영화가 없습니다.'
}: MovieGridProps) => {
  if (!isLoading && (!movies || movies.length === 0)) {
    return (
      <GridContainer>
        <EmptyMessage>
          <EmptyIcon>🎬</EmptyIcon>
          <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
          <EmptyText>{emptyMessage}</EmptyText>
        </EmptyMessage>
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      {movies.map((movie, index) => (
        <GridItem 
          key={`${movie.id}-${index}`} 
          $delay={Math.min(index * 30, 300)}
          $tilt={(index % 7) - 3}
        >
          <MovieCard 
            movie={movie} 
            onCardClick={onMovieClick}
          />
        </GridItem>
      ))}
      
      {/* 무한 스크롤 트리거 */}
      {hasMore && (
        <LoadMoreTrigger ref={loadMoreRef}>
          {isLoadingMore && <LoadingSpinner />}
        </LoadMoreTrigger>
      )}
      
      {/* 더 이상 데이터 없음 */}
      {!hasMore && movies.length > 0 && (
        <EndMessage>
          모든 영화를 불러왔습니다 🎉
        </EndMessage>
      )}
      
      {/* 초기 로딩 */}
      {isLoading && (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      )}
    </GridContainer>
  );
};

export default MovieGrid;

