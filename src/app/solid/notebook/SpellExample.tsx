import { E } from "spell-ui/core"
import { UIExample } from "spell-ui/components/ui-example"
import { spellExampleVocabulary } from "./SpellExample.en"

/****************
 * ### `vocabulary`
 * `<spell-example>`'s whole vocabulary:  `<ui-example>`'s names, its own added (`SpellExample.en.ts`).
 * - Above the component:  its `@E.proto static vocabulary` reads it while the class is built.
 ****************/
const EXAMPLE_VOCABULARY = UIExample.describe()
const vocabulary = {
  ...EXAMPLE_VOCABULARY,
  ...spellExampleVocabulary,
  attributes: [...EXAMPLE_VOCABULARY.attributes, ...spellExampleVocabulary.attributes],
  events: EXAMPLE_VOCABULARY.events,
  slots: EXAMPLE_VOCABULARY.slots,
  parts: EXAMPLE_VOCABULARY.parts,
  states: EXAMPLE_VOCABULARY.states,
  texts: EXAMPLE_VOCABULARY.texts
} satisfies E.ComponentVocabulary

/****************
 * ### `SpellExample`
 * The component behind `<spell-example>`:  a notebook's example (epic `elemental-spell` P16),
 * drawn as a component page's examples are.
 * - It IS a `<ui-example>`:  its heading, its description, its live result in a frame,
 *   and the `</>` button that rolls its code open under it, closed at first.
 * - Its heading is its `name`:  a notebook's `<example "one counter">` compiles to
 *   `h("spell-example", { name: "one counter" }, ...)`.
 * - Knows nothing of the notebook:  `<NotebookPage>` puts each example's code in its `source` slot (an editor), and
 *   the text before it in its `description` slot, and finds it by its place.
 * - The editor app's own:  a page that doesn't define it (a `<spell-viewer>` elsewhere) shows the result alone.
 ****************/
export class SpellExample extends UIExample {
  @E.proto static vocabulary: E.ComponentVocabulary = vocabulary

  /** Its heading:  its `name`. */
  get heading(): string | undefined {
    return this.name
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface SpellExample extends E.AttributeValues<typeof spellExampleVocabulary> {}
