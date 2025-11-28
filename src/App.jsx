import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import ListeningPage from './pages/ListeningPage.jsx';
import CharactersPage from './pages/CharactersPage.jsx';
import { useSettings } from './context/SettingsContext.jsx';

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50/50 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
