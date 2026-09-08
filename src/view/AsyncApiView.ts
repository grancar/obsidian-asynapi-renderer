import { TextFileView, type WorkspaceLeaf, debounce, setIcon } from 'obsidian';
import type { EditorView } from '@codemirror/view';
import type AsyncApiPlugin from '../main';
import { createEditor } from './editor';
import { renderAsyncApi } from '../render';
import { isAsyncApiSource } from '../detect';

export const ASYNCAPI_VIEW = 'asyncapi-view';
type Mode = 'preview' | 'source';

export class AsyncApiView extends TextFileView {
  private mode: Mode;
  private previewEl!: HTMLElement;
  private sourceEl!: HTMLElement;
  private toggleEl!: HTMLElement;
  private editor: EditorView | null = null;
  private applyingExternal = false;
  private readonly rerender: () => void;

  constructor(leaf: WorkspaceLeaf, private plugin: AsyncApiPlugin) {
    super(leaf);
    this.mode = plugin.settings.defaultMode;
    this.rerender = debounce(() => this.renderPreview(), plugin.settings.renderDebounceMs, true);
  }

  getViewType() { return ASYNCAPI_VIEW; }
  getDisplayText() { return this.file?.basename ?? 'AsyncAPI'; }
  getIcon() { return 'radio-tower'; }

  async onOpen() {
    this.previewEl = this.contentEl.createDiv({ cls: 'asyncapi-view-preview' });
    this.sourceEl = this.contentEl.createDiv({ cls: 'asyncapi-view-source' });
    this.toggleEl = this.addAction('code', 'Toggle source / preview', () => this.toggleMode());
    this.applyMode();
  }

  async onClose() {
    this.editor?.destroy();
    this.editor = null;
  }

  getViewData() { return this.data; }

  setViewData(data: string, clear: boolean) {
    this.data = data;
    if (clear) {
      // New file: rebuild the editor (language may differ) and drop to Source for non-specs.
      this.editor?.destroy();
      this.editor = createEditor(this.sourceEl, data, this.file?.extension ?? 'yaml', (d) => this.onEdit(d));
      this.mode = isAsyncApiSource(data) ? this.plugin.settings.defaultMode : 'source';
    } else if (this.editor && this.editor.state.doc.toString() !== data) {
      // External modification of the open file.
      this.applyingExternal = true;
      this.editor.dispatch({ changes: { from: 0, to: this.editor.state.doc.length, insert: data } });
      this.applyingExternal = false;
    }
    this.applyMode();
    this.renderPreview();
  }

  clear() {
    this.data = '';
    this.editor?.destroy();
    this.editor = null;
    this.previewEl.empty();
  }

  toggleMode() {
    this.mode = this.mode === 'preview' ? 'source' : 'preview';
    this.applyMode();
    this.renderPreview();
  }

  private onEdit(doc: string) {
    if (this.applyingExternal) return;
    this.data = doc;
    this.requestSave();
    this.rerender();
  }

  private applyMode() {
    this.previewEl.toggle(this.mode === 'preview');
    this.sourceEl.toggle(this.mode === 'source');
    setIcon(this.toggleEl, this.mode === 'preview' ? 'code' : 'eye');
    if (this.mode === 'source') this.editor?.focus();
  }

  private renderPreview() {
    if (this.mode !== 'preview') return;
    if (!isAsyncApiSource(this.data)) {
      this.previewEl.empty();
      this.previewEl.createDiv({
        cls: 'asyncapi-block-error',
        text: 'Not an AsyncAPI document: no top-level "asyncapi" key. Switch to Source to edit.',
      });
      return;
    }
    renderAsyncApi(this.previewEl, this.data);
  }
}
