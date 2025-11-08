import HTMLComponent from '../Component.js';

import { TEXT_NODE } from '../utils.js';

export default class IInitializer {
  constructor(builder) {
    this.builder = builder;
  }

  /**
   * Creates a component from the given element.
   *
   * @param element {Element} The element
   * @param options [Object} The options to create and initialize. Default to the builder's options
   *    - lockOn {string[]} The dataset value that lock some component for this pattern
   *    - stopOnLock {boolean} Must the component analysis stop on a locked component (if only one part is to be locked, not (all) its children)
   *    - callbacks {{[key]: function}} The callbacks to call for components (here, callbackOnInit ("data-callback-on-init"))
   *    - datasetClean {string[]} The dataset elements to delete from the node post component initialization
   *    - attributeClean {string[]} The attribute to delete from the node post component initialization
   *
   * @return {HTMLComponent} The created component.
   */
  createComponent(element, options) {
    options = {
      ...this.builder.options,
      ...options,
    };

    const comp = new HTMLComponent(element, this.builder, options);
    const node = comp.sourceNode;

    if (this.lockOn(node, options.lockOn)) {
      comp.lock = true;
    }

    if (! comp.lock || ! options.stopOnLock) {
      // Initialize the children
      for (const child of node.childNodes) {
        if (child.nodeType == TEXT_NODE) {
          // Child text node is not empty (space only)
          if (! child.textContent.match(/^[\s]*$/)) {
            comp.children.push(child);
          }
        } else {
          comp.children.push(this.createComponent(child, options));
        }
      }
    }

    if (! comp.lock) {
      const ds = node.dataset;

      if ('multiple' in ds) {
        comp.multiple = true;
      }

      if ('value' in ds) {
        comp.value = ds.value ? ds.value : '__plain';
      }

      this.pullDataset(comp, ds);

      if (ds.callbackOnInit) {
        if (options.callbacks[ds.callbackOnInit]) {
          options.callbacks[ds.callbackOnInit](comp, this.builder, options);
        } else {
          throw new Error(`Callback not found on component init "${ds.callbackOnInit}"`);
        }
      }
    } 
    // If the component is locked and you must stop on lock, set as deep copy
    else if (this.stopOnLock) {
      comp.deep = true;
    }

    this.clean(comp, options);

    return comp;
  }

  /**
   * Pull some value plainly from the dataset.
   *
   * @param comp {HTMLComponent} The component to pull into
   * @param dataset {DataSet} The dataset to pull from
   *
   * @return -
   */
  pullDataset(comp, dataset) {
    for (const [key, value] of Object.entries(dataset)) {
      if ([
        "tag",
        "component",
        "callback",
        "layout"
      ].includes(key)) {
        comp[key] = value;
      }
    }
  }

  /**
   * Lock on the given node ?
   *
   * @param node {Element} The node to lock on ?
   * @param lockOn {string[]} The dataset values to lock on
   *
   * @return {boolean} True if must lock on this node
   */
  lockOn(node, lockOn) {
    for (const ds in node.dataset) {
      if (lockOn.includes(ds)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clean the component for next operations.
   *
   * @param comp {HTMLComponent} The component to clean
   * @param options {Object} The options to control cleaning
   */
  clean(comp, options) {
    if (this.canAllChildBeCleaned(comp)) {
      comp.children = [];
      comp.deep = true;
    }

    for (const ds of options.datasetClean) {
      delete comp.sourceNode.dataset[ds];
    }

    for (const attr of options.attributeClean) {
      delete comp.sourceNode.removeAttribute(attr);
    }
  }

  /**
   * Check if all component's children can be cleaned (component can simply be deep cloned)
   *
   * @param comp {HTMLComponent} The component
   *
   * @return {boolean} If the component can clean all its children
   */
  canAllChildBeCleaned(comp) {
    for (const child of comp.children) {
      if (! this.canBeCleaned(child)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a component can be cleaned (clone directly by copying its parent)
   *
   * @param comp {HTMLComponent}
   *
   * @return {boolean} This component can be cleaned.
   */
  canBeCleaned(comp) {
    // Can always clean non-component
    if (! (comp instanceof HTMLComponent)) {
      return true;
    }

    // Is an HTMLComponent with value, so can't be cleaned
    if (comp.children.length > 0
      || comp.value
      || comp.component
      || comp.callback
      || comp.tag
      || (comp.dataset && comp.dataset.length > 0)
    ) {
      return false;
    }

    return true;
  }
}
