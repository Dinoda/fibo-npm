import fs from 'node:fs/promises';
import path from 'node:path';

import { JSDOM } from 'jsdom';

const componentDocument = {};

/**
 * Creates a document (JSDOM package) using the given html string
 *
 * @param html {string} - The content of the created document
 * @return {JSDOM} A JSDOM document, matching DOM web standards
 */
componentDocument.createFromHTML = (html) => {
  return new JSDOM(html);
};

/**
 * Creates a document from the content of the file indicated.
 *
 * Calls "createFromHTML" from the content of the file
 *
 * @param filepath {string} - The path of the html file
 * @return {Promise<JSDOM>} A promise, resolving to a JSDOM document, matching DOM web standards
 */
componentDocument.createFromFile = (filepath) => {
  return new Promise((res, rej) => {
    fs.readFile(filepath).then((html) => {
      res(
        componentDocument.createFromHTML(html, { encoding: 'utf-8' })
      );
    }).catch(err => {
      rej(err);
    });
  });
};

class DocumentBundle {
  constructor(depth = false, extensions = ['.html']) {
    this.documents = {};
    this.depth = depth;
    this.extensions = extensions;
  }

  /**
   * Calls "resolveDirectory" on the given directory, and returns the main Promise.
   *
   * @param directory {string} The parent directory for all resources.
   *
   * @return {Promise<>} A promise resolved when the whole directory has been resolved and turned to documents (in the "documents" attribute of the bundle).
   */
  createFromDirectory(directory) {
    return this.resolveDirectory(this.documents, directory);
  }

  /**
   * Takes the containing object and the directory path to resolve the documents.
   *
   * @param obj {Object} An object which will contain the resolved documents.
   * @param filepath {string} The path to the resource directory
   *
   * @return {Promise<>} A promise resolved when the directory's documents are resolved.
   */
  resolveDirectory(obj, filepath) {
    return new Promise((res) => {
      const dirName = path.basename(filepath);
      const proms = [];

      obj[dirName] = {};

      fs.readdir(filepath).then((files) => {
        for (const file of files) {
          proms.push(this.resolveFile(obj[dirName], filepath, file));
        }

        Promise.all(proms).then(() => {
          res();
        });
      });
    });
  }

  /**
   *
   */
  resolveFile(obj, filepath, file) {
    const fullpath = path.join(filepath, file);
    return new Promise((res) => {
      fs.lstat(fullpath).then((stat) => {
        if(stat.isDirectory()) {
          if (this.depth) {
            this.resolveDirectory(obj, fullpath).then(() => res());
          } else {
            res();
          }
        } else if (this.extensions.includes(path.extname(fullpath))) {
          const filename = path.basename(file);

          componentDocument.createFromFile(fullpath).then((jsdoc) => {
            obj[filename] = jsdoc;
            res();
          });
        } else {
          res();
        }
      });
    });
  }
}

/**
 * @return {Promise<Array<string,JSDOM|Object>>} A promise resolving to an array, containing the filename (at 0) and the JSDOM document or object (at 1)
 */
/*
const resolveFile = (file, depth, extensions) => {
  return new Promise((res, rej) => {
    fs.lstat(file).then((fstat) => {
      if(fstat.isDirectory()) {
        if (depth) {
          res(resolveDirectory(file, depth, extensions));
        } else {
          res();
        }
      } else if (extensions.includes(path.extname(file))) {
        createFromFile(file).then((jsdoc) => {
          res(jsdoc);
        });
      }
    });
  });
};
*/

/**
 * @return {Promise<Object<JSDOM|Object>>} A promise resolving to an object containing the document by the filename, if depth, some documents can be replaced by object containing document themselves.
 */
/*
const resolveDirectory = (files, depth, extensions) => {
  const proms = [];

  for (const file of files) {
    proms.push(resolveFile(file, depth, extensions));
  }

  return Promise.all(proms).then((resolvedFiles) => {
    const documents = {};

    for (const [filename, doc] of resolvedFiles) {
      documents[filename] = doc;
    }

    return document;
  });
};
*/

/**
 * Creates documents from the files present in the directory
 *
 * Calls "createFromFile" for each matching files
 *
 * @param directory {string} - The path of the directory
 * @param depth {boolean} - Should we call for the content to be looked into directories (default to false)
 * @param extensions {string|Array<string>} - What file extensions are considered to load, allowing to avoid to load all files without conditions (default to ['.html'] only) (do not forget the '.' dot, we use path.extname to compare)
 * @return {DocumentBundle} A promise, witch should resolve to an array of JSDOM documents, matching web standards
 */
componentDocument.createFromDirectory = async (directory, depth = false, extensions = ['.html']) => {
  const bundle = new DocumentBundle(depth, extensions);

  await bundle.createFromDirectory(directory);

  return bundle;
};

export { componentDocument, DocumentBundle };
