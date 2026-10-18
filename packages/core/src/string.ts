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
  }
})
Object.assign(core, stringMethods)
