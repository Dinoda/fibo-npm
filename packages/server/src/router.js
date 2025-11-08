import express from "express";
import { ensureArray } from 'fibo-common';

/**
 * Returns an express router.
 *
 * @param options Accepts an option argument with:
 *  - middlewares: One or an array of router specific middlewares
 */
const createRouter = (options = {}) => {
  const router = express.Router();

  for (const mdw of ensureArray(options.middlewares)) {
    router.use(mdw);
  }

  return router;
};

export default createRouter;
