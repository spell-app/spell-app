/**
 * The `variables` rule module:  single-word identifiers, known or unknown, singular or plural.
 * - NOTE the split, which the `_identifier` / `variable` suffixes are there to tell you:
 *   - `identifier` / `singular_identifier` / `plural_identifier` match a BARE word, no `the`.
 *   - `variable` / `known_variable` also allow a leading `the`, e.g. `the thing`.
 * - One rule per file, each registering itself on `variables` (`variables.parser.ts`) as it loads.
 *   `SpellIdentifier`, the base class of the `*identifier` rules, registers nothing itself.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./variables.parser"
export * from "./variables.shared"
export * from "./SpellIdentifier"
export * from "./Identifier"
export * from "./SingularIdentifier"
export * from "./PluralIdentifier"
export * from "./Variable"
export * from "./KnownVariable"
