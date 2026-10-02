import { Show, createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, IconGlyph, proto, UI, UIElement, UIT } from "$/ui/core"

import { nagVocabulary } from "./ui-nag.vocabulary.en"
import { NagFallback } from "./ui-nag.fallback"
import { UINagHost } from "./UINagHost"
import { DismissalStore } from "./DismissalStore"

import nagCSS from "./ui-nag.css?inline"
import { COOKIE, DEFAULT_VALUE, DEFAULT_EXPIRES, TIMEOUT, DISMISS, SLIDE, type Vocabulary } from "./ui-nag.types"

/****************
 * ### `<ui-nag>`
 * A nag:  `<div class="ui ... nag" part="nag">` around the slot, with a close icon -- a bar at the top (or `bottom`)
 * of the page or its container that stays until dismissed, and can remember the dismissal.
 * - Remembering (opt-in, with `key`):  closing it from its icon (or `host.close()`) stores `value` under `key` in
 *   `storage` (`DismissalStore`:  local / session / cookie, `expires` days);  a nag whose dismissal is stored is
 *   `hidden` from the start -- set on the HOST as it first connects, before anything paints -- unless it
 *   `persist`s.  Storage that is blocked or missing just doesn't remember:  the nag still shows and closes.
 * - Closing:  the cancelable `ui-close` (with a `reason`) first, then the exit animation (Fomantic's `slide`), `hidden`
 *   on the HOST and `ui-hide`.  It never removes itself.  `display-time` hides it without storing anything.
 * - No role:  a banner that must be announced gets `role` / `aria-live` from the page;  the close icon is a real
 *   `<button>` with a translated label.
 ****************/
export class UINag extends UIElement<Vocabulary> {
  @proto static vocabulary = nagVocabulary
  @proto static styles = { nag: nagCSS }
  @proto static Fallback = NagFallback
  @proto static Host = UINagHost

  ////////////////
  // ## State
  ////////////////

  /** Glyph of the close icon. */
  readonly closeGlyph = new IconGlyph(this, () => (this.attrs.closable ? UIT.CLOSE_ICON : undefined))

  /** Hidden because it was dismissed, now or before (stored). */
  readonly dismissedState = new Cell(untrack(() => this.hiddenByStorage()))

  /** The nag bar. */
  private root?: HTMLDivElement

  /** Pending `display-time`. */
  private timer?: ReturnType<typeof setTimeout>

  /** Closing:  no second close until it has hidden. */
  private closing = false

  /** Appeared (entry animation, `ui-show`, timer) since it last showed. */
  private shown = false

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    // SIDE EFFECT:  a stored dismissal hides the host before it first paints
    if (!isServer && untrack(() => this.dismissedState.get())) this.host.hidden = true
    this.host.addReleaseCallback(() => clearTimeout(this.timer))
  }

  /** A dismissal is stored (and not expired).  `false` without a `key`. */
  isDismissed(): boolean {
    return this.store()?.isDismissed() ?? false
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected hostStates() {
    return { dismissed: this.dismissedState.get() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.effects()
    return (
      <div ref={(element) => (this.root = element)} class={this.classes()} part={this.part("nag")}>
        <slot />
        <Show when={this.attrs.closable}>
          <button
            type="button"
            class={UIT.CLOSE_CLASS}
            part={this.part("close")}
            aria-label={this.text("close")}
            onClick={this.onCloseIcon}
          >
            {this.closeGlyph.svg()}
          </button>
        </Show>
      </div>
    )
  }

  /** Appear once connected (and not hidden). */
  private effects() {
    createEffect(
      () => this.connected.get(),
      (connected) => {
        if (connected) this.appear()
        return () => clearTimeout(this.timer)
      }
    )
  }

  /** Entry animation, `ui-show` and the display time -- once per showing. */
  private appear() {
    if (this.shown || this.host.hidden) return
    this.shown = true
    const time = untrack(() => this.attrs.displayTime) ?? 0
    if (time > 0) this.timer = setTimeout(() => this.close(TIMEOUT), time)
    const root = this.root
    void (root ? UI.transitions.animate(root, SLIDE, UIT.IN) : Promise.resolve(true)).then(() => {
      if (!this.closing) this.emit("ui-show", {})
    })
  }

  ////////////////
  // ## Transitions
  ////////////////

  /**
   * Close for `reason`:  the cancelable `ui-close`, the dismissal stored (not for `timeout`), then the exit
   * animation, `hidden` on the host and `ui-hide`.  True when it closes.
   */
  close(reason: UIT.NagCloseReason = DISMISS, originalEvent?: Event): boolean {
    if (this.closing || this.host.hidden) return false
    const detail: UIT.NagCloseDetail = { reason, originalEvent }
    if (!this.emit("ui-close", detail)) return false
    this.closing = true
    clearTimeout(this.timer)
    if (reason !== TIMEOUT) {
      this.store()?.dismiss()
      this.dismissedState.set(true)
    }
    const root = this.root
    void (root ? UI.transitions.animate(root, SLIDE, UIT.OUT) : Promise.resolve(true)).then(() => {
      this.closing = false
      this.shown = false
      this.host.hidden = true
      const hidden: UIT.NagCloseDetail = { reason }
      this.emit("ui-hide", hidden)
    })
    return true
  }

  /** Show again, unless a stored dismissal says not (and it doesn't `persist`).  True when it shows. */
  show(): boolean {
    if (this.hiddenByStorage() || this.closing || (!this.host.hidden && this.shown)) return false
    this.dismissedState.set(false)
    this.host.hidden = false
    this.appear()
    return true
  }

  /** Forget a stored dismissal. */
  clear() {
    this.store()?.clear()
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Close icon:  dismiss (and remember). */
  private readonly onCloseIcon = (event: MouseEvent) => {
    event.stopPropagation()
    this.close(UIT.CLOSE, event)
  }

  ////////////////
  // ## Storage
  ////////////////

  /** A stored dismissal hides it:  dismissed, and not `persist`. */
  private hiddenByStorage(): boolean {
    return !this.attrs.persist && this.isDismissed()
  }

  /** The dismissal store for the current attributes, or `undefined` without a `key`. */
  private store(): DismissalStore | undefined {
    return untrack(() => {
      const { key, value, storage, expires, path, domain, secure, samesite } = this.attrs
      if (!key) return undefined
      return new DismissalStore({
        storage: (storage ?? COOKIE) as UIT.NagStorage,
        key,
        value: value ?? DEFAULT_VALUE,
        expires: expires ?? DEFAULT_EXPIRES,
        cookie: {
          path: path ?? undefined,
          domain: domain ?? undefined,
          secure: !!secure,
          sameSite: samesite ?? undefined
        }
      })
    })
  }
}
