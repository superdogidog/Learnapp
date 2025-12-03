import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import ListeningPage from './pages/ListeningPage.jsx';
import CharactersPage from './pages/CharactersPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { useSettings } from './context/SettingsContext.jsx';
import { useAudioPreload } from './hooks/useAudioPreload.js';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const pageTransition = { duration: 0.28, ease: 'easeOut' };

function NotFound() {
  return (
    <main className="page-container">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Страница не найдена</h1>
      <p className="mt-4 text-gray-600">Проверьте адрес или вернитесь на главную.</p>
    </main>
  );
}

function App() {
  const location = useLocation();
  const { settings } = useSettings();
  const { isPreloading, preloadComplete, preloadProgress } = useAudioPreload();
  const [showPreloadNotice, setShowPreloadNotice] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // Show preload notice when preloading starts
  useEffect(() => {
    if (isPreloading) {
      setShowPreloadNotice(true);
    }
  }, [isPreloading]);

  // Hide notice after preload completes (with delay)
  useEffect(() => {
    if (preloadComplete && showPreloadNotice) {
      const timer = setTimeout(() => {
        setShowPreloadNotice(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [preloadComplete, showPreloadNotice]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50/50 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Audio preload notice */}
      {showPreloadNotice && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-rose-100 dark:border-slate-700 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {isPreloading ? '⏳' : '✅'}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {isPreloading ? 'Загрузка аудио...' : 'Готово!'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {isPreloading
                    ? 'Подготовка файлов для офлайн-использования'
                    : 'Все аудио готовы к работе'}
                </div>
                {isPreloading && preloadProgress > 0 && (
                  <div className="mt-2 h-1.5 rounded-full bg-rose-100 dark:bg-slate-700 overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${preloadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/listening" replace />} />
          <Route
            path="/home"
            element={
              <motion.div
                className="fade-container"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <HomePage />
              </motion.div>
            }
          />
          <Route
            path="/listening"
            element={
              <motion.div
                className="fade-container"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ListeningPage />
              </motion.div>
            }
          />
          <Route
            path="/characters"
            element={
              <motion.div
                className="fade-container"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <CharactersPage />
              </motion.div>
            }
          />
          <Route
            path="/settings"
            element={
              <motion.div
                className="fade-container"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <SettingsPage />
              </motion.div>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
