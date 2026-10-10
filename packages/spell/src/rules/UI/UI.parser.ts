/**
 * The `UI` rule module's parser:  each of its rule files registers on it (`UI.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for UI rules (`print`, `end_print_group`, `notify`, `alert`, `warn`, `confirm`, `prompt`, `css`).
 */
export const UI = new SpellParser({ module: "UI" })
