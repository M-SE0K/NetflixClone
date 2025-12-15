import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './hooks/useAuth';
import { WishlistProvider } from './hooks/useWishlist';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/common/ProtectedRoute';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Popular from './pages/Popular';
import Search from './pages/Search';
import Wishlist from './pages/Wishlist';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' as const }
  }
};

const PageTransition = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        <Routes location={location}>
          {/* 로그인/회원가입 페이지 */}
          <Route path="/signin" element={<SignIn />} />
          
          {/* 보호된 라우트들 */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/popular" 
            element={
              <ProtectedRoute>
                <Popular />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } 
          />
          
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

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <WishlistProvider>
          <HashRouter>
            <PageTransition />
            <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop />
          </HashRouter>
        </WishlistProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;

