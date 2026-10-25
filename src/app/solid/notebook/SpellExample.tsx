import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "spell-ui/core"
import { spellExampleVocabulary } from "./SpellExample.en"

import exampleCSS from "./SpellExample.css?inline"

/****************
 * ### `SpellExample`
 * The component behind `<spell-example>`:  a notebook's example (epic `elemental-spell` P16).
 * - A frame holding its title, its live result (the default slot) and its code (the `code` slot), as a component
 *   page's examples look.
 * - A notebook's `<example "one counter">` compiles to it:  `h("spell-example", { name: "one counter" }, ...)`.
 * - Knows nothing of the notebook:  `<NotebookPage>` puts each example's code in its `code` slot, an editor in edit
 *   mode, and finds it by its place.
 * - The editor app's own:  a page that doesn't define it (a `<spell-viewer>` elsewhere) shows the result alone.
 ****************/
export class SpellExample extends E.UIComponent<typeof spellExampleVocabulary> {
  @E.proto static vocabulary = spellExampleVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { example: exampleCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <section class="SpellExample" part={this.partForName("example")}>
        <Show when={this.name}>
          <div class="title" part={this.partForName("title")}>
            {this.name}
          </div>
        </Show>
        <div class="result" part={this.partForName("result")}>
          <slot />
        </div>
        <slot name="code" />
      </section>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface SpellExample extends E.AttributeValues<typeof spellExampleVocabulary> {}
