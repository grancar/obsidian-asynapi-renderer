import './render';
import { Plugin } from 'obsidian';
import { AsyncApiSettingTab, DEFAULT_SETTINGS, type Settings } from './settings';

export default class AsyncApiPlugin extends Plugin {
  settings: Settings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new AsyncApiSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
