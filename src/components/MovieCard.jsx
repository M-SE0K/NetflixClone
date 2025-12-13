import { useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { getImageUrl } from '../api/tmdb';
import { useWishlist } from '../hooks/useWishlist.jsx';

const scaleUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const CardContainer = styled.div`
  position: relative;
  flex-shrink: 0;
  width: ${props => props.$isLarge ? '200px' : '160px'};
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  overflow: hidden;

  &:hover {
    transform: scale(1.08);
    z-index: 10;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
  }

  @media (max-width: 768px) {
    width: ${props => props.$isLarge ? '150px' : '120px'};
  }
`;

const PosterImage = styled.img`
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 4px;
  background: #222;
  transition: filter 0.3s ease;

  ${CardContainer}:hover & {
    filter: brightness(0.7);
  }
`;

const PosterPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
`;

const HoverOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 12px;
  border-radius: 4px;

  ${CardContainer}:hover & {
    opacity: 1;
  }
`;

const HoverContent = styled.div`
  animation: ${scaleUp} 0.2s ease;
`;

const MovieTitle = styled.h4`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const MovieInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Rating = styled.span`
  color: #46d369;
  font-size: 12px;
  font-weight: 600;
`;

const Year = styled.span`
  color: #b3b3b3;
  font-size: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const IconButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: ${props => props.$isActive ? '#e50914' : 'rgba(42, 42, 42, 0.8)'};
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isActive ? '#b20710' : 'rgba(255, 255, 255, 0.2)'};
    border-color: #fff;
    transform: scale(1.1);
  }
`;

const WishlistBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e50914;
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'scale(1)' : 'scale(0)'};
  transition: all 0.3s ease;
`;

// 상세 모달
const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const DetailContent = styled.div`
  background: #111;
  border-radius: 10px;
  width: min(900px, 95vw);
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 20px;
  padding: 20px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailPoster = styled.img`
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
  background: #222;
`;

const DetailBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #fff;
`;

const DetailTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
`;

const DetailMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #b3b3b3;
  font-size: 14px;
`;

const DetailOverview = styled.p`
  color: #d9d9d9;
  line-height: 1.6;
  font-size: 14px;
  margin: 0;
`;

const CloseButton = styled.button`
  align-self: flex-end;
  padding: 8px 14px;
  background: #e50914;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s;

  &:hover {
    background: #b20710;
  }
`;

const DetailActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const MovieCard = ({ movie, isLarge = false, onCardClick }) => {
  const [imageError, setImageError] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!movie) return null;

  const posterUrl = getImageUrl(movie.poster_path, 'poster', isLarge ? 'large' : 'medium');
  const isWishlisted = isInWishlist(movie.id);
  const releaseYear = movie.release_date?.split('-')[0] || '';
  const rating = movie.vote_average?.toFixed(1) || 'N/A';

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(movie);
  };

  const openDetail = () => setShowDetail(true);
  const closeDetail = () => setShowDetail(false);

  const handleCardClick = () => {
    openDetail(); // 카드 어디를 눌러도 상세 표시
    if (onCardClick) {
      onCardClick(movie);
    }
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    openDetail();
  };

  return (
    <CardContainer $isLarge={isLarge} onClick={handleCardClick}>
      <WishlistBadge $show={isWishlisted}>✓</WishlistBadge>
      
      {posterUrl && !imageError ? (
        <PosterImage 
          src={posterUrl} 
          alt={movie.title}
          loading="lazy"
          onError={() => setImageError(true)}
          onClick={(e) => {
            e.stopPropagation();
            openDetail();
          }}
          style={{ cursor: 'pointer' }}
        />
      ) : (
        <PosterPlaceholder
          onClick={(e) => {
            e.stopPropagation();
            openDetail();
          }}
          style={{ cursor: 'pointer' }}
        >
          🎬
        </PosterPlaceholder>
      )}

      <HoverOverlay>
        <HoverContent>
          <MovieTitle>{movie.title}</MovieTitle>
          <MovieInfo>
            <Rating>⭐ {rating}</Rating>
            <Year>{releaseYear}</Year>
          </MovieInfo>
          <ButtonGroup>
            <IconButton title="재생">▶</IconButton>
            <IconButton 
              $isActive={isWishlisted}
              onClick={handleWishlistClick}
              title={isWishlisted ? '내 리스트에서 제거' : '내 리스트에 추가'}
            >
              {isWishlisted ? '✓' : '+'}
            </IconButton>
            <IconButton title="상세 정보" onClick={handleInfoClick}>ℹ</IconButton>
          </ButtonGroup>
        </HoverContent>
      </HoverOverlay>

      {/* 상세 모달 */}
      {showDetail &&
        createPortal(
          <DetailOverlay onClick={closeDetail}>
            <DetailContent onClick={(e) => e.stopPropagation()}>
              {posterUrl && !imageError ? (
                <DetailPoster src={posterUrl} alt={movie.title} />
              ) : (
                <DetailPoster
                  as="div"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#222',
                    color: '#888',
                    fontSize: '40px',
                  }}
                >
                  🎬
                </DetailPoster>
              )}
              <DetailBody>
                <DetailTitle>{movie.title}</DetailTitle>
                <DetailMeta>
                  <span>⭐ {rating}</span>
                  <span>·</span>
                  <span>{releaseYear}</span>
                </DetailMeta>
                <DetailOverview>{movie.overview || '줄거리 정보가 없습니다.'}</DetailOverview>
              <DetailActions>
                <IconButton
                  $isActive={isWishlisted}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(movie);
                  }}
                  title={isWishlisted ? '내 리스트에서 제거' : '내 리스트에 추가'}
                  style={{ width: 42, height: 42, fontSize: 14 }}
                >
                  {isWishlisted ? '✓' : '+'}
                </IconButton>
                <CloseButton onClick={closeDetail}>닫기</CloseButton>
              </DetailActions>
              </DetailBody>
            </DetailContent>
          </DetailOverlay>,
          document.body
        )}
    </CardContainer>
  );
};

export default MovieCard;

