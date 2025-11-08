import fs from 'fs/promises';
import path from 'path';

export default async (directory) => {
  const files = await fs.readdir(directory);
  const result = [];

  for (const file of files) {
    const stat = await fs.stat(path.join(directory, file));
    if (stat.isFile() && file.match(/\.sql$/)) {
      result.push(file);
    }
  }

  return result;
};
