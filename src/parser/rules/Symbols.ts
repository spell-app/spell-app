// Import directly to avoid circular import
import { Literals } from "./Literals"

/**
 * Rule to match one or more sequential literal symbols, with no space in-between.
 *
 * - After matching, `match.value` will be the literal string matched.
 * - Symbols output WITHOUT spaces in-between.
 */
export class Symbols extends Literals {
  static {
    /** Join symbols with no space in-between. */
    Object.defineProperty(this.prototype, "literalSeparator", {
      value: "",
      writable: true
    })
  }
}
