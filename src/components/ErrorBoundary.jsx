import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Можно логировать на сервер позже
    console.error('Ошибка рендера:', error, info);
    // Store error info for debugging on mobile
    try {
      sessionStorage.setItem('lastError', JSON.stringify({
        error: error.toString(),
        stack: error.stack,
        info: info.componentStack,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      // Ignore storage errors
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container">
          <h1 className="text-2xl font-bold text-red-600">Произошла ошибка</h1>
          <p className="mt-4 text-gray-700">{String(this.state.error)}</p>
          <button className="btn-outline mt-6" onClick={() => window.location.reload()}>Перезагрузить страницу</button>
        </div>
      );
    }
    return this.props.children;
  }
}

