import { PluginSettingTab, type SettingDefinitionItem } from 'obsidian';

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

/** Values are read from and saved to `plugin.settings` by PluginSettingTab's default get/setControlValue. */
export class AsyncApiSettingTab extends PluginSettingTab {
  getSettingDefinitions(): SettingDefinitionItem<keyof Settings>[] {
    return [
      {
        name: 'Open .yaml / .yml files in AsyncAPI view',
        desc: 'Takes effect after reloading the plugin. Turn off if another plugin should own YAML files.',
        control: { type: 'toggle', key: 'registerYaml' },
      },
      {
        name: 'Open .json files in AsyncAPI view',
        desc: 'Off by default because it claims every JSON file in the vault. Takes effect after reloading the plugin.',
        control: { type: 'toggle', key: 'registerJson' },
      },
      {
        name: 'Default mode',
        desc: 'Mode a spec opens in.',
        control: { type: 'dropdown', key: 'defaultMode', options: { preview: 'Preview', source: 'Source' } },
      },
      {
        name: 'Render debounce (ms)',
        desc: 'Delay between the last keystroke in Source mode and the preview re-render.',
        control: { type: 'number', key: 'renderDebounceMs', min: 0, step: 50 },
      },
    ];
  }
}
