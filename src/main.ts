import './render';
import { Plugin } from 'obsidian';

export default class AsyncApiPlugin extends Plugin {
  async onload() {
    console.log('asyncapi-renderer loaded');
  }
}
