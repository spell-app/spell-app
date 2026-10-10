import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { sidebarVocabulary } from "./UISidebar.en"
import type { UIPushable } from "./UIPushable"
import { CENTER, type SidebarVocabulary } from "./UISidebar.types"

import sidebarCSS from "./UISidebar.css?inline"

/****************
 * ### `UISidebar`
 * The component behind `<ui-sidebar>`:  a panel along one edge of its `<ui-pushable>` (Fomantic's `.ui.sidebar`),
 * shown by `visible` with one of Fomantic's six transitions.
 * Its pushable moves and dims the `<ui-pusher>` beside it.
 *
 * - Two kinds, as the APG has them:
 *   - MODAL (the default):  a drawer, `<dialog class="ui … sidebar" aria-modal="true">` opened with `show()`,
 *     NOT `showModal()`:  the top layer would lift it out of its pushable
 *     (a sidebar in a segment would cover the page).  Instead:
 *     - focus moves inside (the dialog's own focusing steps), and Tab stays inside (`UI.focus.trap`)
 *     - the pushable makes the pusher `inert` and dims it
 *     - Escape and a click beside it close it (`UI.overlays`, kind `sidebar`):
 *       keyboard scope and focus restore, no scroll lock, as Fomantic's `scrollLock: false`
 *     - named by the DOM element's `aria-label`, else "Sidebar".
 *   - `persistent`:  part of the page, an `<aside>`
 *     (a complementary landmark;  a `<ui-menu>` inside is the `<nav>`).
 *     Nothing is dimmed, inert or trapped, and focus stays put.
 *
 * - A hidden sidebar is `hidden`, as every element (it starts hidden:  `elementSetup.visible`);
 *   while it slides out, `:state(hiding)` keeps it on screen (`onVisibleChange()`).
 *
 * - `visible` / `hidden` are controlled:
 *   the cancelable `ui-open` / `ui-close` come first for a person's actions
 *   (invoker commands, `UIT.ToggleCommands`;  Escape;  a click beside it).
 *   - `ui-show` / `ui-hide` follow once the transition has ended.
 *   - Writing `visible` or `hidden` fires no `ui-open` / `ui-close`.
 ****************/
