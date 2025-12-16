/**
 * ProtectedRoute.tsx - 보호된 라우트 컴포넌트
 * 
 * 인증이 필요한 페이지를 보호하는 래퍼 컴포넌트입니다.
 * 로그인하지 않은 사용자가 접근하면 로그인 페이지로 리다이렉트합니다.
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styled, { keyframes } from 'styled-components';

// ============================================
// 애니메이션 정의
// ============================================

/** 로딩 스피너 회전 애니메이션 */
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

/** 텍스트 펄스 애니메이션 */
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// ============================================
// Styled Components
// ============================================

/** 로딩 화면 컨테이너 */
const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #141414;
  gap: 20px;
`;

/** 로딩 스피너 */
const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(229, 9, 20, 0.3);
  border-radius: 50%;
  border-top-color: #e50914;  /* 넷플릭스 레드 */
  animation: ${spin} 1s linear infinite;
`;

/** 로딩 텍스트 */
const LoadingText = styled.p`
  color: #fff;
  font-size: 16px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// ============================================
// 타입 정의
// ============================================

interface ProtectedRouteProps {
  children: ReactNode;  // 보호할 자식 컴포넌트
}

// ============================================
// 컴포넌트
// ============================================

/**
 * ProtectedRoute 컴포넌트
 * 
 * 인증된 사용자만 접근할 수 있는 라우트를 보호합니다.
 * 
 * 동작 방식:
 * 1. 인증 상태 확인 중: 로딩 화면 표시
 * 2. 미인증 사용자: /signin으로 리다이렉트 (이전 위치 저장)
 * 3. 인증된 사용자: 자식 컴포넌트 렌더링
 * 
 * @example
 * // App.tsx에서 사용
 * <Route 
 *   path="/popular" 
 *   element={
 *     <ProtectedRoute>
 *       <Popular />
 *     </ProtectedRoute>
 *   } 
 * />
 * 
 * @param children - 보호할 페이지 컴포넌트
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // 인증 상태와 로딩 상태 가져오기
  const { isLoggedIn, isLoading } = useAuth();
  // 현재 위치 정보 (리다이렉트 후 돌아올 때 사용)
  const location = useLocation();

  // 인증 상태 확인 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>로딩 중...</LoadingText>
      </LoadingContainer>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  // state에 현재 위치를 저장하여 로그인 후 돌아올 수 있도록 함
  if (!isLoggedIn) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 인증된 경우 자식 컴포넌트(보호된 페이지) 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;
