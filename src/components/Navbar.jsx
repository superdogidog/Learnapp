import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext.jsx';
import SettingsDrawer from './SettingsDrawer.jsx';

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-lg transition-colors duration-200 ${
    isActive ? 'text-white bg-accent' : 'text-gray-700 hover:text-accent hover:bg-rose-50'
  }`;

export default function Navbar() {
  const { settings, setTheme } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggleTheme = () => setTheme(settings.theme === 'light' ? 'dark' : 'light');
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 bg-white/70 dark:bg-slate-900/70 border-b border-rose-100 dark:border-slate-800">
      <div className="page-container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-coral shadow-soft flex items-center justify-center text-white text-xl">汉</div>
          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight text-gray-900">Learn Chinese</div>
            <div className="text-xs text-gray-500">Учимся китайскому красиво</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-2">
            <NavLink to="/" className={navLinkClass} end>
              Главная
            </NavLink>
            <NavLink to="/listening" className={navLinkClass}>
              Тренировка слуха
            </NavLink>
            <NavLink to="/characters" className={navLinkClass}>
              Тренировка иероглифов
            </NavLink>
          </nav>
          <button
            type="button"
            onClick={toggleTheme}
            className="ml-3 h-10 w-10 rounded-2xl border border-rose-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-xl shadow-soft flex items-center justify-center transition"
            aria-label="Переключить тему"
          >
            {settings.theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="h-10 px-4 rounded-2xl border border-rose-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-sm font-semibold shadow-soft"
          >
            ⚙️ Настройки
          </button>
        </div>
      </div>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
