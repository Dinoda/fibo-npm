import IInitializer from './pattern/IInitializer.js';
import IProcessor from './pattern/IProcessor.js';

import HTMLComponent from './Component.js';
import Page from './Page.js';

const DEFAULT_PAGE_NAME = '__default';

const DEFAULT_OPTIONS = {
  identifier: null,
  initializer: IInitializer,
  processor: IProcessor,
  datasetClean: [
    "tag",
    "component",
    "callback",
    "layout"
  ],
  attributeClean: [],
  stopOnLock: true,
  lockOn: [],
  cleanIdentifier: true,
};

/**
 * This class is simply here to manage the whole system.
 *
 * It contains:
 *  * The pattern system, the component creation and building system.
 *  * The pages, containing the defined page with its components, by name
 *  * The resources, containing the components that can be built on the various pages / other components, by name
 *
 * It also received and keep the options given for the whole process.
 */
export default class HTMLBuilder {

  static createBasic(options = {}) {
    return new HTMLBuilder({ 
      ...options,
    });
  }

  static createSimplePR(options = {}) {
    return new HTMLBuilder({
      datasetClean: ['ssr'],
      lockOn: ['client', 'ssr'],
      ...options,
    });
  }

  /**
   * The builder's constructor
   *
   * @constructor
   * @param {Object?} options - The options of this builder, can be left empty for simple builder
   *    - identifier {string} The dataset the builder will catch upon
   *    - initializer {class IInitializer} The initializer class to use, default to the IInitializer class
   *    - processor {class IProcessor} The processor class to use, default to the IProcessor class
   *    - lockOn {string[]} Specific "lockOn" for the pattern class (default depending from the IPattern class)
   *    - stopOnLock {boolean} If the pattern must stop on a locking element (default to true)
   *    - datasetClean {string[]} Dataset elements to clean on components (they will be removed on the resulting HTML)
   *        default: ['layout', 'tag', 'component', 'callback']
   *    - attributeClean {string[]} Attributes to clean on components (they will be removed on the resulting HTML)
   *    - cleanIdentifier {boolean} Do the builder clean all identifier dataset (default to true)
   *    - document {Document} The document to use, JSDOM document for node, window.document for browsers, given by the ssr or browser package by default.
   */
  constructor(options = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.datasetId = this.options.identifier;

    if (this.datasetId) {
      this.options.datasetClean.push(this.datasetId);
    }

    this.initializer = new (this.options.initializer)(this);
    this.processor = new (this.options.processor)(this, this.options.document);

    this.resources = {};
    this.pages = {};
  }

  // RESOURCES //
  // ========= //

  /**
   * Returns a resource for the given id
   *
   * @param {string} id - The resource's id
   *
   * @return {HTMLComponent} The component
   */
  getResource(id) {
    return this.resources[id];
  }

  /**
   * Adds a resource to the builder
   *
   * @param node {Element} The DOM Element to add as a resource, it will be created as a component through the pattern
   * @param options {Object} The options to pass the pattern for the component creation
   * 
   * @return -
   */
  addResource(node, options = {}) {
    const component = this.initializer.createComponent(node, options);

    if (! (component.id in this.resources)) {
      this.resources[component.id] = component;
    } else {
      console.log(`Resource "${component.id}" already loaded.`);
    }
  }

  /**
   * Adds all the direct children of the given doc's body and head part as resources (as long as they have an "id" attribute as name)
   *
   * @param doc {Document} The document to get the resources from
   * @param options {Object} The options
   *
   * @return -
   */
  addResourcesFromDocument(doc, options = {}) {
    if (doc.window) {
      doc = doc.window.document;
    }

    for (const node of doc.querySelectorAll('[id]')) {
      this.addResourceFromDocsNode(doc, node, options);
    }

    if (this.datasetId) {
      for (const node of doc.querySelectorAll(`[${this.__datasetJSToHTML(this.datasetId)}]`)) {
        this.addResourceFromDocsNode(doc, node, options);
      }
    }
  }

