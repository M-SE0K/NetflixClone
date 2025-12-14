import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { toast } from 'react-toastify';

// Wishlist Context 생성
const WishlistContext = createContext(null);

const STORAGE_KEY = 'movieWishlist';

/**
 * Wishlist Provider 컴포넌트
 * 전역 위시리스트 상태 관리
 */
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // 초기 로드 시 Local Storage에서 위시리스트 불러오기
  useEffect(() => {
    const savedWishlist = localStorage.getItem(STORAGE_KEY);
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Failed to parse wishlist from localStorage:', error);
        setWishlist([]);
      }
    }
  }, []);

  // 위시리스트 변경 시 Local Storage에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  /**
   * 영화가 위시리스트에 있는지 확인
   */
  const isInWishlist = useCallback((movieId) => {
    return wishlist.some((movie) => movie.id === movieId);
  }, [wishlist]);

  /**
   * 위시리스트에 영화 추가
   */
  const addToWishlist = useCallback((movie) => {
    setWishlist((prev) => {
      // 이미 존재하면 추가하지 않음
      if (prev.some((m) => m.id === movie.id)) {
        return prev;
      }
      return [...prev, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        overview: movie.overview,
        addedAt: new Date().toISOString()
      }];
    });
  }, []);

  /**
   * 위시리스트에서 영화 제거
   */
  const removeFromWishlist = useCallback((movieId) => {
    setWishlist((prev) => prev.filter((movie) => movie.id !== movieId));
  }, []);

  /**
   * 위시리스트 토글 (추가/제거)
   */
  const toggleWishlist = useCallback((movie) => {
    if (isInWishlist(movie.id)) {
      removeFromWishlist(movie.id);
      return false; // 제거됨
    } else {
      addToWishlist(movie);
      toast.success(`${movie.title || '영화'}이 위시리스트에 추가되었습니다!`);
      return true; // 추가됨
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  /**
   * 위시리스트 전체 삭제
   */
  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const value = {
    wishlist,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    wishlistCount: wishlist.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

/**
 * useWishlist 커스텀 훅
 */
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  
  return context;
};

export default useWishlist;

