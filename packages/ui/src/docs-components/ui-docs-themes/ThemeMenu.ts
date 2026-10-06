import type { MenuEntry } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import type { SiteDataFile } from "$/ui/docs-components/docs-components.types"

import { CLASSIC, DEFAULT_VALUE, SPELL, SPELL_BRAND, type DocsThemesText } from "./ui-docs-themes.types"

/****************
 * ### `ThemeMenu`
 * What `<ui-docs-themes>`' dropdown lists, and its text:  plain data, no Solid, so the element and the native
 * fallback share it.
 * - Entries:  Spell (our own theme, the docs' default), Plain (our own look, no theme), Classic, then a
 *   `Fomantic themes` header over every Fomantic theme (`UI.themes.names`, A-Z by title).
 * - `for`:  only the Fomantic themes whose `SiteTheme.families` hold that tag's family;  Spell, Plain and Classic
 *   stay.  Until the site data arrives (or if it can't, or doesn't know the tag), the list is unfiltered;  titles
 *   fall back to the sheet name.
 ****************/
export class ThemeMenu {
  /** The Fomantic theme names there are (`UI.themes.names`). */
  readonly names: readonly string[]

  /** The site data, once loaded. */
  readonly data: SiteDataFile | undefined

  /** `for`:  a tag whose family's themes to list. */
  readonly forTag: string | undefined

  constructor(names: readonly string[], data: SiteDataFile | undefined, forTag: string | undefined) {
    this.names = names
    this.data = data
    this.forTag = forTag || undefined
  }

  /** The Fomantic themes to list, A-Z by title:  every one, or with `for` those touching its family. */
  themes(): string[] {
    const family = this.family()
    const touching = (name: string) =>
      !family || !!this.data!.themes.find((theme) => theme.name === name)?.families.includes(family)
    return this.names.filter(touching).sort((a, b) => this.title(a).localeCompare(this.title(b)))
  }

  /** Display title of sheet `name`:  the site data's, else the name with its first letter upper-cased. */
  title(name: string): string {
    const title = this.data?.themes.find((theme) => theme.name === name)?.title
    return title ?? name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ")
  }

  /** The dropdown's entries;  `text` looks up the element's strings. */
  entries(text: DocsThemesText): MenuEntry[] {
    return [
      { value: SPELL, text: this.title(SPELL), description: text("spellDescription") },
      { value: SPELL_BRAND, text: this.title(SPELL_BRAND), description: text("spellBrandDescription") },
      { value: DEFAULT_VALUE, text: text("default"), description: text("defaultDescription") },
      { value: CLASSIC, text: this.title(CLASSIC), description: text("classicDescription") },
      { type: "divider", text: "" },
      { type: "header", text: text("fomanticThemes") },
      ...this.themes().map((name) => ({ value: name, text: this.title(name) }))
    ]
  }

  /**
   * The dropdown's text for chosen theme `theme` (`undefined`:  our own look):  `GitHub theme`;  with `for`, while
   * the chosen theme isn't one of the family's, how many are (`3 themes`, `1 theme`), as Fomantic's per-page dropdown
   * says.
   * - A family no theme touches shows the chosen look instead of `0 themes`.
   */
  label(theme: string | undefined, text: DocsThemesText): string {
    // a family no Fomantic theme touches shows the chosen look, never "0 themes"
    const count = this.themes().length
    if (this.forTag && count > 0 && (theme === undefined || !this.themes().includes(theme))) {
      return count === 1 ? text("themeCountOne") : text("themeCount", { count })
    }
    return text("themeLabel", { title: theme === undefined ? text("default") : this.title(theme) })
  }

  /** The folder of `for`'s family, once the data says;  `undefined`:  don't filter (no data, or a tag it lacks). */
  private family(): string | undefined {
    return this.forTag && this.data ? SiteData.family(this.data, this.forTag)?.folder : undefined
  }
}
