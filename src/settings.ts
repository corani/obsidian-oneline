import { App, PluginSettingTab, Setting } from "obsidian";
import type OneLinePlugin from "./main";

export interface OneLineSettings {
	showTitle: boolean;
	defaultDayTitle: string;
	defaultWeekTitle: string;
	defaultSection: string;
	defaultLimit: number;
	dailyNotesFolder: string;
	weeklyNotesFolder: string;
}

export const DEFAULT_SETTINGS: OneLineSettings = {
	showTitle: true,
	defaultDayTitle: "On this day",
	defaultWeekTitle: "This week",
	defaultSection: "One Line",
	defaultLimit: 5,
	dailyNotesFolder: "Journal/Daily",
	weeklyNotesFolder: "Journal/Weekly",
};

export class OneLineSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: OneLinePlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		let dayTitleSetting: Setting;
		let weekTitleSetting: Setting;

		new Setting(containerEl)
			.setName("Show title")
			.setDesc("Show the block title bar by default.")
			.addToggle(t => t
				.setValue(this.plugin.settings.showTitle)
				.onChange(async v => {
					this.plugin.settings.showTitle = v;
					await this.plugin.saveSettings();
					dayTitleSetting.setDisabled(!v);
					weekTitleSetting.setDisabled(!v);
				}));

		const disabled = !this.plugin.settings.showTitle;

		dayTitleSetting = new Setting(containerEl)
			.setName("Default title (day)")
			.setDesc("Block title for period=day when not specified in the block.")
			.addText(t => t
				.setPlaceholder(DEFAULT_SETTINGS.defaultDayTitle)
				.setValue(this.plugin.settings.defaultDayTitle)
				.onChange(async v => {
					this.plugin.settings.defaultDayTitle = v || DEFAULT_SETTINGS.defaultDayTitle;
					await this.plugin.saveSettings();
				}));
		dayTitleSetting.setDisabled(disabled);

		weekTitleSetting = new Setting(containerEl)
			.setName("Default title (week)")
			.setDesc("Block title for period=week when not specified in the block.")
			.addText(t => t
				.setPlaceholder(DEFAULT_SETTINGS.defaultWeekTitle)
				.setValue(this.plugin.settings.defaultWeekTitle)
				.onChange(async v => {
					this.plugin.settings.defaultWeekTitle = v || DEFAULT_SETTINGS.defaultWeekTitle;
					await this.plugin.saveSettings();
				}));
		weekTitleSetting.setDisabled(disabled);

		new Setting(containerEl)
			.setName("Default section")
			.setDesc("Heading to extract when not specified in the block.")
			.addText(t => t
				.setPlaceholder(DEFAULT_SETTINGS.defaultSection)
				.setValue(this.plugin.settings.defaultSection)
				.onChange(async v => {
					this.plugin.settings.defaultSection = v || DEFAULT_SETTINGS.defaultSection;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Default limit")
			.setDesc("Max entries shown in day mode when not specified in the block.")
			.addText(t => t
				.setPlaceholder(String(DEFAULT_SETTINGS.defaultLimit))
				.setValue(String(this.plugin.settings.defaultLimit))
				.onChange(async v => {
					const n = parseInt(v, 10);
					this.plugin.settings.defaultLimit = isNaN(n) || n < 1 ? DEFAULT_SETTINGS.defaultLimit : n;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Daily notes folder")
			.setDesc("Vault-relative folder containing daily notes (YYYY-MM-DD.md).")
			.addText(t => t
				.setPlaceholder(DEFAULT_SETTINGS.dailyNotesFolder)
				.setValue(this.plugin.settings.dailyNotesFolder)
				.onChange(async v => {
					this.plugin.settings.dailyNotesFolder = v || DEFAULT_SETTINGS.dailyNotesFolder;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Weekly notes folder")
			.setDesc("Vault-relative folder containing weekly notes (YYYY-Www.md).")
			.addText(t => t
				.setPlaceholder(DEFAULT_SETTINGS.weeklyNotesFolder)
				.setValue(this.plugin.settings.weeklyNotesFolder)
				.onChange(async v => {
					this.plugin.settings.weeklyNotesFolder = v || DEFAULT_SETTINGS.weeklyNotesFolder;
					await this.plugin.saveSettings();
				}));
	}
}
