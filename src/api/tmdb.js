/**
 * TMDB API 연동 유틸리티
 * 영화 데이터 fetching 함수들
 */

import axios from 'axios';
import { getApiKey } from './auth';

// TMDB API 기본 URL
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// 이미지 사이즈 옵션
export const IMAGE_SIZES = {
  backdrop: {
    small: `${IMAGE_BASE_URL}/w300`,
    medium: `${IMAGE_BASE_URL}/w780`,
    large: `${IMAGE_BASE_URL}/w1280`,
    original: `${IMAGE_BASE_URL}/original`
  },
  poster: {
    small: `${IMAGE_BASE_URL}/w185`,
    medium: `${IMAGE_BASE_URL}/w342`,
    large: `${IMAGE_BASE_URL}/w500`,
    original: `${IMAGE_BASE_URL}/original`
  },
  profile: {
    small: `${IMAGE_BASE_URL}/w45`,
    medium: `${IMAGE_BASE_URL}/w185`,
    large: `${IMAGE_BASE_URL}/h632`,
    original: `${IMAGE_BASE_URL}/original`
  }
};

/**
 * 공통 API 요청 파라미터 생성
 */
const getCommonParams = (page = 1) => ({
  api_key: getApiKey(),
  language: 'ko-KR',
  page
});

/**
 * API 요청 헬퍼 함수
 */
const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: {
        ...getCommonParams(params.page),
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error(`TMDB API Error (${endpoint}):`, error);
    throw error;
  }
};

/**
 * 인기 영화 목록 가져오기
 */
export const getPopularMovies = async (page = 1) => {
  return fetchFromTMDB('/movie/popular', { page });
};

/**
 * 인기 영화 정렬 (discover 기반 서버 정렬)
 * sortField: popularity | vote_average | release_date | title
 * sortOrder: asc | desc
 */
export const getPopularMoviesSorted = async (page = 1, sortField = 'popularity', sortOrder = 'desc') => {
  const sortMap = {
    popularity: 'popularity',
    vote_average: 'vote_average',
    release_date: 'primary_release_date',
    title: 'original_title'
  };
  const key = sortMap[sortField] || 'popularity';
  const order = sortOrder === 'asc' ? 'asc' : 'desc';
  return fetchFromTMDB('/discover/movie', {
    sort_by: `${key}.${order}`,
    page,
    // 평점 정렬 시 극단적인 저투표수를 피하기 위해 기본 하한을 둠
    vote_count_gte: sortField === 'vote_average' ? 200 : undefined
  });
};

/**
 * 현재 상영 중인 영화 목록
 */
export const getNowPlayingMovies = async (page = 1) => {
  return fetchFromTMDB('/movie/now_playing', { page });
};

/**
 * 최고 평점 영화 목록
 */
export const getTopRatedMovies = async (page = 1) => {
  return fetchFromTMDB('/movie/top_rated', { page });
};

/**
 * 개봉 예정 영화 목록
 */
export const getUpcomingMovies = async (page = 1) => {
  return fetchFromTMDB('/movie/upcoming', { page });
};

/**
 * 트렌딩 영화 (일간/주간)
 */
export const getTrendingMovies = async (timeWindow = 'week') => {
  return fetchFromTMDB(`/trending/movie/${timeWindow}`);
};

/**
 * 장르별 영화 목록
 */
export const getMoviesByGenre = async (genreId, page = 1) => {
  return fetchFromTMDB('/discover/movie', {
    with_genres: genreId,
    sort_by: 'popularity.desc',
    page
  });
};

/**
 * 여러 장르로 영화 목록 가져오기 (쉼표 구분)
 */
export const getMoviesByGenres = async (genreIds = [], page = 1) => {
  const ids = Array.isArray(genreIds) ? genreIds : [genreIds];
  if (!ids.length) return { results: [], total_pages: 0, total_results: 0 };
  return fetchFromTMDB('/discover/movie', {
    with_genres: ids.join(','),
    sort_by: 'popularity.desc',
    page
  });
};

/**
 * 영화 상세 정보
 */
export const getMovieDetails = async (movieId) => {
  return fetchFromTMDB(`/movie/${movieId}`, {
    append_to_response: 'videos,credits,similar,recommendations'
  });
};

/**
 * 영화 검색
 */
export const searchMovies = async (query, page = 1) => {
  return fetchFromTMDB('/search/movie', { query, page });
};

/**
 * 장르 목록 가져오기
 */
export const getGenres = async () => {
  return fetchFromTMDB('/genre/movie/list');
};

/**
 * 영화 비디오 (예고편 등) 가져오기
 */
export const getMovieVideos = async (movieId) => {
  return fetchFromTMDB(`/movie/${movieId}/videos`);
};

/**
 * 이미지 URL 생성 헬퍼
 */
export const getImageUrl = (path, type = 'poster', size = 'medium') => {
  if (!path) return null;
  return `${IMAGE_SIZES[type][size]}${path}`;
};

/**
 * 장르 ID 상수
 */
export const GENRE_IDS = {
  ACTION: 28,
  ADVENTURE: 12,
  ANIMATION: 16,
  COMEDY: 35,
  CRIME: 80,
  DOCUMENTARY: 99,
  DRAMA: 18,
  FAMILY: 10751,
  FANTASY: 14,
  HISTORY: 36,
  HORROR: 27,
  MUSIC: 10402,
  MYSTERY: 9648,
  ROMANCE: 10749,
  SCIENCE_FICTION: 878,
  THRILLER: 53,
  WAR: 10752,
  WESTERN: 37
};

/**
 * 홈 페이지용 카테고리별 영화 데이터 가져오기
 */
export const getHomePageData = async () => {
  try {
    const [
      trending,
      nowPlaying,
      popular,
      topRated,
      upcoming,
      actionMovies,
      comedyMovies,
      horrorMovies,
      romanceMovies,
      documentaries
    ] = await Promise.all([
      getTrendingMovies('week'),
      getNowPlayingMovies(),
      getPopularMovies(),
      getTopRatedMovies(),
      getUpcomingMovies(),
      getMoviesByGenre(GENRE_IDS.ACTION),
      getMoviesByGenre(GENRE_IDS.COMEDY),
      getMoviesByGenre(GENRE_IDS.HORROR),
      getMoviesByGenre(GENRE_IDS.ROMANCE),
      getMoviesByGenre(GENRE_IDS.DOCUMENTARY)
    ]);

    return {
      trending: trending.results,
      nowPlaying: nowPlaying.results,
      popular: popular.results,
      topRated: topRated.results,
      upcoming: upcoming.results,
      actionMovies: actionMovies.results,
      comedyMovies: comedyMovies.results,
      horrorMovies: horrorMovies.results,
      romanceMovies: romanceMovies.results,
      documentaries: documentaries.results
    };
  } catch (error) {
    console.error('Failed to fetch home page data:', error);
    throw error;
  }
};

export default {
  getPopularMovies,
  getNowPlayingMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getTrendingMovies,
  getMoviesByGenre,
  getMoviesByGenres,
  getMovieDetails,
  searchMovies,
  getGenres,
  getMovieVideos,
  getImageUrl,
  getHomePageData,
  IMAGE_SIZES,
  GENRE_IDS
};

