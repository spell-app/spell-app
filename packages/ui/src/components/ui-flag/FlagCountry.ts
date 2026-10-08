import { E, UIT } from "$/ui/core"
import { FLAG_ALIASES } from "./UIFlag.types"

/****************
 * ### `FlagCountry`
 * A `country` attribute resolved to a flag:  its code, its Unicode emoji and how to name it.
 * - For `UIFlag`, and for pages that want the emoji or the code alone (the family's barrel exports it).
 * - Rules:  `UIFlag.en.ts`:  normalize, then a name of `FLAG_ALIASES` => its code, then the code =>
 *   its emoji through `UIT.Flags`, the rule menu options' flags use too.
 * - Plain data, no DOM and no runtime:  naming a code (`Intl.DisplayNames`) is the caller's
 *   (the component goes through `UI.i18n`).
 ****************/
export class FlagCountry {
  /** Normalized code:  ISO 3166-1 alpha-2 (`fr`) or a `UIT.SpecialFlags` key (`gb-eng`);  `""` when unknown. */
  readonly code: string

  /** Flag emoji;  `""` when unknown. */
  readonly emoji: string

  /** Text key naming a non-country flag (`rainbow`, `gbEng`), else `undefined`:  name the code by region. */
  readonly textKey: string | undefined

  /** Resolve `country`:  a code in any case, or one of Fomantic's names;  absent ~== unknown. */
  constructor(country?: string) {
    const name = FlagCountry.normalize(country ?? "")
    const code = Object.hasOwn(FLAG_ALIASES, name) ? FLAG_ALIASES[name as keyof typeof FLAG_ALIASES] : name
    const emoji = UIT.Flags.emojiFor(code)
    this.code = emoji ? code : ""
    this.emoji = emoji
    this.textKey = UIT.Flags.isSpecial(code) ? E.camelCase(code) : undefined
  }

  /** Region code for `Intl.DisplayNames` (`FR`), or `undefined` for a non-country flag or an unknown one. */
  get region(): string | undefined {
    return this.code && !this.textKey ? this.code.toUpperCase() : undefined
  }

  /**
   * Lowercase, `_` => space, one space between words:  `United_States` ~== `united states`.
   * - STATIC:  pure, needs no instance.
   */
  private static normalize(country: string): string {
    return country.trim().toLowerCase().replaceAll("_", " ").split(UIT.WHITESPACE).join(" ")
  }
}
