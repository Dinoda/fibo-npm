import fs from 'fs/promises';
import path from 'path';

const FILE_STATUS_OK = 1;
const FILE_STATUS_NOT_INCLUDED = 0;
const FILE_STATUS_NOT_FOUND = -1;

export default class FileSystem {
  constructor(directory, reverseDirectory, files = null) {
    this.directory = path.resolve(directory);
    this.reverseDir = path.resolve(path.join(directory, reverseDirectory));

    this.files = files;
    this.activeFile = null;
  }

  async loadFiles() {
    if (this.files) {
      return;
    }

    const files = await fs.readdir(this.directory);

    const result = [];

    for (const file of files) {
      const stat = await fs.stat(path.join(directory, file));

      if (stat.isFile()) {
        result.push(file);
      }
    }

    this.files = result;
  }

  setActiveFile(file) {
    if (this.files.includes(file)) {
      this.activeFile = file;
    }

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

    return matching[0] ?? null;
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

  checkFiles() {
    const proms = [];

    proms.push(this.checkFilesFrom(this.directory));
    proms.push(this.checkFilesFrom(this.reverseDir));

    return Promise.all(proms);
  }

  checkFilesFrom(directory) {
    return fs.readdir(dir).then((files) => {
      const statuses = {};
      for (const f of files) {
        if (this.files.includes(f)) {
          statuses[f] = FILE_STATUS_OK;
        } else {
          statuses[f] = FILE_STATUS_NOT_INCLUDED;
        }
      }

      for (const f in this.files) {
        if (!statuses[f]) {
          statuses[f] = FILE_STATUS_NOT_FOUND;
        }
      }

      return statuses;
    });
  }

  getFiles() {
    return this.files;
  }
}
