import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
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
  flex-shrink: 0;
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

// 약관 동의 관련 스타일
const TermsSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  border: 1px solid ${props => props.$hasError ? '#e87c03' : 'rgba(255, 255, 255, 0.1)'};
`;

const TermsTitle = styled.p`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const TermsCheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TermsCheckbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #e50914;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
`;

const TermsLabel = styled.label`
  color: #b3b3b3;
  font-size: 13px;
  cursor: pointer;
  line-height: 1.4;
  flex: 1;
`;

const RequiredBadge = styled.span`
  color: #e50914;
  font-size: 11px;
  font-weight: 600;
  margin-left: 4px;
`;

const ViewTermsButton = styled.button`
  background: none;
  border: none;
  color: #e50914;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  text-decoration: underline;

  &:hover {
    color: #f40612;
  }
`;

const AllAgreeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const AllAgreeLabel = styled.label`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

// 약관 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  color: #b3b3b3;
  font-size: 14px;
  line-height: 1.8;

  h3 {
    color: #fff;
    font-size: 16px;
    margin: 20px 0 10px;

    &:first-child {
      margin-top: 0;
    }
  }

  p {
    margin-bottom: 12px;
  }

  ul {
    padding-left: 20px;
    margin-bottom: 12px;
  }

  li {
    margin-bottom: 6px;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 10px 24px;
  background: #e50914;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f40612;
  }
