import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameProvider } from './context/GameContext';
import logger from './utils/logger';
import './i18n';
import './index.css';

// Global error handlers
window.addEventListener('error', (event) => {
  logger.error({ err: event.error }, 'Unhandled global error');
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error({ reason: event.reason }, 'Unhandled promise rejection');
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  logger.fatal('Could not find root element to mount to');
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Suspense fallback="Loading...">
      <GameProvider>
        <App />
      </GameProvider>
    </Suspense>
  </React.StrictMode>
);