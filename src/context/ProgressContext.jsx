import React, { createContext, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

const ProgressContext = createContext(null);

const defaultProgress = {
  listening: {
    queue: [],
    index: 0,
    completed: false,
    stats: { correct: 0, incorrect: 0, history: [] },
  },
  phonetic: {
    queue: [],
    stats: { correct: 0, incorrect: 0, history: [] },
  },
};

const clampHistory = (history) => history.slice(-200);

export function ProgressProvider({ children }) {
  const [progress, setProgress] = usePersistentState('lc-progress', defaultProgress);

  const value = useMemo(() => ({
    progress,
    setListeningState: (next) =>
      setProgress((prev) => ({
        ...prev,
        listening: { ...prev.listening, ...next },
      })),
    recordListeningResult: (entry) =>
      setProgress((prev) => ({
        ...prev,
        listening: {
          ...prev.listening,
          stats: {
            correct: prev.listening.stats.correct + (entry.correct ? 1 : 0),
            incorrect: prev.listening.stats.incorrect + (!entry.correct ? 1 : 0),
            history: clampHistory([...prev.listening.stats.history, { ...entry, ts: Date.now() }]),
          },
        },
      })),
    resetListening: () =>
      setProgress((prev) => ({
        ...prev,
        listening: defaultProgress.listening,
      })),

    setPhoneticState: (next) =>
      setProgress((prev) => ({
        ...prev,
        phonetic: { ...prev.phonetic, ...next },
      })),
    recordPhoneticResult: (entry) =>
      setProgress((prev) => ({
        ...prev,
        phonetic: {
          ...prev.phonetic,
          stats: {
            correct: prev.phonetic.stats.correct + (entry.correct ? 1 : 0),
            incorrect: prev.phonetic.stats.incorrect + (!entry.correct ? 1 : 0),
            history: clampHistory([...prev.phonetic.stats.history, { ...entry, ts: Date.now() }]),
          },
        },
      })),
    resetPhonetic: () =>
      setProgress((prev) => ({
        ...prev,
        phonetic: defaultProgress.phonetic,
      })),
    resetAll: () => setProgress(defaultProgress),
  }), [progress, setProgress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}

