/**
 * useWishlist.tsx - 찜 목록 관리 커스텀 훅
 * 
 * Context API를 활용하여 전역 찜 목록 상태를 관리합니다.
 * Local Storage를 사용하여 데이터를 영구 저장합니다.
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { toast } from 'react-toastify';
import type { Movie, WishlistContextType } from '../types';

// ============================================
// Context 생성
// ============================================

/**
 * Wishlist Context
 * 앱 전체에서 찜 목록에 접근할 수 있도록 Context 생성
 */
const WishlistContext = createContext<WishlistContextType | null>(null);

/** Local Storage 키 */
const STORAGE_KEY = 'movieWishlist';

// ============================================
// Provider 컴포넌트
// ============================================

interface WishlistProviderProps {
  children: ReactNode;
}

/**
 * WishlistProvider 컴포넌트
 * 
 * 전역 찜 목록 상태를 관리하고 하위 컴포넌트에 제공합니다.
 * Local Storage와 동기화하여 브라우저를 닫아도 데이터가 유지됩니다.
 * 
 * @example
 * <WishlistProvider>
 *   <App />
 * </WishlistProvider>
 */
export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  // 찜 목록 상태
  const [wishlist, setWishlist] = useState<Movie[]>([]);

  /**
   * 초기 로드 시 Local Storage에서 찜 목록 불러오기
   */
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

  /**
   * 찜 목록 변경 시 Local Storage에 자동 저장
   */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  /**
   * 영화가 찜 목록에 있는지 확인
   * 
   * @param movieId - 확인할 영화 ID
   * @returns 찜 목록 포함 여부
   */
  const isInWishlist = useCallback((movieId: number): boolean => {
    return wishlist.some((movie) => movie.id === movieId);
  }, [wishlist]);

  /**
   * 찜 목록에 영화 추가
   * 
   * @param movie - 추가할 영화 객체
   */
  const addToWishlist = useCallback((movie: Movie): void => {
    setWishlist((prev) => {
      // 이미 존재하면 추가하지 않음 (중복 방지)
      if (prev.some((m) => m.id === movie.id)) {
        return prev;
      }
      // 필요한 필드만 저장하여 저장 공간 최적화
      return [...prev, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        overview: movie.overview,
        addedAt: new Date().toISOString()  // 추가 시각 기록
      }];
    });
  }, []);

  /**
   * 찜 목록에서 영화 제거
   * 
   * @param movieId - 제거할 영화 ID
   */
  const removeFromWishlist = useCallback((movieId: number): void => {
    setWishlist((prev) => prev.filter((movie) => movie.id !== movieId));
  }, []);

  /**
   * 찜 목록 토글 (추가/제거)
   * 영화가 이미 찜 목록에 있으면 제거, 없으면 추가
   * 
   * @param movie - 토글할 영화 객체
   * @returns true면 추가됨, false면 제거됨
   */
  const toggleWishlist = useCallback((movie: Movie): boolean => {
    if (isInWishlist(movie.id)) {
      removeFromWishlist(movie.id);
      return false; // 제거됨
    } else {
      addToWishlist(movie);
      // 추가 시 토스트 알림 표시
      toast.success(`${movie.title || '영화'}이 위시리스트에 추가되었습니다!`);
      return true; // 추가됨
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  /**
   * 찜 목록 전체 삭제
   */
  const clearWishlist = useCallback((): void => {
    setWishlist([]);
  }, []);

  // Context에 제공할 값
  const value: WishlistContextType = {
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

// ============================================
// 커스텀 훅
// ============================================

/**
 * useWishlist 커스텀 훅
 * 
 * 찜 목록 관련 상태와 함수에 접근하기 위한 훅입니다.
 * 반드시 WishlistProvider 내부에서 사용해야 합니다.
 * 
 * @example
 * const { wishlist, isInWishlist, toggleWishlist } = useWishlist();
 * 
 * // 영화 찜 토글
 * const handleWishlist = () => {
 *   toggleWishlist(movie);
 * };
 * 
 * @throws Error - WishlistProvider 외부에서 사용 시 에러 발생
 */
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  
  return context;
};

export default useWishlist;
