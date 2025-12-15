/**
 * 공통 타입 정의
 */

// 영화 데이터 타입
export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count?: number;
  release_date: string;
  genre_ids?: number[];
  genres?: Genre[];
  popularity?: number;
  original_language?: string;
  adult?: boolean;
  video?: boolean;
  addedAt?: string; // 위시리스트 추가 시각
}

// 장르 타입
export interface Genre {
  id: number;
  name: string;
}

// TMDB API 응답 타입
export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// 사용자 타입
export interface User {
  id?: string;
  email: string;
  password?: string;
}

// 인증 결과 타입
export interface AuthResult {
  success: boolean;
  user?: { email: string };
  error?: string;
}

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  USERS: 'users',
  TMDB_KEY: 'TMDb-Key',
  CURRENT_USER: 'currentUser',
  REMEMBER_ME: 'rememberMe',
  WISHLIST: 'movieWishlist',
  RECENT_SEARCHES: 'recentSearches'
} as const;

// 이미지 타입
export type ImageType = 'poster' | 'backdrop' | 'profile';
export type ImageSize = 'small' | 'medium' | 'large' | 'original';

// 정렬 옵션
export type SortField = 'popularity' | 'vote_average' | 'release_date' | 'title';
export type SortOrder = 'asc' | 'desc';
export type OriginFilter = 'all' | 'kr' | 'foreign';

// 뷰 모드
export type ViewMode = 'grid' | 'table';

// Auth Context 타입
export interface AuthContextType {
  user: { email: string } | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  apiKey: string | null;
}

// Wishlist Context 타입
export interface WishlistContextType {
  wishlist: Movie[];
  isInWishlist: (movieId: number) => boolean;
  addToWishlist: (movie: Movie) => void;
  removeFromWishlist: (movieId: number) => void;
  toggleWishlist: (movie: Movie) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

// Redux UI State
export interface UIState {
  bannerIndex: number;
}

// 홈 페이지 데이터 타입
export interface HomePageData {
  trending: Movie[];
  nowPlaying: Movie[];
  popular: Movie[];
  topRated: Movie[];
  upcoming: Movie[];
  actionMovies: Movie[];
  comedyMovies: Movie[];
  horrorMovies: Movie[];
  romanceMovies: Movie[];
  documentaries: Movie[];
}

