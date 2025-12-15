import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { getImageUrl } from '../../api/tmdb';
import { useWishlist } from '../../hooks/useWishlist';
import {
  Star,
  Flame,
  Calendar,
  Languages,
  Users,
  BookOpenText,
  Globe2,
  Heart,
  Check,
  X
} from 'lucide-react';
import { useMemo, MouseEvent } from 'react';
import type { Movie } from '../../types';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
}

interface PillProps {
  $type?: 'rating' | 'pop' | 'default';
}

interface IconButtonProps {
  $isActive?: boolean;
}

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.96); }
`;

const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
    align-items: flex-start;
    padding-top: 40px;
    overflow-y: auto;
  }
`;

const DetailContent = styled.div`
  background: linear-gradient(135deg, rgba(20,20,20,0.98), rgba(32,32,32,0.95));
  border-radius: 16px;
  width: min(960px, 95vw);
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    width: 100%;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
    padding: 16px;
    gap: 16px;
    border-radius: 12px;
  }
`;

const DetailPoster = styled.img`
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
  background: #222;

  @media (max-width: 768px) {
    max-height: 280px;
    object-fit: contain;
    background: transparent;
  }
`;

const DetailPosterPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #222;
  color: #888;
  font-size: 40px;
  border-radius: 8px;
`;

const DetailBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #fff;
`;

const DetailTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Pill = styled.span<PillProps>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: #f4f4f4;
  background: ${props => props.$type === 'rating'
    ? 'rgba(70, 211, 105, 0.18)'
    : props.$type === 'pop'
      ? 'rgba(229, 9, 20, 0.18)'
      : 'rgba(255,255,255,0.08)'};
  border: 1px solid rgba(255,255,255,0.08);

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 11px;
    gap: 4px;
  }
`;

const DetailOverview = styled.p`
  color: #d9d9d9;
  line-height: 1.6;
  font-size: 14px;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 13px;
    line-height: 1.5;
    max-height: 120px;
    overflow-y: auto;
  }
`;

const DetailActions = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #2b2b2b, #1c1c1c);
  color: #fff;
  border-radius: 999px;
  font-size: 13px;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;
    border-color: #e50914;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
    gap: 4px;
  }
`;

const IconButton = styled.button<IconButtonProps>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.5);
  background: ${props => props.$isActive ? '#e50914' : 'rgba(42, 42, 42, 0.8)'};
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isActive ? '#b20710' : 'rgba(255, 255, 255, 0.2)'};
    border-color: #fff;
    transform: scale(1.08);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const CloseButton = styled.button`
  padding: 10px 16px;
  background: #e50914;
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s;
  margin-left: auto;

  &:hover {
    background: #b20710;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

const MovieDetailModal = ({ movie, onClose }: MovieDetailModalProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const posterUrl = getImageUrl(movie?.poster_path ?? null, 'poster', 'large');
  const isWishlisted = movie ? isInWishlist(movie.id) : false;
  const releaseYear = movie?.release_date?.split('-')[0] || '';
  const rating = movie?.vote_average?.toFixed(1) || 'N/A';
  const voteCount = movie?.vote_count?.toLocaleString() || '-';
  const popularity = movie?.popularity ? Math.round(movie.popularity) : '-';
  const language = (movie?.original_language || '').toUpperCase();
  const encodedTitle = useMemo(() => encodeURIComponent((movie?.title || '').trim()), [movie?.title]);
  const wikiUrl = `https://namu.wiki/w/${encodedTitle}`;
  const googleUrl = `https://www.google.com/search?q=${encodedTitle}`;

  if (!movie) return null;

  return createPortal(
    <DetailOverlay onClick={onClose}>
      <DetailContent onClick={(e: MouseEvent) => e.stopPropagation()}>
        {posterUrl ? (
          <DetailPoster src={posterUrl} alt={movie.title} />
        ) : (
          <DetailPosterPlaceholder>
            🎬
          </DetailPosterPlaceholder>
        )}
        <DetailBody>
          <DetailTitle>{movie.title}</DetailTitle>

          <PillRow>
            <Pill $type="rating">
              <Star size={14} /> {rating}
            </Pill>
            <Pill $type="pop">
              <Flame size={14} /> {popularity}
            </Pill>
            <Pill>
              <Calendar size={14} /> {releaseYear || '미정'}
            </Pill>
            <Pill>
              <Languages size={14} /> {language || 'N/A'}
            </Pill>
            <Pill>
              <Users size={14} /> {voteCount}
            </Pill>
          </PillRow>

          <DetailOverview>{movie.overview || '줄거리 정보가 없습니다.'}</DetailOverview>

          <DetailActions>
            <LinkButton href={wikiUrl} target="_blank" rel="noopener noreferrer">
              <BookOpenText size={16} />
              나무위키
            </LinkButton>
            <LinkButton href={googleUrl} target="_blank" rel="noopener noreferrer">
              <Globe2 size={16} />
              Google
            </LinkButton>
            <IconButton
              $isActive={isWishlisted}
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                toggleWishlist(movie);
              }}
              title={isWishlisted ? '내 리스트에서 제거' : '내 리스트에 추가'}
            >
              {isWishlisted ? <Check size={18} /> : <Heart size={18} />}
            </IconButton>
            <CloseButton onClick={onClose}>
              <X size={16} />
            </CloseButton>
          </DetailActions>
        </DetailBody>
      </DetailContent>
    </DetailOverlay>,
    document.body
  );
};

export default MovieDetailModal;

