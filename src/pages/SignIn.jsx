import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../hooks/useAuth.jsx';

// 애니메이션 정의
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(20, 20, 20, 0.95) 50%,
    rgba(0, 0, 0, 0.9) 100%
  ),
  url('https://assets.nflxext.com/ffe/siteui/vlv3/a56dc29b-a0ec-4f6f-85fb-50df0680f80f/2f8ae902-8efe-49bb-9a91-51b6fcc8bf46/KR-ko-20240617-popsignuptwoweeks-perspective_alpha_website_large.jpg');
  background-size: cover;
  background-position: center;
  padding: 20px;
`;

const FormWrapper = styled.div`
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 60px 68px 40px;
  width: 100%;
  max-width: 450px;
  animation: ${fadeIn} 0.5s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

  @media (max-width: 740px) {
    padding: 40px 30px;
    max-width: 100%;
    background: rgba(0, 0, 0, 0.75);
  }
`;

const Logo = styled.div`
  font-family: 'Bebas Neue', 'Arial Black', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #e50914;
  text-align: center;
  margin-bottom: 30px;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h1`
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 28px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  background: #333;
  border: 1px solid ${props => props.$hasError ? '#e87c03' : 'transparent'};
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  transition: all 0.2s ease;
  animation: ${props => props.$hasError ? shake : 'none'} 0.4s ease;

  &:focus {
    outline: none;
    background: #454545;
    border-color: ${props => props.$hasError ? '#e87c03' : '#e50914'};
  }

  &::placeholder {
    color: #8c8c8c;
  }
`;

const ErrorText = styled.span`
  color: #e87c03;
  font-size: 13px;
  margin-top: 6px;
  display: block;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #e50914;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #f40612;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #e50914;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  color: #b3b3b3;
  font-size: 14px;
  cursor: pointer;
`;

const SwitchText = styled.p`
  color: #737373;
  font-size: 16px;
  margin-top: 24px;
  text-align: center;
`;

const SwitchLink = styled.span`
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s;

  &:hover {
    text-decoration: underline;
    color: #e50914;
  }
`;

const InfoBox = styled.div`
  background: rgba(229, 9, 20, 0.1);
  border: 1px solid rgba(229, 9, 20, 0.3);
  border-radius: 4px;
  padding: 16px;
  margin-top: 24px;
  color: #b3b3b3;
  font-size: 13px;
  line-height: 1.6;

  strong {
    color: #e50914;
  }

  a {
    color: #e50914;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SignIn = () => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일 형식이 아닙니다.';
    }

    // API Key 검증
    if (!formData.password) {
      newErrors.password = 'TMDB API Key를 입력해주세요.';
    } else if (formData.password.length < 10) {
      newErrors.password = 'API Key가 너무 짧습니다.';
    }

    // 회원가입 모드일 때 비밀번호 확인
    if (!isLoginMode) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'API Key를 다시 입력해주세요.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'API Key가 일치하지 않습니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 입력 시 해당 필드 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLoginMode) {
      // 로그인
      const result = await login(formData.email, formData.password, rememberMe);
      
      if (result.success) {
        navigate('/');
      } else {
        setSubmitError(result.error);
      }
    } else {
      // 회원가입
      const result = await register(formData.email, formData.password);
      
      if (result.success) {
        setSubmitError('');
        setIsLoginMode(true);
        setFormData(prev => ({ ...prev, confirmPassword: '' }));
        alert('회원가입이 완료되었습니다. 로그인해주세요!');
      } else {
        setSubmitError(result.error);
      }
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setSubmitError('');
    setFormData({
      email: formData.email,
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <Container>
      <FormWrapper>
        <Logo>NETFLEX</Logo>
        <Title>{isLoginMode ? '로그인' : '회원가입'}</Title>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="email"
              name="email"
              placeholder="이메일 주소"
              value={formData.email}
              onChange={handleChange}
              $hasError={!!errors.email}
              autoComplete="email"
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Input
              type="password"
              name="password"
              placeholder="TMDB API Key"
              value={formData.password}
              onChange={handleChange}
              $hasError={!!errors.password}
              autoComplete={isLoginMode ? 'current-password' : 'new-password'}
            />
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
          </InputGroup>

          {!isLoginMode && (
            <InputGroup>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="TMDB API Key 확인"
                value={formData.confirmPassword}
                onChange={handleChange}
                $hasError={!!errors.confirmPassword}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
            </InputGroup>
          )}

          {submitError && <ErrorText>{submitError}</ErrorText>}

          {isLoginMode && (
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <CheckboxLabel htmlFor="rememberMe">로그인 상태 유지</CheckboxLabel>
            </CheckboxWrapper>
          )}

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : (isLoginMode ? '로그인' : '회원가입')}
          </SubmitButton>
        </Form>

        <SwitchText>
          {isLoginMode ? '처음이신가요? ' : '이미 계정이 있으신가요? '}
          <SwitchLink onClick={toggleMode}>
            {isLoginMode ? '지금 가입하세요.' : '로그인하세요.'}
          </SwitchLink>
        </SwitchText>

        <InfoBox>
          <strong>💡 TMDB API Key가 필요합니다!</strong>
          <br /><br />
          1. <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB 웹사이트</a>에 가입하세요.
          <br />
          2. 설정 → API에서 API Key를 발급받으세요.
          <br />
          3. 발급받은 API Key를 비밀번호로 사용하세요.
        </InfoBox>
      </FormWrapper>
    </Container>
  );
};

export default SignIn;

