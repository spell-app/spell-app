import { E, UIT } from "$/ui/core"
import { popupVocabulary } from "./ui-popup.vocabulary.en"
import { DEFAULT_POSITION, type Vocabulary } from "./ui-popup.types"

/****************
 * ### `PopupFallback`
 * The element's markup, plain DOM, never shown:  `<div part="popup" class="ui ... popup [position]">` with the
 * `header` / `content` shorthands and the slot, in a host that stays closed (`ui-popup.css` hides a host that isn't
 * `:popover-open`).
 * - Nothing harmful:  no positioning, no listeners on the page, no overlay.  What remains is the NATIVE tooltip:
 *   a tooltip-like popup (`on` isn't `click`) copies its text into the target's `title` when the target has
 *   none, removed again on dispose.
 ****************/
export class PopupFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabulary = popupVocabulary
  @E.proto static degraded = [
    "showing it:  no popover, positioning, triggers, invoker commands, `ui-open` / `ui-close` or Escape;  a tooltip's text becomes " +
      "the target's native `title`",
    "click popups (`on=click`):  nothing at all"
  ]

  /** Target whose `title` this fallback set, to undo on dispose. */
  private titled?: Element

  protected override build() {
    const header = this.attr("header")
    const content = this.attr("content")
    const popup = this.create("div", { class: this.classes(this.attr("position") ?? DEFAULT_POSITION) })
    if (header) popup.append(this.create("div", { class: UIT.HEADER, part: UIT.HEADER }, header))
    if (content) popup.append(this.create("div", { class: UIT.CONTENT, part: UIT.CONTENT }, content))
    popup.append(this.slot())
    return [this.decorate(popup, "popup")]
  }

  /** Copies a tooltip's text into its target's `title`, which needs the host attached (its target is a sibling). */
  protected override attached() {
    if (this.attr("on") === UIT.PopupTrigger.click) return
    const target = this.target()
    const text = [this.attr("header"), this.attr("content"), this.host.textContent?.trim()].filter(Boolean).join(" -- ")
    if (!target || !text || target.hasAttribute(UIT.TITLE)) return
    target.setAttribute(UIT.TITLE, text)
    this.titled = target
  }

  /** Takes the `title` it set off the target again. */
  override dispose() {
    this.titled?.removeAttribute(UIT.TITLE)
    this.titled = undefined
    super.dispose()
  }

  /** The element `for` names in the host's tree, else the previous element sibling. */
  private target(): Element | undefined {
    const id = this.attr("for")
    if (id) return (this.host.getRootNode() as Document | ShadowRoot).getElementById?.(id) ?? undefined
    return this.host.previousElementSibling ?? undefined
  }
}
