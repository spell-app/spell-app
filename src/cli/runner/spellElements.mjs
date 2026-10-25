/**
 * A stand-in for `@spell/elements` in the headless run (`spell run`, the core contract):
 * what compiled TypeScript's element classes build on, with no Spell UI (epic `drawable-thing` P10, J41).
 * - The real one is app's `src/runner/spellElements.ts`:  `SpellElement` and Spell UI's `E`.
 * - Spell UI can't load under node:  its core imports its own CSS files, which only Vite loads.
 * - Enough for `class CardElement extends SpellElement<Card> { @E.proto static vocabulary = ... }` to load:
 *   - `SpellElement`:  an empty class, with the one helper an element class calls as it's made, `vocabularyFor()`
 *   - `E`:  the two decorators an element class uses, doing nothing
 * - Nothing draws it:  there's no page definer, so `core.useElement()` only keeps the class,
 *   and the program prints what its javascript prints.
 * - `hooks.mjs` points `@spell/elements` here.
 */

/** The element every view's element class builds on:  here, nothing. */
export class SpellElement {
  /** As the real one's:  the vocabulary an element class says, as it's written. */
  static vocabularyFor(tag, noun, attributes) {
    return { tag, noun, attributes }
  }
}

/** Spell UI's element core:  only the decorators an element class uses, leaving each value as it is. */
export const E = {
  proto() {},
  protoMerged() {}
}
