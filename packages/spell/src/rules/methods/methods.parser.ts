/**
 * The `methods` rule module's parser:  each of its rule files registers on it (`methods.addRule()`),
 * and `rules/index.ts` combines it into `spellParser`.
 * - A file of its own, so a rule file can import it without importing its siblings.
 */
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"

/**
 * Rule module for dynamic method definitions (`to foo ...`, `animation ...`) and their call sites, plus
 * quoted ad-hoc expressions on a type (`a thing "..." if`), and the method-signature/method-arg building
 * blocks they all share.
 * - e.g. signature shapes handled by `method_signature`:
 *   - `to foo the bar`
 *   - `to foo (a thing)`
 *   - `to foo (a thing) in (a thing)`
 *   - `to foo a thing in a pile` -- paren-free:  `a` / `an` + a KNOWN type is an argument (`bare_type_arg`)
 *   - `to foo (bar)`
 *   - `to foo the (bar as text)`
 *   - `to foo (with bar)`
 *   - `to foo (with a bar)`
 *   - `to foo (with baz = "baz")`
 *   - `to foo (with bar as text)`
 *   - `to foo (with bar and baz = "baz" and bong as text)`
 */
export const methods = new SpellParser({ module: "methods" })
