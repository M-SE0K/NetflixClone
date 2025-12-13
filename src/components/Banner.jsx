import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { getImageUrl } from '../api/tmdb';
import { useWishlist } from '../hooks/useWishlist.jsx';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const BannerContainer = styled.div`
  position: relative;
  height: 80vh;
  min-height: 500px;
  max-height: 800px;
  width: 100%;
  display: flex;
  align-items: center;
  animation: ${fadeIn} 0.8s ease;
  margin-bottom: -100px;

  @media (max-width: 768px) {
    height: 60vh;
    min-height: 400px;
    margin-bottom: -50px;
  }
`;

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center top;
  z-index: 0;
  opacity: ${props => (props.$loaded ? 1 : 0)};
  transition: opacity 0.35s ease;
  background-color: #0f0f0f;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to right,
      rgba(20, 20, 20, 0.9) 0%,
      rgba(20, 20, 20, 0.6) 40%,
      transparent 60%
    ),
    linear-gradient(
      to top,
      rgba(20, 20, 20, 1) 0%,
      rgba(20, 20, 20, 0.4) 30%,
      transparent 50%
    );
  }

  @media (max-width: 768px) {
    &::after {
      background: linear-gradient(
        to right,
        rgba(20, 20, 20, 0.95) 0%,
        rgba(20, 20, 20, 0.7) 100%
      ),
      linear-gradient(
        to top,
        rgba(20, 20, 20, 1) 0%,
        transparent 60%
      );
    }
  }
`;

const Content = styled.div`
  padding: 0 4%;
  max-width: 600px;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 5%;
    max-width: 100%;
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 16px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
  animation: ${slideUp} 0.6s ease 0.2s both;
  line-height: 1.1;

  @media (max-width: 1024px) {
    font-size: 2.5rem;
  }

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 12px;
  }
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  animation: ${slideUp} 0.6s ease 0.3s both;

  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 12px;
  }
`;

const Rating = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #46d369;
  font-weight: 700;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Year = styled.span`
  color: #b3b3b3;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Overview = styled.p`
  font-size: 1.1rem;
  color: #e5e5e5;
  line-height: 1.6;
  margin-bottom: 24px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  animation: ${slideUp} 0.6s ease 0.4s both;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    -webkit-line-clamp: 3;
    margin-bottom: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  animation: ${slideUp} 0.6s ease 0.5s both;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 14px;
  }
`;

const PlayButton = styled(Button)`
  background: #fff;
  color: #141414;

  &:hover {
    background: rgba(255, 255, 255, 0.85);
    transform: scale(1.05);
  }
`;

const InfoButton = styled(Button)`
  background: rgba(109, 109, 110, 0.7);
  color: #fff;

  &:hover {
    background: rgba(109, 109, 110, 0.5);
  }
`;

const WishlistButton = styled(Button)`
  background: ${props => props.$isActive ? '#e50914' : 'rgba(109, 109, 110, 0.7)'};
  color: #fff;
  min-width: 48px;
  padding: 12px;

  &:hover {
    background: ${props => props.$isActive ? '#b20710' : 'rgba(109, 109, 110, 0.5)'};
    transform: scale(1.1);
  }
`;

const Banner = ({ movie }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const imageUrl = getImageUrl(movie?.backdrop_path, 'backdrop', 'original');
  const isWishlisted = movie ? isInWishlist(movie.id) : false;

  useEffect(() => {
    let isMounted = true;
    setImageLoaded(false);
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        if (isMounted) setImageLoaded(true);
      };
    }
    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  if (!movie) return null;

  const releaseYear = movie.release_date?.split('-')[0] || '';
  const rating = movie.vote_average?.toFixed(1) || 'N/A';

  return (
    <BannerContainer>
      {imageUrl && (
        <BackgroundImage $imageUrl={imageUrl} $loaded={imageLoaded} />
      )}
      
      <Content>
        <Title>{movie.title}</Title>
        
        <Info>
          <Rating>⭐ {rating}</Rating>
          <Year>{releaseYear}</Year>
        </Info>

        <Overview>{movie.overview || '줄거리 정보가 없습니다.'}</Overview>

        <ButtonGroup>
          <PlayButton>
            ▶ 재생
          </PlayButton>
          <InfoButton>
            상세 정보
          </InfoButton>
          <WishlistButton 
            $isActive={isWishlisted}
            onClick={() => toggleWishlist(movie)}
            title={isWishlisted ? '내 리스트에서 제거' : '내 리스트에 추가'}
          >
            {isWishlisted ? '✓' : '+'}
          </WishlistButton>
        </ButtonGroup>
      </Content>
    </BannerContainer>
  );
};

export default Banner;

