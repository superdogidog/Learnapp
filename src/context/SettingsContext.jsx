import React, { createContext, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

const SettingsContext = createContext(null);

const defaultSettings = {
  theme: 'light',
  autoAdvance: true,
  advanceDelay: 1300,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = usePersistentState('lc-settings', defaultSettings);

  const value = useMemo(() => ({
    settings,
    setTheme: (theme) => setSettings((prev) => ({ ...prev, theme })),
    setAutoAdvance: (autoAdvance) => setSettings((prev) => ({ ...prev, autoAdvance })),
    setAdvanceDelay: (advanceDelay) => setSettings((prev) => ({ ...prev, advanceDelay })),
    resetSettings: () => setSettings(defaultSettings),
  }), [settings, setSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

