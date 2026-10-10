/**
 * The `async` rule module's parser:  each of its rule files registers on it (`_async.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for async/process rules (`await`, `pause`, `start_process`, `stop_process`, `check_process`).
 */
export const _async = new SpellParser({ module: "async" })
