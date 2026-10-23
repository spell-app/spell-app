import type { P } from "spell-lang/parser"
import { SP } from "spell-lang/spell"

import { LSP_TEXTS, type LspTextKey, type LspTextPack } from "./LspTexts.en"
import { LSP_TEXTS_ES } from "./LspTexts.es"

/****************
 * ### `LspTexts`
 * The language server's words in one language:
 * the labels around a hover, a completion, the Type Explorer's tree (epic `spanish` P13).
 * - In the FILE's language, by its name (epic `spanish` P19), not the editor's:
 *   a Spanish program's hover says `declarado en` in any editor, VS Code's included.
 *   `LspTexts.of(scope)` asks `SP.Language.of(scope)`.
 * - Read one with `text(key, params)`:  `LspTexts.of(scope).text("declaredIn", { where })`.
 *   - The keys and their English:  `LSP_TEXTS` (`LspTexts.en.ts`);  Spanish:  `LspTexts.es.ts`.
 *   - A language with no texts here reads English.
 * - Plain data, browser-safe:  the app's Monaco editor runs the same service in-process.
 * - NOT `UI.i18n` (Spell UI's), which the app's own texts read:  the server runs in node too, with no Spell UI.
 * - Its Spanish is a static import, not a lazy chunk:  hover and completion answer at once,
 *   and the Spanish language pack (`SP.spanish`) it labels is in the same bundle already.
 ****************/
export class LspTexts {
  /** Language code, e.g. `es`. */
  readonly lang: string
  /** Its texts:  every key. */
  private readonly texts: LspTextPack

  private constructor(lang: string, texts: LspTextPack) {
    this.lang = lang
    this.texts = texts
  }

  /**
   * Text `key`, each `{name}` in it filled from `params`.
   * - A placeholder with no param stays as written, `{name}`, so the gap shows.
   */
  text(key: LspTextKey, params?: Readonly<Record<string, string | number>>): string {
    const text = this.texts[key]
    if (!params) return text
    return text.replace(PLACEHOLDER, (whole, name: string) => (name in params ? String(params[name]) : whole))
  }

  ////////////////
  // ## Every language
  ////////////////

  /** The texts of the language `scope` is read in (`SP.Language.of()`):  its parser's, else the one in play. */
  static of(scope: P.Scope | undefined): LspTexts {
    return LspTexts.for(SP.Language.of(scope))
  }

  /** The texts for `language`'s programs;  English for a language we have none in. */
  static for(language: SP.Language): LspTexts {
    return LspTexts.forLang(language.lang)
  }

  /** The texts for language code `lang`, e.g. `es`, made once each;  English for a language we have none in. */
  static forLang(lang: string): LspTexts {
    let texts = LspTexts.all.get(lang)
    if (!texts) LspTexts.all.set(lang, (texts = new LspTexts(lang, LANGUAGES[lang] ?? LSP_TEXTS)))
    return texts
  }

  /** Each language's texts, by its code, as `forLang()` made them. */
  private static readonly all = new Map<string, LspTexts>()
}

/** The languages we have the language server's words in:  code => its texts. */
const LANGUAGES: Readonly<Record<string, LspTextPack>> = { en: LSP_TEXTS, es: LSP_TEXTS_ES }

/** A named placeholder in a text, `{type}`. */
const PLACEHOLDER = /\{(\w+)\}/g

export type { LspTextKey, LspTextPack } from "./LspTexts.en"
