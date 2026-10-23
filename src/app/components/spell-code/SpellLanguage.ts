import { E, UI } from "spell-ui/core"

/****************
 * ### `SpellLanguage`
 * The `spell` language of `<ui-code>`:  `language="spell"` (~== `spell/en`), `spell/<lang>` for a translation.
 * - Registered with the page's `UI.code` by the `<spell-code>` family as it loads (`registerWhenLoaded()`),
 *   and by `spell-language.js`, which the page server adds to the docs pages it serves (epic `repo-split` Q23).
 *   - So once either is on a page, EVERY `<ui-code language="spell">` there is coloured,
 *     a `spell` block in any `<ui-markdown>` too.
 *   - Spell UI itself knows nothing of spell:  this is one more language a page registers (`UI.code.register()`).
 * - Colours from spell's own parser (`SP.SpellHighlighter`), from source:
 *   a lazy chunk (the parser and spell's rules, ~130 kB gzipped), fetched the first time a page shows spell.
 *   - NOT in auto-detection:  too big to load on a guess.
 * - A `spell/<lang>` with no translation is a `render` error naming it:  the code stays plain.
 * - STATIC and instance-free:  ONE `spell` language per page, registered with the page's `UI.code`.
 ****************/
export class SpellLanguage {
  /**
   * Register `spell` with `UI.code` once the page's runtime is in;  what a family barrel calls as it loads.
   * - NEVER throws:  a runtime that won't load is logged.
   */
  static registerWhenLoaded(): void {
    UI.load()
      .then(() => SpellLanguage.register())
      .catch((error: unknown) => console.error("SpellLanguage:  the page's Spell UI runtime didn't load", error))
  }

  /** Register `spell` with `UI.code` (the runtime MUST be loaded), unless something else already has. */
  static register(): void {
    if (UI.code.find(NAME)) return
    UI.code.register(NAME, { aliases: ALIASES, load: (variant) => SpellLanguage.load(variant) })
  }

  /** The highlighter for translation `variant` (default English);  a `render` `SourceError` when there's none. */
  static async load(variant: string = DEFAULT_VARIANT): Promise<Omit<E.CodeLanguage, "load">> {
    const load = TRANSLATIONS[variant]
    if (!load) {
      throw new E.SourceError(
        `SpellLanguage.load():  no "${variant}" translation of spell;  there's ${Object.keys(TRANSLATIONS).join(", ")}`,
        { cause: { kind: "render" } }
      )
    }
    return load()
  }
}

/** The language's name. */
const NAME = "spell"

/** Its other names. */
const ALIASES = ["sp"]

/** The translation `spell` alone means. */
const DEFAULT_VARIANT = "en"

/**
 * Each translation's highlighter, imported on first use:  ONE lazy chunk, spell's parser and rules, every language.
 * - Each colours with its own language pack's parser, so its words colour as theirs do:
 *   ```` ```spell/es ```` reads `si`, `para cada`, `el número de` as Spanish keywords.
 * - A new language pack:  add its code here.
 */
const TRANSLATIONS: Record<string, () => Promise<Omit<E.CodeLanguage, "load">>> = {
  en: () => highlighterFor("en"),
  es: () => highlighterFor("es")
}

/** The highlighter of language `lang`'s spell, from its pack:  `SP.SpellHighlighter` with its parser. */
async function highlighterFor(lang: string): Promise<Omit<E.CodeLanguage, "load">> {
  const { SP } = await import("spell-parser/spell")
  const { parser } = SP.Language.for(lang)
  return { highlight: (code: string) => SP.SpellHighlighter.spans(code, parser) }
}
