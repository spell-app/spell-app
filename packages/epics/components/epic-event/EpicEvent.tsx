import { createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { IconGlyph, proto, UIElement, UIT } from "$/ui/core"

import { epicEventVocabulary } from "./epic-event.vocabulary.en"
import { EpicEventFallback } from "./epic-event.fallback"
import { DEFAULT_ICON, ICON, SHOWN_TIME, TEXT, TIME, type EpicEventVocabulary } from "./epic-event.types"

import eventCSS from "./epic-event.css?inline"

/****************
 * ### `<epic-event>`
 * One line of the log:  its icon (`icon`, default `pen to square`), its time to the minute (`at`), then what
 * happened (its children).
 * - A row:  the icon centred on the first line, the time in mono, the text wrapping beside them;  too narrow, the
 *   text wraps under the time.
 ****************/
export class EpicEvent extends UIElement<EpicEventVocabulary> {
  @proto static vocabulary = epicEventVocabulary
  @proto static styles = { "epic-event": eventCSS }
  @proto static Fallback = EpicEventFallback

  /** Its icon. */
  readonly glyph = new IconGlyph(this, () => this.attrs.icon || DEFAULT_ICON)

  /** `at`, as shown:  `2026-10-06 08:12`. */
  readonly time = createMemo(() => {
    const at = this.attrs.at ?? ""
    const match = SHOWN_TIME.exec(at)
    return match ? [match[1], match[2]].filter(Boolean).join(" ") : at
  })

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <span class={ICON} part={this.part("icon")} aria-hidden={UIT.TRUE}>
          {this.glyph.svg()}
        </span>
        <span class={TEXT}>
          <time class={TIME} part={this.part("time")} datetime={this.attrs.at}>
            {this.time()}
          </time>{" "}
          <slot />
        </span>
      </div>
    )
  }
}
