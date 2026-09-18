// ----------------------------
// String utilites
// ----------------------------
import { spellCore } from "./core"
import { defineSpellCoreModule } from "./SpellCore"

export const stringMethods = defineSpellCoreModule({
  /** Wrap `thing` in double quotes. */
  doubleQuote(thing: unknown): string {
    if (typeof thing === "string" && thing.startsWith('"') && thing.endsWith('"')) return thing
    return `"${thing}"`
  },
  /** Wrap `thing` in back-ticks. */
  backTickQuote(thing: unknown): string {
    if (typeof thing === "string" && thing.startsWith("`") && thing.endsWith("`")) return thing
    return `\`${thing}\``
  },

  /** Stringify and convert to UPPERCASE */
  upperCase(string: unknown): string {
    if (string == null) return ""
    return `${string as string}`.toUpperCase()
  },
  /** Stringify and convert to lowercase */
  lowerCase(string: unknown): string {
    if (string == null) return ""
    return `${string as string}`.toLowerCase()
  }
})
Object.assign(spellCore, stringMethods)
