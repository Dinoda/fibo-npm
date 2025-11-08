import fs from 'fs/promises';
import path from 'path';

const FILE_STATUS_OK = 'Ok';
const FILE_STATUS_NOT_INCLUDED = 'File not included in migrations';
const FILE_STATUS_NOT_FOUND = 'Could not find the corresponding file';

const TABLE_STATUS_TO_STRING = {
  'none':     'None    ',
  'loaded':   'Loaded  ',
  'reversed': 'Reversed',
};

export default class FileSystem {
  constructor(directory, reverseDirectory, files = null) {
    this.directory = path.resolve(directory);
    this.reverseDir = path.resolve(path.join(directory, reverseDirectory));

    this.files = files;
    this.activeFile = null;

    this.status = {};
  }

  setTable(table) {
    this.table = table;
  }

  async load() {
    if (this.files) {
      return;
    }

    const files = await fs.readdir(this.directory);

    const result = [];

    for (const file of files) {
      const stat = await fs.stat(path.join(this.directory, file));

      if (stat.isFile()) {
        result.push(file);
      }
    }

    this.files = result;
  }

  async check() {
    const [mig, rev] = await this.checkFiles();
    const tableFiles = this.table.getFiles();
    let alert = false;

    for (const f of this.files) {
      this.setStatus(f, 'table', tableFiles[f]);
      if (!this.status[f].migration) {
        this.setStatus(f, 'migration', FILE_STATUS_NOT_FOUND);
        alert = true;
      }
      if (! this.status[f].reverse) {
        this.setStatus(f, 'reverse', FILE_STATUS_NOT_FOUND);
        alert = true;
      }
    }


    for (const f in this.table.getFiles()) {
      if (!this.status[f]) {
        this.status[f] = {
          table: tableFiles[f],
          directory: FILE_STATUS_NOT_FOUND,
          reverse: FILE_STATUS_NOT_FOUND,
        };
        alert = true;
      }
    }

    return alert;
  }

  // FILES MANIPULATION //
  //-==================-//

  setActiveFile(file) {
    if (this.files.includes(file)) {
      this.activeFile = file;
    } else {
      const regex = new RegExp(file + '.*');
      const matching = [];

      for (const f of this.files) {
        if (regex.exec(f)) {
          matching.push(f);
        }
      }

      if (matching.length > 1) {
        throw new Error(`String "${file}" matches multiple files: ${matching.join(', ')}`);
      }

      this.activeFile = matching[0] ?? null;
    }
  }

  getActiveFile() {
    return this.activeFile;
  }

  getContent(reverse = false) {
    return fs.readFile(path.join(reverse ? this.getReversePath() : this.getPath(), this.activeFile), 'utf-8');
  }

  getPath() {
    return this.directory;
  }

  getReversePath() {
    return this.reverseDir;
  }

  getFiles() {
    return this.files;
  }

  // CHECKING //
  //-========-//

  checkFiles() {
    const proms = [];

    proms.push(this.checkFilesFrom('migration', this.directory));
    proms.push(this.checkFilesFrom('reverse', this.reverseDir));

    return Promise.all(proms);
  }

  checkFilesFrom(type, directory) {
    return fs.readdir(directory).then((files) => {
      for (const f of files) {
        if (this.files.includes(f)) {
          this.setStatus(f, type, FILE_STATUS_OK);
        } else {
          this.setStatus(f, type, FILE_STATUS_NOT_INCLUDED);
        }
      }
    });
  }

  // STATUS //
  //-======-//
  
  getActiveFileStatus() {
    return this.status[this.activeFile].table.status;
  }

  setStatus(filename, type, status) {
    if (!this.status[filename]) {
      this.status[filename] = {};
    }

    this.status[filename][type] = status;
  }

  displayStatus() {
    for (const file in this.status) {
      const fstat = this.status[file];

      console.log(` - ${TABLE_STATUS_TO_STRING[fstat.table.status]} ${file}`);
      if (fstat.migration == FILE_STATUS_OK && fstat.reverse == FILE_STATUS_OK) {
        console.log(`\t\tFiles: Ok`);
      } else {
        console.log(`\t\tFiles: Migration ${fstat.migration}`);
        console.log(`\t\tFiles: Reverse mig. ${fstat.reverse}`);
      }
    }
  }

  isStatusValid() {
    let valid = true;

    for (const file in this.status) {
      const fstat = this.status[file];

      if (fstat.migration == FILE_STATUS_NOT_FOUND) { 
        console.log(`Missing migration file: ${file}`);
        valid = false;
      }
      if (fstat.reverse == FILE_STATUS_NOT_FOUND) {
        console.log(`Missing reverse migration file: ${file}`);
        valid = false;
      }
    }

    return valid;
  }
}
