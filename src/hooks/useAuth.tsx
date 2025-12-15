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

// Auth Context 생성
const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider 컴포넌트
 * 전역 인증 상태 관리
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 인증 상태 확인
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

  // 로그인
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

  // 회원가입
  const register = useCallback(async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setIsLoading(true);
    
    const result = await apiRegister(email, password);
    
    setIsLoading(false);
    return result;
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  // API Key 가져오기
  const apiKey = getApiKey();

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

/**
 * useAuth 커스텀 훅
 * 인증 관련 상태 및 함수 사용
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;

