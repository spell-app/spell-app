/**
 * The `tests` rule module's parser:  each of its rule files registers on it (`tests.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for inline test rules (`expect_test`, `start_test`, `end_test`, `echo`).
 */
export const tests = new SpellParser({ module: "tests" })
