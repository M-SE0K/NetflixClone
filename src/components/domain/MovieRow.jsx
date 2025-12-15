import { useState, useRef } from 'react';
import styled from 'styled-components';
import MovieCard from './MovieCard';

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

const SliderButton = styled.button`
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

const MovieRow = ({ title, movies, isLargeRow = false, onMovieClick }) => {
  const sliderRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (sliderRef.current) {
      const cardWidth = isLargeRow ? 208 : 168;
      const scrollAmount = cardWidth * 4;
      
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <RowContainer>
      <RowHeader>
        <RowTitle>{title}</RowTitle>
        <ExploreLink>
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
  );
};

export default MovieRow;

