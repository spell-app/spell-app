/**
 * The `constants` rule module:  rules for constants -- e.g. `red`, `green`, either free-standing
 * (possibly-unknown, quoted as a string literal) or resolved against `scope.constants` (`known_constant`).
 * - One rule per file, each registering itself on `constants` (`constants.parser.ts`) as it loads.
 * - `SpellConstant` is their base class, not a rule:  other modules use it, e.g. `SpellConstant.declareValue()`.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./constants.parser"
export * from "./SpellConstant"
export * from "./Constant"
export * from "./KnownConstant"
