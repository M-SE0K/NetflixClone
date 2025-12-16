/**
 * Banner.tsx - 메인 배너 컴포넌트
 * 
 * 홈 화면 상단에 표시되는 영화 배너입니다.
 * 트렌딩 영화의 정보를 시각적으로 표시하고,
 * 재생, 상세보기, 찜하기 기능을 제공합니다.
 */

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { getImageUrl } from '../../api/tmdb';
import { useWishlist } from '../../hooks/useWishlist';
import MovieDetailModal from './MovieDetailModal';
import type { Movie } from '../../types';

// ============================================
// 타입 정의
// ============================================

interface BannerProps {
  movie: Movie | null;  // 표시할 영화 데이터
}

interface StyledProps {
  $imageUrl?: string;
  $loaded?: boolean;
  $isActive?: boolean;
}

// ============================================
// 애니메이션 정의
// ============================================

/** 페이드 인 애니메이션 */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/** 슬라이드 업 애니메이션 */
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

// ============================================
// Styled Components
// ============================================

/** 배너 컨테이너 - 전체 배너 영역 */
const BannerContainer = styled.div`
  position: relative;
  height: 80vh;
  min-height: 500px;
  max-height: 800px;
  width: 100%;
  display: flex;
  align-items: center;
  animation: ${fadeIn} 0.8s ease;
  margin-bottom: -100px;  /* 다음 섹션과 자연스러운 오버랩 */

  @media (max-width: 768px) {
    height: 60vh;
    min-height: 400px;
    margin-bottom: -50px;
  }
`;

/** 배경 이미지 - 영화 배경 사진 표시 */
const BackgroundImage = styled(motion.div)<StyledProps>`
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

  /* 그라디언트 오버레이: 텍스트 가독성 향상 */
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

/** 콘텐츠 영역 - 영화 정보 표시 */
const Content = styled(motion.div)`
  padding: 0 4%;
  max-width: 600px;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 5%;
    max-width: 100%;
  }
`;

/** 영화 제목 */
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

/** 영화 메타 정보 (평점, 개봉연도) */
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

/** 평점 표시 */
const Rating = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #46d369;  /* 넷플릭스 스타일 녹색 */
  font-weight: 700;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

/** 개봉 연도 */
const Year = styled.span`
  color: #b3b3b3;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

/** 줄거리 (4줄 제한) */
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

/** 버튼 그룹 */
const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  animation: ${slideUp} 0.6s ease 0.5s both;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

/** 기본 버튼 스타일 */
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

/** 재생 버튼 (흰색 배경) */
const PlayButton = styled(Button)`
  background: #fff;
  color: #141414;

  &:hover {
    background: rgba(255, 255, 255, 0.85);
    transform: scale(1.05);
  }
`;

/** 상세정보 버튼 (회색 배경) */
const InfoButton = styled(Button)`
  background: rgba(109, 109, 110, 0.7);
  color: #fff;

  &:hover {
    background: rgba(109, 109, 110, 0.5);
  }
`;

/** 찜 버튼 (토글 가능) */
const WishlistButton = styled(Button)<StyledProps>`
  background: ${props => props.$isActive ? '#e50914' : 'rgba(109, 109, 110, 0.7)'};
  color: #fff;
  min-width: 48px;
  padding: 12px;

  &:hover {
    background: ${props => props.$isActive ? '#b20710' : 'rgba(109, 109, 110, 0.5)'};
    transform: scale(1.1);
  }
`;

// ============================================
// 컴포넌트
// ============================================

/**
 * Banner 컴포넌트
 * 
 * 홈 화면의 메인 배너로, 트렌딩 영화의 정보를 표시합니다.
 * 10초마다 자동으로 다음 영화로 전환됩니다 (Redux로 관리)
 * 
 * @param movie - 표시할 영화 데이터
 */
const Banner = ({ movie }: BannerProps) => {
  // 이미지 로딩 상태
  const [imageLoaded, setImageLoaded] = useState(false);
  // 상세보기 모달 표시 상태
  const [showDetail, setShowDetail] = useState(false);
  // 찜 목록 관련 함수
  const { isInWishlist, toggleWishlist } = useWishlist();

  // 배경 이미지 URL 생성
  const imageUrl = getImageUrl(movie?.backdrop_path ?? null, 'backdrop', 'original');
  // 현재 영화가 찜 목록에 있는지 확인
  const isWishlisted = movie ? isInWishlist(movie.id) : false;

  /**
   * 이미지 프리로딩
   * 배경 이미지를 미리 로드하여 부드러운 전환 구현
   */
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

  // 영화 데이터가 없으면 렌더링하지 않음
  if (!movie) return null;

  // 개봉 연도 추출 (YYYY-MM-DD에서 YYYY만)
  const releaseYear = movie.release_date?.split('-')[0] || '';
  // 평점 포맷팅 (소수점 1자리)
  const rating = movie.vote_average?.toFixed(1) || 'N/A';

  return (
    <BannerContainer>
      {/* 배경 이미지 - 애니메이션 적용 */}
      <AnimatePresence mode="wait">
        {imageUrl && imageLoaded && (
          <BackgroundImage
            key={movie.id || imageUrl}
            $imageUrl={imageUrl}
            $loaded={imageLoaded}
            variants={{
              initial: { opacity: 0, x: 50 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: -50 }
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>
      
      {/* 콘텐츠 영역 - 영화 정보 */}
      <AnimatePresence mode="wait">
        <Content
          key={movie.id || imageUrl}
          variants={{
            initial: { opacity: 0, x: 35 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -35 }
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <Title>{movie.title}</Title>
          
          <Info>
            <Rating>⭐ {rating}</Rating>
            <Year>{releaseYear}</Year>
          </Info>

          <Overview>{movie.overview || '줄거리 정보가 없습니다.'}</Overview>

          {/* 액션 버튼 그룹 */}
          <ButtonGroup>
            <PlayButton>
              ▶ 재생
            </PlayButton>
            <InfoButton onClick={() => setShowDetail(true)}>
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
      </AnimatePresence>

      {/* 상세보기 모달 */}
      {showDetail && (
        <MovieDetailModal
          movie={movie}
          onClose={() => setShowDetail(false)}
        />
      )}
    </BannerContainer>
  );
};

export default Banner;
