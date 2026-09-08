# Obsidian AsyncAPI Renderer

Render [AsyncAPI](https://www.asyncapi.com) specifications (2.x and 3.x) inside Obsidian.

## Features

- Open `.yaml` / `.yml` (and optionally `.json`) spec files in a rendered view, with a Source editor toggle.
- Embed specs in notes:

  ````markdown
  ```asyncapi
  asyncapi: 3.0.0
  info:
    title: Inline spec
    version: 1.0.0
  ```
  ````

  or reference a vault file:

  ````markdown
  ```asyncapi
  file: specs/orders.yaml
  ```
  ````

- Deep link: `obsidian://asyncapi-open?vault=<vault>&path=specs/orders.yaml`. Obsidian asks you to
  trust the `asyncapi-open` action the first time it is used from outside the app.
- File explorer context menu: "Open in AsyncAPI view".

## Settings

- **Open .yaml / .yml files in AsyncAPI view** (default on) and **Open .json files** (default off). Reload the plugin after changing.
- **Default mode**: Preview or Source.
- **Render debounce**: delay before the preview re-renders while typing.

## Development

```bash
npm install
npm run dev      # watch build into test-vault/.obsidian/plugins/asyncapi-renderer
npm test         # unit tests
npm run build    # production build to repo root
```

Rendering is delegated to the official `@asyncapi/react-component` standalone bundle, so `main.js` is about 3 MB.

## Releases

Merging to `main` runs `semantic-release`: commit messages decide the bump (`fix:` patch, `feat:` minor,
`feat!:`/`BREAKING CHANGE:` major), `manifest.json` and `versions.json` are updated and committed back,
and a GitHub Release tagged `x.y.z` is published with `main.js`, `manifest.json` and `styles.css` attached.
Commits without a releasable type (`docs:`, `chore:`, `ci:`) publish nothing.
