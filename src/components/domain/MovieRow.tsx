/**
 * MovieRow.tsx - 영화 가로 슬라이더 컴포넌트
 * 
 * 카테고리별 영화 목록을 가로 스크롤 형태로 표시합니다.
 * "모두 보기" 클릭 시 전체 영화를 팝업 모달로 표시하며,
 * 무한 스크롤을 지원합니다.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { X } from 'lucide-react';
import MovieCard from './MovieCard';
import type { Movie, TMDBResponse } from '../../types';

// ============================================
// 타입 정의
// ============================================

interface MovieRowProps {
  title: string;                           // 카테고리 제목
  movies: Movie[];                         // 초기 영화 목록
  isLargeRow?: boolean;                    // 큰 카드 사용 여부
  onMovieClick?: (movie: Movie) => void;   // 영화 클릭 콜백
  fetchMore?: (page: number) => Promise<TMDBResponse<Movie>>;  // 추가 데이터 로드 함수
}

interface SliderButtonProps {
  $direction: 'left' | 'right';
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
    transform: translateY(40px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

/** 스피너 회전 애니메이션 */
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// ============================================
// Styled Components - Row
// ============================================

const RowContainer = styled.div`
  margin-bottom: 40px;
  position: relative;

  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const RowHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4%;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    padding: 0 3%;
    margin-bottom: 8px;
  }
`;

const RowTitle = styled.h2`
  color: #e5e5e5;
  font-size: 1.4rem;
  font-weight: 700;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ExploreLink = styled.span`
  color: #54b9c5;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;

  ${RowContainer}:hover & {
    opacity: 1;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const SliderWrapper = styled.div`
  position: relative;
  padding: 0 4%;

  @media (max-width: 768px) {
    padding: 0 3%;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 10px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const SliderButton = styled.button<SliderButtonProps>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$direction === 'left' ? 'left: 0;' : 'right: 0;'}
  z-index: 5;
  width: 48px;
  height: 100%;
  max-height: 300px;
  background: rgba(20, 20, 20, 0.7);
  border: none;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;

  ${RowContainer}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(20, 20, 20, 0.9);
  }

  &:disabled {
    opacity: 0 !important;
    cursor: default;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

// ============================================
// Styled Components - Modal
// ============================================

/** 모달 오버레이 (배경) */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

/** 모달 컨텐츠 영역 */
const ModalContent = styled.div`
  background: linear-gradient(180deg, #181818 0%, #141414 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.4s ease;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 768px) {
    max-height: calc(100vh - 40px);
    border-radius: 12px;
  }
`;

/** 모달 헤더 */
const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  background: linear-gradient(180deg, #1a1a1a 0%, #181818 100%);
  border-radius: 16px 16px 0 0;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 16px 20px;
    border-radius: 12px 12px 0 0;
  }
`;

/** 모달 제목 */
const ModalTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    gap: 8px;
  }
`;

/** 영화 개수 뱃지 */
const CountBadge = styled.span`
  background: rgba(229, 9, 20, 0.15);
  color: #e50914;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 8px;
  }
`;

/** 닫기 버튼 */
const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

/** 모달 바디 (스크롤 영역) */
const ModalBody = styled.div`
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

/** 영화 그리드 */
const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

/** 그리드 아이템 래퍼 */
const GridItem = styled.div`
  animation: ${fadeIn} 0.4s ease;
  animation-fill-mode: both;

  /* 순차적 애니메이션 딜레이 */
  &:nth-child(1) { animation-delay: 0.05s; }
  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.15s; }
  &:nth-child(4) { animation-delay: 0.2s; }
  &:nth-child(5) { animation-delay: 0.25s; }
  &:nth-child(6) { animation-delay: 0.3s; }
  &:nth-child(n+7) { animation-delay: 0.35s; }
`;

/** 로딩 스피너 컨테이너 */
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
`;

/** 로딩 스피너 */
const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(229, 9, 20, 0.3);
  border-radius: 50%;
  border-top-color: #e50914;
  animation: ${spin} 1s linear infinite;
`;

/** 로딩 텍스트 */
const LoadingText = styled.p`
  color: #b3b3b3;
  font-size: 14px;
  margin: 0;
`;

/** 무한 스크롤 트리거 (Observer 타겟) */
const ScrollTrigger = styled.div`
  width: 100%;
  height: 20px;
  margin-top: 20px;
`;

/** 더 이상 데이터 없음 메시지 */
const EndMessage = styled.p`
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 20px;
  margin: 0;
`;

// ============================================
// 컴포넌트
// ============================================

/**
 * MovieRow 컴포넌트
 * 
 * 카테고리별 영화를 가로 슬라이더로 표시합니다.
 * "모두 보기" 클릭 시 전체 영화를 그리드 모달로 표시하며,
 * fetchMore 함수가 제공되면 무한 스크롤을 지원합니다.
 * 
 * @param title - 카테고리 제목
 * @param movies - 초기 영화 목록
 * @param isLargeRow - 큰 카드 사용 여부
 * @param onMovieClick - 영화 클릭 콜백
 * @param fetchMore - 추가 데이터 로드 함수 (무한 스크롤용)
 */
