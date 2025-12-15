# M-FLIX - Netflix-Clone (Vite + React + TypeScript)

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

## 📦 설치 및 설정

### 요구 사항
- Node.js 18.x 이상
- npm 9.x 이상
- TMDB API Key ([발급 링크](https://www.themoviedb.org/))

### 빠른 시작 (권장)

```bash
# 1. 저장소 클론
git clone https://github.com/m-se0k/NetflixClone.git
cd NetflixClone

# 2. 의존성 설치
npm install

# 3. 프로젝트 설정 (환경 변수 자동 생성)
npm run setup

# 4. 개발 서버 시작
npm run dev
```

`npm run setup` 명령은 다음을 수행합니다:
- `.env` 파일 생성 및 TMDB API Key 입력 안내
- 프로젝트 구조 검증
- TypeScript 설정 확인

### 수동 설정

환경 변수를 수동으로 설정하려면:

```bash
# .env.example을 복사
cp .env.example .env

# .env 파일을 열어 API Key 입력
```

`.env` 파일 내용:
```env
VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY
```

> 💡 TMDB API Key는 [TMDB 공식 사이트](https://www.themoviedb.org/)에서 무료로 발급받을 수 있습니다.

## 🏃 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (기본 포트: 5173) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 미리보기 |
| `npm run setup` | 프로젝트 초기 설정 |
| `npm run lint` | ESLint 코드 검사 |
| `npm run typecheck` | TypeScript 타입 체크 |
| `npm run deploy` | GitHub Pages 배포 |

```bash
# 개발 서버 시작
npm run dev

# 타입 체크
npm run typecheck

# 프로덕션 빌드 및 배포
npm run build
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

### 배포 URL

🔗 **https://m-se0k.github.io/NetflixClone/**

### CI/CD 파이프라인

GitHub Actions를 통한 자동 배포가 설정되어 있습니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    배포 워크플로우                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   feature/*  ──┬──▶  Pull Request  ──▶  main  ──▶  Deploy   │
│   fix/*       ─┘          │                │                │
│                           │                │                │
│                        Approval       GitHub Actions        │
│                                       자동 빌드 & 배포         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 브랜치 정책

| 브랜치 | 설명 | 직접 Push |
|--------|------|:---------:|
| `main` | 프로덕션 브랜치 (배포 트리거) | ❌ 불가 |
| `feature/*` | 기능 개발 브랜치 | ✅ 가능 |
| `hotfix/*` | 긴급 버그 수정 브랜치 | ✅ 가능 |

> ⚠️ **main 브랜치에 직접 Push가 불가능합니다.** Pull Request를 통해서만 변경사항을 반영할 수 있습니다.

### 배포 프로세스

1. **기능 개발**: `feature/기능명` 브랜치에서 작업
2. **Pull Request 생성**: main 브랜치로 PR 생성
3. **Merge**: PR이 main에 머지되면 자동 배포 시작
4. **배포 완료**: GitHub Pages에 반영 (약 1-2분 소요)

### GitHub Actions 워크플로우

`.github/workflows/deploy.yml`:
- **트리거**: main 브랜치 push 또는 수동 실행
- **Node.js**: 18.x
- **빌드**: `npm ci` → `npm run build`
- **배포**: GitHub Pages artifact 업로드

---

## 📋 릴리즈 노트

버전별 변경사항은 GitHub Releases에서 확인할 수 있습니다.

🔗 **[Releases 보기](https://github.com/m-se0k/NetflixClone/releases)**

### 버전 히스토리

| 버전 | 날짜 | 주요 변경사항 |
|------|------|---------------|
| v1.0.0 | - | 초기 릴리즈 - 기본 기능 구현 |
| v1.1.0 | - | 검색/필터 기능 강화, 무한 스크롤 |
| v2.0.0 | - | TypeScript 마이그레이션, 폴더 구조 개선 |

> 자세한 내용은 [GitHub Releases](https://github.com/m-se0k/NetflixClone/releases) 페이지를 참조하세요.

## ⚠️ 유의사항

1. TMDB API Key가 필요합니다.
2. 회원가입 시 비밀번호 필드에 TMDB API Key를 입력합니다.
3. Wishlist 페이지는 Local Storage만 사용하며 TMDB API를 호출하지 않습니다.
