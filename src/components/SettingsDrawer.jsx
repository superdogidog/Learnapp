import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';

const drawerVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

export default function SettingsDrawer({ open, onClose }) {
  const { settings, setTheme, setAutoAdvance, setAdvanceDelay, resetSettings } = useSettings();
  const { resetAll } = useProgress();

  const handleDelayChange = (e) => {
    setAdvanceDelay(Number(e.target.value));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-rose-100 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerVariants}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Настройки</h2>
              <button className="btn-outline" onClick={onClose}>Закрыть</button>
            </div>

            <div className="mt-6 space-y-6">
              <section>
                <h3 className="text-lg font-semibold">Тема</h3>
                <div className="mt-3 flex gap-3">
                  <button
                    className={`px-4 py-2 rounded-2xl border ${settings.theme === 'light' ? 'bg-accent text-white border-accent' : 'border-rose-200 dark:border-slate-700'}`}
                    onClick={() => setTheme('light')}
                  >
                    Светлая
                  </button>
                  <button
                    className={`px-4 py-2 rounded-2xl border ${settings.theme === 'dark' ? 'bg-accent text-white border-accent' : 'border-rose-200 dark:border-slate-700'}`}
                    onClick={() => setTheme('dark')}
                  >
                    Тёмная
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold">Переход между заданиями</h3>
                <div className="mt-3 flex flex-col gap-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                    />
                    Автоматически переходить к следующему
                  </label>
                  {settings.autoAdvance ? (
                    <div>
                      <label className="text-sm text-gray-500">Задержка (мс)</label>
                      <input
                        type="range"
                        min="600"
                        max="3000"
                        step="100"
                        value={settings.advanceDelay}
                        onChange={handleDelayChange}
                        className="w-full"
                      />
                      <div className="text-sm mt-1">{settings.advanceDelay} мс</div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">При ошибках появится кнопка «Дальше», чтобы перейти вручную.</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold">Данные</h3>
                <div className="mt-3 flex flex-col gap-3">
                  <button className="btn-outline" onClick={resetSettings}>Сбросить настройки</button>
                  <button className="btn-outline" onClick={resetAll}>Очистить историю тренировок</button>
                </div>
              </section>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

