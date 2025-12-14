import { configureStore, createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    bannerIndex: 0
  },
  reducers: {
    setBannerIndex: (state, action) => {
      state.bannerIndex = action.payload ?? 0;
    },
    nextBanner: (state, action) => {
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


