/**
 * The types and constants of the docs theme controls family:  what the component (`UIDocsThemes`)
 * and its menu builder (`ThemeMenu`) share.
 * - Pure data:  `import type` only, so node can load it (`yarn site:data`).
 *   A constant only one class reads sits below that class.
 */

import type { DocsScheme, DocsShownScheme } from "$/ui/docs-components/docs-components.types"
import type { docsThemesVocabulary } from "./UIDocsThemes.en"

////////////////
// ## Element
////////////////

/** `docsThemesVocabulary`'s type. */
export type DocsThemesVocabulary = typeof docsThemesVocabulary

/** A text key of `<ui-docs-themes>` (`docsThemesVocabulary.texts`). */
export type DocsThemesTextKey = DocsThemesVocabulary["texts"][number]["key"]

/** Looks up a text by key, with `{param}`s filled in (the component's `translationForKey()`). */
export type DocsThemesText = (key: DocsThemesTextKey, params?: Record<string, string | number>) => string

/** `show`:  which controls render. */
export type DocsThemesShow = "both" | "theme" | "scheme"

/** `ui-change`'s detail. */
export type DocsThemesChange = {
  /** a `UI.themes` name;  absent:  our own look */
  theme?: string
  /** the chosen scheme;  `system`:  following the OS */
  scheme: DocsScheme
  /** the scheme the page shows:  `scheme`, or the OS's while following it */
  shown: DocsShownScheme
  /** what the viewer did */
  originalEvent?: Event
}

////////////////
// ## Theme names
////////////////

/** The `UI.themes` name of Spell:  our own theme (`UI.themes.own`), the docs' default (`DOCS_DEFAULT_THEME`). */
export const SPELL = "spell"

/**
 * The `UI.themes` name of Spell Brand:  our own theme too, converging on Claude Design's brand pages (epic
 * `design-system`).
 */
export const SPELL_BRAND = "spell-brand"

/** The `UI.themes` name of Classic, the base every Fomantic theme sits on (`UI.themes.base`). */
export const CLASSIC = "classic"
