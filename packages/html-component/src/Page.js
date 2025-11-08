export default class Page {
  constructor(name, source) {
    this.name = name;
    this.sourceComponent = source;
    this.build = null;
  }

  isBuilt() {
    return !!this.build;
  }

  setBuild(builtDocument) {
    this.build = builtDocument;
  }

  getBuild() {
    return this.build;
  }
}
