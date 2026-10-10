/**
 * The `classes` rule module's parser:  each of its rule files registers on it (`classes.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for class/property rules (`create_type`, `define_property_has`, `quoted_property_formula`, …).
 * - Each rule file follows its rule class with the `classes.addRule()` call which defines and registers it.
 */
export const classes = new SpellParser({ module: "classes" })
