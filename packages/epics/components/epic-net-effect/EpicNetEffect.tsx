import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicNetEffectVocabulary } from "./EpicNetEffect.en"

import netEffectCSS from "./EpicNetEffect.css?inline"

/****************
 * ### `EpicNetEffect`
 * The component behind `<epic-net-effect>`:
 * a "Net effect" list, one look wherever it sits (an item's text, a reply, an option card, an Overview sub-section).
 * - Draws only its label, a line of its own:
 *   `Net effect:`, `Net effect (A):`, `Net effect (A, recommended):`
 *   (the word in grey, as `(recommended)` is everywhere);  neutral, no colour of its own (Q20).
 * - The list under it is its light children, through the default slot:
 *   find-in-page, `#id` links and the live update see them (Q12).
 * - `flow` in its definition:  allowed wherever prose is, so a parent's content model needn't list it.
 ****************/
export class EpicNetEffect extends E.UIComponent<typeof epicNetEffectVocabulary> {
  @E.proto static vocabulary = epicNetEffectVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-net-effect": netEffectCSS },
    // `disabled`:  only a look (the sheet dims it), so the text stays findable;  `loading`:  the shared spinner
    disabled: "its own",
    loading: "loader"
  } satisfies Partial<E.ElementSetup>

  /** Has it a `(A, recommended)` after `Net effect`?  The colon goes after that, else inside the bold label. */
  get hasQualifier(): boolean {
    return !!this.option || !!this.recommended
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <div class={LABEL} part={this.partForName("label")}>
          <b>
            {this.translationForKey("label")}
            {this.hasQualifier ? "" : ":"}
          </b>
          <Show when={this.hasQualifier}>
            {" "}
            <span class={OPTION} part={this.partForName("option")}>
              ({this.option}
              <Show when={this.recommended}>
                {this.option ? ", " : ""}
                <span class={RECOMMENDED} part={this.partForName("recommended")}>
                  {this.translationForKey("recommended")}
                </span>
              </Show>
              )
            </span>
            :
          </Show>
        </div>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicNetEffect extends E.AttributeValues<typeof epicNetEffectVocabulary> {}

/** Classes of the shadow markup:  the label line, its `(A, recommended)`, the grey word. */
const LABEL = "label"
const OPTION = "option"
const RECOMMENDED = "recommended"
