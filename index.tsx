import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameProvider } from './context/GameContext';
import logger from './services/logger';

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
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>
);
