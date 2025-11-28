import { useEffect, useState } from 'react';

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return JSON.parse(value);
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${key}=`));
    if (cookie) return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
  } catch (_) {
    return fallback;
  }
  return fallback;
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    document.cookie = `${key}=${encodeURIComponent(serialized)};path=/;max-age=31536000`;
  } catch (_) {
    /* ignore */
  }
};

export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => readStorage(key, initialValue));

  useEffect(() => {
    writeStorage(key, state);
  }, [key, state]);

  return [state, setState];
}

