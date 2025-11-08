import path from "path";
import express from "express";
import { ensureArray } from "fibo-common";

/**
 * Returns an express app in an object.
 *
 * @param options Accepts an option argument with:
 *  - port: The server port (default to 3000)
 *  - middlewares: A middleware or an array of middlewares
 *  - routers: A router or an array of routers
 *  - errorHandlers: An error handler or an array of them
 *  - static: A directory for static deliveries
 * @return An object with "app" the express app, and "start", a function to start the app directly.
 */
const createExpressApp = (options = {}) => {
  const app = express();

  for (const mdw of ensureArray(options.middlewares)) {
    app.use(mdw);
  }

  for (const rtr of ensureArray(options.routers)) {
    console.log(rtr);
    app.use(rtr);
  }

  for (const eh of ensureArray(options.errorHandlers)) {
    app.use(eh);
  }

  const expressStatic = options.static;
  if (typeof expressStatic == "string" || expressStatic instanceof String) {
    const pub = path.join(global.PROJECT_ROOT, expressStatic);
    app.use(express.static(pub));
  }

  const port = options.port ?? 3000;

  return {
    app,
    start: () => {
      app.listen(port, () => {
        console.log("Fibo App Started on port:", port);
        console.log(`http://localhost:${port}/`);
      });
    }
  };
};

export default createExpressApp;
