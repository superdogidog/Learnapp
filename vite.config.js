import react from '@vitejs/plugin-react';

// Простой экспорт объекта конфигурации без defineConfig для совместимости окружений
export default {
  plugins: [react()],
  base: '/Learnapp/',
};

