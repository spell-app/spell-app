import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { IconGlyph, proto, UIElement, UIT } from "$/ui/core"

import { epicUpdatedVocabulary } from "./epic-updated.vocabulary.en"
import { ICON, LABEL, SHOWN_TIME, TEXT, UPDATED, type EpicUpdatedVocabulary } from "./epic-phase.types"

import fieldCSS from "./epic-field.css?inline"

/****************
 * ### `<epic-updated>`
 * One dated change to a phase's plan, FENCED under its Symptom / Changes (a dashed orange box):  its icon, `Updated`
 * and the time (`at`, to the minute), the phase under way then, then what changed (its children).
 * - Kept once the phase is done:  the record of how the plan moved.
 ****************/
export class EpicUpdated extends UIElement<EpicUpdatedVocabulary> {
  @proto static vocabulary = epicUpdatedVocabulary
  @proto static styles = { "epic-field": fieldCSS }

  /** Its icon. */
  readonly glyph = new IconGlyph(this, () => "pen to square")

  /** `at`, as shown:  `2026-10-06 14:30`. */
  readonly time = createMemo(() => {
    const at = this.attrs.at ?? ""
    const match = SHOWN_TIME.exec(at)
    return match ? [match[1], match[2]].filter(Boolean).join(" ") : at
  })

  render(): JSX.Element {
    return (
      <div class={[this.classes(), UPDATED]} part={this.part("base")}>
        <span class={ICON} part={this.part("icon")} aria-hidden={UIT.TRUE}>
          {this.glyph.svg()}
        </span>
        <div class={TEXT}>
          <span class={LABEL} part={this.part("label")}>
            <b>{this.text("updated")}</b> <time datetime={this.attrs.at}>{this.time()}</time>
            <Show when={this.attrs.phase}>
              {(phase) => <span class="during">{this.text("during", { phase: phase() })}</span>}
            </Show>
          </span>{" "}
          <slot />
        </div>
      </div>
    )
  }
}
