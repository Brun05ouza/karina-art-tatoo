import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'production';
const output = resolve('frontend/.qa/bio-regression-bundle.mjs');
await mkdir(resolve('frontend/.qa'), { recursive: true });
await build({
  stdin: {
    contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import {MemoryRouter} from 'react-router'; import {LinkBioLanding} from './frontend/src/app/components/LinkBioLanding.tsx'; export {loadLinkBioContent, defaultLinkBioContent} from './frontend/src/app/link-bio-content.ts'; export const render = () => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(LinkBioLanding)));`,
    resolveDir: process.cwd(), loader: 'tsx',
  },
  outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', loader: { '.css': 'empty' },
  plugins: [{ name: 'bio-render-fixture', setup(build) {
    build.onResolve({ filter: /link-bio-content$/ }, args => args.importer.endsWith('LinkBioLanding.tsx') ? { path: 'fixture', namespace: 'bio-fixture' } : null);
    build.onLoad({ filter: /.*/, namespace: 'bio-fixture' }, () => ({ contents: 'export const useLinkBioContent = () => globalThis.__bioFixture;' }));
  }}],
});
const originalFetch = globalThis.fetch;
try {
  const { loadLinkBioContent, defaultLinkBioContent, render } = await import(pathToFileURL(output));
  let items = [];
  let fail = false;
  globalThis.fetch = async (url, options) => {
    assert.equal(options.cache, 'no-store');
    if (String(url).includes('bio-links')) {
      if (fail) return new Response('{}', { status: 500 });
      return Response.json({ items });
    }
    return Response.json({ chips: [], testimonials: [] });
  };
  let data = await loadLinkBioContent();
  assert.deepEqual(data.buttons, [], 'Empty admin list must not restore default buttons');
  assert.equal(data.linksError, false);
  items = [{ id: 'keep', label: 'Meu link', url: '/portfolio', icon: 'portfolio', published: true, sort_order: 0 }];
  data = await loadLinkBioContent();
  assert.deepEqual(data.buttons.map(i => i.id), ['keep'], 'Deleted buttons must stay absent');
  fail = true;
  data = await loadLinkBioContent();
  assert.deepEqual(data.buttons, [], 'API failure must not resurrect removed links');
  assert.equal(data.linksError, true);
  globalThis.__bioFixture = { ...defaultLinkBioContent, buttons: [], loaded: true, linksError: false, retry() {} };
  let html = render();
  assert.ok(!html.includes('Solicitar orçamento'), 'Removed primary button must not reappear in either CTA');
  assert.ok(!html.includes('ks-bio-final-cta'), 'Final CTA must follow removal');
  globalThis.__bioFixture.buttons = [{ id:'w', kind:'whatsapp', label:'Contato personalizado', url:'https://wa.me/5511999999999?text=teste', icon:'whatsapp', active:true, order:0, featured:true }];
  html = render();
  assert.ok(html.includes('Contato personalizado'));
  assert.ok(html.includes('https://wa.me/5511999999999?text=teste'));
  globalThis.__bioFixture.buttons = [{ ...globalThis.__bioFixture.buttons[0], active:false }];
  assert.ok(!render().includes('Contato personalizado'), 'Unpublished buttons must stay hidden');
  console.log('PASS: empty list, deleted link, API failure, removed primary and final CTA, custom destination, unpublished link.');
} finally {
  globalThis.fetch = originalFetch;
  delete globalThis.__bioFixture;
  await rm(output, { force:true });
}
