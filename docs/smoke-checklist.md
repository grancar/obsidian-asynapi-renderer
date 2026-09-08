# Manual smoke checklist

Run against `test-vault/` with `npm run dev` watching. Reload with
`obsidian vault=test-vault plugin:reload id=asyncapi-renderer` after each rebuild and finish with
`obsidian vault=test-vault dev:errors` (expect nothing from asyncapi-renderer).

## File view
- [ ] `specs/streetlights-3.yaml` opens rendered (3.x).
- [ ] `specs/account-2.6.yaml` opens rendered (2.x).
- [ ] Header toggle and the "Toggle source / preview" command switch modes; the icon changes.
- [ ] Editing in Source saves to disk and updates Preview after the debounce.
- [ ] External edit of the open file (edit on disk) updates both Source and Preview.
- [ ] `specs/not-asyncapi.yaml` opens in Source; Preview shows the "Not an AsyncAPI document" message.

## Code blocks (`Embeds.md`, Reading view)
- [ ] Inline block renders.
- [ ] `file:` block renders and re-renders when the referenced file changes.
- [ ] Missing file and empty block each show a red error box.

## Entry points
- [ ] `obsidian://asyncapi-open?vault=test-vault&path=specs/account-2.6.yaml` opens the view.
      Obsidian shows a trust prompt for third-party URI actions the first time; accept it.
- [ ] Bad path shows a Notice.
- [ ] With YAML registration off, the file-menu item still opens the view.

## Settings
- [ ] Turning `.json` registration on and reloading makes `.json` files open in the view.
