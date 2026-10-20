import { core } from "./core"
import { defineCoreModule } from "./core.types"

/** Assembled `core` string-utility methods. */
export const stringMethods = defineCoreModule({
  /** Wrap `thing` in double quotes -- no-op if `thing` is already a double-quoted string. */
  doubleQuote(thing: unknown): string {
    if (typeof thing === "string" && thing.startsWith('"') && thing.endsWith('"')) return thing
    return `"${thing}"`
  },
  /**
   * Wrap `thing` in back-ticks -- no-op if `thing` is already a back-ticked string.
   * - Used e.g. by `core.expect()`/`core.echoTestAction()` to quote spell source snippets
   *   for test output.
   */
  backTickQuote(thing: unknown): string {
    if (typeof thing === "string" && thing.startsWith("`") && thing.endsWith("`")) return thing
    return `\`${thing}\``
  },

  /**
   * Stringify and convert to UPPERCASE.
   * - Compiles from spell `{expression} as upper case` / `as uppercase` (see `rules/expressions/AsUppercase.ts`).
   */
  upperCase(string: unknown): string {
    if (string == null) return ""
    return `${string as string}`.toUpperCase()
  },
  /**
   * Stringify and convert to lowercase.
   * - Compiles from spell `{expression} as lower case` / `as lowercase` (see `rules/expressions/AsLowercase.ts`).
   */
  lowerCase(string: unknown): string {
    if (string == null) return ""
    return `${string as string}`.toLowerCase()
  },
  /**
   * The character with unicode code point `code`, e.g. `"🂠"` for `0x1F0A0`.
   * - Compiles from spell `unicode {number}`, a number worked out as the program runs (see `rules/expressions/Unicode.ts`).
   *   `unicode 1F0A0`, written out, compiles straight to the character.
   * - `""` for nothing, or what's no code point (not a whole number, or past `0x10FFFF`).
   */
  unicode(code: unknown): string {
    const point = Number(code)
    if (code == null || !Number.isInteger(point) || point < 0 || point > 0x10ffff) return ""
    return String.fromCodePoint(point)
  }
})
Object.assign(core, stringMethods)
