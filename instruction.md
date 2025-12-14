# Netflix Clone Project Requirements

## 개요
이 과제는 TMDB API를 활용하여 넷플릭스 클론 웹사이트를 구현하는 프론트엔드 프로젝트입니다.
React 기반의 SPA(Single Page Application)를 개발하며, 반응형 디자인과 다양한 영화/TV 정보 제공을 목표로 합니다.

## 핵심 요구사항

### 1. 기술 스택
- **Framework**: React + Vite
- **Language**: JavaScript or TypeScript
- **Styling**: Styled-Components (권장) 또는 CSS Modules, Tailwind CSS 등 자유
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Deploy**: GitHub Pages

### 2. 주요 기능 (Features)
- **메인 페이지 (Home)**
  - 대형 배너 (Billboard): 인기 영화 예고편 또는 이미지 재생
  - 카테고리별 슬라이더 (Row): '지금 뜨는 콘텐츠', '다시보기 추천' 등
- **검색 (Search)**
  - 영화/TV 프로그램 검색 기능
  - 실시간 검색 결과 표시 (Debounce 적용 권장)
- **상세 페이지 (Detail)**
  - 콘텐츠 클릭 시 모달 또는 별도 페이지로 상세 정보 표시
  - 줄거리, 장르, 출연진, 평점 등 정보 제공
- **반응형 디자인 (Responsive)**
  - 데스크탑, 태블릿, 모바일 등 다양한 해상도 지원

### 3. API 연동 (TMDB)
- **API Key**: `.env` 파일로 분리하여 보안 관리
- **Endpoints**:
  - Trending (주간/일간 트렌드)
  - Top Rated
  - Action, Comedy, Horror, Romance, Documentaries 등 장르별 목록
  - Movie/TV Details

### 4. 제약 사항
- **Optional 기능 제외**: 로그인/회원가입, 결제, 찜하기(My List) 기능은 구현하지 않음.
- **Gitflow**: `main`, `develop`, `feature/*` 브랜치 전략 준수.

## 참고 자료
- TMDB API: https://www.themoviedb.org/documentation/api
- Demo Site: http://clinic.jbnu.ac.kr:3000/24-02-WSD-Assignment-02-Demo/

