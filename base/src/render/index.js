import createBuilder, { Builder, DocumentBundle, output } from 'fibo-html-component-ssr';

const builder = createBuilder({identifier: 'fb'});

const bundle = new DocumentBundle(true);

await bundle.createFromDirectory("src/html");

const layout = bundle.documents.html.resources['layout.html'];

builder.addAllResourcesFromBundle(bundle, { identifier: "pr", lockOn: ['client'] });

builder.createPage('index', 'index');
builder.createPage('profile', 'profile');

builder.prepareAllPages({}, {lockOn: ['client']})

output.setFormat(false);

await output.outputPage(builder, 'index', '.page', 'index.html');
await output.outputPage(builder, 'profile', '.page', 'profile.html');

await output.outputResource(builder, 'timer', '.resource', 'timer.html');
