/**
 * Redux Store 설정 파일
 * 
 * Redux Toolkit을 사용하여 전역 상태 관리를 구현합니다.
 * 현재는 UI 상태(배너 인덱스)만 관리하고 있습니다.
 */

import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState } from '../types';

// ============================================
// UI Slice 정의
// ============================================

/**
 * UI 상태 초기값
 * bannerIndex: 홈 화면의 메인 배너 슬라이더 인덱스
 */
const initialState: UIState = {
  bannerIndex: 0
};

/**
 * UI Slice
 * 배너 관련 상태와 액션을 정의합니다.
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * 배너 인덱스를 직접 설정
     * @param action.payload - 설정할 인덱스 값
     */
    setBannerIndex: (state, action: PayloadAction<number>) => {
      state.bannerIndex = action.payload ?? 0;
    },
    
    /**
     * 다음 배너로 이동 (순환)
     * @param action.payload - 전체 배너 개수
     */
    nextBanner: (state, action: PayloadAction<number>) => {
      const length = action.payload || 1;
      if (length <= 0) return;
      // 마지막 배너에서 다음으로 이동하면 처음으로 돌아감
      state.bannerIndex = (state.bannerIndex + 1) % length;
    },
    
    /**
     * 배너 인덱스 초기화
     */
    resetBanner: (state) => {
      state.bannerIndex = 0;
    }
  }
});

// 액션 내보내기
export const { setBannerIndex, nextBanner, resetBanner } = uiSlice.actions;

// ============================================
// Store 구성
// ============================================

/**
 * Redux Store 생성
 * 여러 슬라이스를 결합하여 단일 스토어 구성
 */
export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer  // UI 상태 리듀서
  }
});

// ============================================
// 타입 추론
// ============================================

/** 전체 상태 타입 (자동 추론) */
export type RootState = ReturnType<typeof store.getState>;

/** 디스패치 타입 (비동기 액션 지원) */
export type AppDispatch = typeof store.dispatch;
