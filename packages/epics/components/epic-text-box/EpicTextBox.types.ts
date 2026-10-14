/**
 * `<epic-text-box>` in JSX:  the tag the families that draw a box in their shadow roots write
 * (`<epic-ask>`'s Other, `<epic-option>`'s comment on an answering page, `<epic-choices-bar>`'s feedback).
 * - Types only.
 */
import type { UIJSXAttributes } from "$/epics/components/epic-page/EpicPage.types"

declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      "epic-text-box": UIJSXAttributes
    }
  }
}
