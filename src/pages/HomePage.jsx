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
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900"
        >
          Добро пожаловать в Learn Chinese!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-4 text-gray-600 text-lg max-w-2xl"
        >
          Современная тренировочная платформа для отработки восприятия речи и изучения иероглифов. Начните с выбора режима ниже.
        </motion.p>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-soft p-6 border border-rose-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-accent flex items-center justify-center text-2xl">🎧</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Тренировка слуха</h3>
              <p className="text-gray-600">Развивайте понимание речи на слух.</p>
            </div>
          </div>
          <div className="mt-6">
            <Link to="/listening" className="btn-primary inline-flex items-center justify-center w-full text-center">
              🎧 Тренировка слуха
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-soft p-6 border border-rose-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-accent flex items-center justify-center text-2xl">🈶</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Тренировка иероглифов</h3>
              <p className="text-gray-600">Учите написание и распознавание знаков.</p>
            </div>
          </div>
          <div className="mt-6">
            <Link to="/characters" className="btn-outline inline-flex items-center justify-center w-full text-center">
              🈶 Тренировка иероглифов
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

