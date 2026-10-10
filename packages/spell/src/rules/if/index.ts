/**
 * The `if` rule module:  `if`/`else if`/`else` statements, plus the backwards `if...else` ternary suffix.
 * - One rule per file, each registering itself on `_if_` (`if.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./if.parser"
export * from "./If"
export * from "./ElseIf"
export * from "./Else"
export * from "./BackwardsIf"
export * from "./ValueIf"
export * from "./ValueOtherwise"
