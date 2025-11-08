import fs from 'fs';
import { parse } from 'csv-parse';

const get = (type, data) => {
  if (typeof type === 'function') {
    return type(data);
  }

  return type;
};

export default (datasource) => {
  const parser = parse({ delimiter: datasource.delimiter ?? ',' });

  const rstream = fs.createReadStream(datasource.file);

  const data = [];

  return new Promise((res, rej) => {
    parser.on('readable', () => {
      let i = 0;

      let row = parser.read();

      while(row) {
        data.push(row);
        row = parser.read();
      }
    });

    parser.on('end', () => {
      res({
        table: datasource.tableName,
        headers: get(datasource.headers, data),
        rows: get(datasource.rows, data),
      });
    });

    rstream.pipe(parser);
  });
};
