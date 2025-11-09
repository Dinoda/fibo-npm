import CRUD from 'fibo-crud';

import database from '../service/database.js';

import { SELECT_ALL, SELECT_ROOT, SELECT, INSERT, UPDATE } from './work.sql.js';

const selectHydrator = (data) => {
  for (const datum of data) {
    datum.id = Number(datum.id);
  }
  
  return data;
};

const crud = new CRUD(database, {
  selectAll: {
    sql: SELECT_ALL,
    type: CRUD.TYPE_SELECT,
    hydrator: selectHydrator,
  },
  selectRoots: {
    sql: SELECT_ROOT,
    type: CRUD.TYPE_SELECT,
    hydrator: selectHydrator,
  },
  select: {
    sql: SELECT,
    params: ['id'],
    type: CRUD.TYPE_SELECT,
    hydrator: selectHydrator,
  },
  insert: {
    sql: INSERT,
    params: ['name', 'description', 'work'],
    type: CRUD.TYPE_INSERT,
  },
  update: {
    sql: UPDATE,
    params: ['name', 'description', 'work', 'id'],
    type: CRUD.TYPE_UPDATE,
  },
});

export default crud.proxy();
