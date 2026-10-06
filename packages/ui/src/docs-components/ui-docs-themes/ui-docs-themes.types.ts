/**
 * Constants and types of the `ui-docs-themes` family:  what the element (`UIDocsThemes`), its menu builder
 * (`ThemeMenu`) and the native fallback share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 *   A constant only one class reads sits below that class (epic `wwod-spell-ui`, Q18).
 */

import type { DocsLook, DocsScheme, DocsShownScheme } from "$/ui/docs-components/docs-components.types"
import type { docsThemesVocabulary } from "./ui-docs-themes.vocabulary.en"

////////////////
// ## Element
////////////////

/** `docsThemesVocabulary`'s type. */
export type DocsThemesVocabulary = typeof docsThemesVocabulary

/** A text key of `<ui-docs-themes>` (`docsThemesVocabulary.texts`). */
export type DocsThemesTextKey = DocsThemesVocabulary["texts"][number]["key"]

/** Looks up a text by key, with `{param}`s filled in:  the element's `text()`, or English in the fallback. */
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

/****************
 * ### `DocsThemesChanges`
 * The `ui-change` detail for a look, as the element and its native fallback both fire it.
 * - Static:  pure;  the caller reads `ThemePreference` (a value this file can't import).
 ****************/
export class DocsThemesChanges {
  /** `look` as a `ui-change` detail:  no `theme` key for our own look. */
  static detailFor({ look, shown, originalEvent }: ChangeParams): DocsThemesChange {
    return { ...(look.theme !== undefined && { theme: look.theme }), scheme: look.scheme, shown, originalEvent }
  }
}

/** What `DocsThemesChanges.detailFor()` reads. */
export type ChangeParams = {
  /** the look now (`ThemePreference.look`) */
  look: DocsLook
  /** the scheme the page shows now (`ThemePreference.shownScheme()`) */
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
