import { TEXT_NODE } from './utils.js';

export default class HTMLComponent {
  constructor(node, builder, options = {}) {
    this.sourceNode = node;
    this.builder = builder;

    const idt = options.identifier;

    if (idt) {
      this.id = node.getAttribute(idt);
    }

    if (! this.id && node.nodeType != TEXT_NODE) {
      this.id = node.id;
      node.removeAttribute('id');
    }

    this.multiple = false;
    this.lock = false;

    this.children = [];
    this.dataset = {};
  }

  getId() {
    return this.id;
  }

  setDataset(key, value) {
    this.dataset[key] = value;
  }

  getDataset(key) {
    return this.dataset[key];
  }
}
