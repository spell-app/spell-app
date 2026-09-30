import { NativeFallback, proto } from "$/core"

import { accordionVocabulary } from "./accordion.vocabulary.en"
import { AccordionPanels } from "./AccordionPanels"

/****************
 * ### `AccordionFallback`
 * The accordion's markup without Solid:  the same `<details>` panels, which keep working on their own.
 * - `<div class="ui ... accordion" part="accordion">`, then per `<ui-title>` + next-element pair a
 *   `<details part="panel">` (`name`d while `exclusive`, `open` per the host's `open`) holding
 *   `<summary class="title">` and `<div class="content">`, each around a `<slot>` assigned its child by hand (the
 *   host's shadow root assigns slots manually).
 * - Native disclosure stays:  clicking a title toggles it, an exclusive group closes the others, find-in-page
 *   opens a panel.
 ****************/
export class AccordionFallback extends NativeFallback<typeof accordionVocabulary> {
  @proto static vocabulary = accordionVocabulary
  @proto static degraded = [
    "`ui-open` / `ui-close` and their veto;  the host's `open` doesn't follow the panels",
    '`collapsible="no"`',
    "the open / close animation, the arrow keys between titles",
    "a nested accordion's inherited look (it keeps `ui` and its own words)",
    "children added or moved later (the panels are read once)"
  ]

  protected override build() {
    // absent ~== the vocabulary's default, `true`;  `exclusive="no"` ~== false
    const exclusive = this.host.hasAttribute(EXCLUSIVE) ? this.flag(EXCLUSIVE) : true
    const open = AccordionPanels.parse(this.attr("open"), exclusive)
    const panels = AccordionPanels.read(this.host, (element) => element.localName === TITLE_TAG).map(
      ({ title, content }, index) => {
        const active = open.includes(index)
        const summarySlot = this.slot()
        summarySlot.assign(title)
        const summary = this.create(
          "summary",
          { class: active ? ACTIVE_TITLE : TITLE, part: TITLE_PART },
          this.create("span", { class: ICON, part: ICON_PART, "aria-hidden": "true" }),
          summarySlot
        )
        const box = this.create("div", { class: active ? ACTIVE_CONTENT : CONTENT, part: CONTENT_PART })
        if (content) {
          const contentSlot = this.slot()
          contentSlot.assign(content)
          box.append(contentSlot)
        }
        return this.create("details", { part: PANEL_PART, name: exclusive ? GROUP : null, open: active }, summary, box)
      }
    )
    return [this.decorate(this.create("div", { class: this.classes() }, ...panels), "accordion")]
  }
}

/** Canonical tag of a title child (`parts`:  another family, not imported). */
const TITLE_TAG = "ui-title"

/** Behaviour attribute read here, not in `classes()`. */
const EXCLUSIVE = "exclusive"

/** Shared `name` of an exclusive group, as the element's. */
const GROUP = "panels"

/** Class words and parts, as the element renders them. */
const TITLE = "title"
const ACTIVE_TITLE = "active title"
const CONTENT = "content"
const ACTIVE_CONTENT = "active content"
const ICON = "dropdown icon"
const PANEL_PART = "panel"
const TITLE_PART = "title"
const ICON_PART = "icon"
const CONTENT_PART = "content"
