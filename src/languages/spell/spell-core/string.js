// ----------------------------
// String utilites
// ----------------------------
import { spellCore } from "."

Object.assign(spellCore, {
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
