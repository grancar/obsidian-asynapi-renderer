import { App, PluginSettingTab, Setting } from 'obsidian';
import type AsyncApiPlugin from './main';

export interface Settings {
  registerYaml: boolean;
  registerJson: boolean;
  defaultMode: 'preview' | 'source';
  renderDebounceMs: number;
}

export const DEFAULT_SETTINGS: Settings = {
  registerYaml: true,
  registerJson: false,
  defaultMode: 'preview',
  renderDebounceMs: 400,
};

export class AsyncApiSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: AsyncApiPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const s = this.plugin.settings;
    const save = () => this.plugin.saveSettings();

    new Setting(containerEl)
      .setName('Open .yaml / .yml files in AsyncAPI view')
      .setDesc('Takes effect after reloading the plugin. Turn off if another plugin should own YAML files.')
      .addToggle((t) => t.setValue(s.registerYaml).onChange(async (v) => { s.registerYaml = v; await save(); }));

    new Setting(containerEl)
      .setName('Open .json files in AsyncAPI view')
      .setDesc('Off by default because it claims every JSON file in the vault. Takes effect after reloading the plugin.')
      .addToggle((t) => t.setValue(s.registerJson).onChange(async (v) => { s.registerJson = v; await save(); }));

    new Setting(containerEl)
      .setName('Default mode')
      .setDesc('Mode a spec opens in.')
      .addDropdown((d) =>
        d.addOption('preview', 'Preview')
          .addOption('source', 'Source')
          .setValue(s.defaultMode)
          .onChange(async (v) => { s.defaultMode = v as Settings['defaultMode']; await save(); }),
      );

    new Setting(containerEl)
      .setName('Render debounce (ms)')
      .setDesc('Delay between the last keystroke in Source mode and the preview re-render.')
      .addText((t) =>
        t.setValue(String(s.renderDebounceMs)).onChange(async (v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n >= 0) { s.renderDebounceMs = n; await save(); }
        }),
      );
  }
}
