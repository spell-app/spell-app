/**
 * The `events` rule module's parser:  each of its rule files registers on it (`events.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for `trigger`/`on` -- events fired / watched through core, `spellCore.trigger()` / `spellCore.on()`.
 * - They find the program's CURRENT runtime when called:  a new one is made each time a program starts.
 */
export const events = new SpellParser({ module: "events" })
