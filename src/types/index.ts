/**
 * 공통 타입 정의 파일
 * 
 * 이 파일은 프로젝트 전반에서 사용되는 TypeScript 인터페이스와
 * 타입 정의를 중앙에서 관리합니다.
 */

// ============================================
// 영화 관련 타입
// ============================================

/**
 * Movie 인터페이스
 * TMDB API에서 반환되는 영화 데이터 구조
 */
export interface Movie {
  id: number;                      // 영화 고유 ID
  title: string;                   // 영화 제목 (한국어)
  original_title?: string;         // 원제
  overview: string;                // 줄거리
  poster_path: string | null;      // 포스터 이미지 경로
  backdrop_path: string | null;    // 배경 이미지 경로
  vote_average: number;            // 평균 평점 (0-10)
  vote_count?: number;             // 투표 수
  release_date: string;            // 개봉일 (YYYY-MM-DD)
  genre_ids?: number[];            // 장르 ID 배열
  genres?: Genre[];                // 장르 객체 배열 (상세 정보)
  popularity?: number;             // 인기도
  original_language?: string;      // 원어
  adult?: boolean;                 // 성인 콘텐츠 여부
  video?: boolean;                 // 비디오 여부
  addedAt?: string;                // 위시리스트 추가 시각 (ISO 문자열)
}

/**
 * Genre 인터페이스
 * 영화 장르 정보
 */
export interface Genre {
  id: number;      // 장르 ID
  name: string;    // 장르 이름
}

/**
 * TMDBResponse 제네릭 인터페이스
 * TMDB API의 페이지네이션 응답 구조
 */
export interface TMDBResponse<T> {
  page: number;           // 현재 페이지
  results: T[];           // 결과 배열
  total_pages: number;    // 전체 페이지 수
  total_results: number;  // 전체 결과 수
}

// ============================================
// 사용자 및 인증 관련 타입
// ============================================

/**
 * User 인터페이스
 * 사용자 정보 구조
 */
export interface User {
  id?: string;       // 사용자 ID (이메일과 동일)
  email: string;     // 이메일 주소
  password?: string; // 비밀번호 (TMDB API Key)
}

/**
 * AuthResult 인터페이스
 * 로그인/회원가입 결과
 */
export interface AuthResult {
  success: boolean;           // 성공 여부
  user?: { email: string };   // 사용자 정보 (성공 시)
  error?: string;             // 에러 메시지 (실패 시)
}

/**
 * 로컬 스토리지 키 상수
 * 애플리케이션에서 사용하는 모든 스토리지 키를 중앙 관리
 */
export const STORAGE_KEYS = {
  USERS: 'users',                    // 등록된 사용자 목록
  TMDB_KEY: 'TMDb-Key',              // TMDB API Key
  CURRENT_USER: 'currentUser',       // 현재 로그인된 사용자
  REMEMBER_ME: 'rememberMe',         // 로그인 상태 유지 여부
  WISHLIST: 'movieWishlist',         // 찜 목록
  RECENT_SEARCHES: 'recentSearches'  // 최근 검색어
} as const;

// ============================================
// 이미지 관련 타입
// ============================================

/** 이미지 타입 (포스터, 배경, 프로필) */
export type ImageType = 'poster' | 'backdrop' | 'profile';

/** 이미지 크기 옵션 */
export type ImageSize = 'small' | 'medium' | 'large' | 'original';

// ============================================
// 정렬 및 필터 관련 타입
// ============================================

/** 정렬 필드 */
export type SortField = 'popularity' | 'vote_average' | 'release_date' | 'title';

/** 정렬 순서 */
export type SortOrder = 'asc' | 'desc';

/** 국가 필터 */
export type OriginFilter = 'all' | 'kr' | 'foreign';

/** 뷰 모드 (그리드/테이블) */
export type ViewMode = 'grid' | 'table';

// ============================================
// Context 타입
// ============================================

/**
 * AuthContextType 인터페이스
 * 인증 Context에서 제공하는 값들의 타입
 */
export interface AuthContextType {
  user: { email: string } | null;  // 현재 사용자 정보
  isLoggedIn: boolean;             // 로그인 상태
  isLoading: boolean;              // 로딩 상태
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;  // 로그인 함수
  register: (email: string, password: string) => Promise<AuthResult>;                      // 회원가입 함수
  logout: () => void;              // 로그아웃 함수
  apiKey: string | null;           // 현재 TMDB API Key
}

/**
 * WishlistContextType 인터페이스
 * 찜 목록 Context에서 제공하는 값들의 타입
 */
export interface WishlistContextType {
  wishlist: Movie[];                              // 찜 목록 배열
  isInWishlist: (movieId: number) => boolean;     // 찜 여부 확인
  addToWishlist: (movie: Movie) => void;          // 찜 추가
  removeFromWishlist: (movieId: number) => void;  // 찜 제거
  toggleWishlist: (movie: Movie) => boolean;      // 찜 토글 (추가/제거)
  clearWishlist: () => void;                      // 찜 목록 초기화
  wishlistCount: number;                          // 찜한 영화 수
}

// ============================================
// Redux 상태 타입
// ============================================

/**
 * UIState 인터페이스
 * Redux에서 관리하는 UI 상태
 */
export interface UIState {
  bannerIndex: number;  // 현재 배너 인덱스 (홈 화면 슬라이더)
}

// ============================================
// 페이지 데이터 타입
// ============================================

/**
 * HomePageData 인터페이스
 * 홈 페이지에서 사용하는 영화 데이터 구조
 */
export interface HomePageData {
  trending: Movie[];        // 트렌딩 영화
  nowPlaying: Movie[];      // 현재 상영 중
  popular: Movie[];         // 인기 영화
  topRated: Movie[];        // 최고 평점
  upcoming: Movie[];        // 개봉 예정
  actionMovies: Movie[];    // 액션 영화
  comedyMovies: Movie[];    // 코미디 영화
  horrorMovies: Movie[];    // 공포 영화
  romanceMovies: Movie[];   // 로맨스 영화
  documentaries: Movie[];   // 다큐멘터리
}
