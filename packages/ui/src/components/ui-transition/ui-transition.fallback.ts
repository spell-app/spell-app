import { E, UIT } from "$/ui/core"
import { transitionVocabulary } from "./ui-transition.vocabulary.en"
import { DEFAULT_ANIMATION, type Vocabulary } from "./ui-transition.types"

/****************
 * ### `TransitionFallback`
 * The element's box without Solid:  `<div class="ui ... transition [visible]" part="transition"><slot>`, hidden
 * while the host lacks `visible`.
 * - Follows the host's `visible` attribute (a `MutationObserver`) at once, with no animation, and still fires
 *   `ui-show` / `ui-hide` (then `ui-complete`) so a page waiting on them carries on.
 ****************/
export class TransitionFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabulary = transitionVocabulary
  @E.proto static degraded = [
    "every animation:  shows / hides at once;  attention animations don't run",
    "the queue, `interrupt`, `allow-repeats`, `duration`;  the host's `show()` / `hide()` / `toggle()` / " +
      "`transition()` resolve `false` and do nothing (write `visible` instead)"
  ]

  /** The box. */
  private box?: HTMLDivElement

  /** Watches the host's `visible`. */
  private observer?: MutationObserver

  protected override build() {
    this.box = this.decorate(this.create("div", { class: this.boxClasses() }, this.slot()), "transition")
    this.box.hidden = !this.isVisible()
    return [this.box]
  }

  protected override attached() {
    this.observer = new MutationObserver(() => this.sync())
    this.observer.observe(this.host, { attributeFilter: [UIT.VISIBLE] })
  }

  override dispose() {
    this.observer?.disconnect()
    super.dispose()
  }

  /** Show / hide the box as `visible` says;  events only on a change. */
  private sync() {
    const box = this.box
    if (!box) return
    const isVisible = this.isVisible()
    box.className = this.boxClasses()
    if (box.hidden === !isVisible) return
    box.hidden = !isVisible
    const detail: UIT.TransitionDetail = { visible: isVisible, animation: this.attr("animation") ?? DEFAULT_ANIMATION }
    this.fire(isVisible ? SHOW_EVENT : HIDE_EVENT, detail)
    this.fire(COMPLETE_EVENT, detail)
  }

  /** The host's `visible`. */
  private isVisible(): boolean {
    return E.Converters.boolean(this.attr("visible"), UIT.VISIBLE)
  }

  /** The class grammar, plus `visible` while shown. */
  private boxClasses(): string {
    return this.classes(this.isVisible() ? UIT.VISIBLE : undefined)
  }

  /** Dispatch `name` from the host, as the element would. */
  private fire(name: E.EventName<Vocabulary>, detail: UIT.TransitionDetail) {
    this.host.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }))
  }
}

/** Shown:  fired once `visible` is on. */
const SHOW_EVENT: E.EventName<Vocabulary> = "ui-show"

/** Hidden:  fired once `visible` is off. */
const HIDE_EVENT: E.EventName<Vocabulary> = "ui-hide"

/** After either. */
const COMPLETE_EVENT: E.EventName<Vocabulary> = "ui-complete"
