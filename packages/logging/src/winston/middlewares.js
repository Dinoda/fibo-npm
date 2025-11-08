import expressWinston from "express-winston";

import getTransports from "./transports.js";
import { hasRequestId } from "../requestId.js";

const getArguments = options => {
  const args = {
    transports: getTransports(options.transports)
  };

  if (hasRequestId()) {
    args.requestWhitelist = [
      "httpVersion",
      "headers",
      "url",
      "method",
      "originalUrl",
      "query",
      "requestId"
    ];
  }

  return args;
};
/**
 * Get an express winston middleware.
 *
 * @param options An object with:
 *  - "transports": An object that will be sent to the "getTransports" function to get transports (see "getTransports" for values (required, no default value)
 * @return The middleware
 */
const getMiddleware = options => {
  return expressWinston.logger(getArguments(options));
};

/**
 * Get an express winston error handler.
 *
 * @param options Same as for "getMiddleware" function
 * @return The error handler
 */
const getErrorHandler = options => {
  return expressWinston.errorLogger(getArguments(options));
};

export { getMiddleware, getErrorHandler };
