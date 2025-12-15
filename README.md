# M-FLIX - Netflix-like Demo (Vite + React + TypeScript)

TMDB API를 활용한 넷플릭스 스타일 SPA 데모입니다. TypeScript 기반으로 타입 안정성을 갖추었으며, 인증, 위시리스트, 검색/필터, 인피니트 스크롤, 애니메이션, GitHub Pages 배포를 지원합니다.

## 🚀 기술 스택

### Core
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **React 19** - UI 라이브러리
- **TypeScript** - 정적 타입 지원
- **React Router v6** - SPA 라우팅

### 상태 관리
- **Redux Toolkit** - 전역 상태 관리 (배너 슬라이더 등)
- **Context API** - 인증/위시리스트 상태

### 스타일링 & 애니메이션
- **Styled-Components** - CSS-in-JS
- **Framer Motion** - 페이지/폼/배너 전환 애니메이션

### 유틸리티
- **Axios** - HTTP 클라이언트
- **React-Toastify** - 알림 시스템
- **Lucide React** - 아이콘

## 📦 설치

### 요구 사항
- Node.js 18.x 이상
- npm 9.x 이상

### 설치 명령

```bash
# 저장소 클론
git clone https://github.com/m-se0k/NetflixClone.git
cd NetflixClone

# 의존성 설치
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 TMDB API Key를 입력합니다:

```env
VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY
```

> 💡 TMDB API Key는 [TMDB 공식 사이트](https://www.themoviedb.org/)에서 무료로 발급받을 수 있습니다.

## 🏃 실행

```bash
# 개발 서버 시작 (기본 포트: 5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# ESLint 검사
npm run lint

# GitHub Pages 배포
npm run deploy
```

## 📁 프로젝트 구조

```
src/
├── api/                    # API 유틸리티
│   ├── auth.ts            # 인증 관련 함수
│   └── tmdb.ts            # TMDB API 연동
├── components/
│   ├── common/            # 공통 컴포넌트
│   │   ├── Header.tsx     # 네비게이션 헤더
│   │   └── ProtectedRoute.tsx  # 인증 보호 라우트
│   └── domain/            # 도메인 컴포넌트
│       ├── Banner.tsx     # 메인 배너
│       ├── MovieCard.tsx  # 영화 카드
│       ├── MovieDetailModal.tsx  # 상세 모달
│       ├── MovieGrid.tsx  # 그리드 뷰
│       ├── MovieRow.tsx   # 가로 슬라이더
│       ├── MovieTable.tsx # 테이블 뷰
│       └── PopularFilters.tsx  # 필터 UI
├── hooks/                  # 커스텀 훅
│   ├── useAuth.tsx        # 인증 훅 + Provider
│   ├── useWishlist.tsx    # 위시리스트 훅 + Provider
│   ├── useDebounce.ts     # 디바운스 훅
│   └── useInfiniteScroll.ts  # 무한 스크롤 훅
├── pages/                  # 페이지 컴포넌트
│   ├── Home.tsx           # 홈 페이지
│   ├── Popular.tsx        # 인기 영화 페이지
│   ├── Search.tsx         # 검색 페이지
│   ├── SignIn.tsx         # 로그인/회원가입 페이지
│   └── Wishlist.tsx       # 위시리스트 페이지
├── store/                  # Redux 스토어
│   └── index.ts           # 스토어 설정 + 슬라이스
├── types/                  # TypeScript 타입 정의
│   └── index.ts           # 공통 타입 (Movie, Genre, etc.)
├── App.tsx                # 앱 진입점
├── main.tsx               # React 렌더링
└── index.css              # 글로벌 스타일
```

## 🗺️ 라우트

| 경로 | 보호 | 설명 |
|------|------|------|
| `/signin` | ✅ | 로그인/회원가입, 약관 동의, 폼 애니메이션, 우주 배경 |
| `/` | ✅ | 홈 - 배너 자동 슬라이더(10초), 카테고리별 영화 슬라이더 |
| `/popular` | ✅ | 인기 영화 - 그리드/테이블 뷰, 무한 스크롤, 정렬/필터 |
| `/search` | ✅ | 검색 - 디바운스, 다중 장르, 요일별 추천, 최근 검색어 |
| `/wishlist` | ✅ | 찜 목록 - Local Storage 기반, API 호출 없음 |

## 💾 Local Storage 사용

| 키 | 용도 |
|----|------|
| `movieWishlist` | 위시리스트 데이터 (새로고침 후에도 유지) |
| `recentSearches` | 최근 검색어 (최대 8개) |
| `users` | 등록된 사용자 목록 |
| `TMDb-Key` | 로그인된 사용자의 TMDB API Key |
| `currentUser` | 현재 로그인된 사용자 정보 |
| `rememberMe` | 로그인 유지 설정 |

## 🎨 주요 기능

### 인증
- 이메일 + TMDB API Key 기반 로그인/회원가입
- 비밀번호(API Key) 표시/숨김 토글
- 필수 약관 동의
- Remember Me 기능

### 영화 탐색
- 카테고리별 영화 슬라이더 (트렌딩, 인기, 최고 평점 등)
- 자동 배너 슬라이더 (10초 간격)
- 무한 스크롤 (그리드 뷰)
- 테이블/그리드 뷰 전환
- 다중 장르 필터링
- 평점/개봉일/인기도 정렬

### 위시리스트
- 클릭으로 즉시 추가/제거
- Toast 알림으로 피드백
- 상세 모달에서도 토글 가능

### 애니메이션
- 페이지 전환 (Fade + Blur)
- 폼 전환 (Slide + Fade)
- 카드/테이블 행 셔플 효과
- 배너 슬라이드 (FadeInRight/FadeOutLeft)

## 🌐 배포

GitHub Pages로 자동 배포됩니다:

```bash
# 수동 배포
npm run deploy
```

배포 URL: `https://m-se0k.github.io/NetflixClone/`

## ⚠️ 유의사항

1. TMDB API Key가 필요합니다.
2. 회원가입 시 비밀번호 필드에 TMDB API Key를 입력합니다.
3. Wishlist 페이지는 Local Storage만 사용하며 TMDB API를 호출하지 않습니다.

## 📄 라이선스

MIT License
