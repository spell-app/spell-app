/**
 * The `core` rule module:  simple datatypes (`number`, `boolean`, `text`, `undefined`), whitespace/newline/comment
 * tokens, and the `keyword` identifier pattern used by method/type definitions elsewhere.
 * - One rule per file, each registering itself on `core` (`core.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./core.parser"
export * from "./EatWhitespace"
export * from "./Whitespace"
export * from "./Indent"
export * from "./Newline"
export * from "./InlineWhitespace"
export * from "./NumberLiteral"
export * from "./NumberAsString"
export * from "./BooleanLiteral"
export * from "./TextLiteral"
export * from "./CommentLine"
export * from "./UndefinedLiteral"
export * from "./KeywordRule"
