/**
 * The `constants` rule module's parser:  each of its rule files registers on it (`constants.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for constant rules (`constant`, `known_constant`).
 */
export const constants = new SpellParser({ module: "constants" })
