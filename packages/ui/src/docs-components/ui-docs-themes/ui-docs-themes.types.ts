/**
 * Loose constants and types of the `ui-docs-themes` family:  what the element, its menu builder (`ThemeMenu`) and
 * the native fallback share.
 * - Data only:  nothing here runs.
 */

import type { DocsLook, DocsScheme, DocsShownScheme } from "$/ui/docs-components/docs-components.types"

import type { docsThemesVocabulary } from "./ui-docs-themes.vocabulary.en"

/** `docsThemesVocabulary`'s type. */
export type DocsThemesVocabulary = typeof docsThemesVocabulary

/** A text key of `<ui-docs-themes>` (`docsThemesVocabulary.texts`). */
export type DocsThemesTextKey = DocsThemesVocabulary["texts"][number]["key"]

/** Looks up a text by key, with `{param}`s filled in:  the element's `text()`, or English in the fallback. */
export type DocsThemesText = (key: DocsThemesTextKey, params?: Record<string, string | number>) => string

/** `ui-change`'s detail. */
export type DocsThemesChange = {
  /** a `ThemeSheets` name;  absent:  our own look */
  theme?: string
  /** the chosen scheme;  `system`:  following the OS */
  scheme: DocsScheme
  /** the scheme the page shows:  `scheme`, or the OS's while following it */
  shown: DocsShownScheme
  originalEvent?: Event
}

/** `show`:  which controls render. */
export type DocsThemesShow = "both" | "theme" | "scheme"

/** The dropdown value standing for our own look (`ThemeSheets.apply(undefined)`):  no sheet is named so. */
export const DEFAULT_VALUE = "default"

/** The `ThemeSheets` name of Spell:  our own theme (`ThemeSheets.OWN`), the docs' default (`DOCS_DEFAULT_THEME`). */
export const SPELL = "spell"

/** The `ThemeSheets` name of Classic, the base every Fomantic theme sits on (`ThemeSheets.BASE`). */
export const CLASSIC = "classic"

/**
 * Icon the scheme button shows for the scheme the page SHOWS (`fomantic` pack).
 * - the OUTLINE sun:  the solid one reads as a cog at 14px
 */
export const SCHEME_ICONS: Readonly<Record<DocsShownScheme, string>> = { light: "sun outline", dark: "moon" }

/** Icon of the button opening the overlay (`fomantic` pack). */
export const PALETTE_ICON = "palette"

/** Icon marking the chosen theme in the overlay's list (`fomantic` pack). */
export const CHECK_ICON = "check"

/** The look a server render shows:  no storage there. */
export const SERVER_LOOK: DocsLook = { theme: undefined, scheme: "system" }

/** Shadow-root ids:  the palette button (its tooltip's `for`) and the overlay's header (its list's name). */
export const IDS = { palette: "palette", heading: "themes-heading" } as const

/** ARIA of the overlay's theme list:  a menu of radio items (arrows move, Enter / Space / click picks). */
export const MENU_ROLES = { menu: "menu", item: "menuitemradio", separator: "separator", switch: "switch" } as const

/** Keys that move focus in the overlay's theme list, by how far:  `"first"` / `"last"` jump to an end. */
export const MENU_KEYS: Readonly<Record<string, number | "first" | "last">> = {
  ArrowDown: 1,
  ArrowUp: -1,
  Home: "first",
  End: "last"
}