  addAllResourcesFromBundle(bundle, options = {}) {
    const documents = bundle.documents;

    for (const name in documents) {
      const doc = documents[name];
      if (doc.window) {
        this.addResourcesFromDocument(doc, options);
      } else {
        this.addAllResourcesFromBundle({documents: doc}, options);
      }
    }
  }

  /**
   * Adds a resource from a given node from the doc.
   * Mainly used by "addResourcesFromDocument".
   *
   * @param doc {Document}
   * @param node {Element}
   * @param options {options}
   *
   * @return -
   */
  addResourceFromDocsNode(doc, node, options) {
    this.addResource(node, options);
  }

  // // PAGES // //
  // // ===== // //

  /**
   * Returns the id'd page.
   *
   * @param name {string} The page's id. Return the default one if left empty.
   *
   * @return {{sourceComponent: HTMLComponent, build: string?}} The asked page, combination of its source component and a build result.
   */
  getPage(name = null) {
    return this.pages[name ?? DEFAULT_PAGE_NAME];
  }

  /**
   * Returns the whole pages object.
   *
   * @return {Object<Page>} The page containing object.
   */
  getPages() {
    return this.pages;
  }

  /**
   * Creates a named page from the given component.
   *
   * @param name {string} The created page's name (Optional)
   * @param component {string?} The component's name in the builder
   */
  createPage(name, component) {
    // For "name" not given
    if (! component) {
      component = name;
      name = DEFAULT_PAGE_NAME;
    }

    this.pages[name] = new Page(name, this.getResource(component));
  }

  prepareAllPages(data, options = {}) {
    for (const [name, page] of Object.entries(this.pages)) {
      this.preparePage(page.name, data, options);
    }
  }

  /**
   * Prepares a page, as default name if no valid name is given.
   *
   * @param name {string?} The page's name (optional)
   * @param data {object} The data to create the page
   * @param options {object} The options
   *
   * @return -
   */
  preparePage(name, data, options = {}) {
    if (! this.__isString(name)) {
      options = data;
      data = name;
      name = DEFAULT_PAGE_NAME;
    }

    const page = this.pages[name];

    page.setBuild(this.build(
      page.sourceComponent, 
      data, 
      {
        ...this.options,
        ...options
      }
    ));
  }

  /**
   * Get the page's HTML content, created and prepared, then formatted by the given formatter.
   *
   * @param name {string|function} The page's name (optional)
   * @param formatter {function} The HTML formatter function
   *
   * @return {string} The page's HTML string, formatted.
   */
  getPageHTML(name, formatter = (a) => a) {
    if (! this.__isString(name)) {
      formatter = name;
      name = DEFAULT_PAGE_NAME;
    }

    console.log(this.pages);
    const page = this.pages[name];
    console.log(page);

    if (page?.isBuilt()) {
      if (page.build.dom) {
        return formatter(page.serialize());
      } else {
        return formatter('<!DOCTYPE HTML>' + page.getBuild().outerHTML);
      }
    }

    return null;
  }

  // BUILDING //
  // ======== //

  /**
   *
   */
  build(component, data, options = {}) {
    if (! (component instanceof HTMLComponent)) {
      throw new Error('You can\'t call this method with something else than a component');
    }

    return this.processor.build(component, data, options);
  }

  buildComponent(componentName, data, options = {}) {
    if (! this.__isString(componentName)) {
      throw new Error(`The method "buildComponent" expect a string as the componentName parameter`);
    }

    const component = this.getResource(componentName);

    if (!component) {
      throw new Error(`Couldn't find a component in resources id'd with the name "${componentName}"`);
    }

    return this.build(this.getResource(componentName), data, options);
  }

  __isString(str) {
    return (str instanceof String) || typeof str === 'string';
  }

  __datasetJSToHTML(str) {
    return 'data-' 
      + str.replace(/[A-Z]/, (match) => {
        return '-' + match.toLowercase();
      });
  }
}
