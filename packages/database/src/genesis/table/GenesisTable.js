import { CREATE, INSERT, UPDATE, LOAD } from './tableSQL.js';

export default class GenesisTable {
  constructor(db, createSQL, loadSQL) {
    this.db = db;
    this.createSQL = createSQL ?? CREATE;
    this.loadSQL = loadSQL ?? LOAD;

    this.rows = {};
  }

  async load() {
    await this.db.query(this.createSQL);

    const rows = await this.db.query(this.loadSQL);

    for (const row of rows) {
      this.rows[row.filename] = row;
    }
  }

  async check() {
  }

  getFiles() {
    return this.rows;
  }

  getFile(filename) {
    return this.rows[filename];
  }

  async insertNewFile(filename) {
    await this.db.query(INSERT, [filename]);
  }

  async updateFile(filename, status) {
    await this.db.query(UPDATE, [status, filename]);
  }
}
