import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicUpdatedVocabulary } from "./EpicUpdated.en"
import { ICON, LABEL, TEXT } from "./EpicPhase.types"

import fieldCSS from "./EpicField.css?inline"

/****************
 * ### `EpicUpdated`
 * The component behind `<epic-updated>`:  one dated change to a phase's plan, FENCED under its Symptom / Changes (a
 * dashed orange box) -- its icon, `Updated` and the time (`at`, to the minute), the phase under way then, then what
 * changed (its children).
 * - Kept once the phase is done:  the record of how the plan moved.
 * - A copy in the Phases section's Plan changes box (`of`, the phase it changes) leads with a `P5` link to it.
 ****************/
export class EpicUpdated extends E.UIComponent<typeof epicUpdatedVocabulary> {
  @E.proto static vocabulary = epicUpdatedVocabulary
  @E.proto static styleSheets = { "epic-field": fieldCSS }

  /** Its icon. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => "pen to square" })

  /** `at`, as shown:  `2026-10-06 14:30`. */
  get shownTime(): string {
    const at = this.at ?? ""
    const match = SHOWN_TIME.exec(at)
    return match ? [match[1], match[2]].filter(Boolean).join(" ") : at
  }

  render(): JSX.Element {
    return (
      <div class={[this.rootClasses, UPDATED]} part={this.partForName("base")}>
        <span class={ICON} part={this.partForName("icon")} aria-hidden="true">
          {this.glyph.svg}
        </span>
        <div class={TEXT}>
          <span class={LABEL} part={this.partForName("label")}>
            <Show when={this.of}>
              {(of) => (
                <a class="of" href={`#p${of()}`}>
                  {this.translationForKey("of", { phase: of() })}
                </a>
              )}
            </Show>
            <b>{this.translationForKey("updated")}</b> <time datetime={this.at}>{this.shownTime}</time>
            <Show when={this.phase}>
              {(phase) => <span class="during">{this.translationForKey("during", { phase: phase() })}</span>}
            </Show>
          </span>{" "}
          <slot />
        </div>
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicUpdated extends E.AttributeValues<typeof epicUpdatedVocabulary> {}

/** An `at` time as shown:  `2026-10-06T14:30-04:00` => `2026-10-06 14:30`. */
const SHOWN_TIME = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}))?/

/** Class word of its box:  fenced, dashed orange. */
const UPDATED = "updated"
