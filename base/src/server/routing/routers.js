import { createRouter } from "fibo-server";
import { PageRouterBuilder } from 'fibo-html-component-ssr';

const pageRouter = new PageRouterBuilder('.page', createRouter(), 'index');
const resourceRouter = new PageRouterBuilder('.resource', createRouter());
await pageRouter.initialize();
await resourceRouter.initialize();

export default [
  pageRouter.getRouter(),
  resourceRouter.getRouter('/res'),
];
