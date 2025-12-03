import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { listeningSets } from '../data/listeningSets';
import { getPinyinForChars, applyToneMark, loadSyllableAudio } from '../utils/pinyinHelpers';
import { pinyinAudioDB } from '../data/pinyinAudioDB';
import { useSettings } from '../context/SettingsContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { getTranslation, getExtendedTranslation } from '../utils/translationHelper.js';

const cardVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const toneButtons = [
  { tone: 1, label: '¯', aria: 'Первый тон' },
  { tone: 2, label: 'ˊ', aria: 'Второй тон' },
  { tone: 3, label: 'ˇ', aria: 'Третий тон' },
  { tone: 4, label: 'ˋ', aria: 'Четвёртый тон' },
];

const shuffle = (array) => array.slice().sort(() => Math.random() - 0.5);

const playSequence = async (syllables, fallbackSpeak) => {
  for (const unit of syllables) {
    if (!unit) continue;
    // eslint-disable-next-line no-await-in-loop
    await (async () => {
      // Load audio lazily if not already loaded
      const audioUrl = await loadSyllableAudio(unit);
      
      return new Promise((resolve) => {
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.play();
          audio.onended = resolve;
          audio.onerror = resolve;
        } else if (fallbackSpeak) {
          fallbackSpeak(unit).finally(resolve);
        } else {
          resolve();
        }
      });
    })();
  }
};

const normalizeStoredQueue = (stored = []) =>
  stored
    .map((entry) => {
      if (entry?.syllables?.length && entry.text) return entry;
      const source = entry?.text || entry?.char;
      if (!source) return null;
      const [fromHelper] = getPinyinForChars([source]);
      return fromHelper ?? null;
    })
    .filter(Boolean);

