/**
 * The `JSX` rule module's parser:  each of its rule files registers on it (`JSX.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for JSX rules (`jsxElement`, `jsxAttribute`, `jsxText`, `jsxEndTag`, `jsxExpression`).
 */
export const JSX = new SpellParser({ module: "JSX" })
