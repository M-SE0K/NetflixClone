/**
 * App.tsx - 메인 애플리케이션 컴포넌트
 * 
 * 이 파일은 전체 애플리케이션의 진입점으로,
 * 라우팅, 전역 상태 관리, 페이지 전환 애니메이션을 담당합니다.
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './hooks/useAuth';
import { WishlistProvider } from './hooks/useWishlist';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

// 컴포넌트 임포트
import ProtectedRoute from './components/common/ProtectedRoute';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Popular from './pages/Popular';
import Search from './pages/Search';
import Wishlist from './pages/Wishlist';

/**
 * 페이지 전환 애니메이션 설정
 * Framer Motion을 사용하여 부드러운 페이지 전환 구현
 */
const pageVariants = {
  // 초기 상태: 투명하고 약간 아래에 위치
  initial: { opacity: 0, y: 12 },
  // 애니메이션 완료 상태: 완전히 보이고 원래 위치
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const }
  },
  // 종료 상태: 투명해지며 약간 위로 이동
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' as const }
  }
};

/**
 * PageTransition 컴포넌트
 * 페이지 변경 시 애니메이션을 적용하고 라우팅을 처리
 */
const PageTransition = () => {
  // 현재 경로 정보 가져오기
  const location = useLocation();

  return (
    // AnimatePresence: 컴포넌트가 DOM에서 제거될 때도 애니메이션 적용
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}  // 경로가 변경될 때마다 새로운 애니메이션 트리거
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        <Routes location={location}>
          {/* 로그인/회원가입 페이지 - 비보호 라우트 */}
          <Route path="/signin" element={<SignIn />} />
          
          {/* 홈 페이지 - 로그인 필요 */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          {/* 인기 영화 페이지 - 로그인 필요 */}
          <Route 
            path="/popular" 
            element={
              <ProtectedRoute>
                <Popular />
              </ProtectedRoute>
            } 
          />
          
          {/* 검색 페이지 - 로그인 필요 */}
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } 
          />
          
          {/* 찜 목록 페이지 - 로그인 필요 */}
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 - 존재하지 않는 경로는 홈으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * App 컴포넌트 - 애플리케이션 루트
 * 
 * Provider 구조:
 * 1. Redux Provider: 전역 상태 관리 (배너 인덱스 등)
 * 2. AuthProvider: 인증 상태 관리 (로그인, 로그아웃)
 * 3. WishlistProvider: 찜 목록 상태 관리
 * 4. BrowserRouter: 클라이언트 사이드 라우팅
 */
function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <WishlistProvider>
          {/* basename: GitHub Pages 배포를 위한 기본 경로 설정 */}
          <BrowserRouter basename="/NetflixClone">
            <PageTransition />
            {/* 토스트 알림 컨테이너 */}
            <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop />
          </BrowserRouter>
        </WishlistProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
