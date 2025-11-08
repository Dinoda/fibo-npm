import fs from 'fs/promises';
import path from 'path';

function fill(value, length, char) {
  value = value.toString();
  while (value.length < length) {
    value = char + value;
  }

  return value;
}

// Short fill
function sf(value) {
  return fill(value, 2, '0');
}

function getFullDate() {
  const dt = new Date();

  return dt.getFullYear() + '' + sf(dt.getMonth() + 1) + sf(dt.getDate(), 2, 0) + '-' + sf(dt.getHours()) + '' + sf(dt.getMinutes());
}

export default (dir, reverseDir, filename) => {
  const file = getFullDate() + (filename === true ? '.sql' : '-' + filename + '.sql');
  const proms = [];

  proms.push(
    fs.writeFile(path.join(dir, file), `CREATE TABLE \`${filename === true ? 'tableName' : filename}\` (
  id INTEGER PRIMARY KEY AUTO_INCREMENT
);
`)
  );

  proms.push(
    fs.writeFile(path.join(reverseDir, file), `DROP TABLE \`${filename === true ? 'tableName' : filename}\`;`)
  );

  return Promise.all(proms).then(() => {
    return file;
  });
};

