import { Converters, NativeFallback, proto, type EventName, type TransitionDetail } from "$/core"

import { transitionVocabulary } from "./transition.vocabulary.en"

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
    const detail: TransitionDetail = { visible, animation: this.attr("animation") ?? DEFAULT_ANIMATION }
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
  private fire(name: EventName<typeof transitionVocabulary>, detail: TransitionDetail) {
    this.host.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }))
  }
}

/** The host attribute it follows, and the class word it adds while shown. */
const VISIBLE = "visible"

/** Default of `animation` (the vocabulary's). */
const DEFAULT_ANIMATION = "fade"

/** Events it still fires, checked against the vocabulary. */
const SHOW: EventName<typeof transitionVocabulary> = "ui-show"
const HIDE: EventName<typeof transitionVocabulary> = "ui-hide"
const COMPLETE: EventName<typeof transitionVocabulary> = "ui-complete"
