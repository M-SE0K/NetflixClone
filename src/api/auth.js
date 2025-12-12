/**
 * Authentication Utility Functions
 * Local Storage를 활용한 사용자 인증 관리
 */

// Local Storage 키 상수
const STORAGE_KEYS = {
  USERS: 'users',
  TMDB_KEY: 'TMDb-Key',
  CURRENT_USER: 'currentUser',
  REMEMBER_ME: 'rememberMe'
};

/**
 * 로그인 시도
 * @param {string} email - 사용자 이메일
 * @param {string} password - TMDB API Key
 * @param {boolean} rememberMe - 로그인 상태 유지 여부
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const tryLogin = async (email, password, rememberMe = false) => {
  try {
    // 저장된 사용자 목록 가져오기
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    const users = usersData ? JSON.parse(usersData) : [];

    // 사용자 찾기
    const user = users.find(
      (u) => u.id === email && u.password === password
    );

    if (user) {
      // API 키 유효성 검증 (TMDB API 호출 테스트)
      const isValidKey = await validateTMDbKey(password);
      
      if (!isValidKey) {
        return {
          success: false,
          error: '유효하지 않은 TMDB API Key입니다.'
        };
      }

      // 로그인 성공 - 정보 저장
      localStorage.setItem(STORAGE_KEYS.TMDB_KEY, password);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ email: user.id }));
      
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ email: user.id }));
        sessionStorage.setItem(STORAGE_KEYS.TMDB_KEY, password);
      }

      return {
        success: true,
        user: { email: user.id }
      };
    }

    return {
      success: false,
      error: '이메일 또는 API Key가 일치하지 않습니다.'
    };
  } catch (error) {
    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 회원가입 시도
 * @param {string} email - 사용자 이메일
 * @param {string} password - TMDB API Key
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const tryRegister = async (email, password) => {
  try {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: '유효한 이메일 형식이 아닙니다.'
      };
    }

    // TMDB API Key 유효성 검증
    const isValidKey = await validateTMDbKey(password);
    if (!isValidKey) {
      return {
        success: false,
        error: '유효하지 않은 TMDB API Key입니다. TMDB에서 API Key를 발급받으세요.'
      };
    }

    // 저장된 사용자 목록 가져오기
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    const users = usersData ? JSON.parse(usersData) : [];

    // 이미 존재하는 사용자인지 확인
    const userExists = users.some((user) => user.id === email);
    if (userExists) {
      return {
        success: false,
        error: '이미 등록된 이메일입니다.'
      };
    }

    // 새 사용자 추가
    users.push({ id: email, password: password });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: '회원가입 중 오류가 발생했습니다.'
    };
  }
};

/**
 * TMDB API Key 유효성 검증
 * @param {string} apiKey - TMDB API Key
 * @returns {Promise<boolean>}
 */
export const validateTMDbKey = async (apiKey) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR&page=1`
    );
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * 로그아웃
 */
export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.TMDB_KEY);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  sessionStorage.removeItem(STORAGE_KEYS.TMDB_KEY);
};

/**
 * 현재 로그인 상태 확인
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
  
  if (rememberMe === 'true') {
    return !!(
      localStorage.getItem(STORAGE_KEYS.TMDB_KEY) &&
      localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    );
  }
  
  return !!(
    (localStorage.getItem(STORAGE_KEYS.TMDB_KEY) || sessionStorage.getItem(STORAGE_KEYS.TMDB_KEY)) &&
    (localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER))
  );
};

/**
 * 현재 사용자 정보 가져오기
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 
                   sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userData ? JSON.parse(userData) : null;
};

/**
 * 저장된 TMDB API Key 가져오기
 * @returns {string|null}
 */
export const getApiKey = () => {
  return localStorage.getItem(STORAGE_KEYS.TMDB_KEY) || 
         sessionStorage.getItem(STORAGE_KEYS.TMDB_KEY);
};

