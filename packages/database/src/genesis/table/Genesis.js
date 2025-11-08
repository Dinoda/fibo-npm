import FileSystem from './FileSystem.js';

export default class Genesis {
  constructor(db, options, parameters) {
    this.db = db;
    this.options = options;
    this.params = parameters;

    this.reverse = options.reverse ?? false;
  }

  setFileSystem(fs) {
    this.fs = fs;
  }

  setTable(table) {
    this.table = table;
  }

  async load() {
  }

  async check() {
  }

  async execute(filename, force) {
    const type = this.reverse ? 'reversed' : 'loaded';
    this.fs.setActiveFile(filename);

    if (! force && this.fs.getActiveFileStatus() == type) {
      throw new Error('This file is already on the demanded status. Call with --force option to ignore this');
    }
    
    const content = await this.fs.getContent(this.reverse);

    console.log('Calling SQL file:');
    console.log(content);

    await this.db.query(content, []);

    await this.table.updateFile(this.fs.getActiveFile(), this.reverse ? 'reversed' : 'loaded');
  }
}
