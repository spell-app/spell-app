/**
 * The `lists` rule module's parser:  each of its rule files registers on it (`lists.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for list rules -- literals, membership, indexing, in-place mutation, iteration.
 */
export const lists = new SpellParser({ module: "lists" })
