import { Show, createEffect, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { dimmerVocabulary } from "./ui-dimmer.vocabulary.en"
import { DimmerFallback } from "./ui-dimmer.fallback"

import dimmerCSS from "./ui-dimmer.css?inline"
import dimmablePageCSS from "./ui-dimmer.page.css?inline"

/****************
 * ### `<ui-dimmer>`
 * A dimmer, in two kinds:
 * - ELEMENT dimmer (default):  `<div class="ui ... dimmer" part="dimmer"><div class="content"><slot>` covering its
 *   parent -- the nearest positioned box;  the `dimmer-page` page sheet makes a plain parent `position: relative`
 *   (Fomantic's `.dimmable`).  Not modal:  what it covers stays in the page, as in Fomantic.
 * - PAGE dimmer (`page`):  a `<dialog class="ui page ... dimmer">` shown with `showModal()` -- modal ON PURPOSE:  it
 *   covers everything, so the page is `inert` (a pointer can't reach it either), focus moves inside (the dialog
 *   itself when nothing inside is focusable) and returns on hide.  Registered with `UI.overlays` (kind `dimmer`:
 *   scroll lock, keyboard scope, Escape).  Named by the host's `aria-label`, else "Dimmed page".
 * - `active` is auto-controlled:  the cancelable `ui-open` / `ui-close` come first for a person's actions -- `on`
 *   (`hover`:  pointer over the parent or focus inside it;  `click`:  a click on the parent), a click on the dimmer
 *   itself (not its content, `closedby="any"`), Escape (a page dimmer), invoker commands (`TOGGLE_COMMANDS`);
 *   `ui-show` / `ui-hide` follow once the CSS transition has ended.  Writing `active` fires no `ui-open` / `ui-close`.
 * - An inactive `hover` dimmer stays laid out but transparent (and ignores the pointer), so a keyboard user can Tab
 *   into its content, which shows it.
 * - Looks:  a dark dimmer is the dark scheme for its content (`color-scheme: dark`, `--ui-inverted: 1`), so a
 *   `<ui-header>` in it turns light by itself;  `inverted` is the light one.  `blurring` blurs what's behind
 *   (`backdrop-filter`) instead of Fomantic's filter on the siblings.
 ****************/
export class UIDimmer extends E.UIElement<typeof dimmerVocabulary> {
  @E.proto static vocabulary = dimmerVocabulary
  @E.proto static styles = { dimmer: dimmerCSS }
  @E.proto static Fallback = DimmerFallback
  // a click on the dimmer must not jump focus into its content
  @E.proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** `active`:  always the host's (a boolean). */
  readonly activeState = this.controlled("active", false)

  /** Host `aria-label`, forwarded to a page dimmer's dialog. */
  readonly ariaLabel = new E.HostAttribute({ host: this.host, name: UIT.ARIA_LABEL })

  /** The dimmer box:  a `<div>`, or a page dimmer's `<dialog>`. */
  private box?: HTMLElement

  /** Bumped on every show / hide, so a late `ui-show` / `ui-hide` of an earlier one is dropped. */
  private generation = 0

  /** A dismissal was asked for in this task:  the dialog's own `cancel` for the same key press is ignored. */
  private isDismissing = false

  /** The pointer is over the parent (`on="hover"`). */
  private isHovered = false

  /** A page dimmer's `UI.overlays` entry;  its Escape option follows `closedby` when it shows. */
  private readonly overlay: E.OverlayEntry = {
    element: this.host,
    kind: "dimmer",
    closeOnOutsideClick: false,
    onDismiss: (reason: E.DismissReason) => void this.requestClose(reason === "outside" ? "click" : reason)
  }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const listeners = new AbortController()
    this.host.addEventListener("command", this.onCommand, { signal: listeners.signal })
    this.host.addReleaseCallback(() => listeners.abort())
  }

  /** Shown now (and not `disabled`). */
  isActive(): boolean {
    return this.activeState.get() && !this.attrs.disabled
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: E.AttributeName<typeof dimmerVocabulary>): unknown {
    if (name === UIT.ACTIVE) return this.isActive()
    return super.classValue(name)
  }

  protected hostStates() {
    return { active: this.isActive(), dimmer: true, page: !!this.attrs.page, "on-hover": this.attrs.on === "hover" }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    if (!UI.styles.has(PAGE_SHEET)) UI.styles.register(PAGE_SHEET, dimmablePageCSS, { page: true })
    this.effects()
    const content = (
      <div class={UIT.CONTENT} part={this.part("content")}>
        <slot />
      </div>
    )
    return (
      <Show
        when={this.attrs.page}
        fallback={
          <div
            ref={(element) => (this.box = element)}
            class={this.classes()}
            part={this.part("dimmer")}
            onClick={this.onDimmerClick}
          >
            {content}
          </div>
        }
      >
        <dialog
          ref={(element) => (this.box = element)}
          class={this.classes()}
          part={this.part("dimmer")}
          aria-label={this.ariaLabel.get() ?? this.text("dimmedPage")}
          onClick={this.onDimmerClick}
          onCancel={this.onCancel}
          onClose={this.onClose}
        >
          {content}
        </dialog>
      </Show>
    )
  }

  ////////////////
  // ## Effects
  ////////////////

  /** Showing / hiding while active AND connected;  the parent's listeners for `on`. */
  private effects() {
    createEffect(
      (): { isOn: boolean; kind: DimmerKind } => ({
        isOn: this.isConnected.get() && this.isActive(),
        kind: this.attrs.page ? "page" : "element"
      }),
      ({ isOn, kind }) => {
        if (!isOn) return
        this.show(kind)
        return () => this.hide(kind)
      }
    )
    createEffect(
      () => (this.isConnected.get() ? this.attrs.on : undefined),
      (on) => (on ? this.listenToParent(on) : undefined)
    )
  }

  /** A page dimmer:  `showModal()` and `UI.overlays`;  then `ui-show` once the entry transition ends. */
  private show(kind: DimmerKind) {
    const box = this.box
    if (kind === "page" && box instanceof HTMLDialogElement) {
      this.overlay.closeOnEscape = (untrack(() => this.attrs.closedby) ?? "any") !== UIT.NONE
      if (!box.open) {
        box.showModal()
        UI.focus.enter(box)
      }
      UI.overlays.open(this.overlay)
    }
    this.after(() => {
      const detail: UIT.DimmerOpenDetail = { active: true }
      if (untrack(() => this.isActive())) this.emit("ui-show", detail)
    })
  }

  /** A page dimmer:  `close()`, THEN leave `UI.overlays` (focus restore needs the page no longer `inert`). */
  private hide(kind: DimmerKind) {
    const box = this.box
    if (kind === "page") {
      if (box instanceof HTMLDialogElement && box.open) box.close()
      UI.overlays.close(this.overlay)
    }
    this.after(() => {
      const detail: UIT.DimmerOpenDetail = { active: false }
      if (!untrack(() => this.isActive()) && this.host.isConnected) this.emit("ui-hide", detail)
    })
  }

  /** Run `then` once the box's own transitions end, unless another show / hide started meanwhile. */
  private after(then: () => void) {
    const generation = ++this.generation
    const animations = this.box?.getAnimations() ?? []
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (generation === this.generation) then()
    })
  }

  /**
   * Listen to the parent for `on`;  returns the undo.
   * - `hover`:  pointer over the parent, or focus inside it (a keyboard user Tabbing into the content);  hides once
   *   both have left.
   * - `click`:  a click on the parent outside the dimmer shows it.
   */
  private listenToParent(on: string): (() => void) | undefined {
    const parent = this.host.parentElement
    if (!parent) return undefined
    const listeners = new AbortController()
    const options = { signal: listeners.signal }
    if (on === "hover") {
      parent.addEventListener("pointerenter", this.onPointerEnter, options)
      parent.addEventListener("pointerleave", this.onPointerLeave, options)
      parent.addEventListener("focusin", (event) => this.requestOpen(event), options)
      parent.addEventListener("focusout", (event) => this.leave(event, event.relatedTarget), options)
    } else {
      parent.addEventListener(UIT.CLICK, (event) => this.onParentClick(event), options)
    }
    return () => {
      this.isHovered = false
      listeners.abort()
    }
  }

  /** The pointer or focus left an `on="hover"` dimmer's parent:  hide once neither is inside. */
  private leave(event: Event, next: EventTarget | null | undefined = UI.focus.activeElementDeep()) {
    const parent = this.host.parentElement
    if (this.isHovered || (parent && next instanceof Node && UI.focus.containsDeep(parent, next))) return
    this.requestClose("hover", event)
  }

  ////////////////
  // ## Transitions
  ////////////////

  /** Show for a person's action, dispatching the cancelable `ui-open` first;  true when applied. */
  requestOpen(originalEvent?: Event): boolean {
    if (untrack(() => this.activeState.get() || !!this.attrs.disabled)) return false
    const detail: UIT.DimmerOpenDetail = { active: true, originalEvent }
    return this.activeState.request(true, () => this.emit("ui-open", detail))
  }

  /** Hide for `reason`, dispatching the cancelable `ui-close` first;  true when applied. */
  requestClose(reason: UIT.DimmerCloseReason, originalEvent?: Event): boolean {
    if (!untrack(() => this.activeState.get())) return false
    this.isDismissing = true
    setTimeout(() => (this.isDismissing = false))
    const detail: UIT.DimmerCloseDetail = { active: false, reason, originalEvent }
    return this.activeState.request(false, () => this.emit("ui-close", detail))
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** An invoker command aimed at the host (`TOGGLE_COMMANDS`). */
  private readonly onCommand = (event: Event) => {
    const action = UIT.ToggleCommands.action(
      event,
      untrack(() => this.activeState.get())
    )
    if (action === "show") this.requestOpen(event)
    else if (action === "close") this.requestClose("click", event)
  }

  /** A click on the dimmer itself, not its content:  hides it when `closedby="any"` (never a `hover` one). */
  private readonly onDimmerClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.box) return
    const closedBy = untrack(() => this.attrs.closedby) ?? "any"
    if (closedBy !== "any" || untrack(() => this.attrs.on) === "hover") return
    this.requestClose("click", event)
  }

  /** The pointer entered an `on="hover"` dimmer's parent:  show. */
  private readonly onPointerEnter = (event: PointerEvent) => {
    this.isHovered = true
    this.requestOpen(event)
  }

  /** The pointer left an `on="hover"` dimmer's parent:  hide, unless focus is still inside. */
  private readonly onPointerLeave = (event: PointerEvent) => {
    this.isHovered = false
    this.leave(event)
  }

  /** A click on the parent (`on="click"`) outside the dimmer:  show. */
  private onParentClick(event: MouseEvent) {
    if (this.box && event.composedPath().includes(this.box)) return
    this.requestOpen(event)
  }

  /**
   * A page dimmer's `cancel`:  Escape the overlay didn't take (a `CloseWatcher` request).
   * - Always prevented;  the element decides, by `closedby`, and `ui-close` may veto.
   */
  private readonly onCancel = (event: Event) => {
    event.preventDefault()
    if (this.isDismissing || (untrack(() => this.attrs.closedby) ?? "any") === UIT.NONE) return
    this.requestClose("escape", event)
  }

  /** A page dimmer's dialog closed while the element thinks it's active:  the browser forced it -- follow. */
  private readonly onClose = (event: Event) => {
    const box = this.box
    if ((box instanceof HTMLDialogElement && box.open) || !this.host.isConnected) return
    if (!untrack(() => this.activeState.get())) return
    const detail: UIT.DimmerCloseDetail = { active: false, reason: "escape", originalEvent: event }
    this.emit("ui-close", detail)
    this.activeState.set(false)
  }
}

/** Which dimmer it is:  over its parent (`element`), or a modal dialog over the page (`page`). */
type DimmerKind = "element" | "page"

/** Name of the page sheet that positions dimmed parents (`ui-dimmer.page.css`). */
const PAGE_SHEET = "dimmer-page"
