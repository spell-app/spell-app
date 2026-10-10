import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { dimmerVocabulary } from "./UIDimmer.en"

import dimmerCSS from "./UIDimmer.css?inline"
import dimmablePageCSS from "./UIDimmer.page.css?inline"

/****************
 * ### `UIDimmer`
 * The component behind `<ui-dimmer>`:  a dimmer over part of the page, or over all of it.
 *
 * - An ELEMENT dimmer (the default):
 *   `<div class="ui … dimmer" part="dimmer"><div class="content"><slot>` covering its parent,
 *   the nearest positioned box.
 *   - The `dimmer-page` page sheet makes a plain parent `position: relative` (Fomantic's `.dimmable`).
 *   - Not modal:  what it covers stays in the page, as in Fomantic.
 *
 * - A PAGE dimmer (`page`):  a `<dialog class="ui page … dimmer">` shown with `showModal()`, modal ON PURPOSE.
 *   - It covers everything, so the page is `inert` (a pointer can't reach it either);
 *     focus moves inside (to the dialog itself when nothing inside is focusable) and returns on hide.
 *   - Registered with `UI.overlays` (kind `dimmer`:  scroll lock, keyboard scope, Escape).
 *   - Named by the DOM element's `aria-label`, else "Dimmed page".
 *
 * - Shown by the shared `visible` / `hidden` (`UIComponent`, "Shown or hidden"), starting hidden;
 *   Fomantic's `active` is the box's class while it shows.
 *   Controlled (`isVisible`):  the cancelable `ui-open` / `ui-close` come first for a person's actions:
 *   - `show-on`:  `hover` (the pointer over the parent, or focus inside it) or `click` (a click on the parent)
 *   - a click on the dimmer itself (not its content;  `closedby="any"`)
 *   - Escape (a page dimmer), invoker commands (`UIT.ToggleCommands`).
 *
 *   `ui-show` / `ui-hide` follow once the CSS transition has ended.
 *   Writing `visible` (or `hidden`) fires no `ui-open` / `ui-close`.
 *
 * - A hidden `hover` dimmer stays laid out but transparent (and ignores the pointer),
 *   so a keyboard user can Tab into its content, which shows it (`UIDimmer.css`).
 *
 * - Looks:  a dark dimmer is the dark scheme for its content (`color-scheme: dark`, `--ui-inverted: 1`),
 *   so a `<ui-header>` in it turns light by itself;  `inverted` is the light one.
 *   `blurring` blurs what's behind (`backdrop-filter`), instead of Fomantic's filter on the siblings.
 ****************/
export class UIDimmer extends E.UIComponent<typeof dimmerVocabulary> {
  @E.proto static vocabulary = dimmerVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { dimmer: dimmerCSS },
    cssStates: ["page"],
    // a click on the dimmer must not jump focus into its content
    delegatesFocus: false,
    // `disabled`:  it never shows
    disabled: "its own",
    visible: "hidden"
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Showing (`visible`)
  ////////////////

  /** Shown now:  `visible`, and not `disabled`. */
  get isShowing(): boolean {
    return this.isVisible && !this.disabled
  }

  /** Fomantic's `active`, just before the noun while it shows. */
  protected get extraClass(): string | undefined {
    return this.isShowing ? UIT.ACTIVE : undefined
  }

  /** Show for a person's action, dispatching the cancelable `ui-open` first;  true when applied. */
  @E.untracked
  requestOpen(originalEvent?: Event): boolean {
    if (this.isVisible || this.disabled) return false
    const detail: UIT.DimmerOpenDetail = { visible: true, originalEvent }
    return this.requestChange("isVisible", true, () => this.send("ui-open", detail))
  }

  /** Hide for `reason`, dispatching the cancelable `ui-close` first;  true when applied. */
  @E.untracked
  requestClose(reason: UIT.DimmerCloseReason, originalEvent?: Event): boolean {
    if (!this.isVisible) return false
    this.isDismissing = true
    E.soon(() => (this.isDismissing = false))
    const detail: UIT.DimmerCloseDetail = { visible: false, reason, originalEvent }
    return this.requestChange("isVisible", false, () => this.send("ui-close", detail))
  }

  /** An invoker command aimed at the DOM element (`UIT.ToggleCommands`). */
  @E.on("command")
  protected onCommand(event: Event) {
    const action = UIT.ToggleCommands.action(event, this.isVisible)
    if (action === "show") this.requestOpen(event)
    else if (action === "close") this.requestClose("click", event)
  }

  ////////////////
  // ## Kind
  ////////////////

  /** Always `:state(dimmer)`. */
  @E.cssState("dimmer")
  get isDimmer(): boolean {
    return true
  }

