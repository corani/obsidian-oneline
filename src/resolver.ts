import { App, TFile } from "obsidian";
import type { BlockConfig } from "./parser";
import type { OneLineSettings } from "./settings";

export interface ResolvedDate {
	year: number;
	month: number;  // 1-12
	day: number;    // 1-31
	isoWeek: string; // "YYYY-Www"
}

// Parse YYYY-MM-DD from a filename (without path or extension)
function parseDailyFilename(name: string): { year: number; month: number; day: number } | null {
	const m = name.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return null;
	return { year: +m[1], month: +m[2], day: +m[3] };
}

// Parse YYYY-Www from a filename
function parseWeeklyFilename(name: string): string | null {
	return /^\d{4}-W\d{2}$/.test(name) ? name : null;
}

// Return ISO week string "YYYY-Www" for a given date
function isoWeekOf(year: number, month: number, day: number): string {
	const d = new Date(year, month - 1, day);
	// ISO week: Thursday of the week determines the year
	const thursday = new Date(d);
	thursday.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
	const yearStart = new Date(thursday.getFullYear(), 0, 1);
	const week = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	return `${thursday.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

// Resolve the anchor date from config + context, in priority order:
//   1. block config `date` field (YYYY-MM-DD or "today")
//   2. `date` frontmatter via MetadataCache
//   3. filename parsed as YYYY-MM-DD or YYYY-Www
export function resolveAnchorDate(
	app: App,
	contextPath: string,
	config: BlockConfig
): { year: number; month: number; day: number } | null {
	// 1. Block config date
	if (config.date) {
		const target = config.date.toLowerCase() === "today"
			? new Date()
			: new Date(config.date);
		if (!isNaN(target.getTime())) {
			return { year: target.getFullYear(), month: target.getMonth() + 1, day: target.getDate() };
		}
	}

	// 2. Frontmatter `date`
	const file = app.vault.getFileByPath(contextPath);
	if (file) {
		const cache = app.metadataCache.getFileCache(file);
		const fm = cache?.frontmatter;
		if (fm?.date) {
			const d = new Date(fm.date);
			if (!isNaN(d.getTime())) {
				return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
			}
		}
	}

	// 3. Filename
	const basename = contextPath.split("/").pop()?.replace(/\.md$/, "") ?? "";
	const daily = parseDailyFilename(basename);
	if (daily) return daily;

	// Weekly filename: use Monday of that week
	const weekly = parseWeeklyFilename(basename);
	if (weekly) {
		const m = weekly.match(/^(\d{4})-W(\d{2})$/);
		if (m) {
			const year = +m[1], week = +m[2];
			// ISO week 1 Monday: Jan 4 is always in week 1
			const jan4 = new Date(year, 0, 4);
			const monday = new Date(jan4);
			monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);
			return { year: monday.getFullYear(), month: monday.getMonth() + 1, day: monday.getDate() };
		}
	}

	return null;
}

export function resolveDayFiles(
	app: App,
	settings: OneLineSettings,
	contextPath: string,
	config: BlockConfig
): TFile[] {
	const anchor = resolveAnchorDate(app, contextPath, config);
	if (!anchor) return [];

	const mm = String(anchor.month).padStart(2, "0");
	const dd = String(anchor.day).padStart(2, "0");
	const suffix = `-${mm}-${dd}.md`;
	const folder = settings.dailyNotesFolder.replace(/\/$/, "");
	const limit = config.limit ?? settings.defaultLimit;

	const files = app.vault.getMarkdownFiles()
		.filter(f => f.path.startsWith(folder + "/") && f.name.endsWith(suffix))
		.filter(f => {
			const parsed = parseDailyFilename(f.name.replace(/\.md$/, ""));
			return parsed !== null && parsed.year !== anchor.year;
		})
		.sort((a, b) => b.name.localeCompare(a.name))  // descending by year
		.slice(0, limit);

	return files;
}

export function resolveWeekFiles(
	app: App,
	settings: OneLineSettings,
	contextPath: string,
	config: BlockConfig
): TFile[] {
	const anchor = resolveAnchorDate(app, contextPath, config);
	if (!anchor) return [];

	const targetWeek = isoWeekOf(anchor.year, anchor.month, anchor.day);
	const folder = settings.dailyNotesFolder.replace(/\/$/, "");

	const files = app.vault.getMarkdownFiles()
		.filter(f => {
			if (!f.path.startsWith(folder + "/")) return false;
			const parsed = parseDailyFilename(f.name.replace(/\.md$/, ""));
			if (!parsed) return false;
			return isoWeekOf(parsed.year, parsed.month, parsed.day) === targetWeek;
		})
		.sort((a, b) => a.name.localeCompare(b.name));  // ascending by date

	return files;
}
