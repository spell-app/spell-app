/**
 * Loose constants and types of the `ui-docs-themes` family:  what the element, its menu builder (`ThemeMenu`) and
 * the native fallback share.
 * - Data only:  nothing here runs.
 */

import type { DocsLook, DocsScheme } from "$/ui/docs-components/docs-components.types"

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
  scheme: DocsScheme
  originalEvent?: Event
}

/** `show`:  which controls render. */
export type DocsThemesShow = "both" | "theme" | "scheme"

/** The dropdown value standing for our own look (`ThemeSheets.apply(undefined)`):  no sheet is named so. */
export const DEFAULT_VALUE = "default"

/** The `ThemeSheets` name of Classic, the base every Fomantic theme sits on (`ThemeSheets.BASE`). */
export const CLASSIC = "classic"

/** Icon of each scheme button (`fomantic` pack names). */
export const SCHEME_ICONS: Readonly<Record<DocsScheme, string>> = { light: "sun", dark: "moon", system: "desktop" }

/** The look a server render shows:  no storage there. */
export const SERVER_LOOK: DocsLook = { theme: undefined, scheme: "system" }
