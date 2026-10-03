import { SourceError, UI, type CodeLanguage } from "$/ui/core"

/****************
 * ### `SpellLanguage`
 * The `spell` language of `<ui-code>`:  `language="spell"` (~== `spell/en`), `spell/<lang>` for a translation.
 * - Colours from spell's own parser, PRE-COMPILED into `src/languages/spell.<lang>.js` (`yarn gen:spell`):  `ui`
 *   never imports spell's source.  Each file is its own lazy chunk (~130 kB gzipped), fetched the first time a page
 *   shows that language;  NOT in auto-detection (too big to load on a guess).
 * - A `spell/<lang>` with no file is a `render` error naming the missing translation:  the code stays plain.
 * - Registered by the family barrel once the runtime is in, unless the page registered its own `spell` first.
 ****************/
export class SpellLanguage {
  /** The language's name, and its other one. */
  static readonly NAME = "spell"
  static readonly ALIASES = ["sp"]

  /** The language `spell` alone means. */
  static readonly DEFAULT = "en"

  /** Each translation's bundle, by path (a literal glob:  one chunk per file, nothing loaded up front). */
  private static readonly BUNDLES = import.meta.glob<{ default: Omit<CodeLanguage, "load"> }>(
    "../../languages/spell.*.js"
  )

  /** Register `spell` with `UI.code` (the runtime MUST be loaded), unless something else already has. */
  static register() {
    if (UI.code.find(SpellLanguage.NAME)) return
    UI.code.register(SpellLanguage.NAME, {
      aliases: SpellLanguage.ALIASES,
      load: (variant) => SpellLanguage.load(variant)
    })
  }

  /** The highlighter for translation `variant` (default English);  a `render` `SourceError` when there's none. */
  static async load(variant: string = SpellLanguage.DEFAULT): Promise<Omit<CodeLanguage, "load">> {
    const loader = SpellLanguage.BUNDLES[`../../languages/spell.${variant}.js`]
    if (!loader) throw new SourceError("render", `No "${variant}" translation of spell to highlight with`)
    return (await loader()).default
  }
}
