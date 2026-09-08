# Obsidian AsyncAPI Renderer — Design

Date: 2026-09-08
Status: approved for planning

## Goal

An Obsidian plugin that renders AsyncAPI specification files (YAML or JSON, spec
versions 2.x and 3.x) inside the vault, with a source editor, a dashboard of all
specs, and file-based version snapshots. Modelled on
[obsidian-openapi-renderer](https://github.com/Ssentiago/obsidian-openapi-renderer)
but for [AsyncAPI](https://www.asyncapi.com).

## Non-goals (v1)

- YAML <-> JSON conversion, `$ref` navigation or resolution, formatter.
- Dark-mode restyling of the AsyncAPI component (container is forced light).
- Mobile support (`isDesktopOnly: true`).
- Any storage outside the vault (no IndexedDB).

## Architecture

- TypeScript, esbuild, standard Obsidian sample-plugin layout. Output: `main.js`,
  `styles.css`, `manifest.json`.
- Renderer: `@asyncapi/react-component` **standalone** bundle
  (`browser/standalone/index.js`, v3.1.x). It bundles React and
  `@asyncapi/parser`; we ship no React of our own. Its `styles/default.min.css`
  is concatenated into `styles.css` at build time.
- One wrapper module `src/render.ts` exporting
  `renderAsyncApi(el: HTMLElement, source: string): Promise<void>` is the only
  code that touches the bundle. It clears `el`, calls
  `AsyncApiStandalone.render({ schema: source }, el)`, and on throw writes the
  error text into `el`.
- Parser access for lint/detection goes through `src/parser.ts` which re-exports
  the parser bundled with the component (or `@asyncapi/parser` directly if the
  standalone does not expose it; decided during phase 2).
- Plain Obsidian API and DOM everywhere else. No UI framework.

## Modules

| File | Responsibility |
|---|---|
| `src/main.ts` | Plugin class: settings, view/extension registration, code block processor, commands, ribbon, protocol handler, file menu. |
| `src/settings.ts` | Settings interface, defaults, settings tab. |
| `src/render.ts` | Wrapper over the standalone bundle. |
| `src/detect.ts` | `isAsyncApiSource(text): boolean` (top-level `asyncapi` key, YAML or JSON), `isSpecFile(file)` (extension + content check, cached by mtime). |
| `src/view/AsyncApiView.ts` | `TextFileView`: Preview/Source toggle, snapshot actions. |
| `src/view/editor.ts` | Builds the CodeMirror 6 `EditorView`: languages, lint, autocomplete. |
| `src/codeblock.ts` | ` ```asyncapi ` processor: parse body (inline YAML vs `file:` ref), render, re-render on referenced file change. |
| `src/dashboard/DashboardView.ts` | `ItemView` card grid of vault specs. |
| `src/snapshots/store.ts` | Snapshot path building, list/save/restore/delete over `Vault`. |
| `src/snapshots/SnapshotPanel.ts` | Snapshot list UI and compare modal (`@codemirror/merge`). |
| `src/keywords.ts` | Generated at build time from `@asyncapi/specs` JSON schemas: keyword lists per spec version. |

## Settings

```ts
interface Settings {
  registerYaml: boolean;      // default true  -> claim .yaml/.yml
  registerJson: boolean;      // default false -> claim .json
  defaultMode: 'preview' | 'source'; // default 'preview'
  snapshotFolder: string;     // default '.asyncapi-snapshots'
  renderDebounceMs: number;   // default 400
}
```

Changing `registerYaml`/`registerJson` takes effect after plugin reload; the
settings tab says so.

## Entry points

### File view

- `AsyncApiView extends TextFileView`, view type `asyncapi-view`.
- Registered via `registerExtensions` for `yaml`/`yml` (and `json` when enabled).
- Header actions: toggle Preview/Source, Save snapshot, Open snapshots panel.
- Preview: `renderAsyncApi` into a scrollable container. Re-renders after the
  source changes, debounced by `renderDebounceMs`.
- Source: CM6 editor (see Editor). Edits flow through `TextFileView`'s
  `getViewData`/`setViewData`/`requestSave`.
- Opening a file that fails `isAsyncApiSource` opens in Source mode; switching to
  Preview shows "Not an AsyncAPI document" instead of rendering.

### Code block

- `registerMarkdownCodeBlockProcessor('asyncapi', ...)`.
- Body grammar: if the trimmed body is a single line matching
  `^file:\s*(.+)$`, it is a vault path (resolved relative to the note first,
  then vault root, via `metadataCache.getFirstLinkpathDest`). Otherwise the body
  is the spec source.
- File refs re-render when the target file is modified (`vault.on('modify')`
  filtered by path); the listener is removed when the block's `MarkdownRenderChild`
  unloads.
- Missing file or empty body renders a callout-styled error inside the block.

### Deep links and menu

- `registerObsidianProtocolHandler('asyncapi-open', ({ path }) => ...)`: opens
  the file in `asyncapi-view` via `leaf.setViewState`. Unknown path -> `Notice`.
- `workspace.on('file-menu')`: "Open in AsyncAPI view" for `.yaml/.yml/.json`
  files, regardless of the extension settings, so users can opt in per file when
  registration is off.

## Editor

- CodeMirror 6 from Obsidian's bundled modules (`@codemirror/state`, `view`,
  `language`, `commands`, `lint`, `autocomplete`, `search`) marked external in
  esbuild. We bundle `@codemirror/lang-yaml` and `@codemirror/lang-json`.
- Extensions: line numbers, history, bracket matching, default keymap, search,
  language by file extension, lint, autocomplete.
- Lint (phase 2): on a 500 ms debounce, run the AsyncAPI parser; map each
  diagnostic (`range.start/end` line/character when present, else document
  start) to a CM6 `Diagnostic` with severity from the parser (`error`/`warning`).
- Autocomplete (phase 2): keyword completion from `src/keywords.ts`, chosen by
  the document's `asyncapi:` version prefix (`2.` or `3.`), falling back to the
  union. Completion only for property keys (cursor at line start after
  indentation). No `$ref` or path-aware suggestions.

## Dashboard

- `DashboardView extends ItemView`, view type `asyncapi-dashboard`, opened by a
  ribbon icon and command "AsyncAPI: Open dashboard". Single instance.
- Data: iterate `vault.getFiles()` with matching extensions, run
  `isAsyncApiSource` on `cachedRead`. Cache result keyed by `path + mtime` in
  memory. Re-scan on `vault.on('create'|'modify'|'delete'|'rename')` with a
  1 s debounce while the view is open.
- Card: `info.title` (fallback file name), AsyncAPI version, `info.version`,
  modified date, snapshot count. Click opens the spec in `asyncapi-view`.
- Uses Obsidian CSS variables only; light and dark follow the theme.

## Snapshots

- Storage: plain vault files at
  `<snapshotFolder>/<spec path without extension>/<YYYYMMDD-HHmmss>[--<label>].<ext>`.
  Labels are sanitised to `[A-Za-z0-9_-]`, max 40 chars.
- `store.ts` API: `list(spec): Snapshot[]`, `save(spec, label?)`,
  `restore(snapshot)` (writes snapshot content over the spec file),
  `remove(snapshot)`, `read(snapshot)`.
- Panel (right sidebar `ItemView`, view type `asyncapi-snapshots`, bound to the
  active spec): list newest first with timestamp and label; per-row actions
  Restore (confirm modal), Compare with current, Delete (confirm modal);
  multi-select two rows -> Compare.
- Compare: modal containing a `@codemirror/merge` `MergeView` (read-only both
  sides) between the two sources.
- The snapshot folder is hidden from the dashboard scan and from the file view's
  auto-detection (path prefix check).

## Error handling

- Render failure: parser/render error text in the preview container, never a
  blank pane. The last successful render is not kept; the error replaces it.
- Code block: missing file, unreadable file, or empty body -> inline error
  callout.
- Snapshot restore and delete require confirmation. Save never overwrites: if a
  path collides within the same second, append `-1`, `-2`, ...
- Protocol handler with a path that does not resolve -> `Notice`.

## Testing

- `vitest` for pure modules: `detect.ts`, code block body parsing,
  `snapshots/store.ts` path building and collision handling, `keywords.ts`
  generation. `obsidian` is aliased to a stub in `vitest.config.ts`.
- Manual smoke checklist (`docs/smoke-checklist.md`) run against `test-vault/`
  containing a 2.6 and a 3.0 sample spec, using the `obsidian` CLI to reload
  the plugin and take screenshots.

## Build

- esbuild config: entry `src/main.ts`, format `cjs`, externals `obsidian`,
  `electron`, `@codemirror/*` that Obsidian ships, `@lezer/*`. Standalone bundle
  imported as a module; its CSS appended to `styles.css` via a small build step.
- `npm run dev` watches and writes to `test-vault/.obsidian/plugins/asyncapi-renderer/`
  with a `.hotreload` marker. `npm run build` type-checks then bundles to repo root.
- `scripts/gen-keywords.ts` produces `src/keywords.ts` from `@asyncapi/specs`.

## Phases

1. **Core**: scaffold, settings, `render.ts`, `detect.ts`, `AsyncApiView` with
   Preview/Source toggle (plain CM6, no lint/autocomplete), code block processor,
   protocol handler, file menu. Tests for `detect.ts` and code block parsing.
2. **Editor**: lint via parser diagnostics, keyword autocomplete, `gen-keywords`.
3. **Dashboard**: `DashboardView`, ribbon, command, scan cache.
4. **Snapshots**: store, panel, compare modal, header actions, dashboard count.

Each phase leaves the plugin in a releasable state.
