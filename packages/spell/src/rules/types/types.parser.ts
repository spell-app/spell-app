/**
 * The `types` rule module's parser:  each of its rule files registers on it (`types.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for type-name rules (`type`, `singular_type`, `plural_type`, `known_type`).
 */
export const types = new SpellParser({ module: "types" })
