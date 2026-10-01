import { Converters, NativeFallback, proto, type EventName, UIT } from "$/ui/core"

import { transitionVocabulary } from "./ui-transition.vocabulary.en"
import { DEFAULT_ANIMATION, SHOW, HIDE, COMPLETE } from "./ui-transition.types"
import { VISIBLE } from "$/ui/components/components.types"

/****************
 * ### `TransitionFallback`
 * The element's box without Solid:  `<div class="ui ... transition [visible]" part="transition"><slot>`, hidden
 * while the host lacks `visible`.
 * - Follows the host's `visible` attribute (a `MutationObserver`) at once, with no animation, and still fires
 *   `ui-show` / `ui-hide` (then `ui-complete`) so a page waiting on them carries on.
 ****************/
export class TransitionFallback extends NativeFallback<typeof transitionVocabulary> {
  @proto static vocabulary = transitionVocabulary
  @proto static degraded = [
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
    this.box.hidden = !this.visible()
    return [this.box]
  }

  protected override attached() {
    this.observer = new MutationObserver(() => this.sync())
    this.observer.observe(this.host, { attributeFilter: [VISIBLE] })
  }

  override dispose() {
    this.observer?.disconnect()
    super.dispose()
  }

  /** Show / hide the box as `visible` says;  events only on a change. */
  private sync() {
    const box = this.box
    if (!box) return
    const visible = this.visible()
    box.className = this.boxClasses()
    if (box.hidden === !visible) return
    box.hidden = !visible
    const detail: UIT.TransitionDetail = { visible, animation: this.attr("animation") ?? DEFAULT_ANIMATION }
    this.fire(visible ? SHOW : HIDE, detail)
    this.fire(COMPLETE, detail)
  }

  /** The host's `visible`. */
  private visible(): boolean {
    return Converters.boolean(this.host.getAttribute(VISIBLE), VISIBLE)
  }

  /** The class grammar, plus `visible` while shown. */
  private boxClasses(): string {
    return this.classes(this.visible() ? VISIBLE : undefined)
  }

  /** Dispatch `name` from the host, as the element would. */
  private fire(name: EventName<typeof transitionVocabulary>, detail: UIT.TransitionDetail) {
    this.host.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }))
  }
}
