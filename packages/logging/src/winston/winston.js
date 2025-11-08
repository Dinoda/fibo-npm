import winston from 'winston';
import getTransports from './transports.js';

/**
 *
 */
export default (level, transports) => {
  return winston.createLogger({
    level,
    transports: getTransports(transports),
  });
};
