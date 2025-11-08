import * as esbuild from "esbuild";

const def = {
  logLevel: 'info',
  bundle: true,
  sourcemap: true,
  minify: true,
  outdir: process.env.STATIC_DIRECTORY ?? "public",
  define: {
    PORT: (process.env.PORT ?? 1342).toString()
  }
};

export default class Builder {
  constructor(options) {
    this.options = {
      ...def,
      ...options,
    };

    if (!('entryPoints' in this.options)) {
      throw new Error('Missing "entryPoints" for building');
    }

    this.ctx = esbuild.context(this.options);
  }

  async watch() {
    await (await this.ctx).watch();
  }

  async build() {
    await (await this.ctx).build();
  }
}


