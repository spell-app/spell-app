import { camelCase } from "$/core"

import { flagAliases, flagEmoji } from "./flag.vocabulary.en"

/****************
 * ### `FlagCountry`
 * A `country` attribute resolved to a flag:  its code, its Unicode emoji and how to name it -- shared by
 * `<ui-flag>` and its native fallback, so both draw the same glyph.
 * - Rules:  `flag.vocabulary.en.ts` (normalize, alias, `flagEmoji`, else a regional-indicator pair).
 * - Plain data, no DOM and no runtime:  naming a code (`Intl.DisplayNames`) is the caller's, since the element
 *   goes through `UI.i18n` and the fallback can't count on the runtime.
 ****************/
export class FlagCountry {
  /** Normalized code:  ISO 3166-1 alpha-2 (`fr`) or a `flagEmoji` key (`gb-eng`);  `""` when unknown. */
  readonly code: string

  /** Flag emoji;  `""` when unknown. */
  readonly emoji: string

  /** Text key naming a non-country flag (`rainbow`, `gbEng`), else `undefined`:  name the code by region. */
  readonly textKey: string | undefined

  constructor(country: string | null | undefined) {
    const name = FlagCountry.normalize(country ?? "")
    const code = (flagAliases as Readonly<Record<string, string>>)[name] ?? name
    const special = (flagEmoji as Readonly<Record<string, string>>)[code]
    const emoji = special ?? FlagCountry.regionalIndicators(code)
    this.code = emoji ? code : ""
    this.emoji = emoji
    this.textKey = special ? camelCase(code) : undefined
  }

  /** Region code for `Intl.DisplayNames` (`FR`), or `undefined` for a non-country flag or an unknown one. */
  get region(): string | undefined {
    return this.code && !this.textKey ? this.code.toUpperCase() : undefined
  }

  /** Lowercase, `_` => space, one space between words:  `United_States` ~== `united states`. */
  private static normalize(country: string): string {
    return country.trim().toLowerCase().replaceAll("_", " ").replace(WHITESPACE, " ")
  }

  /** Regional-indicator pair of a two-letter code (`fr` => `🇫🇷`);  `""` for anything else. */
  private static regionalIndicators(code: string): string {
    if (!TWO_LETTERS.test(code)) return ""
    return String.fromCodePoint(...Array.from(code, (letter) => INDICATOR_A + letter.charCodeAt(0) - LETTER_A))
  }
}

/** Runs of whitespace. */
const WHITESPACE = /\s+/g

/** An ISO 3166-1 alpha-2 code, lowercase. */
const TWO_LETTERS = /^[a-z]{2}$/

/** `U+1F1E6`, REGIONAL INDICATOR SYMBOL LETTER A. */
const INDICATOR_A = 0x1f1e6

/** Char code of `a`. */
const LETTER_A = 0x61
