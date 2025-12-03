import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext.jsx';
import SettingsDrawer from './SettingsDrawer.jsx';

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-lg transition-colors duration-200 ${
    isActive ? 'text-white bg-accent dark:bg-accent' : 'text-gray-700 dark:text-gray-200 hover:text-accent hover:bg-rose-50 dark:hover:bg-slate-800'
  }`;

const mobileNavLinkClass = ({ isActive }) =>
  `block px-4 py-3 rounded-lg transition-colors duration-200 text-base ${
    isActive ? 'text-white bg-accent dark:bg-accent' : 'text-gray-700 dark:text-gray-200 hover:text-accent hover:bg-rose-50 dark:hover:bg-slate-800'
  }`;

export default function Navbar() {
  const { settings, setTheme } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleTheme = () => setTheme(settings.theme === 'light' ? 'dark' : 'light');
  
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 bg-white/70 dark:bg-slate-900/70 border-b border-rose-100 dark:border-slate-800">
      <div className="page-container flex items-center justify-between py-3 md:py-4">
        <Link to="/listening" className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-accent to-accent-coral shadow-soft flex items-center justify-center text-white text-lg md:text-xl">汉</div>
          <div className="leading-tight">
            <div className="text-base md:text-lg font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Learn Chinese</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Учимся китайскому красиво</div>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          <nav className="flex items-center gap-2">
            <NavLink to="/home" className={navLinkClass}>
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
            className="ml-3 h-10 w-10 rounded-2xl border border-rose-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-xl shadow-soft flex items-center justify-center transition hover:scale-105"
            aria-label="Переключить тему"
          >
            {settings.theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="h-10 px-4 rounded-2xl border border-rose-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-sm font-semibold shadow-soft hover:bg-white dark:hover:bg-slate-700 transition"
          >
            ⚙️ Настройки
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="h-9 w-9 md:h-10 md:w-10 rounded-xl border border-rose-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-lg md:text-xl shadow-soft flex items-center justify-center transition"
            aria-label="Переключить тему"
          >
            {settings.theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 md:h-10 md:w-10 rounded-xl border border-rose-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-lg md:text-xl shadow-soft flex items-center justify-center transition"
            aria-label="Меню"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-rose-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
          <nav className="page-container py-4 space-y-2">
            <NavLink to="/home" className={mobileNavLinkClass} onClick={closeMobileMenu}>
              🏠 Главная
            </NavLink>
            <NavLink to="/listening" className={mobileNavLinkClass} onClick={closeMobileMenu}>
              🎧 Тренировка слуха
            </NavLink>
            <NavLink to="/characters" className={mobileNavLinkClass} onClick={closeMobileMenu}>
              🈶 Тренировка иероглифов
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setSettingsOpen(true);
                closeMobileMenu();
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-base text-gray-700 dark:text-gray-200 hover:text-accent hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              ⚙️ Настройки
            </button>
          </nav>
        </div>
      )}

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