  /** Shows while the pointer or focus is in its parent (`show-on="hover"`). */
  @E.cssState("on-hover")
  get showsOnHover(): boolean {
    return this.showOn === "hover"
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    if (!UI.styles.has(PAGE_SHEET)) UI.styles.register(PAGE_SHEET, dimmablePageCSS, { page: true })
    const content = (
      <div class={UIT.CONTENT} part={this.partForName("content")}>
        <slot />
      </div>
    )
    return (
      <Show
        when={this.page}
        fallback={
          <div
            ref={(element) => (this.box = element)}
            class={this.rootClass}
            part={this.partForName("dimmer")}
            onClick={this.onDimmerClick}
          >
            {content}
          </div>
        }
      >
        <dialog
          ref={(element) => (this.box = element)}
          class={this.rootClass}
          part={this.partForName("dimmer")}
          aria-label={this.attributes["aria-label"] ?? this.translationForKey("dimmedPage")}
          onClick={this.onDimmerClick}
          onCancel={this.onCancel}
          onClose={this.onClose}
        >
          {content}
        </dialog>
      </Show>
    )
  }

  /** The dimmer box:  a `<div>`, or a page dimmer's `<dialog>`. */
  private box?: HTMLElement

  ////////////////
  // ## Show and hide
  ////////////////

  /** Bumped on every show / hide, so a late `ui-show` / `ui-hide` of an earlier one is dropped. */
  private generation = 0

  /** A page dimmer's `UI.overlays` entry;  its Escape option follows `closedby` when it shows. */
  private readonly overlay: E.OverlayEntry = {
    element: this.domElement,
    kind: "dimmer",
    closeOnOutsideClick: false,
    onDismiss: (reason: E.DismissReason) => void this.requestClose(reason === "outside" ? "click" : reason)
  }

  /** What is on screen now:  an element dimmer, a page dimmer (its `<dialog>`), or nothing. */
  private shown?: { kind: DimmerKind; box?: HTMLDialogElement }

  /**
   * `visible` changed (`UIComponent`'s hook):  show or take down;
   * resolves once the box's transition has ended, with `ui-show` / `ui-hide`.
   * - `animation`:  the family's own (`fade`) is the sheet's transition (`UIDimmer.css`);
   *   another one (the element's own `animation`) runs on the box through `UI.transitions`;  `none`:  at once.
   * - A disabled dimmer never shows, and fires nothing.
   */
  protected async onVisibleChange(visible: boolean, animation: UIT.Animation): Promise<void> {
    const box = this.box
    const keyframes = UIT.AnimationLookup.keyframesBeside(animation, this.elementSetup.animation)
    const wasShown = !!this.shown
    if (!visible && wasShown && keyframes && box) {
      await UI.transitions.animate({ element: box, name: keyframes, direction: UIT.OUT })
      // shown again while the keyframes ran
      if (this.isVisible) return
    }
    this.place()
    if (visible ? !this.shown : !wasShown) return
    if (visible && keyframes && box) await UI.transitions.animate({ element: box, name: keyframes, direction: UIT.IN })
    const detail: UIT.DimmerOpenDetail = { visible }
    if (!(await this.transitionsEnd())) return
    if (visible ? this.isShowing : !this.isShowing && this.domElement.isConnected) {
      this.send(visible ? "ui-show" : "ui-hide", detail)
    }
  }

  /** Placed again whenever what decides it changes:  connected, `page`, `disabled`, drawn. */
  @E.onChange("isConnected", "page", "disabled", "isReady", { defer: true })
  protected onPlacementChanged() {
    this.place()
  }

  /**
   * Put on screen what should be there now, taking down what shouldn't:  nothing, an element or a page dimmer.
   * - A page dimmer:  `showModal()` and `UI.overlays`;  taken down, `close()` THEN leave `UI.overlays`
   *   (focus restore needs the page no longer `inert`).
   * - The `<dialog>` it showed is kept:  `page` may switch the box before it's taken down.
   * - A box other keyframes animated out (`hidden` on it) shows again.
   */
  @E.untracked
  private place() {
    const box = this.box
    const kind: DimmerKind | undefined =
      this.isConnected && this.isReady && this.isShowing ? (this.page ? "page" : "element") : undefined
    if (kind === this.shown?.kind) return
    const dialog = this.shown?.box
    if (dialog) {
      if (dialog.open) dialog.close()
      UI.overlays.close(this.overlay)
    }
    this.shown = undefined
    if (!kind) return
    if (box) UI.transitions.reveal(box)
    if (kind === "element" || !(box instanceof HTMLDialogElement)) return void (this.shown = { kind })
    this.overlay.closeOnEscape = (this.closedby ?? "any") !== "none"
    if (!box.open) {
      box.showModal()
      UI.focus.enter(box)
    }
    UI.overlays.open(this.overlay)
    this.shown = { kind, box }
  }

  /** Once the box's own transitions end:  `true` unless another show / hide started meanwhile. */
  private async transitionsEnd(): Promise<boolean> {
    const generation = ++this.generation
    const animations = this.box?.getAnimations() ?? []
    await Promise.allSettled(animations.map((animation) => animation.finished))
    return generation === this.generation
  }

