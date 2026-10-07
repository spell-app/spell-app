import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicEventVocabulary } from "./epic-event.vocabulary.en"
import { EpicEventFallback } from "./epic-event.fallback"
import type { EpicEventVocabulary } from "./epic-event.types"

import eventCSS from "./epic-event.css?inline"

/****************
 * ### `<epic-event>`
 * One line of the plan's log.
 * - P4:  shows its children through its slots, nothing more;  its icon and time:  P5's
 ****************/
export class EpicEvent extends UIElement<EpicEventVocabulary> {
  @proto static vocabulary = epicEventVocabulary
  @proto static styles = { event: eventCSS }
  @proto static Fallback = EpicEventFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