`;

// 약관 내용 데이터
const TERMS_DATA = {
  terms: {
    title: '이용약관',
    content: `
      <h3>제1조 (목적)</h3>
      <p>이 약관은 NETFLEX(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
      
      <h3>제2조 (정의)</h3>
      <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
      <ul>
        <li>"서비스"란 회사가 제공하는 영화 정보 서비스를 의미합니다.</li>
        <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 의미합니다.</li>
        <li>"TMDB API Key"란 The Movie Database에서 발급받은 API 인증키를 의미합니다.</li>
      </ul>
      
      <h3>제3조 (약관의 효력 및 변경)</h3>
      <p>이 약관은 서비스를 이용하고자 하는 모든 회원에게 그 효력이 발생합니다. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</p>
      
      <h3>제4조 (서비스 이용)</h3>
      <p>회원은 TMDB API Key를 통해 서비스에 접근할 수 있으며, API Key의 관리 책임은 회원에게 있습니다. 부정한 방법으로 서비스를 이용하는 경우 서비스 이용이 제한될 수 있습니다.</p>
      
      <h3>제5조 (면책조항)</h3>
      <p>본 서비스는 TMDB API를 활용한 학습 목적의 데모 서비스입니다. 회사는 서비스의 정확성, 완전성, 신뢰성에 대해 보증하지 않습니다.</p>
    `
  },
  privacy: {
    title: '개인정보 처리방침',
    content: `
      <h3>제1조 (개인정보의 수집 및 이용목적)</h3>
      <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않습니다.</p>
      <ul>
        <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인 확인, 서비스 부정 이용 방지</li>
        <li>서비스 제공: 영화 정보 제공, 찜하기 기능 등 맞춤 서비스 제공</li>
      </ul>
      
      <h3>제2조 (수집하는 개인정보 항목)</h3>
      <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
      <ul>
        <li>필수항목: 이메일 주소, TMDB API Key</li>
        <li>자동 수집 항목: 서비스 이용 기록, 찜한 영화 목록</li>
      </ul>
      
      <h3>제3조 (개인정보의 보유 및 이용기간)</h3>
      <p>회원의 개인정보는 Local Storage에 저장되며, 브라우저 데이터 삭제 시 함께 삭제됩니다. 회사의 서버에는 개인정보가 저장되지 않습니다.</p>
      
      <h3>제4조 (개인정보의 제3자 제공)</h3>
      <p>회사는 회원의 개인정보를 제3자에게 제공하지 않습니다.</p>
      
      <h3>제5조 (정보주체의 권리)</h3>
      <p>회원은 언제든지 자신의 개인정보를 조회하거나 수정, 삭제할 수 있습니다. 브라우저의 Local Storage를 삭제하면 모든 개인정보가 삭제됩니다.</p>
    `
  }
};

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
  
  // 약관 동의 상태
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    age: false
  });
  const [termsModal, setTermsModal] = useState({ open: false, type: null });

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

    // 회원가입 모드일 때
    if (!isLoginMode) {
      // 비밀번호 확인
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'API Key를 다시 입력해주세요.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'API Key가 일치하지 않습니다.';
      }

      // 필수 약관 동의 확인
      if (!agreements.terms || !agreements.privacy || !agreements.age) {
        newErrors.agreements = '필수 약관에 모두 동의해주세요.';
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

  // 약관 동의 핸들러
  const handleAgreementChange = (type) => {
    if (type === 'all') {
      const newValue = !agreements.all;
      setAgreements({
        all: newValue,
        terms: newValue,
        privacy: newValue,
        age: newValue
      });
    } else {
      const newAgreements = {
        ...agreements,
        [type]: !agreements[type]
      };
      // 모든 개별 항목이 체크되면 전체 동의도 체크
      newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.age;
      setAgreements(newAgreements);
    }

    // 약관 에러 제거
    if (errors.agreements) {
      setErrors(prev => ({ ...prev, agreements: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLoginMode) {
      // 로그인
      const result = await login(formData.email, formData.password, rememberMe);
      
      if (result.success) {
        toast.success('로그인되었습니다!', {
          title: '환영합니다 🎉',
          duration: 3000
        });
        navigate('/');
      } else {
        toast.error(result.error);
        setSubmitError(result.error);
      }
    } else {
      // 회원가입
      const result = await register(formData.email, formData.password);
      
      if (result.success) {
        setSubmitError('');
        setIsLoginMode(true);
        setFormData(prev => ({ ...prev, confirmPassword: '' }));
        setAgreements({ all: false, terms: false, privacy: false, age: false });
        toast.success('회원가입이 완료되었습니다! 로그인해주세요.', {
          title: '가입 완료 🎊',
          duration: 5000
        });
      } else {
        toast.error(result.error);
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
    setAgreements({ all: false, terms: false, privacy: false, age: false });
  };

  const openTermsModal = (type) => {
    setTermsModal({ open: true, type });
  };

  const closeTermsModal = () => {
    setTermsModal({ open: false, type: null });
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

          {/* 회원가입 시 약관 동의 */}
          {!isLoginMode && (
            <TermsSection $hasError={!!errors.agreements}>
              <TermsTitle>약관 동의</TermsTitle>
              
              {/* 전체 동의 */}
              <AllAgreeWrapper>
                <TermsCheckbox
                  type="checkbox"
                  id="agreeAll"
                  checked={agreements.all}
                  onChange={() => handleAgreementChange('all')}
                />
                <AllAgreeLabel htmlFor="agreeAll">
                  전체 동의하기
                </AllAgreeLabel>
              </AllAgreeWrapper>

              {/* 이용약관 */}
              <TermsCheckboxWrapper>
                <TermsCheckbox
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreements.terms}
                  onChange={() => handleAgreementChange('terms')}
                />
                <TermsLabel htmlFor="agreeTerms">
                  이용약관 동의
                  <RequiredBadge>(필수)</RequiredBadge>
                  <ViewTermsButton type="button" onClick={() => openTermsModal('terms')}>
                    보기
                  </ViewTermsButton>
                </TermsLabel>
              </TermsCheckboxWrapper>

              {/* 개인정보 처리방침 */}
              <TermsCheckboxWrapper>
                <TermsCheckbox
                  type="checkbox"
                  id="agreePrivacy"
                  checked={agreements.privacy}
                  onChange={() => handleAgreementChange('privacy')}
                />
                <TermsLabel htmlFor="agreePrivacy">
                  개인정보 처리방침 동의
                  <RequiredBadge>(필수)</RequiredBadge>
                  <ViewTermsButton type="button" onClick={() => openTermsModal('privacy')}>
                    보기
                  </ViewTermsButton>
                </TermsLabel>
              </TermsCheckboxWrapper>

              {/* 만 14세 이상 */}
              <TermsCheckboxWrapper>
                <TermsCheckbox
                  type="checkbox"
                  id="agreeAge"
                  checked={agreements.age}
                  onChange={() => handleAgreementChange('age')}
                />
                <TermsLabel htmlFor="agreeAge">
                  만 14세 이상입니다
                  <RequiredBadge>(필수)</RequiredBadge>
                </TermsLabel>
              </TermsCheckboxWrapper>

              {errors.agreements && <ErrorText>{errors.agreements}</ErrorText>}
            </TermsSection>
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

      {/* 약관 상세 모달 */}
      {termsModal.open && termsModal.type && (
        <ModalOverlay onClick={closeTermsModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{TERMS_DATA[termsModal.type].title}</ModalTitle>
              <ModalCloseButton onClick={closeTermsModal}>×</ModalCloseButton>
            </ModalHeader>
            <ModalBody 
              dangerouslySetInnerHTML={{ __html: TERMS_DATA[termsModal.type].content }} 
            />
            <ModalFooter>
              <ModalButton onClick={closeTermsModal}>확인</ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default SignIn;
