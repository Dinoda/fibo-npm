import 'dotenv/config';

import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

//import genesis from 'fibo-database-mariadb/genesis';

import { MariaDBDatabase as Database } from 'fibo-database-mariadb';

const db = new Database({
	host: process.env.DATABASE_HOST,
	database: process.env.DATABASE,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	connectionLimit: 5,
  allowMultiQueries: true,
});
//import itemsData from './loadItemsData.js';
const dir = './genesis';

readdir(dir).then(async (files) => {
  console.log(files);
  for (const file of files) {
    if (extname(file) == '.sql') {
      console.log(file);
      await db.query(await readFile(join(dir, file)), {});
    }
  }
  //db.query(await read('
  process.exit(0);
});
/*
await genesis(database, {
  datasources: {
    //items: itemsData,
  }
});
*/

