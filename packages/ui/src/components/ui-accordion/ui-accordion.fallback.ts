import { E, UIT } from "$/ui/core"
import { accordionVocabulary } from "./ui-accordion.vocabulary.en"
import { AccordionPanels } from "./AccordionPanels"
import {
  ACTIVE_CONTENT,
  ACTIVE_TITLE,
  CONTENT_PART,
  DETAILS_GROUP,
  DROPDOWN_ICON,
  TITLE_PART
} from "./ui-accordion.types"

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
export class AccordionFallback extends E.NativeFallback<typeof accordionVocabulary> {
  @E.proto static vocabulary = accordionVocabulary
  @E.proto static degraded = [
    "`ui-open` / `ui-close` and their veto;  the host's `open` doesn't follow the panels",
    '`collapsible="no"`',
    "the open / close animation, the arrow keys between titles",
    "a nested accordion's inherited look (it keeps `ui` and its own words)",
    "children added or moved later (the panels are read once)"
  ]

  protected override build() {
    // absent ~== the vocabulary's default, `true`;  `exclusive="no"` ~== false
    const exclusive = this.host.hasAttribute(EXCLUSIVE) ? this.flag(EXCLUSIVE) : true
    const open = AccordionPanels.parse(this.attr("open"), { exclusive })
    const panels = AccordionPanels.read(this.host, (element) => element.localName === TITLE_TAG).map(
      ({ title, content }, index) => {
        const isActive = open.includes(index)
        const summarySlot = this.slot()
        summarySlot.assign(title)
        const summary = this.create(
          "summary",
          { class: isActive ? ACTIVE_TITLE : UIT.TITLE, part: TITLE_PART },
          this.create("span", { class: DROPDOWN_ICON, part: ICON_PART, "aria-hidden": "true" }),
          summarySlot
        )
        const box = this.create("div", { class: isActive ? ACTIVE_CONTENT : UIT.CONTENT, part: CONTENT_PART })
        if (content) {
          const contentSlot = this.slot()
          contentSlot.assign(content)
          box.append(contentSlot)
        }
        const name = exclusive ? DETAILS_GROUP : undefined
        return this.create("details", { part: PANEL_PART, name, open: isActive }, summary, box)
      }
    )
    return [this.decorate(this.create("div", { class: this.classes() }, ...panels), "accordion")]
  }
}

/** Behaviour attribute read here, not in `classes()`. */
const EXCLUSIVE = "exclusive"

/** Canonical tag of a title child (`ui-parts`:  another family, not imported). */
const TITLE_TAG = "ui-title"

/** Part of a panel's `<details>`. */
const PANEL_PART = "panel"

/** Part of the arrow in a title. */
const ICON_PART = "icon"
