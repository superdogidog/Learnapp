import React from 'react';

export default function CharactersPage() {
  return (
    <main className="page-container">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Тренировка иероглифов</h1>
      <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl">
        Режим в разработке. Здесь будет практика написания и распознавания иероглифов.
      </p>
      <div className="mt-6">
        <button className="btn-primary w-full sm:w-auto">Начать тренировку иероглифов</button>
      </div>
    </main>
  );
}

