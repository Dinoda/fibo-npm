import {
  getLogger,
  getTransports,
  getRequestIdMiddleware,
  getMiddleware,
  getErrorHandler
} from "fibo-logging";

const transports = getTransports({
  console: "debug",
  rotate: "info"
});

const idMiddleware = getRequestIdMiddleware(getLogger("info", transports));
const middleware = getMiddleware({
  transports: transports
});
const errorHandler = getErrorHandler({
  transports: transports
});

export { idMiddleware, middleware, errorHandler };
