import { Show, createEffect, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import {
  HostAttribute,
  proto,
  UI,
  UIElement,
  type AttributeName,
  type Disposer,
  type DismissReason,
  type OverlayEntry,
  type UIHost,
  UIT
} from "$/ui/core"

import { SIDEBAR_WORD_WIDTHS } from "./ui-sidebar.types"
import { sidebarVocabulary } from "./ui-sidebar.vocabulary.en"
import type { UIPushable } from "./UIPushable"
import { SidebarFallback } from "./ui-sidebar.fallback"

import sidebarCSS from "./ui-sidebar.css?inline"
import {
  VERTICAL,
  OVERLAY,
  UNCOVER,
  ANY,
  NONE_TRANSFORM,
  CENTER,
  SCALE_DOWN,
  SCALE,
  SCALE_ORIGINS
} from "./ui-sidebar.types"
import type { SidebarVocabulary } from "./ui-sidebar.types"
import { ARIA_LABEL, LEFT, TRUE, NONE, TOP, CLOSE } from "$/ui/components/components.types"

/****************
 * ### `<ui-sidebar>`
 * A panel along one edge of its `<ui-pushable>` (Fomantic's `.ui.sidebar`), shown by `visible` with one of
 * Fomantic's six transitions;  its pushable moves / dims the `<ui-pusher>` beside it.
 * - Two kinds, by APG:
 *   - MODAL (default) -- a drawer:  `<dialog class="ui ... sidebar" aria-modal="true">` opened with `show()`, NOT
 *     `showModal()`:  the top layer would lift it out of its pushable (a sidebar in a segment would cover the
 *     page).  Instead:  focus moves inside (the dialog's own focusing steps) and Tab stays inside (`UI.focus.trap`),
 *     the pushable makes the pusher `inert` and dims it, Escape and a click beside it close it (`UI.overlays`, kind
 *     `sidebar`:  keyboard scope and focus restore, no scroll lock -- Fomantic's `scrollLock: false`).  Named by
 *     the host's `aria-label`, else "Sidebar".
 *   - `persistent` -- part of the page:  an `<aside>` (complementary landmark;  a `<ui-menu>` inside is the
 *     `<nav>`), nothing dimmed, inert or trapped, focus stays put.
 * - A hidden sidebar is `visibility: hidden` (out of the tab order and the accessibility tree), laid out so its
 *   pushable can measure it.
 * - `visible` is auto-controlled:  the cancelable `ui-open` / `ui-close` come first for user actions (invoker
 *   commands `TOGGLE_COMMANDS`, Escape, a click beside it);  `ui-show` / `ui-hide` follow once the transition has
 *   ended.  Writing `visible` fires no `ui-open` / `ui-close`.
 ****************/
export class UISidebar extends UIElement<SidebarVocabulary> {
  @proto static vocabulary = sidebarVocabulary
  @proto static styles = { sidebar: sidebarCSS }
  @proto static Fallback = SidebarFallback
  // a click on the panel's padding must not jump focus to its first link
  @proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** `visible`:  always the host's (a boolean). */
  readonly visibleState = this.controlled("visible", false)

  /** Host `aria-label`, forwarded to the panel. */
  readonly ariaLabel = new HostAttribute({ host: this.host, name: ARIA_LABEL })

  /** The panel:  a `<dialog>`, or an `<aside>` when `persistent`. */
  private box?: HTMLElement

  /** Undoes the focus trap of a modal sidebar. */
  private untrap?: Disposer

  /** Bumped on every show / hide, so a late `ui-show` / `ui-hide` of an earlier one is dropped. */
  private generation = 0

  /** A modal sidebar's `UI.overlays` entry;  its options follow `closedby` when it shows. */
  private readonly overlay: OverlayEntry = {
    element: this.host,
    kind: "sidebar",
    modal: false,
    onDismiss: (reason: DismissReason) => void this.requestClose(reason)
  }

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    const listeners = new AbortController()
    this.host.addEventListener("command", this.onCommand, { signal: listeners.signal })
    this.host.addReleaseCallback(() => listeners.abort())
  }

  /** Shown now. */
  isVisible(): boolean {
    return this.visibleState.get()
  }

  /** Modal (the default), or `persistent`. */
  isModal(): boolean {
    return !this.attrs.persistent
  }

  /** `transition`, else Fomantic's default for the side:  `uncover` left / right, `overlay` top / bottom. */
  transitionName(): string {
    return this.attrs.transition ?? (VERTICAL.has(this.attrs.position ?? LEFT) ? OVERLAY : UNCOVER)
  }

  ////////////////
  // ## Element hooks
  ////////////////

  /** A word width (`thin`) goes after the noun;  `ClassBuilder`'s `width` kind only knows columns. */
  protected extraClasses(): string | undefined {
    return UISidebar.wordWidth(this.attrs.width)
  }

  /** `width` when it's one of Fomantic's words (spaces or dashes), else `undefined`. */
  static wordWidth(width: string | number | undefined): string | undefined {
    const text = typeof width === "string" ? width.trim().replace(/[\s-]+/g, " ") : undefined
    return SIDEBAR_WORD_WIDTHS.find((word) => word === text)
  }

  protected classValue(name: AttributeName<SidebarVocabulary>): unknown {
    if (name === "width" && UISidebar.wordWidth(this.attrs.width)) return undefined
    if (name === "visible") return this.isVisible()
    if (name === "transition") return this.transitionName()
    return super.classValue(name)
  }

  protected hostStates() {
    return { sidebar: true, visible: this.isVisible() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.effects()
    const label = () => this.ariaLabel.get() ?? this.text("sidebar")
    return (
      <Show
        when={this.isModal()}
        fallback={
          <aside
            ref={(element) => (this.box = element)}
            class={this.classes()}
            part={this.part("sidebar")}
            aria-label={label()}
          >
            <slot />
          </aside>
        }
      >
        <dialog
          ref={(element) => (this.box = element)}
          class={this.classes()}
          part={this.part("sidebar")}
          aria-label={label()}
          aria-modal={this.isVisible() ? TRUE : undefined}
          onCancel={this.onCancel}
        >
          <slot />
        </dialog>
      </Show>
    )
  }

  ////////////////
  // ## Effects
  ////////////////

  /** Showing / hiding while visible AND connected;  reporting the layout to the pushable. */
  private effects() {
    createEffect(
      () => ({ on: this.connected.get() && this.isVisible(), modal: this.isModal() }),
      ({ on, modal }) => {
        if (!on) return
        this.show(modal)
        return () => this.hide(modal)
      }
    )
    createEffect(
      () => ({
        visible: this.connected.get() && this.isVisible(),
        modal: this.isModal(),
        position: this.attrs.position,
        width: this.attrs.width,
        transition: this.transitionName(),
        blurring: this.attrs.blurring
      }),
      () => this.reportLayout()
    )
  }

  /** Tell the pushable (if any) what this sidebar needs now;  called by it too, once it renders. */
  reportLayout() {
    const pushable = this.pushable()
    if (!pushable) return
    const visible = untrack(() => this.connected.get() && this.isVisible())
    pushable.report(this.host, visible ? this.layout() : undefined)
  }

  /**
   * A modal sidebar:  `show()` (focus moves in), the focus trap, `UI.overlays`;  then `ui-show` once its
   * transition ends.
   */
  private show(modal: boolean) {
    const box = this.box
    this.reportLayout()
    if (modal && box instanceof HTMLDialogElement) {
      const closedBy = untrack(() => this.attrs.closedby) ?? ANY
      this.overlay.closeOnEscape = closedBy !== NONE
      this.overlay.closeOnOutsideClick = closedBy === ANY
      // MUST `show()` BEFORE `UI.overlays.open()`:  `show()` gives the dialog its own close watcher, disabled
      // (`closedby` computes to `none`).  Opened by a click, it's the newest close-watcher group, and Chromium
      // processes only that group, so a watcher made before it never hears Escape.  Focus still returns:
      // `close()` refocuses what had focus before `show()`.
      if (!box.open) {
        box.show()
        UI.focus.enter(box)
      }
      UI.overlays.open(this.overlay)
      this.untrap = UI.focus.trap(this.host)
    }
    this.after(() => {
      const detail: UIT.SidebarOpenDetail = { visible: true }
      if (untrack(() => this.isVisible())) this.emit("ui-show", detail)
    })
  }

  /**
   * Undo `show()`:  `close()`, the trap, the pusher back (not `inert`), THEN leave `UI.overlays`, whose focus restore
   * may aim at a button in the pusher.
   */
  private hide(modal: boolean) {
    const box = this.box
    this.untrap?.()
    this.untrap = undefined
    this.pushable()?.report(this.host, undefined)
    if (modal) {
      if (box instanceof HTMLDialogElement && box.open) box.close()
      UI.overlays.close(this.overlay)
    }
    this.after(() => {
      const detail: UIT.SidebarOpenDetail = { visible: false }
      if (!untrack(() => this.isVisible()) && this.host.isConnected) this.emit("ui-hide", detail)
    })
  }

  /** Run `then` once the panel's transitions end, unless another show / hide started meanwhile. */
  private after(then: () => void) {
    const generation = ++this.generation
    const animations = this.box?.getAnimations() ?? []
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (generation === this.generation) then()
    })
  }

  ////////////////
  // ## Layout
  ////////////////

  /** The parent `<ui-pushable>`'s controller, if that's where it is. */
  private pushable(): UIPushable | undefined {
    const parent = this.host.parentElement
    if (!parent?.matches(`:state(${UIT.PUSHABLE_HOST_STATE})`)) return undefined
    return (parent as UIHost).controller as UIPushable | undefined
  }

  /**
   * What the pusher does beside this sidebar (Fomantic's `sidebar.less` "Animations"):
   * - `overlay`:  stays;  `scale down`:  shrinks to 0.75 towards the far side
   * - `push`, `uncover`, `slide along`, `slide out`:  moves by the panel's measured width (height at the top /
   *   bottom), as Fomantic's script measured it
   */
  private layout(): UIT.SidebarLayout {
    const position = untrack(() => this.attrs.position) ?? LEFT
    const transition = untrack(() => this.transitionName())
    const modal = untrack(() => this.isModal())
    const blurring = untrack(() => !!this.attrs.blurring)
    if (transition === OVERLAY) return { transform: NONE_TRANSFORM, origin: CENTER, modal, blurring }
    if (transition === SCALE_DOWN) return { transform: SCALE, origin: SCALE_ORIGINS[position]!, modal, blurring }
    const box = this.box
    const size = VERTICAL.has(position) ? (box?.offsetHeight ?? 0) : (box?.offsetWidth ?? 0)
    const sign = position === LEFT || position === TOP ? 1 : -1
    const offset = `${sign * size}px`
    const transform = VERTICAL.has(position) ? `translate3d(0, ${offset}, 0)` : `translate3d(${offset}, 0, 0)`
    return { transform, origin: CENTER, modal, blurring }
  }

  ////////////////
  // ## Transitions
  ////////////////

  /** Show for a user action, dispatching the cancelable `ui-open` first;  true when applied. */
  setVisible(originalEvent?: Event): boolean {
    if (untrack(() => this.isVisible())) return false
    const detail: UIT.SidebarOpenDetail = { visible: true, originalEvent }
    return this.visibleState.request(true, () => this.emit("ui-open", detail))
  }

  /** Hide for `reason`, dispatching the cancelable `ui-close` first;  true when applied. */
  requestClose(reason: UIT.SidebarCloseReason, originalEvent?: Event): boolean {
    if (!untrack(() => this.isVisible())) return false
    const detail: UIT.SidebarCloseDetail = { visible: false, reason, originalEvent }
    return this.visibleState.request(false, () => this.emit("ui-close", detail))
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** An invoker command aimed at the host (`TOGGLE_COMMANDS`). */
  private readonly onCommand = (event: Event) => {
    const action = UIT.ToggleCommands.action(
      event,
      untrack(() => this.isVisible())
    )
    if (action === "show") this.setVisible(event)
    else if (action === "close") this.requestClose(CLOSE, event)
  }

  /** A non-modal dialog gets no `cancel` from Escape;  a `CloseWatcher` request might:  always prevented. */
  private readonly onCancel = (event: Event) => {
    event.preventDefault()
  }
}
