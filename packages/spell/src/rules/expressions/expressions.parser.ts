/**
 * The `expressions` rule module's parser:  each of its rule files registers on it (`expressions.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for Spell expression-suffix rules (`and`, `is`, `includes`, ...) plus `CompoundExpression`,
 * which combines them via shunting-yard.
 */
export const expressions = new SpellParser({ module: "expressions" })
