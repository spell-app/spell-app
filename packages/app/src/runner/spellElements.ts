/**
 * What compiled TypeScript imports as `@spell/elements` (`SC.SPELL_ELEMENTS_MODULE`):
 * the base of a drawable type's element class (epic `drawable-thing` P10, J41).
 *
 * ```ts
 * import { E, SpellElement } from "@spell/elements"
 *
 * export class CardElement extends SpellElement<Card> {
 *   @E.proto static vocabulary = SpellElement.vocabularyFor("solitaire-card", "card", [...])
 * }
 * spellCore.useElement(Card, CardElement)
 * ```
 *
 * - `SpellElement`:  the element every drawable thing draws as, which the class builds on.
 * - `E`:  Spell UI's element core, for its decorators (`@E.proto`) and types (`E.ElementSetup`).
 * - A module name of its own, since core never imports Spell UI.
 * - It's resolved in three places:
 *   - a page:  the runtime exports `SpellElement` too, and `E`'s two decorators (`spellRuntime.ts`),
 *     and `runCompiled()` points the name at it
 *   - the type check:  this file (`typecheck()` in spell's `node/typecheck.ts`)
 *   - the headless run, with no Spell UI:  a stand-in of the same shape, cli's `runner/spellElements.mjs`
 */
export { E } from "$/ui/core"
export { SpellElement } from "./SpellElement"
