import { Show, createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { nagVocabulary } from "./ui-nag.vocabulary.en"
import { NagFallback } from "./ui-nag.fallback"
import { UINagHost } from "./UINagHost"
import { DismissalStore } from "./DismissalStore"
import type { Vocabulary } from "./ui-nag.types"

import nagCSS from "./ui-nag.css?inline"

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
 * - Invoker commands (`TOGGLE_COMMANDS`):  a `<button commandfor command="--show">` shows it (`show()`), `--close`
 *   closes it (`close()`, so a `key` remembers it), `--toggle` picks by `hidden`.
 * - No role:  a banner that must be announced gets `role` / `aria-live` from the page;  the close icon is a real
 *   `<button>` with a translated label.
 ****************/
export class UINag extends E.UIElement<Vocabulary> {
  @E.proto static vocabulary = nagVocabulary
  @E.proto static styles = { nag: nagCSS }
  @E.proto static Fallback = NagFallback
  @E.proto static Host = UINagHost

  ////////////////
  // ## State
  ////////////////

  /** Glyph of the close icon. */
  readonly closeGlyph = new E.IconGlyph(this, () => (this.attrs.closable ? UIT.CLOSE_ICON : undefined))

  /** Hidden because it was dismissed, now or before (stored):  drives `:state(dismissed)`. */
  readonly isHiddenByDismissal = new E.Cell(untrack(() => this.isHiddenByStorage()))

  /** The nag bar. */
  private root?: HTMLDivElement

  /** Pending `display-time`. */
  private timer?: ReturnType<typeof setTimeout>

  /** Closing:  no second close until it has hidden. */
  private isClosing = false

  /** Appeared (entry animation, `ui-show`, timer) since it last showed. */
  private hasShown = false

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    // SIDE EFFECT:  a stored dismissal hides the host before it first paints
    if (!isServer && untrack(() => this.isHiddenByDismissal.get())) this.host.hidden = true
    const listeners = new AbortController()
    this.host.addEventListener("command", this.onCommand, { signal: listeners.signal })
    this.host.addReleaseCallback(() => {
      clearTimeout(this.timer)
      listeners.abort()
    })
  }

  /** A dismissal is stored (and not expired).  `false` without a `key`. */
  isDismissed(): boolean {
    return this.store()?.isDismissed() ?? false
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected hostStates() {
    return { dismissed: this.isHiddenByDismissal.get() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Adds the effect that makes it appear once connected (and not hidden), then the content.
   * - It waits for the runtime (`loaded`) too, as the render does:  appearing animates the rendered bar.
   */
  mount(): JSX.Element {
    createEffect(
      () => this.connected.get() && this.loaded(),
      (isShowing) => {
        if (isShowing) this.appear()
        return () => clearTimeout(this.timer)
      }
    )
    return super.mount()
  }

  render(): JSX.Element {
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

  /** Entry animation, `ui-show` and the display time -- once per showing. */
  private appear() {
    if (this.hasShown || this.host.hidden) return
    this.hasShown = true
    const time = untrack(() => this.attrs.displayTime) ?? 0
    if (time > 0) this.timer = setTimeout(() => this.close("timeout"), time)
    const root = this.root
    const entered = root
      ? UI.transitions.animate({ element: root, name: SLIDE, direction: UIT.IN })
      : Promise.resolve(true)
    void entered.then(() => {
      if (!this.isClosing) this.emit("ui-show", {})
    })
  }

  ////////////////
  // ## Transitions
  ////////////////

  /**
   * Close for `reason`:  the cancelable `ui-close`, the dismissal stored (not for `timeout`), then the exit
   * animation, `hidden` on the host and `ui-hide`.  True when it closes.
   */
  close(reason: UIT.NagCloseReason = "dismiss", originalEvent?: Event): boolean {
    if (this.isClosing || this.host.hidden) return false
    const detail: UIT.NagCloseDetail = { reason, originalEvent }
    if (!this.emit("ui-close", detail)) return false
    this.isClosing = true
    clearTimeout(this.timer)
    if (reason !== "timeout") {
      this.store()?.dismiss()
      this.isHiddenByDismissal.set(true)
    }
    const root = this.root
    const exited = root
      ? UI.transitions.animate({ element: root, name: SLIDE, direction: UIT.OUT })
      : Promise.resolve(true)
    void exited.then(() => {
      this.isClosing = false
      this.hasShown = false
      this.host.hidden = true
      const hidden: UIT.NagCloseDetail = { reason }
      this.emit("ui-hide", hidden)
    })
    return true
  }

  /** Show again, unless a stored dismissal says not (and it doesn't `persist`).  True when it shows. */
  show(): boolean {
    if (this.isHiddenByStorage() || this.isClosing || (!this.host.hidden && this.hasShown)) return false
    this.isHiddenByDismissal.set(false)
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

  /** An invoker command aimed at the host (`TOGGLE_COMMANDS`):  open means not `hidden`. */
  private readonly onCommand = (event: Event) => {
    const action = UIT.ToggleCommands.action(event, !this.host.hidden)
    if (action === "show") this.show()
    else if (action === "close") this.close("dismiss", event)
  }

  /** Close icon:  dismiss (and remember). */
  private readonly onCloseIcon = (event: MouseEvent) => {
    event.stopPropagation()
    this.close("close", event)
  }

  ////////////////
  // ## Storage
  ////////////////

  /** A stored dismissal hides it:  dismissed, and not `persist`. */
  private isHiddenByStorage(): boolean {
    return !this.attrs.persist && this.isDismissed()
  }

  /** The dismissal store for the current attributes, or `undefined` without a `key`. */
  private store(): DismissalStore | undefined {
    return untrack(() => {
      const { key, value, storage, expires, path, domain, secure, samesite } = this.attrs
      if (!key) return undefined
      return new DismissalStore({
        storage: (storage ?? DEFAULT_STORAGE) as UIT.NagStorage,
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

/** `UI.transitions` animation in and out (Fomantic's `slide`). */
const SLIDE = "slide-down"

/** Storage of a nag that names none:  Fomantic's default. */
const DEFAULT_STORAGE: UIT.NagStorage = "cookie"

/** Value a dismissal stores by default. */
const DEFAULT_VALUE = "dismiss"

/** Days a dismissal lasts by default. */
const DEFAULT_EXPIRES = 30
