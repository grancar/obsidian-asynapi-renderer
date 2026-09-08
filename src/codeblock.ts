import { type App, MarkdownRenderChild, type TFile } from 'obsidian';
import { parseBlockBody } from './detect';
import { renderAsyncApi } from './render';

/** Renders a ```asyncapi block: inline YAML/JSON, or `file: path/in/vault.yaml`. */
export class AsyncApiBlock extends MarkdownRenderChild {
  constructor(
    containerEl: HTMLElement,
    private app: App,
    private body: string,
    private sourcePath: string,
  ) {
    super(containerEl);
  }

  async onload() {
    const parsed = parseBlockBody(this.body);
    if (parsed.kind === 'empty') {
      this.showError('Empty asyncapi block. Paste a spec, or write `file: path/to/spec.yaml`.');
      return;
    }
    if (parsed.kind === 'inline') {
      renderAsyncApi(this.containerEl, parsed.source);
      return;
    }
    const file = this.app.metadataCache.getFirstLinkpathDest(parsed.path, this.sourcePath);
    if (!file) {
      this.showError(`AsyncAPI file not found: ${parsed.path}`);
      return;
    }
    await this.renderFile(file);
    this.registerEvent(
      this.app.vault.on('modify', (changed) => {
        if (changed === file) void this.renderFile(file);
      }),
    );
  }

  private async renderFile(file: TFile) {
    renderAsyncApi(this.containerEl, await this.app.vault.cachedRead(file));
  }

  private showError(message: string) {
    this.containerEl.empty();
    this.containerEl.createDiv({ cls: 'asyncapi-block-error', text: message });
  }
}
