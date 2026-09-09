import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { expect, test } from 'vitest';
// @ts-expect-error -- plain .mjs shared with esbuild.config.mjs, no types
import { sanitizeVendorCss } from '../scripts/sanitize-vendor-css.mjs';

// Guards the Obsidian plugin-checker warnings on the vendored AsyncAPI CSS.
test('vendor css has no declarations the Obsidian checker flags', () => {
  const require = createRequire(import.meta.url);
  const css = sanitizeVendorCss(
    readFileSync(require.resolve('@asyncapi/react-component/styles/default.min.css'), 'utf8'),
  );
  expect(css).not.toMatch(/ui-(monospace|sans-serif)/);
  expect(css).not.toContain('underline dotted');
  expect(css).not.toContain('text-indent');
  expect(css).not.toContain('-moz-min-content');
});