const MovieRow = ({ 
  title, 
  movies, 
  isLargeRow = false, 
  onMovieClick,
  fetchMore 
}: MovieRowProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // 좌우 버튼 표시 상태
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  
  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  
  // 무한 스크롤 상태
  const [modalMovies, setModalMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  /**
   * 슬라이더 스크롤 이벤트 핸들러
   * 좌우 버튼의 표시/숨김을 제어
   */
  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  /**
   * 슬라이더 스크롤 함수
   * @param direction - 스크롤 방향 (left/right)
   */
  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const cardWidth = isLargeRow ? 208 : 168;
      const scrollAmount = cardWidth * 4;
      
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  /**
   * 추가 데이터 로드 (무한 스크롤)
   */
  const loadMore = useCallback(async () => {
    if (!fetchMore || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const result = await fetchMore(nextPage);
      
      // 새 데이터 추가 (중복 제거)
      setModalMovies(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMovies = result.results.filter(m => !existingIds.has(m.id));
        return [...prev, ...newMovies];
      });
      
      setPage(nextPage);
      setHasMore(nextPage < (result.total_pages || 0));
      setTotalResults(result.total_results || 0);
    } catch (error) {
      console.error('Failed to load more movies:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchMore, page, hasMore, isLoadingMore]);

  /**
   * Intersection Observer 콜백 ref
   * 스크롤이 끝에 도달하면 추가 데이터 로드
   */
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!node || !fetchMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0
      }
    );

    observer.observe(node);
    observerRef.current = observer;
  }, [fetchMore, hasMore, isLoadingMore, loadMore]);

  /** 모달 열기 */
  const openModal = () => {
    setShowModal(true);
    // 초기 데이터 설정
    setModalMovies(movies);
    setPage(1);
    setHasMore(fetchMore ? true : false);
    setTotalResults(movies.length);
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
  };

  /** 모달 닫기 */
  const closeModal = () => {
    setShowModal(false);
    // 상태 초기화
    setModalMovies([]);
    setPage(1);
    setHasMore(true);
    // 스크롤 복원
    document.body.style.overflow = '';
  };

  /** 오버레이 클릭 시 모달 닫기 */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // 모달이 닫힐 때 Observer 정리
  useEffect(() => {
    if (!showModal && observerRef.current) {
      observerRef.current.disconnect();
    }
  }, [showModal]);

  // 영화 데이터가 없으면 렌더링하지 않음
  if (!movies || movies.length === 0) return null;

  // 표시할 영화 개수 (무한 스크롤 시 totalResults, 아니면 현재 데이터 수)
  const displayCount = fetchMore && totalResults > 0 
    ? totalResults 
    : modalMovies.length || movies.length;

  return (
    <>
      <RowContainer>
        <RowHeader>
          <RowTitle>{title}</RowTitle>
          <ExploreLink onClick={openModal}>
            모두 보기 <span>›</span>
          </ExploreLink>
        </RowHeader>

        <SliderWrapper>
          <SliderButton 
            $direction="left" 
            onClick={() => scroll('left')}
            disabled={!showLeftButton}
            aria-label="이전으로"
          >
            ‹
          </SliderButton>

          <SliderContainer 
            ref={sliderRef} 
            onScroll={handleScroll}
          >
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                isLarge={isLargeRow}
                onCardClick={onMovieClick}
              />
            ))}
          </SliderContainer>

          <SliderButton 
            $direction="right" 
            onClick={() => scroll('right')}
            disabled={!showRightButton}
            aria-label="다음으로"
          >
            ›
          </SliderButton>
        </SliderWrapper>
      </RowContainer>

      {/* 모두 보기 모달 (무한 스크롤 지원) */}
      {showModal && (
        <ModalOverlay onClick={handleOverlayClick}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {title}
                <CountBadge>
                  {fetchMore ? `${modalMovies.length}편 / ${displayCount}편` : `${displayCount}편`}
                </CountBadge>
              </ModalTitle>
              <CloseButton onClick={closeModal} aria-label="닫기">
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <MovieGrid>
                {modalMovies.map((movie) => (
                  <GridItem key={movie.id}>
                    <MovieCard 
                      movie={movie} 
                      isLarge={false}
                      onCardClick={onMovieClick}
                    />
                  </GridItem>
                ))}
              </MovieGrid>
              
              {/* 무한 스크롤 트리거 */}
              {fetchMore && hasMore && (
                <ScrollTrigger ref={loadMoreRef}>
                  {isLoadingMore && (
                    <LoadingContainer>
                      <LoadingSpinner />
                      <LoadingText>더 불러오는 중...</LoadingText>
                    </LoadingContainer>
                  )}
                </ScrollTrigger>
              )}
              
              {/* 모든 데이터 로드 완료 메시지 */}
              {fetchMore && !hasMore && modalMovies.length > 0 && (
                <EndMessage>모든 영화를 불러왔습니다 🎬</EndMessage>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default MovieRow;