  ////////////////
  // ## The parent (`show-on`)
  ////////////////

  /** The pointer is over the parent (`show-on="hover"`). */
  private pointerIsOverParent = false

  /** Listen to the parent for `show-on` while connected, once rendered (`isReady`);  returns the undo. */
  @E.onChange("isConnected", "showOn", "isReady")
  protected onTriggerChanged(isConnected: boolean, showOn: string | undefined, isReady: boolean) {
    return isConnected && isReady && showOn ? this.listenToParent(showOn) : undefined
  }

  /**
   * Listen to the parent for `show-on`;  returns the undo.
   * - `hover`:  pointer over the parent, or focus inside it (a keyboard user Tabbing into the content);
   *   hides once both have left.
   * - `click`:  a click on the parent outside the dimmer shows it.
   */
  private listenToParent(showOn: string): (() => void) | undefined {
    const parent = this.domElement.parentElement
    if (!parent) return undefined
    const listeners = new AbortController()
    const options = { signal: listeners.signal }
    if (showOn === "hover") {
      parent.addEventListener("pointerenter", this.onPointerEnter, options)
      parent.addEventListener("pointerleave", this.onPointerLeave, options)
      parent.addEventListener("focusin", this.onParentFocusIn, options)
      parent.addEventListener("focusout", this.onParentFocusOut, options)
    } else {
      parent.addEventListener("click", this.onParentClick, options)
    }
    return () => {
      this.pointerIsOverParent = false
      listeners.abort()
    }
  }

  /** The pointer or focus left a `show-on="hover"` dimmer's parent:  hide once neither is inside. */
  private leave(event: Event, next: EventTarget | null | undefined = UI.focus.activeElementDeep()) {
    const parent = this.domElement.parentElement
    if (this.pointerIsOverParent || (parent && next instanceof Node && UI.focus.containsDeep(parent, next))) return
    this.requestClose("hover", event)
  }

  /** The pointer entered a `show-on="hover"` dimmer's parent:  show. */
  private readonly onPointerEnter = (event: PointerEvent) => {
    this.pointerIsOverParent = true
    this.requestOpen(event)
  }

  /** The pointer left a `show-on="hover"` dimmer's parent:  hide, unless focus is still inside. */
  private readonly onPointerLeave = (event: PointerEvent) => {
    this.pointerIsOverParent = false
    this.leave(event)
  }

  /** Focus moved into a `show-on="hover"` dimmer's parent:  show. */
  private readonly onParentFocusIn = (event: FocusEvent) => this.requestOpen(event)

  /**
   * Focus left a `show-on="hover"` dimmer's parent (or moved within it):  hide once neither it nor the pointer is in.
   */
  private readonly onParentFocusOut = (event: FocusEvent) => this.leave(event, event.relatedTarget)

  /** A click on the parent (`show-on="click"`) outside the dimmer:  show. */
  private readonly onParentClick = (event: MouseEvent) => {
    if (this.box && event.composedPath().includes(this.box)) return
    this.requestOpen(event)
  }

  ////////////////
  // ## Dismissing
  ////////////////

  /** A dismissal was asked for in this task:  the dialog's own `cancel` for the same key press is ignored. */
  private isDismissing = false

  /** A click on the dimmer itself, not its content:  hides it when `closedby="any"` (never a `hover` one). */
  @E.untracked
  private readonly onDimmerClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.box) return
    const closedBy = this.closedby ?? "any"
    if (closedBy !== "any" || this.showOn === "hover") return
    this.requestClose("click", event)
  }

  /**
   * A page dimmer's `cancel`:  Escape the overlay didn't take (a `CloseWatcher` request).
   * - Always prevented;  the element decides, by `closedby`, and `ui-close` may veto.
   */
  @E.untracked
  private readonly onCancel = (event: Event) => {
    event.preventDefault()
    if (this.isDismissing || (this.closedby ?? "any") === "none") return
    this.requestClose("escape", event)
  }

  /** A page dimmer's dialog closed while the element thinks it's shown:  the browser forced it -- follow. */
  @E.untracked
  private readonly onClose = (event: Event) => {
    const box = this.box
    if ((box instanceof HTMLDialogElement && box.open) || !this.domElement.isConnected) return
    if (!this.isVisible) return
    const detail: UIT.DimmerCloseDetail = { visible: false, reason: "escape", originalEvent: event }
    this.send("ui-close", detail)
    this.isVisible = false
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIDimmer extends E.AttributeValues<typeof dimmerVocabulary> {}

/** Which dimmer it is:  over its parent (`element`), or a modal dialog over the page (`page`). */
type DimmerKind = "element" | "page"

/** Name of the page sheet that positions dimmed parents (`UIDimmer.page.css`). */
const PAGE_SHEET = "dimmer-page"
