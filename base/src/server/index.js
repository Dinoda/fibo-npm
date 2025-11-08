import express from 'express';

import '../render/index.js';

import cookieParser from 'cookie-parser';
import { createExpressApp, createRouter } from "fibo-server";

import { idMiddleware, middleware, errorHandler } from "./logging.js";

import routers from './routing/routers.js';

global.PROJECT_ROOT = process.argv[1].replace("index.js", "");

export default {
  routers,
  middlewares: [
    cookieParser(),
    express.json(), 
    idMiddleware, 
    middleware, 
    //JWTMiddleware({ secret: "abcdef" })
  ],
  errorHandlers: [
    errorHandler
  ]
};

