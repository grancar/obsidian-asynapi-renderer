import { Plugin, type TFile } from 'obsidian';
import { AsyncApiSettingTab, DEFAULT_SETTINGS, type Settings } from './settings';
import { ASYNCAPI_VIEW, AsyncApiView } from './view/AsyncApiView';
import { AsyncApiBlock } from './codeblock';

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
    if (extensions.length) this.registerExtensions(extensions, ASYNCAPI_VIEW);

    this.registerMarkdownCodeBlockProcessor('asyncapi', (source, el, ctx) => {
      ctx.addChild(new AsyncApiBlock(el, this.app, source, ctx.sourcePath));
    });

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
    this.app.workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
