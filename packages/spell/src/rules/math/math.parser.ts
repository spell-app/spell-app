/**
 * The `math` rule module's parser:  each of its rule files registers on it (`math.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for math rules (comparison/arithmetic operators, standalone math functions).
 */
export const math = new SpellParser({ module: "math" })
