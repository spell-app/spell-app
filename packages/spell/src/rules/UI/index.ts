/**
 * The `UI` rule module:  user-facing I/O statements -- `print`, `notify`, `alert`, `warn`, `confirm`, `prompt` --
 * plus inline `css` string installation.
 * - One rule per file, each registering itself on `UI` (`UI.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./UI.parser"
export * from "./Print"
export * from "./EndPrintGroup"
export * from "./Notify"
export * from "./Alert"
export * from "./Warn"
export * from "./Confirm"
export * from "./Prompt"
export * from "./CSSStyles"
