/**
 * The `properties` rule module:  members -- naming one, reading one off an object or `it` --
 * plus object-literal construction.
 * - One rule per file, each registering itself on `properties` (`properties.parser.ts`) as it loads.
 *   `MemberReadExpression`, the base class of the rules which read a member, registers nothing itself.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */

// TODO: constructor
// TODO: mixins / traits / composed classes / annotations

export * from "./properties.parser"
export * from "./properties.shared"
export * from "./Property"
export * from "./MemberWords"
export * from "./QuotedMember"
export * from "./MemberReadExpression"
export * from "./PropertyExpression"
export * from "./ItsKnownProperty"
export * from "./ItsProperty"
export * from "./ItsOrdinal"
export * from "./ObjectLiteralProperty"
export * from "./ObjectLiteralProperties"
