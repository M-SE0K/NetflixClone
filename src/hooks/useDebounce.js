import { useState, useEffect } from 'react';

/**
 * Debounce 커스텀 훅
 * 값이 변경된 후 지정된 시간이 지난 후에만 업데이트된 값을 반환
 * 
 * @param {any} value - 디바운스할 값
 * @param {number} delay - 지연 시간 (밀리초)
 * @returns {any} - 디바운스된 값
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 지연 후 값 업데이트
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업: 값이 변경되면 이전 타이머 취소
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;

