import fs from 'fs/promises';
import path from 'path';

export default (rel, filename) => {
  const absolute = path.join(path.resolve(rel), filename);

  return fs.readFile(absolute, { encoding: 'utf-8' });
};
