import React from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';

export default function SettingsPage() {
  const { 
    settings, 
    setTheme, 
    setAutoAdvance, 
    setAdvanceDelay, 
    setEnableTranslation,
    setExtendedTranslation,
    setTranslateOnButton,
    resetSettings 
  } = useSettings();
  const { resetAll } = useProgress();

  const handleDelayChange = (e) => {
    setAdvanceDelay(Number(e.target.value));
  };

  return (
    <main className="page-container">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Настройки</h1>

        <div className="space-y-6">
          {/* Theme Section */}
          <section className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Тема</h2>
            <div className="flex gap-3">
              <button
                className={`px-4 py-2 rounded-2xl border ${
                  settings.theme === 'light' 
                    ? 'bg-accent text-white border-accent' 
                    : 'border-rose-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => setTheme('light')}
              >
                Светлая
              </button>
              <button
                className={`px-4 py-2 rounded-2xl border ${
                  settings.theme === 'dark' 
                    ? 'bg-accent text-white border-accent' 
                    : 'border-rose-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => setTheme('dark')}
              >
                Тёмная
              </button>
            </div>
          </section>

          {/* Translation Section */}
          <section className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Перевод</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableTranslation}
                  onChange={(e) => setEnableTranslation(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-base">Включить перевод</span>
              </label>
              
              {settings.enableTranslation && (
                <div className="ml-8 space-y-3 border-l-2 border-rose-200 dark:border-slate-700 pl-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.extendedTranslation}
                      onChange={(e) => setExtendedTranslation(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-base">Расширенный перевод</span>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Показывать дополнительные переводы и варианты использования слова
                  </p>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.translateOnButton}
                      onChange={(e) => setTranslateOnButton(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-base">Переводить по кнопке</span>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Перевод будет показываться только при нажатии кнопки "Показать перевод"
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Auto Advance Section */}
          <section className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Переход между заданиями</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-base">Автоматически переходить к следующему</span>
              </label>
              
              {settings.autoAdvance && (
                <div className="ml-8 border-l-2 border-rose-200 dark:border-slate-700 pl-4">
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Задержка (мс)
                  </label>
                  <input
                    type="range"
                    min="600"
                    max="3000"
                    step="100"
                    value={settings.advanceDelay}
                    onChange={handleDelayChange}
                    className="w-full mt-2"
                  />
                  <div className="text-sm mt-1">{settings.advanceDelay} мс</div>
                </div>
              )}
              
              {!settings.autoAdvance && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  При ошибках появится кнопка «Дальше», чтобы перейти вручную.
                </p>
              )}
            </div>
          </section>

          {/* Data Section */}
          <section className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Данные</h2>
            <div className="space-y-3">
              <button 
                className="btn-outline w-full sm:w-auto" 
                onClick={resetSettings}
              >
                Сбросить настройки
              </button>
              <button 
                className="btn-outline w-full sm:w-auto ml-0 sm:ml-3" 
                onClick={resetAll}
              >
                Очистить историю тренировок
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
