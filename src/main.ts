import { Notice, Plugin, TFile } from 'obsidian';
import { AsyncApiSettingTab, DEFAULT_SETTINGS, type Settings } from './settings';
import { ASYNCAPI_VIEW, AsyncApiView } from './view/AsyncApiView';
import { AsyncApiBlock } from './codeblock';
import { SPEC_EXTENSIONS } from './detect';

export default class AsyncApiPlugin extends Plugin {
  settings: Settings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new AsyncApiSettingTab(this.app, this));

    this.registerView(ASYNCAPI_VIEW, (leaf) => new AsyncApiView(leaf, this));
    const extensions = [
      ...(this.settings.registerYaml ? ['yaml', 'yml'] : []),
      ...(this.settings.registerJson ? ['json'] : []),
    ];
    // registerExtensions throws if another plugin already owns the extension (e.g. openapi-renderer
    // claims yaml/yml/json). One bad extension must not take the whole plugin down.
    const taken = extensions.filter((ext) => {
      try {
        this.registerExtensions([ext], ASYNCAPI_VIEW);
        return false;
      } catch {
        return true;
      }
    });
    if (taken.length) {
      new Notice(
        `AsyncAPI: .${taken.join(' / .')} already opens in another plugin's view. ` +
          'Use the file context menu or an asyncapi code block instead, or disable that plugin.',
        10000,
      );
    }

    this.registerMarkdownCodeBlockProcessor('asyncapi', (source, el, ctx) => {
      ctx.addChild(new AsyncApiBlock(el, this.app, source, ctx.sourcePath));
    });

    this.registerObsidianProtocolHandler('asyncapi-open', async ({ path }) => {
      const file = path ? this.app.vault.getFileByPath(path) : null;
      if (!file) {
        new Notice(`AsyncAPI: file not found: ${path || '(no path given)'}`);
        return;
      }
      await this.openInView(file);
    });

    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (!(file instanceof TFile)) return;
        if (!(SPEC_EXTENSIONS as readonly string[]).includes(file.extension)) return;
        menu.addItem((item) =>
          item.setTitle('Open in AsyncAPI view').setIcon('radio-tower').onClick(() => void this.openInView(file)),
        );
      }),
    );

    this.addCommand({
      id: 'toggle-mode',
      name: 'Toggle source / preview',
      checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(AsyncApiView);
        if (!view) return false;
        if (!checking) view.toggleMode();
        return true;
      },
    });
  }

  async openInView(file: TFile) {
    const leaf = this.app.workspace.getLeaf('tab');
    await leaf.setViewState({ type: ASYNCAPI_VIEW, state: { file: file.path }, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<Settings> | null);
  }
}
