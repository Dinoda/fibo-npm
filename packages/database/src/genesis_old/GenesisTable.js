import defaultSql from './database/sql.js';

export default class GenesisTable {

  static FILE_STATUS_ABSENT = 0;
  static FILE_STATUS_NONE = 1;
  static FILE_STATUS_LOADED = 2;
  static FILE_STATUS_REVERSED = 3;

  constructor(db, tableName, sql) {
    this.db = db;
    this.table = tableName;
    this.sql = sql ?? defaultSql;
    this.uptodate = false;
    this.files = {};
  }

  init() {
  }

  load() {
    const rows = await this.db.query('SELECT * FROM `genesis`');

    for (const row of rows) {
      this.files[row.filename] = row;
    }
    this.uptodate = true;
  }

  getTableStatus() {
    if (! this.upToDate) {
    }

    return this.files;
  }

  getFileStatus(file) {
  }

  setFileStatus(file, status) {
    let 
    switch(status) {
    }
  }
}
