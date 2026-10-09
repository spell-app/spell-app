import { Show, untrack } from "solid-js"
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
 * - `active` is controlled (`isActive`):  the cancelable `ui-open` / `ui-close` come first for a person's actions:
 *   - `show-on`:  `hover` (the pointer over the parent, or focus inside it) or `click` (a click on the parent)
 *   - a click on the dimmer itself (not its content;  `closedby="any"`)
 *   - Escape (a page dimmer), invoker commands (`UIT.ToggleCommands`).
 *
 *   `ui-show` / `ui-hide` follow once the CSS transition has ended.
 *   Writing `active` fires no `ui-open` / `ui-close`.
 *
 * - An inactive `hover` dimmer stays laid out but transparent (and ignores the pointer),
 *   so a keyboard user can Tab into its content, which shows it.
 *
 * - Looks:  a dark dimmer is the dark scheme for its content (`color-scheme: dark`, `--ui-inverted: 1`),
 *   so a `<ui-header>` in it turns light by itself;  `inverted` is the light one.
 *   `blurring` blurs what's behind (`backdrop-filter`), instead of Fomantic's filter on the siblings.
 ****************/
@E.cssStates("page")
export class UIDimmer extends E.UIComponent<typeof dimmerVocabulary> {
  @E.proto static vocabulary = dimmerVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { dimmer: dimmerCSS },
    // a click on the dimmer must not jump focus into its content
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    this.on("command", this.onCommand)
  }

  ////////////////
  // ## Showing (`active`)
  ////////////////

  /** `active`:  always the DOM element's property (a boolean). */
  @E.controlled("active")
  accessor isActive = false

  /** Shown now:  `active`, and not `disabled`. */
  @E.cssState("active")
  get isShowing(): boolean {
    return this.isActive && !this.disabled
  }

  protected classValue(name: E.AttributeName<typeof dimmerVocabulary>): unknown {
    if (name === UIT.ACTIVE) return this.isShowing
    return super.classValue(name)
  }

  /** Show for a person's action, dispatching the cancelable `ui-open` first;  true when applied. */
  requestOpen(originalEvent?: Event): boolean {
    if (untrack(() => this.isActive || !!this.disabled)) return false
    const detail: UIT.DimmerOpenDetail = { active: true, originalEvent }
    return this.requestChange("isActive", true, () => this.send("ui-open", detail))
  }

  /** Hide for `reason`, dispatching the cancelable `ui-close` first;  true when applied. */
  requestClose(reason: UIT.DimmerCloseReason, originalEvent?: Event): boolean {
    if (!untrack(() => this.isActive)) return false
    this.isDismissing = true
    E.soon(() => (this.isDismissing = false))
    const detail: UIT.DimmerCloseDetail = { active: false, reason, originalEvent }
    return this.requestChange("isActive", false, () => this.send("ui-close", detail))
  }

  /** An invoker command aimed at the DOM element (`UIT.ToggleCommands`). */
  private readonly onCommand = (event: Event) => {
    const action = UIT.ToggleCommands.action(
      event,
      untrack(() => this.isActive)
    )
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

  /**
   * Show while showing AND connected, once rendered (`isReady`:  the box exists then);  hide on the way out.
   * - The kind is captured for the cleanup:  a page dimmer leaves `UI.overlays` even if `page` changed meanwhile.
   */
  @E.onChange("isConnected", "isShowing", "page", "isReady")
  protected onShowingChanged(isConnected: boolean, isShowing: boolean, page: boolean, isReady: boolean) {
    if (!isConnected || !isShowing || !isReady) return undefined
    const kind: DimmerKind = page ? "page" : "element"
    this.show(kind)
    return () => this.hide(kind)
  }

  /** A page dimmer:  `showModal()` and `UI.overlays`;  then `ui-show` once the entry transition ends. */
  private show(kind: DimmerKind) {
    const box = this.box
    if (kind === "page" && box instanceof HTMLDialogElement) {
      this.overlay.closeOnEscape = (untrack(() => this.closedby) ?? "any") !== "none"
      if (!box.open) {
        box.showModal()
        UI.focus.enter(box)
      }
      UI.overlays.open(this.overlay)
    }
    this.after(() => {
      const detail: UIT.DimmerOpenDetail = { active: true }
      if (untrack(() => this.isShowing)) this.send("ui-show", detail)
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
      if (!untrack(() => this.isShowing) && this.domElement.isConnected) this.send("ui-hide", detail)
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
  private readonly onDimmerClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.box) return
    const closedBy = untrack(() => this.closedby) ?? "any"
    if (closedBy !== "any" || untrack(() => this.showOn) === "hover") return
    this.requestClose("click", event)
  }

  /**
   * A page dimmer's `cancel`:  Escape the overlay didn't take (a `CloseWatcher` request).
   * - Always prevented;  the element decides, by `closedby`, and `ui-close` may veto.
   */
  private readonly onCancel = (event: Event) => {
    event.preventDefault()
    if (this.isDismissing || (untrack(() => this.closedby) ?? "any") === "none") return
    this.requestClose("escape", event)
  }

  /** A page dimmer's dialog closed while the element thinks it's active:  the browser forced it -- follow. */
  private readonly onClose = (event: Event) => {
    const box = this.box
    if ((box instanceof HTMLDialogElement && box.open) || !this.domElement.isConnected) return
    if (!untrack(() => this.isActive)) return
    const detail: UIT.DimmerCloseDetail = { active: false, reason: "escape", originalEvent: event }
    this.send("ui-close", detail)
    this.isActive = false
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIDimmer extends E.AttributeValues<typeof dimmerVocabulary> {}

/** Which dimmer it is:  over its parent (`element`), or a modal dialog over the page (`page`). */
type DimmerKind = "element" | "page"

/** Name of the page sheet that positions dimmed parents (`UIDimmer.page.css`). */
const PAGE_SHEET = "dimmer-page"
