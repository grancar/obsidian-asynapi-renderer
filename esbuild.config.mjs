import esbuild from 'esbuild';
import process from 'process';
import { builtinModules as builtins } from 'node:module';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { sanitizeVendorCss } from './scripts/sanitize-vendor-css.mjs';

const prod = process.argv[2] === 'production';
const outDir = prod ? '.' : 'test-vault/.obsidian/plugins/asyncapi-renderer';
fs.mkdirSync(outDir, { recursive: true });

// styles.css = vendor AsyncAPI CSS (scoped under .aui-root) + our own CSS.
const require = createRequire(import.meta.url);
const vendorCss = sanitizeVendorCss(
  fs.readFileSync(require.resolve('@asyncapi/react-component/styles/default.min.css'), 'utf8'),
);
const ownCss = fs.readFileSync('src/styles.css', 'utf8');
fs.writeFileSync(path.join(outDir, 'styles.css'), `${vendorCss}\n${ownCss}`);

if (!prod) {
  fs.copyFileSync('manifest.json', path.join(outDir, 'manifest.json'));
  fs.writeFileSync(path.join(outDir, '.hotreload'), '');
}

const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
    ...builtins,
  ],
  format: 'cjs',
  target: 'es2020',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: path.join(outDir, 'main.js'),
  minify: prod,
});

if (prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
