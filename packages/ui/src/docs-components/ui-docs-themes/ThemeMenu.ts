import type { E } from "$/ui/core"
import { DOCS_PLAIN_THEME, type SiteDataFile } from "$/ui/docs-components/docs-components.types"
import { SiteData } from "$/ui/docs-components/SiteData"
import { CLASSIC, SPELL, SPELL_BRAND, type DocsThemesText } from "./UIDocsThemes.types"

/****************
 * ### `ThemeMenu`
 * What `<ui-docs-themes>`' dropdown lists, and its text:  plain data, no Solid, which tests drive directly.
 * - Entries:  Spell (our own theme, the docs' default), Plain (our own look, no theme:  `DOCS_PLAIN_THEME`), Classic,
 *   then a `Fomantic themes` header over every Fomantic theme (`UI.themes.names`, A-Z by title).
 * - `forTag`:  only the Fomantic themes whose `SiteTheme.families` hold that tag's family;  Spell,
 *   Plain and Classic stay.  Until the site data arrives (or if it can't, or doesn't know the tag),
 *   the list is unfiltered;  titles fall back to the sheet name.
 * - One per state of its inputs:  the element remakes it when the data or `for` changes.
 ****************/
export class ThemeMenu {
  /** The Fomantic theme names there are (`UI.themes.names`). */
  readonly names: readonly string[]

  /** The site data, once loaded. */
  readonly data: SiteDataFile | undefined

  /** `for`:  a tag whose family's themes to list. */
  readonly forTag: string | undefined

  /** Looks up the component's strings. */
  readonly text: DocsThemesText

  constructor({ names, data, forTag, text }: ThemeMenuProps) {
    this.names = names
    this.data = data
    this.forTag = forTag || undefined
    this.text = text
  }

  /** The Fomantic themes to list, A-Z by title:  every one, or with `forTag` those touching its family. */
  get themes(): string[] {
    const folder = this.folder
    return this.names
      .filter((name) => !folder || this.touches(name, folder))
      .sort((a, b) => this.titleFor(a).localeCompare(this.titleFor(b)))
  }

  /** The dropdown's entries. */
  get entries(): E.MenuEntry[] {
    const { text } = this
    return [
      { value: SPELL, text: this.titleFor(SPELL), description: text("spellDescription") },
      { value: SPELL_BRAND, text: this.titleFor(SPELL_BRAND), description: text("spellBrandDescription") },
      { value: DOCS_PLAIN_THEME, text: text("default"), description: text("defaultDescription") },
      { value: CLASSIC, text: this.titleFor(CLASSIC), description: text("classicDescription") },
      { type: "divider", text: "" },
      { type: "header", text: text("fomanticThemes") },
      ...this.themes.map((name) => ({ value: name, text: this.titleFor(name) }))
    ]
  }

  /** Display title of sheet `name`:  the site data's, else the name with its first letter upper-cased. */
  titleFor(name: string): string {
    const title = this.data?.themes.find((theme) => theme.name === name)?.title
    return title ?? name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ")
  }

  /**
   * The dropdown's text for chosen theme `theme` (`undefined`:  our own look):  `GitHub theme`;  with `forTag`,
   * while the chosen theme isn't one of the family's, how many are (`3 themes`, `1 theme`),
   * as Fomantic's per-page dropdown says.
   * - A family no Fomantic theme touches shows the chosen look, never `0 themes`.
   */
  labelFor(theme: string | undefined): string {
    const themes = this.themes
    if (this.forTag && themes.length > 0 && (theme === undefined || !themes.includes(theme))) {
      return themes.length === 1 ? this.text("themeCountOne") : this.text("themeCount", { count: themes.length })
    }
    return this.text("themeLabel", { title: theme === undefined ? this.text("default") : this.titleFor(theme) })
  }

  /** The folder of `forTag`'s family, once the data says;  `undefined`:  don't filter (no data, or a tag it lacks). */
  private get folder(): string | undefined {
    return this.forTag && this.data ? SiteData.family(this.data, this.forTag)?.folder : undefined
  }

  /** Sheet `name` restyles family `folder`, as the site data says. */
  private touches(name: string, folder: string): boolean {
    return !!this.data?.themes.find((theme) => theme.name === name)?.families.includes(folder)
  }
}

/** Props of `new ThemeMenu()`. */
export type ThemeMenuProps = {
  /** the Fomantic theme names there are (`UI.themes.names`) */
  names: readonly string[]
  /** the site data, once loaded */
  data: SiteDataFile | undefined
  /** `for`:  a tag whose family's themes to list;  `""` ~== none */
  forTag?: string
  /** the component's texts (`translationForKey()`) */
  text: DocsThemesText
}
