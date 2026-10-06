import { E, UI } from "$/ui/core"

/****************
 * ### `SpellLanguage`
 * The `spell` language of `<ui-code>`:  `language="spell"` (~== `spell/en`), `spell/<lang>` for a translation.
 * - Colours from spell's own parser, PRE-COMPILED into `src/languages/spell.<lang>.js` (`yarn gen:spell`):  `ui`
 *   never imports spell's source.  Each file is its own lazy chunk (~130 kB gzipped), fetched the first time a page
 *   shows that language;  NOT in auto-detection (too big to load on a guess).
 * - A `spell/<lang>` with no file is a `render` error naming the missing translation:  the code stays plain.
 * - Registered by the family barrel once the runtime is in, unless the page registered its own `spell` first.
 * - STATIC and instance-free:  ONE `spell` language per page, registered with the page's `UI.code`.
 ****************/
export class SpellLanguage {
  /**
   * Imports translation `variant`'s bundle, `undefined` when there's none;  replaceable, e.g. by a bundle that can't
   * keep `import()`s (the docs' classic script loads it as a script of its own).
   * - Static:  page-wide, set before the first highlight.
   */
  static bundleLoader: (variant: string) => Promise<SpellBundle> | undefined = (variant) =>
    BUNDLES[`../../languages/spell.${variant}.ts`]?.()

  /** Register `spell` with `UI.code` (the runtime MUST be loaded), unless something else already has. */
  static register() {
    if (UI.code.find(NAME)) return
    UI.code.register(NAME, { aliases: ALIASES, load: (variant) => SpellLanguage.load(variant) })
  }

  /** The highlighter for translation `variant` (default English);  a `render` `SourceError` when there's none. */
  static async load(variant: string = DEFAULT_VARIANT): Promise<Omit<E.CodeLanguage, "load">> {
    const loading = SpellLanguage.bundleLoader(variant)
    if (!loading) {
      throw new E.SourceError(
        `SpellLanguage.load():  no "${variant}" translation of spell;  use one \`yarn gen:spell\` built`,
        { cause: { kind: "render" } }
      )
    }
    return (await loading).default
  }
}

/** A translation's bundle module:  the highlighter, without `load`. */
type SpellBundle = { default: Omit<E.CodeLanguage, "load"> }

/** The language's name. */
const NAME = "spell"

/** Its other names. */
const ALIASES = ["sp"]

/** The translation `spell` alone means. */
const DEFAULT_VARIANT = "en"

/**
 * Each translation's bundle, by path (a literal glob:  one chunk per file, nothing loaded up front):  the generated
 * `spell.<lang>.ts` wrapper of `spell.<lang>.bundle.js`, which anchors the chunk to `core` (see `gen-spell.ts`).
 */
const BUNDLES = import.meta.glob<SpellBundle>(["../../languages/spell.*.ts", "!**/*.d.ts"])
