export default class IProcessor {
  constructor(builder, doc) {
    this.builder = builder;
    this.document = doc;
  }

  /**
   * Build the element, its possible layout, and return the element, or its parent layout with it inside.
   *
   * @param component {HTMLComponent} The component to build
   * @param data {any} The data to use inside the component
   * @param options {Object} The options for this build
   *
   * @return {Element} The build component, inside its layout if present (so the component root element, or its layout root element)
   */
  build(component, data, options) {
    const element = this.buildElement(component, data, options);

    if (component.callback) {
      const cb = options.callbacks[component.callback];

      if (! cb) {
        throw new Error(`Callback not found on component "${component.getId()}"`);
      }

      cb(component, this.resolveData(data, component), this.builder);
    }

    if (component.layout) {
      const layout = this.builder.buildComponent(
        component.layout, 
        data,
        options
      );

      const childrenLocation = layout.querySelector('[data-children]');

      if (! childrenLocation) {
        throw new Error(`Component expected to have a "data-children" attribute somewhere to be used as a layout, didn't find any in "${component.layout}"`);
      }

      delete childrenLocation.dataset.children;
      childrenLocation.appendChild(element);

      return layout;
    }

    return element;
  }

  /**
   * Directly build the element itself
   *
   * @param component {HTMLComponent} The component to build its direct element
   * @param data {any} The data to use inside the element if needed
   * @param options {Object} The options for this build
   *
   * @return {Element} The built element
   */
  buildElement(component, data, options) {
    if (component.multiple) {
      return this.buildMultipleElement(component, data, options);
    } else if (component.component) {
      return this.buildComponentElement(component, data, options);
    } 

    return this.buildSimpleElement(component, data, options);
  }

  /**
   *
   */
  buildMultipleElement(component, data, options) {
    const element = this.document.createDocumentFragment();

    data = this.resolveMultipleData(data);

    for (const datum of data) {
      element.appendChild(this.buildSimpleElement(component, datum, options));
    }

    return element;
  }

  /**
   *
   */
  buildComponentElement(component, data, options) {
    return this.builder.buildComponent(
      component.component,
      this.resolveData(data, component),
      options
    );
  }

  /**
   *
   */
  buildSimpleElement(component, data, options) {
    const element = this.createElement(component);

    if (component.children.length > 0) {
      for (const child of component.children) {
        const builtChild = this.build(child, data, options);

        element.appendChild(builtChild);
      }
    } else {
      if (component.value) {
        if (element.tagName === 'INPUT') {
          element.value = JSON.stringify(this.resolveData(data, component));
        } else {
          element.textContent = JSON.stringify(this.resolveData(data, component));
        }
      }

      for (const [k, v] of Object.entries(component.dataset)) {
        element.dataset[k] = v;
      }
    }

    return element;
  }

  /**
   * Create an element matching the component.
   *
   * @param component {HTMLComponent} The component
   *
   * @return {Element} An HTML element matching the component needs
   */
  createElement(component) {
    if (component.tag) {
      const match = component.tag.match(/^__/);
      const e = match ? this.document.createDocumentFragment() : this.document.createElement(component.tag);

      if (!match) {
        for (const attr of component.sourceNode.attributes) {
          e.attributes.setNamedItem(attr.cloneNode());
        }
      }

      if (component.deep) {
        for (const childNode of component.sourceNode.children) {
          e.appendChild(childNode.cloneNode(true));
        }
      }

      return e;
    }

    return component.sourceNode.cloneNode(component.deep);
  }

  /**
   * Resolve this data for the given component, so if the data looks like :
   * {
   *  data1: value1,
   *  data2: value2,
   *  dataM: [
   *    m1,
   *    m2,
   *    m3
   *  ]
   * }
   * If the component await "dataM" (value), then it will return the array [m1, m2, m3], if it await "data1", it will return the element value1.
   * If the component as no value expected, or expect "__plain", it will return the whole data. ("__plain" will indicate to display the given data as a plain string in the component)
   *
   * @param data {any} The object to get the data from
   * @param component {HTMLComponent} The component to resolve data for.
   *
   * @return {any} The value expected from the data.
   */
  resolveData(data, component) {
    if (component.value) {
      return data[component.value];
    }

    return data;
  }

  /**
   *
   */
  resolveMultipleData(data, component) {
    const dt = this.resolveData(data, component);

    return Array.isArray(dt) ? dt : Object.values(dt);
  }
}
