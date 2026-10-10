/**
 * The `JSX` rule module:  JSX -- elements (`<tag attr=.../>`), attributes, text, end tags, and `{...}` expression
 * containers, all tokenized up front by `P.JSXElementToken` & friends and re-parsed here.
 * - One rule per file, each registering itself on `JSX` (`JSX.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./JSX.parser"
export * from "./JSX.shared"
export * from "./SpellJSX"
export * from "./SpellJSXContent"
export * from "./SpellJSXAttribute"
export * from "./SpellJSXText"
export * from "./SpellJSXEndTag"
export * from "./SpellJSXExpression"
