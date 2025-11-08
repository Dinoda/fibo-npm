import { readdir, access, constants } from 'node:fs/promises';
import { join, basename, resolve } from 'node:path';

export default class PageRouterBuilder {
  constructor(directory, router, defaultPage) {
    this.dir = resolve(directory);
    this.router = router;
    this.def = defaultPage;
    this.pages = {};
    console.log(`This router builder will deliver files from "${this.dir}"`);
  }

  async initialize() {
    return readdir(this.dir).then((files) => {
      for (const file of files) {
        const base = basename(file, '.html');
        this.pages[base] = file;
      }
      console.log('Pages:', this.pages);

      if (!(this.def in this.pages)) {
        this.def = undefined;
      }

      console.log('Default page:', this.def ?? 'none');
    });
  }

  getRouter(prefix = "") {
    console.log(`Delivering pages on "${prefix}"`);
    if (this.def) {
      this.router.route(prefix).get((req, res) => {
        console.log('Default Route');
        res.sendFile(this.pages[this.def], { root: this.dir }, (err) => {
          if (err) {
            console.error(err);
            res.sendStatus(404);
          }
        });
      });
    }

    this.router.route(prefix + '/:page{.html}').get((req, res, next) => {
      const page = req.params.page;

      if (this.pages[page]) {
        console.log('Page route: ', req.params.page);
        res.sendFile(this.pages[page], { root: this.dir }, (err) => {
          if (err) {
            console.error(err);
            res.sendStatus(404);
          }
        });
      } else {
	      next();
      }
    });

    return this.router;
  }
}
