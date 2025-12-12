import { useState, useCallback, createContext, useContext } from 'react';
import styled, { keyframes } from 'styled-components';

// Toast Context 생성
const ToastContext = createContext(null);

// 애니메이션
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const progressShrink = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

// 스타일드 컴포넌트
const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;

  @media (max-width: 480px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const ToastItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  animation: ${props => props.$isExiting ? slideOut : slideIn} 0.3s ease forwards;
  position: relative;
  overflow: hidden;

  ${props => {
    switch (props.$type) {
      case 'success':
        return `
          background: linear-gradient(135deg, #1a472a 0%, #0d2818 100%);
          border: 1px solid rgba(70, 211, 105, 0.3);
        `;
      case 'error':
        return `
          background: linear-gradient(135deg, #4a1515 0%, #2d0a0a 100%);
          border: 1px solid rgba(229, 9, 20, 0.3);
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, #4a3d15 0%, #2d250a 100%);
          border: 1px solid rgba(255, 193, 7, 0.3);
        `;
      case 'info':
      default:
        return `
          background: linear-gradient(135deg, #1a1a4a 0%, #0d0d2d 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
        `;
    }
  }}
`;

const ToastIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`;

const ToastContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToastTitle = styled.p`
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ToastMessage = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  line-height: 1.4;
  word-break: break-word;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #fff;
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  animation: ${progressShrink} ${props => props.$duration}ms linear forwards;

  ${props => {
    switch (props.$type) {
      case 'success':
        return 'background: #46d369;';
      case 'error':
        return 'background: #e50914;';
      case 'warning':
        return 'background: #ffc107;';
      case 'info':
      default:
        return 'background: #3b82f6;';
    }
  }}
`;

// Toast 아이콘 맵핑
const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

// Toast 타이틀 맵핑
const TOAST_TITLES = {
  success: '성공',
  error: '오류',
  warning: '경고',
  info: '알림'
};

/**
 * Toast Provider 컴포넌트
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Toast 추가
  const addToast = useCallback((message, options = {}) => {
    const {
      type = 'info',
      title = TOAST_TITLES[type],
      duration = 4000,
      closable = true
    } = options;

    const id = Date.now() + Math.random();

    const newToast = {
      id,
      message,
      type,
      title,
      duration,
      closable,
      isExiting: false
    };

    setToasts(prev => [...prev, newToast]);

    // 자동 삭제
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  // Toast 삭제 (애니메이션 포함)
  const removeToast = useCallback((id) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, isExiting: true } : toast
      )
    );

    // 애니메이션 후 실제 삭제
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  // 편의 메서드
  const success = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'success' });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'error' });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'warning' });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'info' });
  }, [addToast]);

  const value = {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer>
        {toasts.map(toast => (
          <ToastItem 
            key={toast.id} 
            $type={toast.type}
            $isExiting={toast.isExiting}
          >
            <ToastIcon>{TOAST_ICONS[toast.type]}</ToastIcon>
            <ToastContent>
              <ToastTitle>{toast.title}</ToastTitle>
              <ToastMessage>{toast.message}</ToastMessage>
            </ToastContent>
            {toast.closable && (
              <CloseButton onClick={() => removeToast(toast.id)}>
                ×
              </CloseButton>
            )}
            {toast.duration > 0 && (
              <ProgressBar $type={toast.type} $duration={toast.duration} />
            )}
          </ToastItem>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

/**
 * useToast 커스텀 훅
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default useToast;

