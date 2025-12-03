import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <main className="page-container">
      <section className="mt-6">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100"
        >
          Добро пожаловать в Learn Chinese!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl"
        >
          Современная тренировочная платформа для отработки восприятия речи и изучения иероглифов. Начните с выбора режима ниже.
        </motion.p>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft p-5 sm:p-6 border border-rose-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-accent flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">🎧</div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Тренировка слуха</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Развивайте понимание речи на слух.</p>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <Link to="/listening" className="btn-primary inline-flex items-center justify-center w-full text-center">
              🎧 Тренировка слуха
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft p-5 sm:p-6 border border-rose-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-accent flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">🈶</div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Тренировка иероглифов</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Учите написание и распознавание знаков.</p>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <Link to="/characters" className="btn-outline inline-flex items-center justify-center w-full text-center">
              🈶 Тренировка иероглифов
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

