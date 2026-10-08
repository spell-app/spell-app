import { Show, untrack } from "solid-js"
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
 * - Invoker commands (`ToggleCommands`):  a `<button commandfor command="--show">` shows it (`show()`), `--close`
 *   closes it (`close()`, so a `key` remembers it), `--toggle` picks by `hidden`.
 * - No role:  a banner that must be announced gets `role` / `aria-live` from the page;  the close icon is a real
 *   `<button>` with a translated label.
 ****************/
export class UINag extends E.UIElement<Vocabulary> {
  @E.proto static vocabulary = nagVocabulary
  @E.proto static styleSheets = { nag: nagCSS }
  @E.proto static elementSetup = { Fallback: NagFallback, Host: UINagHost }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    // SIDE EFFECT:  a stored dismissal hides the host before it first paints
    if (!isServer && untrack(() => this.isHiddenByDismissal)) this.host.hidden = true
    this.on("command", this.onCommand)
    this.host.addReleaseCallback(() => clearTimeout(this.displayTimer))
  }

  ////////////////
  // ## Dismissal
  ////////////////

  /** Hidden because it was dismissed, now or before (stored):  `:state(dismissed)`. */
  @E.cssState("dismissed")
  @E.state
  accessor isHiddenByDismissal = untrack(() => this.isHiddenByStorage)

  /** A dismissal is stored (and not expired).  `false` without a `key`. */
  get isDismissed(): boolean {
    return this.dismissalStore?.isDismissed ?? false
  }

  /** Forget a stored dismissal. */
  clearDismissal() {
    this.dismissalStore?.clear()
  }

  /** A stored dismissal hides it:  dismissed, and not `persist`. */
  private get isHiddenByStorage(): boolean {
    return !this.persist && this.isDismissed
  }

  /**
   * The dismissal store for the current attributes, or `undefined` without a `key`.
   * - A new one per read, untracked:  nothing renders from it.
   */
  private get dismissalStore(): DismissalStore | undefined {
    return untrack(() => {
      const { key, value, storage, expires, path, domain, secure, samesite } = this
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

  ////////////////
  // ## Showing
  ////////////////

  /** The nag bar. */
  private root?: HTMLDivElement

  /** Pending `display-time`. */
  private displayTimer?: ReturnType<typeof setTimeout>

  /** Appeared (entry animation, `ui-show`, timer) since it last showed. */
  private hasShown = false

  /**
   * Appear once connected (and not hidden), waiting for the runtime (`isReady`) too, as the render does:  appearing
   * animates the rendered bar.  The cleanup drops a pending `display-time`.
   */
  @E.onChange("isConnected", "isReady")
  protected onConnectedChanged(isConnected: boolean, isReady: boolean) {
    if (isConnected && isReady) this.appear()
    return () => clearTimeout(this.displayTimer)
  }

  /** Entry animation, `ui-show` and the display time -- once per showing. */
  private appear() {
    if (this.hasShown || this.host.hidden) return
    this.hasShown = true
    const time = untrack(() => this.displayTime) ?? 0
    if (time > 0) this.displayTimer = setTimeout(() => this.close("timeout"), time)
    const root = this.root
    const entered = root
      ? UI.transitions.animate({ element: root, name: SLIDE, direction: UIT.IN })
      : Promise.resolve(true)
    void entered.then(() => {
      if (!this.isClosing) this.send("ui-show", {})
    })
  }

  /** Show again, unless a stored dismissal says not (and it doesn't `persist`).  True when it shows. */
  show(): boolean {
    if (this.isHiddenByStorage || this.isClosing || (!this.host.hidden && this.hasShown)) return false
    this.isHiddenByDismissal = false
    this.host.hidden = false
    this.appear()
    return true
  }

  ////////////////
  // ## Closing
  ////////////////

  /** Closing:  no second close until it has hidden. */
  private isClosing = false

  /**
   * Close for `reason`:  the cancelable `ui-close`, the dismissal stored (not for `timeout`), then the exit
   * animation, `hidden` on the host and `ui-hide`.  True when it closes.
   */
  close(reason: UIT.NagCloseReason = "dismiss", originalEvent?: Event): boolean {
    if (this.isClosing || this.host.hidden) return false
    const detail: UIT.NagCloseDetail = { reason, originalEvent }
    if (!this.send("ui-close", detail)) return false
    this.isClosing = true
    clearTimeout(this.displayTimer)
    if (reason !== "timeout") {
      this.dismissalStore?.dismiss()
      this.isHiddenByDismissal = true
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
      this.send("ui-hide", hidden)
    })
    return true
  }

  /** An invoker command aimed at the host (`ToggleCommands`):  open means not `hidden`. */
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
  // ## Rendering
  ////////////////

  /** Glyph of the close icon. */
  readonly closeGlyph = new E.IconGlyph({ owner: this, name: () => (this.closable ? UIT.CLOSE_ICON : undefined) })

  render(): JSX.Element {
    return (
      <div ref={(element) => (this.root = element)} class={this.rootClasses} part={this.partForName("nag")}>
        <slot />
        <Show when={this.closable}>
          <button
            type="button"
            class={UIT.CLOSE_CLASS}
            part={this.partForName("close")}
            aria-label={this.translationForKey("close")}
            onClick={this.onCloseIcon}
          >
            {this.closeGlyph.svg}
          </button>
        </Show>
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UINag extends E.AttributeValues<Vocabulary> {}

/** `UI.transitions` animation in and out (Fomantic's `slide`). */
const SLIDE = "slide-down"

/** Storage of a nag that names none:  Fomantic's default. */
const DEFAULT_STORAGE: UIT.NagStorage = "cookie"

/** Value a dismissal stores by default. */
const DEFAULT_VALUE = "dismiss"

/** Days a dismissal lasts by default. */
const DEFAULT_EXPIRES = 30
