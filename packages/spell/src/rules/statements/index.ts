/**
 * The `statements` rule module:  random statements that didn't earn a module of their own.
 * - One rule per file, each registering itself on `statements` (`statements.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./statements.parser"
export * from "./DoNothing"
