import Builder, { IInitializer, IProcessor } from 'fibo-html-component';

import { JSDOM } from 'jsdom';

if (typeof window != 'undefined') {
  throw new Error('This code should not be loaded in a browser / client environment, if you are looking for a client side document management, load "fibo-html-component/clientdoc"');
}

export { componentDocument as Document, DocumentBundle } from './src/document.js';
export { output } from './src/output.js';
export { default as PageRouterBuilder } from './src/PageRouterBuilder.js';
export { Builder, IInitializer, IProcessor };

export default (options = {}) => {
  return new Builder({
	document: new JSDOM().window.document,
    	...options,
  });
};


