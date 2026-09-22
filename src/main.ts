import { Plugin } from "obsidian";
import { OneLineSettings, DEFAULT_SETTINGS, OneLineSettingTab } from "./settings";
import { OneLineBlock } from "./renderer";

export default class OneLinePlugin extends Plugin {
	settings: OneLineSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new OneLineSettingTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor("oneline", (source, el, ctx) => {
			ctx.addChild(new OneLineBlock(this.app, this.settings, source, el, ctx));
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
