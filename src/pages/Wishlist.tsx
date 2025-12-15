import { useState, useMemo, ChangeEvent, MouseEvent } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '../components/common/Header';
import MovieTable from '../components/domain/MovieTable';
import MovieGrid from '../components/domain/MovieGrid';
import { useWishlist } from '../hooks/useWishlist';
import type { Movie, SortField, ViewMode } from '../types';

/**
 * ⚠️ 중요: 이 페이지에서는 API를 호출하면 안됩니다!
 * Local Storage에 저장된 데이터만 사용합니다.
 */

interface ViewButtonProps {
  $isActive: boolean;
}

interface ModalButtonProps {
  $primary?: boolean;
}

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
  padding: 88px 4% 50px;

  @media (max-width: 768px) {
    padding: 76px 3% 30px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PageDescription = styled.p`
  color: #888;
  font-size: 14px;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
`;

const ViewButton = styled.button<ViewButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background: ${props => props.$isActive ? '#e50914' : 'transparent'};
  border: none;
  color: ${props => props.$isActive ? '#fff' : '#888'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  gap: 6px;

  &:hover {
    background: ${props => props.$isActive ? '#e50914' : 'rgba(255,255,255,0.1)'};
    color: #fff;
  }
`;

const Select = styled.select`
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:hover, &:focus {
    border-color: #e50914;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const ClearAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid rgba(229, 9, 20, 0.5);
  border-radius: 6px;
  color: #e50914;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(229, 9, 20, 0.1);
    border-color: #e50914;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultInfo = styled.div`
  color: #888;
  font-size: 14px;
  
  span {
    color: #e50914;
    font-weight: 600;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 80px;
  margin-bottom: 24px;
`;

const EmptyTitle = styled.h2`
  color: #fff;
  font-size: 24px;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  color: #888;
  font-size: 16px;
  max-width: 400px;
  line-height: 1.6;
`;

const BrowseButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 14px 28px;
  background: #e50914;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f40612;
    transform: scale(1.05);
  }
`;

const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const ModalTitle = styled.h3`
  color: #fff;
  font-size: 20px;
  margin-bottom: 12px;
`;

const ModalText = styled.p`
  color: #888;
  font-size: 14px;
  margin-bottom: 24px;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ModalButton = styled.button<ModalButtonProps>`
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.$primary ? `
    background: #e50914;
    color: #fff;
    
    &:hover {
      background: #b20710;
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `}
`;

const VIEW_MODES = {
  GRID: 'grid' as ViewMode,
  TABLE: 'table' as ViewMode
};

const SORT_OPTIONS = [
  { value: 'addedAt', label: '추가한 날짜순' },
  { value: 'title', label: '제목순' },
  { value: 'vote_average', label: '평점순' },
  { value: 'release_date', label: '개봉일순' }
];

const Wishlist = () => {
  const { wishlist, clearWishlist, wishlistCount } = useWishlist();
  
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.GRID);
  const [sortField, setSortField] = useState<string>('addedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showClearModal, setShowClearModal] = useState(false);

  const sortedWishlist = useMemo(() => {
    if (!wishlist || wishlist.length === 0) return [];
    
    return [...wishlist].sort((a, b) => {
      let aVal: string | number = (a as Record<string, unknown>)[sortField] as string | number;
      let bVal: string | number = (b as Record<string, unknown>)[sortField] as string | number;

      if (sortField === 'title') {
        aVal = (aVal as string)?.toLowerCase() || '';
        bVal = (bVal as string)?.toLowerCase() || '';
        return sortOrder === 'asc' 
          ? (aVal as string).localeCompare(bVal as string, 'ko')
          : (bVal as string).localeCompare(aVal as string, 'ko');
      }

      if (sortField === 'release_date' || sortField === 'addedAt') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      aVal = aVal || 0;
      bVal = bVal || 0;

      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [wishlist, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortField(e.target.value);
    setSortOrder('desc');
  };

  const handleClearAll = () => {
    setShowClearModal(true);
  };

  const confirmClearAll = () => {
    clearWishlist();
    setShowClearModal(false);
  };

  const handleMovieClick = (movie: Movie) => {
    console.log('Movie clicked:', movie);
  };

  if (wishlistCount === 0) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <EmptyState>
            <EmptyIcon>💔</EmptyIcon>
            <EmptyTitle>찜한 콘텐츠가 없습니다</EmptyTitle>
            <EmptyText>
              마음에 드는 영화를 발견하면 + 버튼을 눌러 내 리스트에 추가하세요.
              언제든지 다시 찾아볼 수 있습니다!
            </EmptyText>
            <BrowseButton href="/">
              🎬 콘텐츠 둘러보기
            </BrowseButton>
          </EmptyState>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        <PageHeader>
          <PageTitle>내가 찜한 리스트</PageTitle>
          <PageDescription>
            찜한 영화들을 한눈에 확인하세요
          </PageDescription>
        </PageHeader>

        <ControlsContainer>
          <LeftControls>
            <ViewToggle>
              <ViewButton 
                $isActive={viewMode === VIEW_MODES.GRID}
                onClick={() => setViewMode(VIEW_MODES.GRID)}
              >
                그리드
              </ViewButton>
              <ViewButton 
                $isActive={viewMode === VIEW_MODES.TABLE}
                onClick={() => setViewMode(VIEW_MODES.TABLE)}
              >
                테이블
              </ViewButton>
            </ViewToggle>

            <Select value={sortField} onChange={handleSortChange}>
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <ClearAllButton 
              onClick={handleClearAll}
              disabled={wishlistCount === 0}
            >
              전체 삭제
            </ClearAllButton>
          </LeftControls>

          <RightControls>
            <ResultInfo>
              총 <span>{wishlistCount}</span>개의 영화
            </ResultInfo>
          </RightControls>
        </ControlsContainer>

        {viewMode === VIEW_MODES.GRID ? (
          <MovieGrid
            movies={sortedWishlist}
            isLoading={false}
            isLoadingMore={false}
            hasMore={false}
            onMovieClick={handleMovieClick}
            emptyMessage="찜한 영화가 없습니다."
          />
        ) : (
          <MovieTable
            movies={sortedWishlist}
            onSort={handleSort}
            sortField={sortField as SortField}
            sortOrder={sortOrder}
            onMovieClick={handleMovieClick}
          />
        )}
      </MainContent>

      {showClearModal && (
        <ConfirmModal onClick={() => setShowClearModal(false)}>
          <ModalContent onClick={(e: MouseEvent) => e.stopPropagation()}>
            <ModalTitle>정말 삭제하시겠습니까?</ModalTitle>
            <ModalText>
              찜한 모든 영화({wishlistCount}개)가 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </ModalText>
            <ModalButtons>
              <ModalButton onClick={() => setShowClearModal(false)}>
                취소
              </ModalButton>
              <ModalButton $primary onClick={confirmClearAll}>
                삭제
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ConfirmModal>
      )}
    </PageContainer>
  );
};

export default Wishlist;

