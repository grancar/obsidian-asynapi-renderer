// Strips declarations the Obsidian plugin checker flags as unsupported/duplicate in Chromium
// from the vendored AsyncAPI component CSS.
export const sanitizeVendorCss = (css) =>
  css
    .replace(/ui-(?:monospace|sans-serif),/g, '') // extended-system-fonts
    .replace('-webkit-text-decoration:underline dotted;text-decoration:underline dotted', 'text-decoration:underline') // text-decoration shorthand
    .replace('text-indent:0;', '') // css-text-indent (0 is already the default)
    .replace('width:-moz-min-content;', ''); // duplicate width
