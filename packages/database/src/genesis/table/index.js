import Database from '../../index.js';

import getCLI from './cli.js';

import Genesis from './Genesis.js';
import FileSystem from './FileSystem.js';
import GenesisTable from './GenesisTable.js';

import initialize from './proc/init.js';
import check from './proc/check.js';

const instanciator = {
  genesis: (db, cli) => {
    return new Genesis(db, cli.getOptions(), cli.getParameters());
  },
  fileSystem: (db, cli) => {
    const opt = cli.getOptions();

    return new FileSystem(opt.directory, opt.reverseDir, opt.files);
  },
  table: (db, cli) => {
    return new GenesisTable(db, cli.getOptions().genesisTableSQL);
  },
};

export default async (db, options, cb) => {
  if (! (db instanceof Database)) {
    throw new Error(`Genesis expect first parameter to be a Database instance`);
  }

  const cli = getCLI(options);

  const inst = {
    ...instanciator,
    ...cb,
  };
  
  const force = cli.getOption('force');

  const gen = inst.genesis(db, cli);
  const fs = inst.fileSystem(db, cli);
  const table = inst.table(db, cli);

  await initialize(gen, fs, table);

  await check(gen, fs, table);

  fs.displayStatus();

  if (! fs.isStatusValid()) {
    console.log('Failure to find all expected files');
    process.exit(-1);
  }

  const target = cli.getParameters();

  // Some target are defined
  if (target.length > 0) {
    if (cli.getOption('all')) {
      throw new Error('Conflict, asked for "all" to be executed, but gave some parameters');
    }

    for (const targ of target) {
      await gen.execute(targ, force);
    }
  } else {
    if (cli.getOption('all')) {
      const files = fs.getFiles();

      if (cli.getOption('reverse')) {
        files.reverse();
      }

      for (const targ of files) {
        await gen.execute(targ, force);
      }
    }
  }
};

/*

Genesis => Process

FileSystem => Create, read, check files

GenesisTable => Create, read, update the genesis table

// All options with default values
const options => {

  // Options for the Genesis

  // Options for the File System

  // string
  // Directory of the migration files
  directory: './genesis/migration',
  // string
  // Directory of the reverse migration files, relative to the migration file directory
  reverseDir: '../reverse',

  // Options for the Genesis Table

  // string
  // The sql to create the genesis table
  genesisTableSQL: 'CREATE TABLE IF NOT EXISTS...',

  // Global options

  // boolean
  // Is the wanted operation a reverse migration
  reverse: false,
  //
  //
  
}

*/
