# Netflix-like Demo (Vite + React)

TMDB API를 활용한 넷플릭스 스타일 SPA 데모입니다. 인증, 위시리스트, 검색/필터, 인피니트 스크롤, 애니메이션, GitHub Pages 배포를 지원합니다.

## 기술 스택
- Vite, React, React Router v6
- Redux Toolkit (배너 등 UI 상태)
- Styled-Components
- Framer Motion (페이지/폼/배너 전환)
- React-Toastify (알림)
- Axios, Lucide React Icons

## 실행
```bash
npm install
npm run dev         # 로컬 개발 (기본 5173)
npm run build       # 프로덕션 빌드
npm run preview     # 빌드 미리보기
```

### 환경 변수
`.env`
```
VITE_TMDB_API_KEY=YOUR_TMDB_KEY
```

## 라우트
- `/signin` (비보호): 이메일 + TMDB API Key 로그인/회원가입, 약관 동의, 비밀번호 보이기 토글, 폼 전환 애니메이션, 우주/성운 배경, Toast 안내.
- `/` (보호): 홈 배너 자동 슬라이더(10초, fade), 여러 카테고리 슬라이더, 카드 셔플 애니메이션.
- `/popular` (보호): 인기 영화, 그리드/테이블, 인피니트 스크롤, 정렬·필터(장르/국가/평점), 테이블 페이지 전환 로딩 애니메이션, 셔플 행 애니메이션.
- `/search` (보호): 디바운스 검색, 다중 장르 선택, 정렬·평점 필터, 최근 검색어 저장/표시(Local Storage), 요일별 추천 장르 프리셋, 인피니트 스크롤.
- `/wishlist` (보호): Local Storage 기반 찜 목록(테이블/그리드), 외부 API 호출 없음.

## 공통 UX
- 헤더: Lucide 아이콘, 호버 드롭다운, 위시리스트 카운트 배지, 스크롤 반응형 스타일.
- 위시리스트 토글: 모든 카드/테이블에서 사용. 포스터 클릭 = 위시리스트 추가(이미 찜이면 무동작), 상세는 정보 아이콘/호버 액션으로만 열림.
- 페이지 전환: 모든 라우트에 공통 Fade/Blur 전환(Framer Motion).
- 애니메이션: 배너 슬라이드 fade, 카드/테이블 셔플, 폼 전환 fade.

## 폴더 구조
- `src/pages`: 라우트별 페이지
- `src/components/common`: 공통/유틸 컴포넌트 (헤더, 보호 라우트 등)
- `src/components/domain`: 도메인 UI (배너, 카드/그리드/테이블, 필터, 슬라이더 등)
- `src/hooks`: 커스텀 훅 (auth, wishlist, infinite scroll, debounce)
- `src/api`: TMDB, auth 유틸
- `src/store`: Redux Toolkit 슬라이스
- `src/styles`: 글로벌 스타일/테마 (필요 시)

## Local Storage 사용
- `movieWishlist`: 위시리스트 (새로고침 후 유지, 외부 API 없음)
- `recentSearches`: 최근 검색어 최대 8개
- Auth: TMDB API Key를 비밀번호처럼 저장(과제 요구사항)

## 알림
- 위시리스트 추가 시: `"[영화명] 이 위시리스트에 추가되었습니다!"` Toast
- 로그인/회원가입 성공/실패 Toast

## 유의사항
- TMDB API Key 필요.
