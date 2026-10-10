/**
 * The `math` rule module:  math-y bits -- comparison operators (`<`, `is greater than`), arithmetic operators
 * (`plus`, `times`, ...), and standalone math functions (`absolute value`, `max`/`min`, `round`).
 * - NOTE: this must come after "operators".
 * - One rule per file, each registering itself on `math` (`math.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./math.parser"
export * from "./GtLt"
export * from "./IsGtLt"
export * from "./Plus"
export * from "./Minus"
export * from "./Times"
export * from "./DividedBy"
export * from "./AbsoluteValue"
export * from "./Max"
export * from "./Min"
export * from "./RoundNumber"
