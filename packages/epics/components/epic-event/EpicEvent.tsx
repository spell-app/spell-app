import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicEventVocabulary } from "./EpicEvent.en"

import eventCSS from "./EpicEvent.css?inline"

/****************
 * ### `EpicEvent`
 * The component behind `<epic-event>`:  one line of the log -- its icon (`icon`, default `pen to square`), its time
 * to the minute (`at`), then what happened (its children).
 * - A row:  the icon centred on the first line, the time in mono, the text wrapping beside them;
 *   too narrow, the text wraps under the time.
 ****************/
export class EpicEvent extends E.UIComponent<typeof epicEventVocabulary> {
  @E.proto static vocabulary = epicEventVocabulary
  @E.protoMerged static elementSetup = { styleSheets: { "epic-event": eventCSS } } satisfies Partial<E.ElementSetup>

  /** Its icon. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => this.icon || DEFAULT_ICON })

  /** `at`, as shown:  `2026-10-06 08:12`. */
  get shownTime(): string {
    const at = this.at ?? ""
    const match = SHOWN_TIME.exec(at)
    return match ? [match[1], match[2]].filter(Boolean).join(" ") : at
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <span class={ICON} part={this.partForName("icon")} aria-hidden="true">
          {this.glyph.svg}
        </span>
        <span class={TEXT}>
          <time class={TIME} part={this.partForName("time")} datetime={this.at}>
            {this.shownTime}
          </time>{" "}
          <slot />
        </span>
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicEvent extends E.AttributeValues<typeof epicEventVocabulary> {}

/** Its icon without an `icon` attribute. */
const DEFAULT_ICON = "pen to square"

/** An `at` time as shown:  `2026-10-06T08:12-04:00` => `2026-10-06 08:12`. */
const SHOWN_TIME = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}))?/

/** Classes of the shadow markup. */
const ICON = "icon"
const TIME = "time"
const TEXT = "text"