export default function ListeningPage() {
  const { settings } = useSettings();
  const { progress, setListeningState, recordListeningResult, resetListening } = useProgress();
  const storedQueue = progress.listening.queue || [];
  const normalizedStoredQueue = React.useMemo(() => normalizeStoredQueue(storedQueue), [storedQueue]);
  const [queue, setQueue] = useState(normalizedStoredQueue);
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(progress.listening.index ?? 0, Math.max(normalizedStoredQueue.length - 1, 0))
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState('');
  const [started, setStarted] = useState(Boolean(normalizedStoredQueue.length));
  const [inputChars, setInputChars] = useState(() => normalizedStoredQueue.map((item) => item.text).join(','));
  const [presetOpen, setPresetOpen] = useState(false);
  const [completed, setCompleted] = useState(progress.listening.completed ?? false);
  const [characterToneAnswer, setCharacterToneAnswer] = useState(null);
  const [hintIndex, setHintIndex] = useState(0);
  const audioRef = useRef(null);
  const autoAdvanceTimer = useRef(null);

  const [phoneticQueue, setPhoneticQueue] = useState(progress.phonetic.queue ?? []);
  const [phoneticStarted, setPhoneticStarted] = useState(Boolean((progress.phonetic.queue ?? []).length));
  const [phoneticResult, setPhoneticResult] = useState('');
  const [phoneticAnswer, setPhoneticAnswer] = useState('');
  const [phoneticTone, setPhoneticTone] = useState(null);
  const phoneticAudioRef = useRef(null);

  const [showTranslation, setShowTranslation] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [russianTranslation, setRussianTranslation] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [isLoadingRussian, setIsLoadingRussian] = useState(false);

  const current = useMemo(() => queue[currentIndex], [queue, currentIndex]);
  const currentSyllable = current?.syllables?.[hintIndex];
  const currentPhonetic = phoneticQueue[0];
  
  // Load translation when current character changes
  useEffect(() => {
    if (!current?.text || !settings.enableTranslation) {
      setTranslation(null);
      setRussianTranslation(null);
      setShowEnglish(false);
      setIsLoadingRussian(false);
      return;
    }
    
    // Reset language preference when character changes
    setShowEnglish(false);
    setIsLoadingRussian(true);
    
    // Get English translation immediately
    const handleRussianReady = (russianResult) => {
      setRussianTranslation(russianResult);
      setIsLoadingRussian(false);
    };
    
    const result = settings.extendedTranslation 
      ? getExtendedTranslation(current.text, handleRussianReady)
      : getTranslation(current.text, handleRussianReady);
    
    setTranslation(result);
    setRussianTranslation(null);
  }, [current?.text, settings.enableTranslation, settings.extendedTranslation]);

  const applyPreset = (chars) => {
    setInputChars(chars);
    setPresetOpen(false);
  };

  const startTraining = () => {
    const list = inputChars
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!list.length) {
      setResult('Добавьте хотя бы один иероглиф.');
      return;
    }
    const generated = getPinyinForChars(list);
    if (!generated.length) {
      setResult('Не удалось расшифровать пиньинь для этих знаков.');
      return;
    }
    setQueue(generated);
    setCurrentIndex(0);
    setUserAnswer('');
    setResult('');
    setCompleted(false);
    setStarted(true);
    setListeningState({ queue: generated, index: 0, completed: false });
  };

  useEffect(() => {
    setQueue(normalizedStoredQueue);
    if (!normalizedStoredQueue.length) {
      setStarted(false);
      setCurrentIndex(0);
      setHintIndex(0);
      return;
    }
    if (currentIndex >= normalizedStoredQueue.length) {
      setCurrentIndex(0);
    }
  }, [normalizedStoredQueue, currentIndex]);

  const speakSyllable = React.useCallback((unit) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const utter = new SpeechSynthesisUtterance(unit?.display || unit?.text || unit?.plain || '');
      utter.lang = 'zh-CN';
      utter.rate = 0.95;
      utter.onend = resolve;
      utter.onerror = resolve;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    });
  }, []);

  useEffect(() => {
    if (!started || !current || !current.syllables?.length) return;
    setResult('');
    playSequence(current.syllables, speakSyllable);
  }, [currentIndex, started, current, speakSyllable]);

  const replayWord = () => {
    if (current?.syllables?.length) playSequence(current.syllables, speakSyllable);
  };

  const scheduleAdvance = () => {
    if (!settings.autoAdvance) return;
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => gotoNext(), settings.advanceDelay);
  };

  const gotoNext = () => {
    setHintIndex(0);
    setShowTranslation(false);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      setCompleted(true);
      setStarted(false);
      setListeningState({ queue, index: nextIndex, completed: true });
    } else {
      setCurrentIndex(nextIndex);
      setListeningState({ queue, index: nextIndex, completed: false });
    }
  };

  const checkAnswer = (toneOverride) => {
    if (!currentSyllable) return;
    const normalized = userAnswer.trim().toLowerCase();
    const expectedPlain = currentSyllable.plain;
    const expectedTone = currentSyllable.tone;
    const toneValue = toneOverride ?? characterToneAnswer;
    const toneRequired = expectedTone && expectedTone !== 5;
    const toneMatch = toneRequired ? Number(toneValue) === Number(expectedTone) : !toneValue;
    if (!toneMatch && toneRequired) {
      setResult('Выберите правильный тон.');
      return;
    }
    const isCorrect = normalized === expectedPlain && (toneMatch || (!toneRequired && normalized === expectedPlain));
    const pretty = expectedTone === 5 ? expectedPlain : applyToneMark(expectedPlain, expectedTone);
    setResult(isCorrect ? `✅ Верно! ${pretty}` : `❌ Правильно: ${pretty}`);
    recordListeningResult({
      char: current.text,
      correct: isCorrect,
      answer: `${normalized}${toneValue || (toneRequired ? '' : '')}`.trim(),
      expected: currentSyllable.code,
    });
    setUserAnswer('');
    setCharacterToneAnswer(null);
    if (isCorrect) {
      const nextHint = hintIndex + 1;
      if (nextHint >= current.syllables.length) {
        scheduleAdvance();
      } else {
        setHintIndex(nextHint);
      }
    } else if (!settings.autoAdvance) {
      // wait for manual next/hint reset
    }
  };

  const handleToneSelect = (tone) => {
    setCharacterToneAnswer(tone);
    if (userAnswer.trim()) {
      checkAnswer(tone);
    }
  };

  const resetTraining = () => {
    setStarted(false);
    setCompleted(false);
    setQueue([]);
    setCurrentIndex(0);
    setUserAnswer('');
    setResult('');
    setInputChars('');
    resetListening();
  };

  useEffect(() => () => autoAdvanceTimer.current && clearTimeout(autoAdvanceTimer.current), []);

  useEffect(() => {
    if (!phoneticStarted || !currentPhonetic) return;
    
    const playAudio = async () => {
      try {
        // Load audio lazily
        const audioUrl = await loadSyllableAudio(currentPhonetic);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          phoneticAudioRef.current = audio;
          await audio.play();
        } else {
          await speakSyllable({ display: currentPhonetic.syllable });
        }
      } catch (err) {
        console.error('Error playing audio:', err);
        await speakSyllable({ display: currentPhonetic.syllable });
      }
    };
    
    playAudio();
    
    return () => {
      if (phoneticAudioRef.current) {
        phoneticAudioRef.current.pause();
      }
    };
  }, [phoneticStarted, currentPhonetic, speakSyllable]);

  const startPhonetic = () => {
    const shuffled = shuffle(pinyinAudioDB).slice(0, 40);
    setPhoneticQueue(shuffled);
    setPhoneticStarted(true);
    setPhoneticResult('');
    setPhoneticAnswer('');
    setPhoneticTone(null);
  };

  const replayPhonetic = async () => {
    if (phoneticAudioRef.current) {
      phoneticAudioRef.current.currentTime = 0;
      phoneticAudioRef.current.play().catch(() => speakSyllable({ display: currentPhonetic?.syllable }));
    } else if (currentPhonetic) {
      // If audio ref is not available, load and play again
      try {
        const audioUrl = await loadSyllableAudio(currentPhonetic);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          phoneticAudioRef.current = audio;
          await audio.play();
        } else {
          await speakSyllable({ display: currentPhonetic.syllable });
        }
      } catch (err) {
        console.error('Error replaying audio:', err);
        await speakSyllable({ display: currentPhonetic.syllable });
      }
    }
  };

  const advancePhonetic = (isCorrect) => {
    const [, ...rest] = phoneticQueue;
    if (isCorrect) {
      setPhoneticQueue(rest.length ? [...rest, currentPhonetic] : []);
      if (!rest.length) setPhoneticStarted(false);
    } else {
      setPhoneticQueue(rest.length ? [...rest.slice(0, 1), currentPhonetic, ...rest.slice(1)] : [currentPhonetic]);
    }
  };

  const checkPhonetic = (toneOverride) => {
    if (!currentPhonetic) return;
    const trimmed = phoneticAnswer.trim().toLowerCase();
    if (!trimmed) {
      setPhoneticResult('Введите слог.');
      return;
    }
    const toneValue = toneOverride ?? phoneticTone;
    if (!toneValue) {
      setPhoneticResult('Выберите тон.');
      return;
    }
    const plain = currentPhonetic.syllable;
    const tone = currentPhonetic.tone;
    const isCorrect = trimmed === plain && Number(toneValue) === Number(tone);
    setPhoneticResult(isCorrect ? `✅ Верно! ${applyToneMark(plain, tone)}` : `❌ Правильно: ${applyToneMark(plain, tone)}`);
    setPhoneticAnswer('');
    setPhoneticTone(null);
    advancePhonetic(isCorrect);
  };

  const handlePhoneticTone = (tone) => {
    setPhoneticTone(tone);
    if (phoneticAnswer.trim()) {
      checkPhonetic(tone);
    }
  };

  const progressValue = queue.length ? Math.round(((currentIndex) / queue.length) * 100) : 0;

  return (
    <main className="page-container flex flex-col gap-10">
      <section className="card p-4 sm:p-6 md:p-10 shadow-soft">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">Тренировка слуха</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Выберите готовый список или соберите свой, система сама найдёт пиньинь и озвучку.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Иероглифы (через запятую)</label>
              <textarea
                rows={3}
                value={inputChars}
                onChange={(e) => setInputChars(e.target.value)}
                placeholder="например 你,好,妈,吗"
                className="w-full rounded-2xl border border-rose-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-950 text-base"
              />
            </div>
            <div className="bg-rose-50 dark:bg-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Готовые подборки</h3>
                <button className="text-sm text-accent" onClick={() => setPresetOpen((v) => !v)}>
                  {presetOpen ? 'Скрыть' : 'Показать'}
                </button>
              </div>
              {presetOpen && (
                <div className="mt-3 space-y-3 max-h-48 overflow-y-auto">
                  {listeningSets.map((preset) => (
                    <button
                      key={preset.id}
                      className="w-full text-left p-3 rounded-2xl border border-transparent hover:border-accent/40 hover:bg-white/70 dark:hover:bg-slate-900"
                      onClick={() => applyPreset(preset.chars)}
                    >
                      <div className="font-semibold">{preset.name}</div>
                      <div className="text-sm text-gray-500">{preset.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="btn-primary" onClick={startTraining}>Начать тренировку</button>
            <button className="btn-outline" onClick={resetTraining}>Сбросить всё</button>
          </div>
        </div>
      </section>

      {started && current && (
        <section className="card p-4 sm:p-6 md:p-10">
          <div className="flex flex-col gap-4 md:gap-6">
            <div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Прогресс</span>
                <span>{currentIndex}/{queue.length}</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-rose-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-coral" style={{ width: `${progressValue}%` }} />
              </div>
            </div>
            <div className="text-center space-y-4">
              <div className="text-xs md:text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Слушай и вводи пиньинь</div>
              <div className="text-[60px] sm:text-[80px] md:text-[90px] font-semibold">{current.text}</div>
              <div className="text-base md:text-lg text-gray-500 dark:text-gray-400">
                Слог {Math.min(hintIndex + 1, current.syllables?.length ?? 0)} из {current.syllables?.length ?? 0}
              </div>
              <button className="btn-outline w-full sm:w-auto" onClick={replayWord}>▶️ Проиграть ещё раз</button>
              
              {/* Translation Display */}
              {settings.enableTranslation && (
                <div className="mt-4">
                  {!translation ? null : settings.translateOnButton && !showTranslation ? (
                    <button 
                      className="btn-outline w-full sm:w-auto"
                      onClick={() => setShowTranslation(true)}
                    >
                      📖 Показать перевод
                    </button>
                  ) : (
                    <div className="bg-rose-50 dark:bg-slate-800 rounded-2xl p-4 text-left relative">
                      {/* Language toggle button */}
                      {russianTranslation && (
                        <button
                          className="absolute top-2 right-2 p-2 text-lg hover:bg-rose-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          onClick={() => setShowEnglish(!showEnglish)}
                          title={showEnglish ? "Показать русский перевод" : "Показать английский перевод"}
                        >
                          🔁
                        </button>
                      )}
                      
                      <div className="font-semibold text-lg mb-2">
                        {translation.simplified}
                        {translation.traditional !== translation.simplified && (
                          <span className="ml-2 text-gray-500">({translation.traditional})</span>
                        )}
                      </div>
                      {translation.pinyin && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {translation.pinyin}
                        </div>
                      )}
                      
                      {/* Show loading indicator for Russian if not ready and not showing English */}
                      {isLoadingRussian && !showEnglish && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          ⏳ Загрузка русского перевода...
                        </div>
                      )}
                      
                      {settings.extendedTranslation ? (
                        <div className="space-y-2">
                          <div className="font-medium text-gray-700 dark:text-gray-300">
                            Переводы:
                          </div>
                          {(showEnglish || !russianTranslation ? translation : russianTranslation).entries?.map((entry, idx) => (
                            <div key={idx} className="pl-3 border-l-2 border-rose-200 dark:border-slate-700">
                              <div className="text-sm text-gray-600 dark:text-gray-400">{entry.pinyin}</div>
                              <ul className="list-disc list-inside text-sm">
                                {entry.definitions?.map((def, defIdx) => (
                                  <li key={defIdx}>{def}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm">
                          {(showEnglish || !russianTranslation ? translation : russianTranslation).definitions?.slice(0, 3).map((def, idx) => (
                            <div key={idx}>• {def}</div>
                          ))}
                        </div>
                      )}
                      {settings.translateOnButton && (
                        <button 
                          className="btn-outline mt-3 text-sm"
                          onClick={() => setShowTranslation(false)}
                        >
                          Скрыть перевод
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Введите пиньинь (например ni или nǐ)</label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="например ni или nǐ"
                className="mt-2 w-full rounded-2xl border border-rose-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-950 text-base md:text-lg"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {toneButtons.map((btn) => (
                 <button
                   key={btn.tone}
                   type="button"
                   className={`rounded-2xl border px-3 py-3 sm:px-4 sm:py-4 text-xl sm:text-2xl font-semibold transition-all touch-manipulation ${characterToneAnswer === btn.tone ? 'bg-accent text-white border-accent shadow-soft scale-105' : 'border-rose-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-accent/60 active:scale-95'}`}
                   onClick={() => handleToneSelect(btn.tone)}
                 >
                   {btn.label}
                 </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
              <button className="btn-primary flex-1 sm:flex-initial" onClick={() => checkAnswer()}>Проверить</button>
              {!settings.autoAdvance && result && (
                <button className="btn-outline flex-1 sm:flex-initial" onClick={gotoNext}>Дальше</button>
              )}
              {result && <span className={`text-sm md:text-base text-center sm:text-left ${result.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}>{result}</span>}
            </div>
          </div>
        </section>
      )}

      {completed && (
        <section className="card p-4 sm:p-6 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl">🎉 Все слова пройдены!</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="btn-outline" onClick={resetTraining}>Начать заново</button>
            <button className="btn-primary" onClick={() => { setCompleted(false); setStarted(true); setCurrentIndex(0); setListeningState({ queue, index: 0, completed: false }); }}>Повторить список</button>
          </div>
        </section>
      )}

      <section className="card p-4 sm:p-6 md:p-10">
        <h2 className="text-xl sm:text-2xl font-semibold">Статистика</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-rose-50 dark:bg-slate-800 p-4">
            <div className="text-sm text-gray-500">Верных</div>
            <div className="text-3xl font-bold">{progress.listening.stats.correct}</div>
          </div>
          <div className="rounded-2xl bg-rose-50 dark:bg-slate-800 p-4">
            <div className="text-sm text-gray-500">Ошибок</div>
            <div className="text-3xl font-bold">{progress.listening.stats.incorrect}</div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Последние попытки</h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {progress.listening.stats.history.slice().reverse().map((entry, idx) => (
              <li key={idx} className="flex justify-between text-sm border-b border-rose-100 dark:border-slate-800 pb-2">
                <span>{entry.char}</span>
                <span className={entry.correct ? 'text-green-500' : 'text-red-500'}>{entry.correct ? 'верно' : `ошибка (${entry.expected})`}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card p-4 sm:p-6 md:p-10">
        <div className="flex flex-col gap-4">
          <div className="text-center space-y-2">
            <span className="text-3xl sm:text-4xl">🎯</span>
            <h2 className="text-2xl sm:text-3xl font-bold">Режим фонетики</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Слушайте пиньинь из базы и выбирайте правильный тон палочками.</p>
          </div>
          {!phoneticStarted && (
            <button className="btn-primary w-full sm:w-auto mx-auto" onClick={startPhonetic}>Начать фонетическую тренировку</button>
          )}
          {phoneticStarted && currentPhonetic && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Осталось: {phoneticQueue.length}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button className="btn-outline" onClick={replayPhonetic}>▶️ Проиграть звук</button>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Введите пиньинь</label>
                <input
                  value={phoneticAnswer}
                  onChange={(e) => setPhoneticAnswer(e.target.value)}
                  placeholder="например ai"
                  className="mt-2 w-full rounded-2xl border border-rose-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-950 text-base md:text-lg"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {toneButtons.map((btn) => (
                  <button
                    key={btn.tone}
                    type="button"
                    className={`rounded-2xl border px-3 py-3 sm:px-4 sm:py-4 text-xl sm:text-2xl font-semibold transition-all touch-manipulation ${phoneticTone === btn.tone ? 'bg-accent text-white border-accent shadow-soft scale-105' : 'border-rose-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-accent/60 active:scale-95'}`}
                    onClick={() => handlePhoneticTone(btn.tone)}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
                <button className="btn-primary flex-1 sm:flex-initial" onClick={() => checkPhonetic()}>Проверить</button>
                {phoneticResult && <span className={`text-sm md:text-base text-center sm:text-left ${phoneticResult.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}>{phoneticResult}</span>}
              </div>
            </div>
          )}
          {!phoneticStarted && phoneticQueue.length === 0 && (
            <p className="text-center text-sm text-gray-500">Выберите “Начать”, чтобы запустить тренировку.</p>
          )}
        </div>
      </section>
    </main>
  );
}
