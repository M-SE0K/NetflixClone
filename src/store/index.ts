import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState } from '../types';

const initialState: UIState = {
  bannerIndex: 0
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBannerIndex: (state, action: PayloadAction<number>) => {
      state.bannerIndex = action.payload ?? 0;
    },
    nextBanner: (state, action: PayloadAction<number>) => {
      const length = action.payload || 1;
      if (length <= 0) return;
      state.bannerIndex = (state.bannerIndex + 1) % length;
    },
    resetBanner: (state) => {
      state.bannerIndex = 0;
    }
  }
});

export const { setBannerIndex, nextBanner, resetBanner } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer
  }
});

// Redux 타입 추론
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

