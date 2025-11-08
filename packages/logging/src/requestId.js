let requestId = null;

function getRequestLoggerWithMeta(log, req) {
  req.logger = log.child({
    meta: {
      req: {
        url: req.url,
        headers: req.headers,
        method: req.method,
        httpVersion: req.httpVersion,
        originalUrl: req.originalUrl,
        query: req.query,
        requestId: req.requestId
      },
      res: {
        statusCode: null
      },
      responseTime: null
    }
  });
}

function hasRequestId() {
  return requestId !== null;
}

export default (logger = null, init = 0) => {
  requestId = init;

  if (logger) {
    return (req, res, next) => {
      req.requestId = requestId++;

      getRequestLoggerWithMeta(logger, req);

      next();
    };
  }

  return (req, res, next) => {
    req.requestId = requestId++;

    next();
  };
};

export { hasRequestId };
