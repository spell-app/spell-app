import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"

/** Assembled `spellCore` string-utility methods. */
export const stringMethods = defineSpellCoreModule({
  /** Wrap `thing` in double quotes -- no-op if `thing` is already a double-quoted string. */
  doubleQuote(thing: unknown): string {
    if (typeof thing === "string" && thing.startsWith('"') && thing.endsWith('"')) return thing
    return `"${thing}"`
  },
  /**
   * Wrap `thing` in back-ticks -- no-op if `thing` is already a back-ticked string.
   * - Used e.g. by `spellCore.expect()`/`spellCore.echoTestAction()` to quote spell source snippets
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
  }
})
Object.assign(spellCore, stringMethods)
