/**
 * The `draw` rule module's parser:  each of its rule files registers on it (`draw.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for draw rules (`draw_thing`, `draw_items`, `start_app`).
 */
export const draw = new SpellParser({ module: "draw" })
