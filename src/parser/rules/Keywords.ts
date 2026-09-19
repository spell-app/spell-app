import { Literals } from "./Literals"

/**
 * Rule to match one or more sequential literal `Keyword`s, with space in-between.
 *
 * - After matching, `match.value` will be the literal string matched.
 * - Symbols output WITH a single space in-between.
 */
export class Keywords extends Literals {
  static {
    /** Join symbols with a single space in-between. */
    Object.defineProperty(this.prototype, "literalSeparator", {
      value: " ",
      writable: true
    })
  }
}
