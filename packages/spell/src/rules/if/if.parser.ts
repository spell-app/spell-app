/**
 * The `if` rule module's parser:  each of its rule files registers on it (`_if_.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for `if`/`else if`/`else` statement rules, plus the `backwards_if` ternary suffix.
 * - Named `_if_`, since `if` is a reserved word.
 */
export const _if_ = new SpellParser({ module: "if" })