export class UISidebar extends E.UIComponent<SidebarVocabulary> {
  @E.proto static vocabulary = sidebarVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { sidebar: sidebarCSS },
    // a click on the panel's padding must not jump focus to its first link
    delegatesFocus: false,
    // `visible` shows it
    visible: "hidden"
  } satisfies Partial<E.ElementSetup>

  /** Always:  its `<ui-pushable>` finds it by `:state(sidebar)`. */
  @E.cssState("sidebar")
  get isSidebar(): boolean {
    return true
  }

  ////////////////
  // ## Visible
  ////////////////

  /** Modal (the default), or `persistent`. */
  get isModal(): boolean {
    return !this.persistent
  }

  /** Show for a person's action, dispatching the cancelable `ui-open` first;  true when applied. */
  @E.untracked
  requestOpen(originalEvent?: Event): boolean {
    if (this.isVisible) return false
    const detail: UIT.SidebarOpenDetail = { visible: true, originalEvent }
    return this.requestChange("isVisible", true, () => this.send("ui-open", detail))
  }

  /** Hide for `reason`, dispatching the cancelable `ui-close` first;  true when applied. */
  @E.untracked
  requestClose(reason: UIT.SidebarCloseReason, originalEvent?: Event): boolean {
    if (!this.isVisible) return false
    const detail: UIT.SidebarCloseDetail = { visible: false, reason, originalEvent }
    return this.requestChange("isVisible", false, () => this.send("ui-close", detail))
  }

  /** An invoker command aimed at the DOM element (`ToggleCommands`). */
  @E.on("command")
  protected onCommand(event: Event) {
    const action = UIT.ToggleCommands.action(event, this.isVisible)
    if (action === "show") this.requestOpen(event)
    else if (action === "close") this.requestClose(UIT.CLOSE, event)
  }

  ////////////////
  // ## Showing and hiding
  ////////////////

  /** The panel:  a `<dialog>`, or an `<aside>` when `persistent`. */
  private box?: HTMLElement

  /** Undoes the focus trap of a modal sidebar. */
  private releaseFocusTrap?: E.Disposer

  /** Bumped on every show / hide, so a late `ui-show` / `ui-hide` of an earlier one is dropped. */
  private generation = 0

  /** A modal sidebar's `UI.overlays` entry;  its options follow `closedby` when it shows. */
  private readonly overlay: E.OverlayEntry = {
    element: this.domElement,
    kind: "sidebar",
    modal: false,
    onDismiss: (reason: E.DismissReason) => void this.requestClose(reason)
  }

  /**
   * Shown while visible AND connected, once the runtime is loaded (`isReady`, as the render waits for):
   * it acts on the rendered panel;  hidden by the cleanup.
   */
  @E.onChange("isReady", "isConnected", "isVisible", "isModal")
  protected onShowingChanged(isReady: boolean, isConnected: boolean, isVisible: boolean, isModal: boolean) {
    if (!(isReady && isConnected && isVisible)) return
    this.show(isModal)
    return () => this.hide(isModal)
  }

  /**
   * A modal sidebar:  `show()` (focus moves in), the focus trap, `UI.overlays`;
   * then `ui-show` once its transition ends.
   */
  @E.untracked
  private show(modal: boolean) {
    const box = this.box
    this.reportLayout()
    if (modal && box instanceof HTMLDialogElement) {
      const closedBy = this.closedby ?? "any"
      this.overlay.closeOnEscape = closedBy !== "none"
      this.overlay.closeOnOutsideClick = closedBy === "any"
      // MUST `show()` BEFORE `UI.overlays.open()`:
      // - `show()` gives the dialog its own close watcher, disabled (`closedby` computes to `none`)
      // - opened by a click, it's the newest close-watcher group, and Chromium processes only that group,
      //   so a watcher made before it never hears Escape
      // - focus still returns:  `close()` refocuses what had focus before `show()`
      if (!box.open) {
        box.show()
        UI.focus.enter(box)
      }
      UI.overlays.open(this.overlay)
      this.releaseFocusTrap = UI.focus.trap(this.domElement)
    }
    this.after(() => {
      const detail: UIT.SidebarOpenDetail = { visible: true }
      if (this.isVisible) this.send("ui-show", detail)
    })
  }

  /**
   * Undo `show()`:  `close()`, the trap, the pusher back (not `inert`), THEN leave `UI.overlays`,
   * whose focus restore may aim at a button in the pusher.
   */
  private hide(modal: boolean) {
    const box = this.box
    this.releaseFocusTrap?.()
    this.releaseFocusTrap = undefined
    this.pushable?.report(this.domElement, undefined)
    if (modal) {
      if (box instanceof HTMLDialogElement && box.open) box.close()
      UI.overlays.close(this.overlay)
    }
    this.after(() => {
      const detail: UIT.SidebarOpenDetail = { visible: false }
      if (!this.isVisible && this.domElement.isConnected) this.send("ui-hide", detail)
    })
  }

  /**
   * The panel slides by its own CSS transitions (`transition`, its `visible` class word):
   * a hide resolves once they end, so the element stays on screen till then (`:state(hiding)`).
   * - Waits for the next paint first:  the class word changes in the same update, and its transitions start with it.
   * - Motion off (`--ui-motion: none`, reduced motion) shortens them to nothing (`reset.css`).
   */
  protected async onVisibleChange(visible: boolean, _animation: UIT.Animation): Promise<void> {
    if (visible || !this.box) return
    await new Promise((resolve) => E.beforeNextPaint(() => resolve(undefined)))
    if (this.isVisible) return
    await Promise.allSettled((this.box.getAnimations() ?? []).map((animation) => animation.finished))
  }

  /** Run `then` once the panel's transitions end, unless another show / hide started meanwhile. */
  private after(then: () => void) {
    const generation = ++this.generation
    const animations = this.box?.getAnimations() ?? []
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (generation === this.generation) then()
    })
  }

  /** A non-modal dialog gets no `cancel` from Escape;  a `CloseWatcher` request might:  always prevented. */
  private readonly onCancel = (event: Event) => {
    event.preventDefault()
  }

  ////////////////
  // ## Layout
  ////////////////

  /** `transition`, else Fomantic's default for the side:  `uncover` left / right, `overlay` top / bottom. */
  get transitionName(): string {
    return this.transition ?? (VERTICAL.has(this.position ?? UIT.LEFT) ? OVERLAY : UNCOVER)
  }

  /** A word width (`thin`) goes before the noun (`UIT.WordWidthClasses`), then `visible` while it shows. */
  protected get extraClass(): string | undefined {
    const words = [UIT.WordWidthClasses.classFor(this.width), this.isVisible ? UIT.VISIBLE : undefined]
    return words.filter(Boolean).join(" ") || undefined
  }

  protected classValue(name: E.AttributeName<SidebarVocabulary>): unknown {
    if (name === "width" && UIT.WordWidthClasses.classFor(this.width)) return undefined
    if (name === "transition") return this.transitionName
    return super.classValue(name)
  }

  /** What the pushable lays out changed:  report it, once the runtime is loaded (the panel is measured). */
  @E.onChange("isReady", "isConnected", "isVisible", "isModal", "position", "width", "transitionName", "blurring")
  protected onLayoutChanged(isReady: boolean) {
    if (isReady) this.reportLayout()
  }

  /** Tell the pushable (if any) what this sidebar needs now;  called by it too, once it renders. */
  @E.untracked
  reportLayout() {
    const pushable = this.pushable
    if (!pushable) return
    const visible = this.isConnected && this.isVisible
    pushable.report(this.domElement, visible ? this.layout() : undefined)
  }

  /** The parent `<ui-pushable>`'s component, if that's where it is. */
  private get pushable(): UIPushable | undefined {
    const parent = this.domElement.parentElement
    if (!parent?.matches(`:state(${UIT.PUSHABLE_HOST_STATE})`)) return undefined
    return (parent as E.DOMElement).component as UIPushable | undefined
  }

  /**
   * What the pusher does beside this sidebar (Fomantic's `sidebar.less` "Animations"):
   * - `overlay`:  stays;  `scale down`:  shrinks to 0.75 towards the far side
   * - `push`, `uncover`, `slide along`, `slide out`:
   *   moves by the panel's measured width (height at the top / bottom), as Fomantic's script measured it
   * - A method, not a getter:  it MEASURES the panel.
   */
  @E.untracked
  private layout(): UIT.SidebarLayout {
    const position = this.position ?? UIT.LEFT
    const transition = this.transitionName
    const modal = this.isModal
    const blurring = !!this.blurring
    if (transition === OVERLAY) return { transform: "none", origin: CENTER, modal, blurring }
    if (transition === SCALE_DOWN) return { transform: SCALE, origin: SCALE_ORIGINS[position]!, modal, blurring }
    const box = this.box
    const size = VERTICAL.has(position) ? (box?.offsetHeight ?? 0) : (box?.offsetWidth ?? 0)
    const sign = position === UIT.LEFT || position === UIT.TOP ? 1 : -1
    const offset = `${sign * size}px`
    const transform = VERTICAL.has(position) ? `translate3d(0, ${offset}, 0)` : `translate3d(${offset}, 0, 0)`
    return { transform, origin: CENTER, modal, blurring }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    const label = () => this.attributes["aria-label"] ?? this.translationForKey("sidebar")
    return (
      <Show
        when={this.isModal}
        fallback={
          <aside
            ref={(element) => (this.box = element)}
            class={this.rootClass}
            part={this.partForName("sidebar")}
            aria-label={label()}
          >
            <slot />
          </aside>
        }
      >
        <dialog
          ref={(element) => (this.box = element)}
          class={this.rootClass}
          part={this.partForName("sidebar")}
          aria-label={label()}
          aria-modal={this.isVisible ? "true" : undefined}
          onCancel={this.onCancel}
        >
          <slot />
        </dialog>
      </Show>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UISidebar extends E.AttributeValues<SidebarVocabulary> {}

/** Top / bottom sidebars:  full width, move the pusher vertically. */
const VERTICAL: ReadonlySet<string> = new Set([UIT.TOP, UIT.BOTTOM])

/** Transition that leaves the pusher where it is;  Fomantic's default at the top / bottom. */
const OVERLAY = "overlay"

/** Fomantic's default transition on the left / right. */
const UNCOVER = "uncover"

/** Transition that shrinks the pusher instead of moving it. */
const SCALE_DOWN = "scale down"

/** The pusher's transform under `scale down`. */
const SCALE = "scale(0.75)"

/** Where a scaled-down pusher shrinks towards, by the sidebar's side (Fomantic's `transform-origin`s). */
const SCALE_ORIGINS: Readonly<Record<string, string>> = {
  left: "75% 50%",
  right: "25% 50%",
  top: "50% 75%",
  bottom: "50% 25%"
}
