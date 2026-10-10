/**
 * The `core` rule module's parser:  each of its rule files registers on it (`core.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for core rules (whitespace variants, simple datatypes, `keyword`).
 */
export const core = new SpellParser({ module: "core" })
