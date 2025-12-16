/**
 * useAuth.tsx - 인증 관리 커스텀 훅
 * 
 * Context API를 활용하여 전역 인증 상태를 관리합니다.
 * 로그인, 회원가입, 로그아웃 기능과 인증 상태를 제공합니다.
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { 
  tryLogin as apiLogin, 
  tryRegister as apiRegister, 
  logout as apiLogout,
  isAuthenticated,
  getCurrentUser,
  getApiKey
} from '../api/auth';
import type { AuthContextType, AuthResult } from '../types';

// ============================================
// Context 생성
// ============================================

/**
 * Auth Context
 * 앱 전체에서 인증 상태에 접근할 수 있도록 Context 생성
 */
const AuthContext = createContext<AuthContextType | null>(null);

// ============================================
// Provider 컴포넌트
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider 컴포넌트
 * 
 * 전역 인증 상태를 관리하고 하위 컴포넌트에 제공합니다.
 * App 컴포넌트에서 최상위에 래핑됩니다.
 * 
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // 현재 로그인된 사용자 정보
  const [user, setUser] = useState<{ email: string } | null>(null);
  // 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 인증 확인 중 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 초기 인증 상태 확인
   * 컴포넌트 마운트 시 Local Storage를 확인하여 로그인 상태 복원
   */
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * 로그인 함수
   * 
   * @param email - 사용자 이메일
   * @param password - TMDB API Key
   * @param rememberMe - 로그인 상태 유지 여부
   * @returns 로그인 결과 (성공/실패 및 에러 메시지)
   */
  const login = useCallback(async (
    email: string,
    password: string,
    rememberMe = false
  ): Promise<AuthResult> => {
    setIsLoading(true);
    
    const result = await apiLogin(email, password, rememberMe);
    
    if (result.success && result.user) {
      setUser(result.user);
      setIsLoggedIn(true);
    }
    
    setIsLoading(false);
    return result;
  }, []);

  /**
   * 회원가입 함수
   * 
   * @param email - 사용자 이메일
   * @param password - TMDB API Key
   * @returns 회원가입 결과 (성공/실패 및 에러 메시지)
   */
  const register = useCallback(async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setIsLoading(true);
    
    const result = await apiRegister(email, password);
    
    setIsLoading(false);
    return result;
  }, []);

  /**
   * 로그아웃 함수
   * Local Storage의 인증 정보를 삭제하고 상태 초기화
   */
  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  // 현재 저장된 API Key 가져오기
  const apiKey = getApiKey();

  // Context에 제공할 값
  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    apiKey
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// 커스텀 훅
// ============================================

/**
 * useAuth 커스텀 훅
 * 
 * 인증 관련 상태와 함수에 접근하기 위한 훅입니다.
 * 반드시 AuthProvider 내부에서 사용해야 합니다.
 * 
 * @example
 * const { user, isLoggedIn, login, logout } = useAuth();
 * 
 * @throws Error - AuthProvider 외부에서 사용 시 에러 발생
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
