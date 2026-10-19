/**
 * The `types` rule module:  type names -- e.g. `thing`, `bank-account`, singular or plural, possibly unknown, resolved
 * against `scope.types` when known.
 * - A name may be several words once declared, e.g. `bank account`;  a declaration's name is `type_words`.
 * - One rule per file, each registering itself on `types` (`types.parser.ts`) as it loads.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./types.parser"
export * from "./SpellType"
export * from "./Type"
export * from "./SingularType"
export * from "./PluralType"
export * from "./QuotedType"
export * from "./SubjectRule"
export * from "./SubjectIt"
export * from "./SubjectIts"
export * from "./SubjectImplied"
export * from "./KnownType"
export * from "./TypeWords"
