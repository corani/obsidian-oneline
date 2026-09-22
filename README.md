# obsidian-one-line

Displays "One Line" journal entries from previous years (same day) or the current week
as a card block on daily and weekly notes.

## Block syntax

````markdown
```oneline
period:    day          # "day" or "week" (required)
date:      2026-09-21   # YYYY-MM-DD or "today"; falls back to frontmatter then filename
title:     On this day  # overrides the settings default
section:   One Line     # heading to extract; overrides the settings default
limit:     5            # day mode only; overrides the settings default
showtitle: false        # hide the title bar for this block
```
````

Minimal usage (relies entirely on settings defaults):

````markdown
```oneline
period: day
```
````

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| Show title | on | Show the title bar by default |
| Default title (day) | `On this day` | Title bar text for `period: day` |
| Default title (week) | `This week` | Title bar text for `period: week` |
| Default section | `One Line` | Heading name to extract from each daily note |
| Default limit | `5` | Max entries shown in day mode |
| Daily notes folder | `Journal/Daily` | Vault-relative folder containing `YYYY-MM-DD.md` notes |
| Weekly notes folder | `Journal/Weekly` | Vault-relative folder containing `YYYY-Www.md` notes |

## Frontmatter used

The plugin reads the **context note** (the note containing the block) to determine the anchor date:

| Field | Used for |
| --- | --- |
| `date` | Anchor date fallback when filename is not `YYYY-MM-DD` or `YYYY-Www` |

## Section content

The plugin extracts the content of the named section (default `One Line`) from each matching
daily note. The section heading match is case-insensitive and heading-level agnostic.
Any `oneline` code fences inside that section are automatically skipped to prevent infinite
loops.

## Deploy

```sh
ln -s ~/obsidian/.obsidian/plugins/obsidian-one-line dist
npm run build
```
