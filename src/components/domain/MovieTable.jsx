import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { getImageUrl } from '../../api/tmdb';
import { useWishlist } from '../../hooks/useWishlist.jsx';
import MovieDetailModal from './MovieDetailModal';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: rgba(20, 20, 20, 0.8);
  border-radius: 8px;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1a1a1a;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const TableHead = styled.thead`
  background: rgba(229, 9, 20, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TableHeader = styled.th`
  padding: 16px 12px;
  text-align: left;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  cursor: ${props => props.$sortable ? 'pointer' : 'default'};
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.$sortable ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
  }

  ${props => props.$sorted && `
    color: #e50914;
  `}
`;

const SortIcon = styled.span`
  margin-left: 6px;
  font-size: 10px;
  opacity: ${props => props.$active ? 1 : 0.3};
`;

const TableBody = styled.tbody``;

const shuffleIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(14px) scale(0.98) rotate(-1deg);
  }
  60% {
    opacity: 1;
    transform: translateY(-4px) scale(1.01) rotate(1.2deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  animation: ${shuffleIn} 0.45s ease forwards;
  animation-delay: ${props => props.$delay || 0}ms;
  opacity: 0;
  min-height: 150px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 8px 26px rgba(0,0,0,0.25);
  }
`;

const TableCell = styled.td`
  padding: 16px 14px;
  color: #e5e5e5;
  font-size: 14px;
  vertical-align: middle;
`;

const PosterCell = styled(TableCell)`
  width: 150px;
  padding: 10px 14px;
`;

const PosterImage = styled.img`
  width: 250px;
  height: 200px;
  object-fit: cover;
  border-radius: 6px;
  background: #333;
`;

const PosterPlaceholder = styled.div`
  width: 72px;
  height: 108px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const TitleCell = styled(TableCell)`
  max-width: 300px;
`;

const MovieTitle = styled.div`
  color: #fff;
  font-weight: 600;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MovieOverview = styled.div`
  color: #888;
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RatingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${props => {
    const rating = parseFloat(props.$rating);
    if (rating >= 8) return 'rgba(70, 211, 105, 0.2)';
    if (rating >= 6) return 'rgba(255, 193, 7, 0.2)';
    return 'rgba(229, 9, 20, 0.2)';
  }};
  color: ${props => {
    const rating = parseFloat(props.$rating);
    if (rating >= 8) return '#46d369';
    if (rating >= 6) return '#ffc107';
    return '#e50914';
  }};
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
`;

const WishlistButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${props => props.$isActive ? '#e50914' : 'rgba(255,255,255,0.3)'};
  background: ${props => props.$isActive ? '#e50914' : 'transparent'};
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$isActive ? '#b20710' : 'rgba(255,255,255,0.1)'};
    border-color: ${props => props.$isActive ? '#b20710' : '#fff'};
    transform: scale(1.1);
  }
`;

const GenreBadge = styled.span`
  display: inline-block;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #b3b3b3;
  border-radius: 4px;
  font-size: 11px;
  margin-right: 4px;
  margin-bottom: 4px;
`;

const MovieTable = ({ 
  movies, 
  onSort, 
  sortField, 
  sortOrder,
  onMovieClick 
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageErrors, setImageErrors] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const handleImageError = (movieId) => {
    setImageErrors(prev => ({ ...prev, [movieId]: true }));
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const columns = [
    { key: 'poster', label: '', sortable: false },
    { key: 'title', label: '제목', sortable: true },
    { key: 'release_date', label: '개봉일', sortable: true },
    { key: 'vote_average', label: '평점', sortable: true },
    { key: 'vote_count', label: '투표수', sortable: true },
    { key: 'popularity', label: '인기도', sortable: true },
    { key: 'wishlist', label: '찜', sortable: false }
  ];

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <tr>
            {columns.map(col => (
              <TableHeader 
                key={col.key}
                $sortable={col.sortable}
                $sorted={sortField === col.key}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.label}
                {col.sortable && (
                  <SortIcon $active={sortField === col.key}>
                    {getSortIcon(col.key)}
                  </SortIcon>
                )}
              </TableHeader>
            ))}
          </tr>
        </TableHead>
        <TableBody>
          {movies.map((movie, index) => {
            const posterUrl = getImageUrl(movie.poster_path, 'poster', 'small');
            const isWishlisted = isInWishlist(movie.id);
            const releaseYear = movie.release_date?.split('-')[0] || '-';

            return (
              <TableRow 
                key={`${movie.id}-${index}`} 
                $delay={Math.min(index * 30, 250)}
                onClick={() => {
                  setSelectedMovie(movie);
                  onMovieClick?.(movie);
                }}
                style={{ cursor: 'pointer' }}
              >
                <PosterCell>
                  {posterUrl && !imageErrors[movie.id] ? (
                    <PosterImage 
                      src={posterUrl} 
                      alt={movie.title}
                      loading="lazy"
                      onError={() => handleImageError(movie.id)}
                      onClick={(e) => { e.stopPropagation(); setSelectedMovie(movie); }}
                    />
                  ) : (
                    <PosterPlaceholder onClick={(e) => { e.stopPropagation(); setSelectedMovie(movie); }}>
                      🎬
                    </PosterPlaceholder>
                  )}
                </PosterCell>
                
                <TitleCell 
                  onClick={(e) => { e.stopPropagation(); setSelectedMovie(movie); onMovieClick?.(movie); }} 
                  style={{ cursor: 'pointer' }}
                >
                  <MovieTitle>{movie.title}</MovieTitle>
                  <MovieOverview>{movie.overview || '줄거리 정보 없음'}</MovieOverview>
                </TitleCell>
                
                <TableCell>{releaseYear}</TableCell>
                
                <TableCell>
                  <RatingBadge $rating={movie.vote_average}>
                    ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
                  </RatingBadge>
                </TableCell>
                
                <TableCell>
                  {movie.vote_count?.toLocaleString() || '-'}
                </TableCell>
                
                <TableCell>
                  {movie.popularity?.toFixed(0) || '-'}
                </TableCell>
                
                <TableCell>
                  <WishlistButton
                    $isActive={isWishlisted}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(movie);
                    }}
                    title={isWishlisted ? '찜 해제' : '찜하기'}
                  >
                    {isWishlisted ? '✓' : '+'}
                  </WishlistButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {selectedMovie && (
        <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </TableContainer>
  );
};

export default MovieTable;

