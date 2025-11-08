import defaultSQL from './sql.js';

export default async (db, sql) => {
  sql = sql ?? defaultSQL;

  await db.query(sql, []);
};
