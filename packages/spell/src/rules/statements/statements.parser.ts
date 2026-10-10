/**
 * The `statements` rule module's parser:  each of its rule files registers on it (`statements.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for miscellaneous statements (currently just `do_nothing`).
 */
export const statements = new SpellParser({ module: "statements" })
