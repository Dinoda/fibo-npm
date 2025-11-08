import "dotenv/config";

import './src/render/index.js';

import buildAndServe from "fibo-setup";

import { sassPlugin } from "esbuild-sass-plugin";
import app from "./src/server/index.js";

buildAndServe(
  app,
  {
    entryPoints: ["src/browser/app.js"],
    plugins: [sassPlugin()]
  },
  !process.env.ENV || process.env.ENV.toLowerCase() !== "prod"
);
