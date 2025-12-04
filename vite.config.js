import react from '@vitejs/plugin-react';

// Простой экспорт объекта конфигурации без defineConfig для совместимости окружений
export default {
  plugins: [react()],
  base: '/Learnapp/',
  build: {
    // Enable code splitting for better mobile performance
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split large audio DB into separate chunk
          if (id.includes('pinyinAudioDB')) {
            return 'audio-db';
          }
          // Split React libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Split framer-motion
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-vendor';
          }
          // Split router
          if (id.includes('node_modules/react-router')) {
            return 'router-vendor';
          }
          // Split cc-cedict (large dictionary)
          if (id.includes('node_modules/cc-cedict')) {
            return 'cedict-vendor';
          }
          // Split pinyin-pro
          if (id.includes('node_modules/pinyin-pro')) {
            return 'pinyin-vendor';
          }
        }
      }
    },
    // Increase chunk size warning limit since we're dealing with audio files
    chunkSizeWarningLimit: 1000
  }
};

