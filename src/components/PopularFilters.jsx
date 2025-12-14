import styled from 'styled-components';

const FilterSection = styled.div`
  margin: 10px 0 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
`;

const LeftGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

const GenreList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const GenreButton = styled.button`
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid ${props => props.$isActive ? '#e50914' : 'rgba(255,255,255,0.15)'};
  background: ${props => props.$isActive ? 'rgba(229, 9, 20, 0.15)' : 'rgba(255,255,255,0.05)'};
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #e50914;
    background: rgba(229, 9, 20, 0.2);
  }
`;

const SelectSmall = styled.select`
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  outline: none;

  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ResultInfo = styled.div`
  color: #888;
  font-size: 14px;
  
  span {
    color: #e50914;
    font-weight: 600;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: ${props => props.$primary ? '#e50914' : '#e50914'};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #b20710;
    border-color: rgba(255, 255, 255, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PopularFilters = ({
  totalResults,
  minRating,
  onMinRatingChange,
  genres,
  selectedGenres,
  isGenreLoading,
  onGenreToggle,
  onRefresh,
  onReset,
  isLoading
}) => {
  return (
    <FilterSection>
      <LeftGroup>
        <SelectSmall value={minRating} onChange={onMinRatingChange} aria-label="최소 평점">
          <option value={0}>평점 전체</option>
          <option value={6}>6.0+</option>
          <option value={7}>7.0+</option>
          <option value={8}>8.0+</option>
          <option value={8.5}>8.5+</option>
        </SelectSmall>

        {isGenreLoading ? (
          <span style={{ color: '#888', fontSize: 13 }}>장르 로딩 중...</span>
        ) : (
          <GenreList>
            {genres.map(g => (
              <GenreButton
                key={g.id}
                $isActive={selectedGenres.includes(g.id)}
                onClick={() => onGenreToggle(g.id)}
              >
                {g.name}
              </GenreButton>
            ))}
          </GenreList>
        )}
      </LeftGroup>

      <RightGroup>
        {totalResults > 0 && (
          <ResultInfo>
            총 <span>{totalResults.toLocaleString()}</span>개의 영화
          </ResultInfo>
        )}
        <Button onClick={onRefresh} disabled={isLoading}>
          새로고침
        </Button>
        <Button $primary onClick={onReset} disabled={isLoading}>
          초기화
        </Button>
      </RightGroup>
    </FilterSection>
  );
};

export default PopularFilters;

