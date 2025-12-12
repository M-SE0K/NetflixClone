import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';

// 임시 홈 컴포넌트 (나중에 대체 예정)
const Home = () => (
  <div style={{ 
    minHeight: '100vh', 
    background: '#141414', 
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '20px'
  }}>
    <h1 style={{ fontSize: '3rem', color: '#e50914' }}>🎬 NETFLEX</h1>
    <p>메인 페이지 - 곧 구현 예정</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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
          
          {/* 나중에 추가될 라우트들 */}
          {/* <Route path="/popular" element={<ProtectedRoute><Popular /></ProtectedRoute>} /> */}
          {/* <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} /> */}
          {/* <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} /> */}
          
          {/* 404 - 존재하지 않는 경로는 홈으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
