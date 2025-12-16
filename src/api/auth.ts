/**
 * auth.ts - 인증 관련 유틸리티 함수
 * 
 * Local Storage를 활용한 사용자 인증 관리
 * TMDB API Key를 비밀번호로 사용하는 특수한 인증 방식
 */

import type { AuthResult, User } from '../types';

// ============================================
// 상수 정의
// ============================================

/**
 * Local Storage 키 상수
 * 인증 관련 데이터 저장에 사용
 */
const STORAGE_KEYS = {
  USERS: 'users',            // 등록된 사용자 목록
  TMDB_KEY: 'TMDb-Key',      // TMDB API Key
  CURRENT_USER: 'currentUser', // 현재 로그인된 사용자
  REMEMBER_ME: 'rememberMe'  // 로그인 상태 유지 여부
} as const;

// ============================================
// 인증 함수
// ============================================

/**
 * 로그인 시도
 * 
 * 1. 저장된 사용자 목록에서 이메일/비밀번호 확인
 * 2. TMDB API Key 유효성 검증
 * 3. 성공 시 인증 정보 저장
 * 
 * @param email - 사용자 이메일
 * @param password - TMDB API Key
 * @param rememberMe - 로그인 상태 유지 여부
 * @returns 로그인 결과
 */
export const tryLogin = async (
  email: string,
  password: string,
  rememberMe = false
): Promise<AuthResult> => {
  try {
    // 저장된 사용자 목록 가져오기
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: User[] = usersData ? JSON.parse(usersData) : [];

    // 사용자 찾기 (이메일과 비밀번호 일치 확인)
    const user = users.find(
      (u) => u.id === email && u.password === password
    );

    if (user) {
      // API 키 유효성 검증 (실제 TMDB API 호출 테스트)
      const isValidKey = await validateTMDbKey(password);
      
      if (!isValidKey) {
        return {
          success: false,
          error: '유효하지 않은 TMDB API Key입니다.'
        };
      }

      // 로그인 성공 - Local Storage에 정보 저장
      localStorage.setItem(STORAGE_KEYS.TMDB_KEY, password);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ email: user.id }));
      
      // rememberMe 여부에 따라 저장 위치 결정
      if (rememberMe) {
        // 영구 저장 (브라우저 닫아도 유지)
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        // 세션 저장 (브라우저 닫으면 삭제)
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ email: user.id }));
        sessionStorage.setItem(STORAGE_KEYS.TMDB_KEY, password);
      }

      return {
        success: true,
        user: { email: user.id! }
      };
    }

    return {
      success: false,
      error: '이메일 또는 API Key가 일치하지 않습니다.'
    };
  } catch {
    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 회원가입 시도
 * 
 * 1. 이메일 형식 검증
 * 2. TMDB API Key 유효성 검증
 * 3. 중복 사용자 확인
 * 4. 새 사용자 등록
 * 
 * @param email - 사용자 이메일
 * @param password - TMDB API Key
 * @returns 회원가입 결과
 */
export const tryRegister = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    // 이메일 형식 검증 (정규식 사용)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: '유효한 이메일 형식이 아닙니다.'
      };
    }

    // TMDB API Key 유효성 검증
    const isValidKey = await validateTMDbKey(password);
    if (!isValidKey) {
      return {
        success: false,
        error: '유효하지 않은 TMDB API Key입니다. TMDB에서 API Key를 발급받으세요.'
      };
    }

    // 저장된 사용자 목록 가져오기
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: User[] = usersData ? JSON.parse(usersData) : [];

    // 이미 존재하는 사용자인지 확인
    const userExists = users.some((user) => user.id === email);
    if (userExists) {
      return {
        success: false,
        error: '이미 등록된 이메일입니다.'
      };
    }

    // 새 사용자 추가
    users.push({ id: email, email, password });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    return {
      success: true
    };
  } catch {
    return {
      success: false,
      error: '회원가입 중 오류가 발생했습니다.'
    };
  }
};

/**
 * TMDB API Key 유효성 검증
 * 실제 TMDB API를 호출하여 키가 유효한지 확인
 * 
 * @param apiKey - 검증할 API Key
 * @returns 유효 여부
 */
export const validateTMDbKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR&page=1`
    );
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * 로그아웃
 * 모든 인증 관련 데이터를 Local Storage와 Session Storage에서 삭제
 */
export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TMDB_KEY);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  sessionStorage.removeItem(STORAGE_KEYS.TMDB_KEY);
};

/**
 * 현재 로그인 상태 확인
 * Local Storage 또는 Session Storage에 유효한 인증 정보가 있는지 확인
 * 
 * @returns 로그인 상태
 */
export const isAuthenticated = (): boolean => {
  const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
  
  if (rememberMe === 'true') {
    // rememberMe가 활성화된 경우 Local Storage만 확인
    return !!(
      localStorage.getItem(STORAGE_KEYS.TMDB_KEY) &&
      localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    );
  }
  
  // 그 외의 경우 Local Storage와 Session Storage 모두 확인
  return !!(
    (localStorage.getItem(STORAGE_KEYS.TMDB_KEY) || sessionStorage.getItem(STORAGE_KEYS.TMDB_KEY)) &&
    (localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER))
  );
};

/**
 * 현재 사용자 정보 가져오기
 * 
 * @returns 현재 사용자 객체 또는 null
 */
export const getCurrentUser = (): { email: string } | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 
                   sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userData ? JSON.parse(userData) : null;
};

/**
 * 저장된 TMDB API Key 가져오기
 * 
 * @returns API Key 문자열 또는 null
 */
export const getApiKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.TMDB_KEY) || 
         sessionStorage.getItem(STORAGE_KEYS.TMDB_KEY);
};
