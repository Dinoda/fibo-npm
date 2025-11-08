import path from 'path';

import initDatabase from './database/init.js';

export default class Genesis {
  constructor(database, options) {
    this.db = database;
    this.options = options;

    this.reverse = options.reverse;
    this.genesisTable = new GenesisTable(this.db, this.tableName, this.genesisSQL);
    this.fs = new FileSystem(options.prefix, options.reverseDir, options.files);

    this.targetStatus = this.reverse ? 'reversed' : 'loaded';

    this.datasources = options.datasources;
  }

  // Initializers //
  // ============ //

  async init() {
    await initDatabase(this.db, this.options.genesisSQL);
    await this.fs.loadFiles();
  }

  async load() {
    await this.loadGenesis();

    let reload = false;

    for (const f of this.files) {
      if (! this.genesis[f]) {
        reload = true;
        await this.addLine(f);
      }
    }

    if (reload) {
      await this.loadGenesis();
    }
  }

  async addLine(file) {
    await this.db.query('INSERT INTO `genesis` (`filename`) VALUES (?)', [file]);
  }

  async loadGenesis() {
    this.genesis = {};

    const res = await this.db.query('SELECT * FROM `genesis`');

    for (const row of res) {
      const fn = row.filename;

      this.genesis[fn] = row;
    }
  }

  async loadFiles() {
    if (! this.files) {
      this.files = this.options.files ?? await getFiles(this.path);
    }

    if (this.reverse) {
      this.files.reverse();
    }
  }

  // Execution //
  // ========= //

  async execute(filename, force = false) {
    if (this.genesis[filename]) {
      if (!force && this.genesis[filename].status == this.targetStatus) {
        throw new Error(`File ${filename} is already at the expected status: ${this.targetStatus}`, { cause: 'StatusMatching' });
      }

      await this.executeFile(filename);
    }
  }

  async executeFile(filename) {
    const sql = await getFileContent(this.path, filename);

    console.log(`Executing sql file "${filename}":`);
    console.log(sql);
    await this.db.query(sql, []);

    await this.updateGenesisTable(filename, this.targetStatus);
  }

  async updateGenesisTable(filename, status) {
    await this.db.query('UPDATE `genesis` SET status = ? WHERE filename = ?', [status, filename]);
  }

  // CLI //
  // === //

  display() {
    for (const file of this.files) {
      const st = this.genesis[file].status;
      const lu = this.genesis[file].last_update;
      console.log(`Status: ${st} -- ${file} - Last update: ${lu}`);
    }
  }

  // Getters //
  // ======= //
  
  getGenesisPath() {
    return path.resolve(this.options.prefix);
  }

  getGenesisReversePath() {
    return path.resolve(path.join(this.options.prefix, this.options.reverseDir));
  }
}

