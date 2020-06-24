// ----------------------------
// String utilites
// ----------------------------
import { spellCore } from "."

Object.assign(spellCore, {
  /** Wrap `thing` in double quotes. */
  doubleQuote(thing) {
    if (typeof thing === "string" && thing.startsWith('"') && thing.endsWith('"')) return thing
    return `"${thing}"`
  },
  /** Wrap `thing` in back-ticks. */
  backTickQuote(thing) {
    if (typeof thing === "string" && thing.startsWith("`") && thing.endsWith("`")) return thing
    return `\`${thing}\``
  },

  /** Stringify and convert to UPPERCASE */
  upperCase(string) {
    if (string == null) return ""
    return `${string}`.toUpperCase()
  },
  /** Stringify and convert to lowercase */
  lowerCase(string) {
    if (string == null) return ""
    return `${string}`.toLowerCase()
  }
})
