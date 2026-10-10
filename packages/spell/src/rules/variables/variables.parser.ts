/**
 * The `variables` rule module's parser:  each of its rule files registers on it (`variables.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for variable rules (`identifier`, `variable`, `known_variable`, plurality variants).
 */
export const variables = new SpellParser({ module: "variables" })
