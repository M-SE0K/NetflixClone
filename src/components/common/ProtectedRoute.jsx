import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import styled, { keyframes } from 'styled-components';

// 로딩 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #141414;
  gap: 20px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(229, 9, 20, 0.3);
  border-radius: 50%;
  border-top-color: #e50914;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: #fff;
  font-size: 16px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

/**
 * ProtectedRoute 컴포넌트
 * 인증된 사용자만 접근 가능한 라우트를 보호
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  // 인증 상태 확인 중
  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>로딩 중...</LoadingText>
      </LoadingContainer>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;

