import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = {};

output.formatter = (a) => a;

output.setFormat = async (minified = true) => {
  output.formatter = (await import('htmlfy'))[minified ? 'minify' : 'prettify']
};

output.setCustomFormatter = (formatter) => {
  output.formatter = formatter;
};

const prepareOutput = (dir) => {
  return access(dir).then(
    () => {}
  ).catch(() => {
    mkdir(dir);
  });
};

output.outputPage = async (builder, pageName, directory, outputName) => {
  await prepareOutput(directory);

  await writeFile(
    join(
      directory,
      outputName ?? pageName
    ), 
    builder.getPageHTML(
      pageName,
      output.formatter
    )
  );
};

output.outputResource = async (builder, resource, directory, outputName) => {
  await prepareOutput(directory);

  await writeFile(
    join(
      directory,
      outputName ?? resource
    ),
    output.formatter(builder.getResource(resource).sourceNode.outerHTML)
  );
};

export { output };
