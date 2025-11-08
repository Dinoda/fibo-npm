export { default as ImplementationError } from './src/exception/ImplementationError.js';

export const ensureArray = elem => {
  if (elem) {
    if (Array.isArray(elem)) {
      return elem;
    }

    return [elem];
  }

  return [];
};
