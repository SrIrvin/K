import pino from 'pino';

// Pino will automatically log to the browser console
const logger = pino({
  level: 'info', // Logs 'info' and higher (warn, error, fatal)
});

export default logger;