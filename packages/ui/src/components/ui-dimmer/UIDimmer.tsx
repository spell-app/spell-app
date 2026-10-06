import { Show, createEffect, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import {
  HostAttribute,
  proto,
  type AttributeName,
  type DismissReason,
  type OverlayEntry,
  UI,
  UIElement,
  UIT
} from "$/ui/core"

import { dimmerVocabulary } from "./ui-dimmer.vocabulary.en"
import { DimmerFallback } from "./ui-dimmer.fallback"
import { ANY, CLICK, ESCAPE, HOVER, PAGE_SHEET, Vocabulary } from "./ui-dimmer.types"

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
 * - `active` is auto-controlled:  the cancelable `ui-open` / `ui-close` come first for user actions -- `on`
 *   (`hover`:  pointer over the parent or focus inside it;  `click`:  a click on the parent), a click on the dimmer
 *   itself (not its content, `closedby="any"`), Escape (a page dimmer), invoker commands (`TOGGLE_COMMANDS`);
 *   `ui-show` / `ui-hide` follow once the CSS transition has ended.  Writing `active` fires no `ui-open` / `ui-close`.
 * - An inactive `hover` dimmer stays laid out but transparent (and ignores the pointer), so a keyboard user can Tab
 *   into its content, which shows it.
 * - Looks:  a dark dimmer is the dark scheme for its content (`color-scheme: dark`, `--ui-inverted: 1`), so a
 *   `<ui-header>` in it turns light by itself;  `inverted` is the light one.  `blurring` blurs what's behind
 *   (`backdrop-filter`) instead of Fomantic's filter on the siblings.
 ****************/
export class UIDimmer extends UIElement<Vocabulary> {
  @proto static vocabulary = dimmerVocabulary
  @proto static styles = { dimmer: dimmerCSS }
  @proto static Fallback = DimmerFallback
  // a click on the dimmer must not jump focus into its content
  @proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** `active`:  always the host's (a boolean). */
  readonly activeState = this.controlled("active", false)

  /** Host `aria-label`, forwarded to a page dimmer's dialog. */
  readonly ariaLabel = new HostAttribute(this.host, UIT.ARIA_LABEL)

  /** The dimmer box:  a `<div>`, or a page dimmer's `<dialog>`. */
  private box?: HTMLElement

  /** Bumped on every show / hide, so a late `ui-show` / `ui-hide` of an earlier one is dropped. */
  private generation = 0

  /** A dismissal was asked for in this task:  the dialog's own `cancel` for the same key press is ignored. */
  private dismissing = false

  /** The pointer is over the parent (`on="hover"`). */
  private hovered = false

  /** A page dimmer's `UI.overlays` entry;  its Escape option follows `closedby` when it shows. */
  private readonly overlay: OverlayEntry = {
    element: this.host,
    kind: "dimmer",
    closeOnOutsideClick: false,
    onDismiss: (reason: DismissReason) => void this.requestClose(reason === "outside" ? CLICK : reason)
  }

  constructor(...args: ConstructorParameters<typeof UIElement>) {
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

  protected classValue(name: AttributeName<Vocabulary>): unknown {
    if (name === "active") return this.isActive()
    return super.classValue(name)
  }

  protected hostStates() {
    return { active: this.isActive(), dimmer: true, page: !!this.attrs.page, "on-hover": this.attrs.on === HOVER }
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
      () => ({ on: this.connected.get() && this.isActive(), page: !!this.attrs.page }),
      ({ on, page }) => {
        if (!on) return
        this.show(page)
        return () => this.hide(page)
      }
    )
    createEffect(
      () => (this.connected.get() ? this.attrs.on : undefined),
      (on) => (on ? this.listenToParent(on) : undefined)
    )
  }

  /** A page dimmer:  `showModal()` and `UI.overlays`;  then `ui-show` once the entry transition ends. */
  private show(page: boolean) {
    const box = this.box
    if (page && box instanceof HTMLDialogElement) {
      this.overlay.closeOnEscape = (untrack(() => this.attrs.closedby) ?? ANY) !== UIT.NONE
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
  private hide(page: boolean) {
    const box = this.box
    if (page) {
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
    if (on === HOVER) {
      parent.addEventListener("pointerenter", (event) => this.hover(true, event), options)
      parent.addEventListener("pointerleave", (event) => this.hover(false, event), options)
      parent.addEventListener("focusin", (event) => this.setActive(event), options)
      parent.addEventListener("focusout", (event) => this.leave(event, event.relatedTarget), options)
    } else {
      parent.addEventListener("click", (event) => this.onParentClick(event), options)
    }
    return () => {
      this.hovered = false
      listeners.abort()
    }
  }

  /** The pointer entered / left an `on="hover"` dimmer's parent. */
  private hover(inside: boolean, event: PointerEvent) {
    this.hovered = inside
    if (inside) this.setActive(event)
    else this.leave(event)
  }

  /** The pointer or focus left an `on="hover"` dimmer's parent:  hide once neither is inside. */
  private leave(event: Event, next: EventTarget | null | undefined = UI.focus.activeElementDeep()) {
    const parent = this.host.parentElement
    if (this.hovered || (parent && next instanceof Node && UI.focus.containsDeep(parent, next))) return
    this.requestClose(HOVER, event)
  }

  ////////////////
  // ## Transitions
  ////////////////

  /** Show for a user action, dispatching the cancelable `ui-open` first;  true when applied. */
  setActive(originalEvent?: Event): boolean {
    if (untrack(() => this.activeState.get() || !!this.attrs.disabled)) return false
    const detail: UIT.DimmerOpenDetail = { active: true, originalEvent }
    return this.activeState.request(true, () => this.emit("ui-open", detail))
  }

  /** Hide for `reason`, dispatching the cancelable `ui-close` first;  true when applied. */
  requestClose(reason: UIT.DimmerCloseReason, originalEvent?: Event): boolean {
    if (!untrack(() => this.activeState.get())) return false
    this.dismissing = true
    setTimeout(() => (this.dismissing = false))
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
    if (action === "show") this.setActive(event)
    else if (action === "close") this.requestClose(CLICK, event)
  }

  /** A click on the dimmer itself, not its content:  hides it when `closedby="any"` (never a `hover` one). */
  private readonly onDimmerClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.box) return
    const closedBy = untrack(() => this.attrs.closedby) ?? ANY
    if (closedBy !== ANY || untrack(() => this.attrs.on) === HOVER) return
    this.requestClose(CLICK, event)
  }

  /** A click on the parent (`on="click"`) outside the dimmer:  show. */
  private onParentClick(event: MouseEvent) {
    if (this.box && event.composedPath().includes(this.box)) return
    this.setActive(event)
  }

  /**
   * A page dimmer's `cancel`:  Escape the overlay didn't take (a `CloseWatcher` request).
   * - Always prevented;  the element decides, by `closedby`, and `ui-close` may veto.
   */
  private readonly onCancel = (event: Event) => {
    event.preventDefault()
    if (this.dismissing || (untrack(() => this.attrs.closedby) ?? ANY) === UIT.NONE) return
    this.requestClose(ESCAPE, event)
  }

  /** A page dimmer's dialog closed while the element thinks it's active:  the browser forced it -- follow. */
  private readonly onClose = (event: Event) => {
    const box = this.box
    if ((box instanceof HTMLDialogElement && box.open) || !this.host.isConnected) return
    if (!untrack(() => this.activeState.get())) return
    const detail: UIT.DimmerCloseDetail = { active: false, reason: ESCAPE, originalEvent: event }
    this.emit("ui-close", detail)
    this.activeState.set(false)
  }
}
