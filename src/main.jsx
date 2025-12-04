import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';

// Wrap initialization in try-catch for better error handling on mobile browsers
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter basename="/Learnapp">
          <SettingsProvider>
            <ProgressProvider>
              <App />
            </ProgressProvider>
          </SettingsProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to initialize app:', error);
  // Fallback error display for Safari and other browsers
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">' +
      '<h1 style="color: #dc2626; margin-bottom: 16px;">Ошибка инициализации</h1>' +
      '<p style="color: #374151; margin-bottom: 8px;">Не удалось запустить приложение</p>' +
      '<p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">' + error.message + '</p>' +
      '<button onclick="window.location.reload()" style="padding: 10px 24px; background: #ef4444; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">Перезагрузить</button>' +
      '</div>';
  }
}
