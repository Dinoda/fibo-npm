import Database from '../index.js';
import Genesis from './Genesis.js';

import cli from './cli.js';

import createNewFiles from './createFiles.js';


const DEFAULT_OPTIONS = {
  prefix: './genesis/migration/',
  reverse: false,
  reverseDir: '../reverse/',
};

const opt = {
  ...DEFAULT_OPTIONS,
  ...cli.getOptions(),
};

const parameters = cli.getParameters();


const end = async (genesis, err) => {
  if (err) {
    console.log(err.message);
    if (opt.verbose) {
      console.log(err.stack);
    }
  }

  await genesis.loadGenesis();

  genesis.display();
};




export default async (database, options) => {
  if (! (database instanceof Database)) {
    throw new Error(`Genesis expect first parameter to be a Database instance`);
  }

  const genesis = new Genesis(database, {
    ...options,
    ...opt,
  });

  await genesis.init();
  await genesis.load();

  genesis.display();

  try {
    if (opt.all) {
      for (const file of genesis.files) {
        try {
          await genesis.execute(file, opt.force);
        } catch (err) {
          if (!err.cause || err.cause != 'StatusMatching') {
            throw err;
          }
        }
      }
      await end(genesis);
    } else if (opt.new) {
      const f = await createNewFiles(genesis.getGenesisPath(), genesis.getGenesisReversePath(), opt.new);

      console.log(`Created new genesis files: ${f}`);
    } else if (parameters[0]) {
      await genesis.execute(parameters[0], opt.force);
      await end(genesis);
    }
  } catch (err) { 
    await end(genesis, err);
  }
};

