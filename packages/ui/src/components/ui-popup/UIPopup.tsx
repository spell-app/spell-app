import { Show, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { popupVocabulary } from "./ui-popup.vocabulary.en"
import { PopupFallback } from "./ui-popup.fallback"
import {
  DEFAULT_POSITION,
  type AriaRelation,
  type PopoverMode,
  type ShowPopoverOptions,
  type Vocabulary
} from "./ui-popup.types"

import popupCSS from "./ui-popup.css?inline"
import anchoredCSS from "./ui-popup.anchored.css?raw"

/****************
 * ### `<ui-popup>`
 * A popup anchored to a TARGET:  the HOST is a popover in the top layer, positioned with CSS anchor positioning
 * only (`ui-popup.css`), holding `<div class="ui ... popup [position]" part="popup">`.
 * - Target:  the `target` property, else the element `for` names (in the popup's own tree), else the previous
 *   element sibling -- Fomantic's `inline` markup, a popup right after its activator.
 * - `open-on`:  `hover` (with `show-delay` / `hide-delay`, and on keyboard focus too), `focus`, `click` (toggles),
 *   `manual` (only `open`).  A hovered popup stays open while the pointer is over it (WCAG 1.4.13), unlike
 *   Fomantic's default `hoverable: false`;  `hoverable="false"` gives Fomantic's behaviour back (it hides as the
 *   pointer leaves the target, after `hide-delay`).
 * - Invoker commands (`<button commandfor="id" command="--toggle">`, `ToggleCommands`) are a person's actions
 *   too:  the popup opens at ITS target, whichever button sent the command.
 * - `open` is auto-controlled:  the cancelable `ui-open` / `ui-close` come first.  Escape and outside clicks come
 *   from `UI.overlays` (kind `popover`, the target counts as inside).
 * - Popover mode:  `hint` for hover / focus popups when `UI.browser.supports.popoverHint` (they don't close an
 *   open dropdown's menu), else `manual`;  click and manual popups are always `manual` -- `auto`'s light dismiss
 *   would skip the cancelable `ui-close`.  When the browser dismisses a `hint` popover itself, the element follows (a
 *   `ui-close` that can no longer veto).
 * - Accessibility, by `open-on`:
 *   - `hover` / `focus` / `manual`:  host `role=tooltip`;  the target is `aria-describedby` it
 *   - `click`:  host `role=dialog` (non-modal, named by `header` or the host's `aria-label`);  the target gets
 *     `aria-haspopup=dialog`, `aria-expanded`, `aria-controls`
 *   - the ARIA goes on the element that takes focus:  a `delegatesFocus` target's (`<ui-button>`'s) first
 *     focusable, through element reflection (`ariaDescribedByElements`) when that is in another tree
 * - SIDE EFFECTS on light DOM the element doesn't own, undone when it unbinds:  the target's inline
 *   `anchor-name` (a per-instance name ADDED to its list) and ARIA attributes;  the host's `popover`, `id` and
 *   inline `position-anchor` / `position-area`.
 ****************/
export class UIPopup extends E.UIElement<Vocabulary> {
  @E.proto static vocabulary = popupVocabulary
  @E.proto static styleSheets = { popup: popupCSS, "popup-anchored": anchoredCSS }
  @E.proto static elementSetup = {
    Fallback: PopupFallback,
    // nothing inside needs focus delegated:  a click on a tooltip's text must not jump to a link in it
    delegatesFocus: false
  }

  /** Listens to its own host:  pointer and focus leaving it, the popover's `toggle`, invoker commands. */
  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    this.on("pointerenter", this.onPopupEnter)
    this.on("pointerleave", this.onPopupLeave)
    this.on("focusout", this.onPopupFocusOut)
    this.on("toggle", this.onToggle)
    this.on("command", this.onCommand)
  }

  ////////////////
  // ## Open
  ////////////////

  /** `open`:  host-controlled, or internal;  `:state(open)`. */
  @E.cssState("open")
  @E.controlled("open")
  accessor isOpen = false

  /** Pending delayed show / hide. */
  private delayTimer?: ReturnType<typeof setTimeout>

  /** This element's `UI.overlays` entry;  `anchor` follows the target. */
  private readonly overlay: E.OverlayEntry = {
    element: this.host,
    kind: "popover",
    onDismiss: () => void this.requestOpen(false)
  }

  /** Show or hide, dispatching the cancelable `ui-open` / `ui-close` first;  true when applied. */
  requestOpen(open: boolean, originalEvent?: Event): boolean {
    clearTimeout(this.delayTimer)
    if (open === untrack(() => this.isOpen)) return false
    const detail: UIT.PopupOpenDetail = { open, originalEvent }
    return this.requestChange("isOpen", open, () => this.send(open ? "ui-open" : "ui-close", detail))
  }

  /** `requestOpen()` after `delay` ms (at once for `0`);  a newer call replaces a pending one. */
  private schedule(open: boolean, delay: number, originalEvent?: Event) {
    clearTimeout(this.delayTimer)
    if (delay <= 0) return void this.requestOpen(open, originalEvent)
    this.delayTimer = setTimeout(() => this.requestOpen(open, originalEvent), delay)
  }

  /** Ready, connected and open:  show (once a `ui-*` target is ready);  the cleanup hides. */
  @E.onChange("isReady", "isConnected", "isOpen")
  protected onOpenChanged(isReady: boolean, isConnected: boolean, isOpen: boolean) {
    if (!isReady || !isConnected || !isOpen) return undefined
    // a `ui-*` target renders async:  its box (or `display: contents`) is only known once it's ready
    let isCancelled = false
    const target = untrack(() => this.targetElement) as { ready?: Promise<void> } | undefined
    void (target?.ready ?? Promise.resolve()).then(() => isCancelled || this.show())
    return () => {
      isCancelled = true
      this.hide()
    }
  }

  /**
   * Show the popover against the target and register with `UI.overlays`.
   * - Anchor:  the target's `anchor-name` when it has a box, else the implicit anchor of `source` (see
   *   `ui-popup.css`).  `source` also makes the target the popover's invoker, so Tab from it continues inside.
   */
  private show() {
    const { host } = this
    const target = untrack(() => this.targetElement)
    const anchor = target ? UIPopup.anchorBoxFor(target) : undefined
    host.popover ||= this.popoverMode
    host.style.setProperty(POSITION_ANCHOR, anchor === target ? this.anchorName : anchor ? UIT.AUTO : UIT.NONE)
    if (!host.matches(UIT.POPOVER_OPEN)) {
      host.showPopover(anchor ? ({ source: anchor } as ShowPopoverOptions) : undefined)
    }
    this.overlay.anchor = target
    this.overlay.restoreFocus = untrack(() => this.isInteractive)
    UI.overlays.open(this.overlay)
  }

  /** Hide the popover and leave `UI.overlays`. */
  private hide() {
    clearTimeout(this.delayTimer)
    if (this.host.matches(UIT.POPOVER_OPEN)) this.host.hidePopover()
    UI.overlays.close(this.overlay)
  }

  /**
   * The popover's `toggle`:  the browser closed it (a `hint` popover's light dismiss) while the element thinks it's
   * open -- follow, announcing a `ui-close` that can't veto any more.
   */
  private readonly onToggle = (event: Event) => {
    if ((event as ToggleEvent).newState !== CLOSED || !this.host.isConnected || !untrack(() => this.isOpen)) return
    const detail: UIT.PopupOpenDetail = { open: false, originalEvent: event }
    this.send("ui-close", detail)
    this.isOpen = false
  }

  /** An invoker command aimed at the host (`ToggleCommands`). */
  private readonly onCommand = (event: Event) => {
    const action = UIT.ToggleCommands.action(
      event,
      untrack(() => this.isOpen)
    )
    if (action) this.requestOpen(action === "show", event)
  }

  ////////////////
  // ## The target
  ////////////////

  /**
   * The target:  `target` property, else `for`, else the previous element sibling;  `undefined` when unbound.
   * - Not `target`:  that's the attribute's getter, the property this reads first.
   */
  @E.derived
  get targetElement(): Element | undefined {
    if (!this.isConnected) return undefined
    const property = this.target
    if (UIPopup.isElement(property)) return property
    const id = this.for
    if (id) return (this.host.getRootNode() as Document | ShadowRoot).getElementById?.(id) ?? undefined
    return this.host.previousElementSibling ?? undefined
  }

  /** What opens it. */
  get trigger(): UIT.PopupTrigger {
    return this.openOn ?? DEFAULT_TRIGGER
  }

  /** A click popup:  a non-modal dialog with interactive content, not a tooltip. */
  get isInteractive(): boolean {
    return this.trigger === UIT.PopupTrigger.click
  }

  /** Element carrying the target's ARIA (see class docs), while bound. */
  @E.state accessor ariaElement: Element | undefined = undefined

  /** Per-instance anchor name, from `UI.ids` on first bind. */
  private anchorName = ""

  /** Ready with a target:  bind it for the trigger;  the cleanup is `bind()`'s undo. */
  @E.onChange("isReady", "targetElement", "trigger")
  protected onTargetChanged(isReady: boolean, target: Element | undefined, trigger: UIT.PopupTrigger) {
    return isReady && target ? this.bind(target, trigger) : undefined
  }

  /**
   * Listen to `target` for `trigger`, add the anchor name and the ARIA;  returns the undo.
   * - SIDE EFFECTS:  see class docs.
   */
  private bind(target: Element, trigger: UIT.PopupTrigger): () => void {
    const { host } = this
    this.anchorName ||= `--${UI.ids.next(ID_PREFIX)}`
    const listeners = new AbortController()
    const options = { signal: listeners.signal }
    const isClick = trigger === UIT.PopupTrigger.click
    // `HTMLElement`'s event map:  an SVG target fires the same pointer / focus events
    const events = target as HTMLElement
    if (trigger === UIT.PopupTrigger.hover) {
      events.addEventListener("pointerenter", this.onTargetEnter, options)
      events.addEventListener("pointerleave", this.onTargetLeave, options)
    }
    if (trigger === UIT.PopupTrigger.hover || trigger === UIT.PopupTrigger.focus) {
      events.addEventListener("focusin", this.onTargetFocus, options)
      events.addEventListener("focusout", this.onTargetBlur, options)
    }
    if (isClick) events.addEventListener("click", this.onTargetClick, options)
    UIPopup.addAnchorName(target, this.anchorName)
    UI.ids.ensure(host, ID_PREFIX)
    const element = UIPopup.ariaTargetFor(target)
    const unrelate = UIPopup.addAriaRelation({ element, relation: isClick ? CONTROLS : DESCRIBED_BY, host })
    if (isClick) element.setAttribute(ARIA_HASPOPUP, DIALOG_ROLE)
    this.ariaElement = element
    return () => {
      listeners.abort()
      clearTimeout(this.delayTimer)
      UIPopup.removeAnchorName(target, this.anchorName)
      unrelate()
      if (isClick) {
        element.removeAttribute(ARIA_HASPOPUP)
        element.removeAttribute(UIT.ARIA_EXPANDED)
      }
      this.ariaElement = undefined
    }
  }

  /**
   * A server render's binding:  the target's ARIA, as `bind()` adds it, without listeners.
   * - SIDE EFFECTS:  gives the host (the render's parsed copy) an id, which its root keeps, and sets the target's
   *   `aria-describedby` / `aria-controls` and `aria-haspopup`.  No `aria-expanded`:  a native invoker reports its
   *   popover's state itself.
   */
  private serverBind() {
    const target = this.targetElement
    if (!target) return
    const isInteractive = this.isInteractive
    UI.ids.ensure(this.host, ID_PREFIX)
    const element = UIPopup.ariaTargetFor(target)
    UIPopup.addAriaRelation({ element, relation: isInteractive ? CONTROLS : DESCRIBED_BY, host: this.host })
    if (isInteractive) element.setAttribute(ARIA_HASPOPUP, DIALOG_ROLE)
  }

  /** A click popup's target says whether it's open (`aria-expanded`). */
  @E.onChange("ariaElement", "isInteractive", "isOpen")
  protected onExpandedChanged(element: Element | undefined, isInteractive: boolean, isOpen: boolean) {
    if (element && isInteractive) element.setAttribute(UIT.ARIA_EXPANDED, String(isOpen))
  }

  /** Pointer onto the target (`hover`):  show after `show-delay`. */
  private readonly onTargetEnter = (event: PointerEvent) => {
    this.schedule(true, this.showDelay ?? 0, event)
  }

  /** Pointer off the target (`hover`):  hide after `hide-delay`, unless it reaches the popup first. */
  private readonly onTargetLeave = (event: PointerEvent) => {
    this.schedule(false, this.hideDelay ?? 0, event)
  }

  /** Focus onto the target (`hover`, `focus`):  show at once. */
  private readonly onTargetFocus = (event: FocusEvent) => {
    this.schedule(true, 0, event)
  }

  /** Focus off the target (`hover`, `focus`):  hide, unless focus moved into the popup. */
  private readonly onTargetBlur = (event: FocusEvent) => {
    if (UI.focus.containsDeep(this.host, event.relatedTarget as Node | null)) return
    this.schedule(false, 0, event)
  }

  /** Click on the target (`click`):  toggle. */
  private readonly onTargetClick = (event: MouseEvent) => {
    this.requestOpen(!untrack(() => this.isOpen), event)
  }

  ////////////////
  // ## The popup itself
  ////////////////

  /** Pointer onto the popup:  keep a hovered popup open, unless `hoverable` is off (Fomantic's default). */
  private readonly onPopupEnter = () => {
    if (untrack(() => this.trigger) !== UIT.PopupTrigger.hover) return
    if (untrack(() => this.hoverable) !== false) clearTimeout(this.delayTimer)
  }

  /** Pointer off the popup:  hide a hovered popup after `hide-delay`. */
  private readonly onPopupLeave = (event: PointerEvent) => {
    if (untrack(() => this.trigger) === UIT.PopupTrigger.hover) this.schedule(false, this.hideDelay ?? 0, event)
  }

  /** Focus off the popup (`focus`):  hide, unless it went back to the target. */
  private readonly onPopupFocusOut = (event: FocusEvent) => {
    if (untrack(() => this.trigger) !== UIT.PopupTrigger.focus) return
    const next = event.relatedTarget as Node | null
    const target = untrack(() => this.targetElement)
    if (UI.focus.containsDeep(this.host, next) || (target && next && UI.focus.containsDeep(target, next))) return
    this.schedule(false, 0, event)
  }

  ////////////////
  // ## Host role, name, position and popover
  ////////////////

  /** SIDE EFFECT:  the host is a dialog for a click popup, else a tooltip. */
  @E.onChange("isInteractive", { writesHost: true })
  protected onInteractiveChanged(isInteractive: boolean) {
    this.host.internals.role = isInteractive ? DIALOG_ROLE : TOOLTIP_ROLE
  }

  /** SIDE EFFECT:  a click popup's dialog is named by `header`. */
  @E.onChange("isInteractive", "header", { writesHost: true })
  protected onDialogNameChanged(isInteractive: boolean, header: string | undefined) {
    // `null`, not `undefined`:  `ElementInternals.ariaLabel` is a platform property, cleared by `null`
    this.host.internals.ariaLabel = isInteractive ? (header ?? null) : null
  }

  /** SIDE EFFECT:  the host's `position-area` follows `position`. */
  @E.onChange("position", { writesHost: true })
  protected onPositionChanged(position: string | undefined) {
    this.host.style.setProperty(POSITION_AREA, POSITION_AREAS[position ?? DEFAULT_POSITION])
  }

  /**
   * `popover` mode for the current trigger, see class docs.
   * - `manual` popups too stay `manual`:  the page decides, so several may be open at once (a `hint` closes the
   *   other hints).
   */
  private get popoverMode(): PopoverMode {
    const trigger = this.trigger
    const isHintable = trigger === UIT.PopupTrigger.hover || trigger === UIT.PopupTrigger.focus
    return isHintable && UI.browser.supports.popoverHint ? HINT : UIT.MANUAL
  }

  /**
   * Once ready, the host's `popover` follows the trigger (`popoverMode`).
   * - Reads `popoverMode` HERE, not as a member of the effect:  it reads `UI.browser`, which exists only once ready.
   */
  @E.onChange("isReady", "trigger")
  protected onPopoverModeChanged(isReady: boolean) {
    if (!isReady) return
    const mode = this.popoverMode
    if (this.host.popover !== mode) this.host.popover = mode
  }

  /**
   * `popover` of the ROOT in a server render (`$/ui/static`), where the root replaces the host:  hidden until
   * opened, in the HTML.
   * - `auto` for a click popup:  light dismiss and Escape without JS, once something opens it (`popovertarget`);
   *   `manual` for the rest (`hint` isn't everywhere, and an unknown value means `manual`).
   */
  private get serverPopover(): PopoverMode {
    return this.isInteractive ? UIT.AUTO : UIT.MANUAL
  }

  ////////////////
  // ## Classes and states
  ////////////////

  /** The `open` class:  the controlled state, not just the attribute. */
  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "open") return this.isOpen
    return super.classValue(name)
  }

  /** The position words, after the noun:  `ui popup top left`. */
  protected get extraClasses(): string | undefined {
    return this.position ?? DEFAULT_POSITION
  }

  /** As wide as its target (`fluid`):  `:state(fluid)`. */
  @E.cssState("fluid")
  get isFluid(): boolean {
    return this.fluid
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Adds the server render's target binding (`serverBind()`) to `UIElement.onMount()`;  the role, name and position
   * effects write the host there too (`writesHost`).
   */
  onMount(): JSX.Element {
    if (isServer) this.serverBind()
    return super.onMount()
  }

  render(): JSX.Element {
    if (isServer) return this.serverMarkup()
    return (
      <div class={this.rootClasses} part={this.partForName("popup")}>
        <Show when={this.header}>
          <div class={UIT.HEADER} part={this.partForName("header")}>
            {this.header}
          </div>
        </Show>
        <Show when={this.content}>
          <div class={UIT.CONTENT} part={this.partForName("content")}>
            {this.content}
          </div>
        </Show>
        <slot />
      </div>
    )
  }

  /**
   * The static markup of a server render (`$/ui/static`), where the root replaces the host:
   * - a popover itself (`serverPopover`):  hidden until opened, in the HTML
   * - PHRASING content (`<span>`s):  a popup often sits in running text, after a `<dfn>` or a button in a `<p>`,
   *   where its host was valid;  a `<div>` would close the `<p>` when a browser parses the page
   */
  private serverMarkup(): JSX.Element {
    return (
      <span class={this.rootClasses} part={this.partForName("popup")} popover={this.serverPopover}>
        <Show when={this.header}>
          <span class={UIT.HEADER} part={this.partForName("header")}>
            {this.header}
          </span>
        </Show>
        <Show when={this.content}>
          <span class={UIT.CONTENT} part={this.partForName("content")}>
            {this.content}
          </span>
        </Show>
        <slot />
      </span>
    )
  }

  ////////////////
  // ## Targets
  ////////////////

  /**
   * `value` is an element:  by node type, since a server render (`$/ui/static`) has no `Element` global.
   * - STATIC:  pure.
   */
  private static isElement(value: unknown): value is Element {
    return typeof value === "object" && value !== null && (value as Node).nodeType === E.NodeType.element
  }

  /**
   * The box to anchor to:  `target`, or -- when it has none (`display: contents`) -- the first element of its
   * shadow root, else its first child element.
   * - STATIC:  needs no instance, only the target.
   */
  private static anchorBoxFor(target: Element): Element {
    if (getComputedStyle(target).display !== CONTENTS) return target
    return target.shadowRoot?.firstElementChild ?? target.firstElementChild ?? target
  }

  /**
   * The element that takes focus for `target`:  a `delegatesFocus` host's first focusable, else `target`.
   * - STATIC:  needs no instance, only the target.
   */
  private static ariaTargetFor(target: Element): Element {
    const root = target.shadowRoot
    return (root?.delegatesFocus && UI.focus.first(root)) || target
  }

  ////////////////
  // ## Target markup:  light DOM the popup doesn't own
  ////////////////

  /**
   * Add `name` to `element`'s inline `anchor-name` LIST:  several popups can share one target, and the page may name
   * it too.
   * - STATIC:  needs no instance;  every popup bound to one target writes the same list.
   */
  private static addAnchorName(element: Element, name: string) {
    const style = (element as HTMLElement).style
    if (!style) return
    const names = UIPopup.anchorNamesIn(style)
    if (!names.includes(name)) style.setProperty(ANCHOR_NAME, [...names, name].join(", "))
  }

  /**
   * Remove `name` from `element`'s inline `anchor-name`;  drops the property when none are left.
   * - STATIC:  as `addAnchorName()`.
   */
  private static removeAnchorName(element: Element, name: string) {
    const style = (element as HTMLElement).style
    if (!style) return
    const names = UIPopup.anchorNamesIn(style).filter((each) => each !== name)
    if (names.length) style.setProperty(ANCHOR_NAME, names.join(", "))
    else style.removeProperty(ANCHOR_NAME)
  }

  /**
   * Names in `style`'s `anchor-name`.
   * - STATIC:  pure.
   */
  private static anchorNamesIn(style: CSSStyleDeclaration): string[] {
    const value = style.getPropertyValue(ANCHOR_NAME).trim()
    return value && value !== UIT.NONE ? value.split(",").map((name) => name.trim()) : []
  }

  /**
   * Point `element`'s idref `relation` (`aria-describedby`, `aria-controls`) at `host` too, ADDED to what's there;
   * returns the undo.
   * - The attribute's token list when both share a tree, else element reflection (`ariaDescribedByElements`), since
   *   an idref can't cross a shadow boundary.
   * - The undo keeps the way it was added:  by the time it runs the host may be detached (its root is then
   *   itself), which must not switch an attribute token list over to reflection.
   * - STATIC:  needs no instance;  a server render (`serverBind()`) and a live binding (`bind()`) share it.
   */
  private static addAriaRelation({ element, relation, host }: AriaRelationProps): () => void {
    const reflected = element as unknown as Record<string, Element[] | null>
    if (element.getRootNode() === host.getRootNode()) {
      const id = host.id
      const ids = UIPopup.idsIn(element, relation.attribute)
      if (!ids.includes(id)) element.setAttribute(relation.attribute, [...ids, id].join(" "))
      return () => {
        const rest = UIPopup.idsIn(element, relation.attribute).filter((each) => each !== id)
        if (rest.length) element.setAttribute(relation.attribute, rest.join(" "))
        else element.removeAttribute(relation.attribute)
      }
    }
    const elements = reflected[relation.property] ?? []
    if (!elements.includes(host)) reflected[relation.property] = [...elements, host]
    return () => {
      const rest = (reflected[relation.property] ?? []).filter((each) => each !== host)
      // `null`, not `undefined`:  element reflection is a platform property, cleared by `null`
      reflected[relation.property] = rest.length ? rest : null
    }
  }

  /**
   * Ids in `element`'s `attribute`.
   * - STATIC:  pure.
   */
  private static idsIn(element: Element, attribute: string): string[] {
    return (element.getAttribute(attribute) ?? "").split(UIT.WHITESPACE).filter(Boolean)
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIPopup extends E.AttributeValues<Vocabulary> {}

/** What `UIPopup.addAriaRelation()` takes. */
type AriaRelationProps = {
  /** the element that takes focus for the target */
  element: Element
  /** which idref relation */
  relation: AriaRelation
  /** the popup host it points at */
  host: Element
}

////////////////
// ## Constants
////////////////

/** Fomantic's default trigger. */
const DEFAULT_TRIGGER: UIT.PopupTrigger = UIT.PopupTrigger.hover

/** `UI.ids` prefix. */
const ID_PREFIX = "ui-popup"

/** Host role of a tooltip (`hover`, `focus`, `manual`). */
const TOOLTIP_ROLE = "tooltip"

/** Host role of a click popup;  also the target's `aria-haspopup`. */
const DIALOG_ROLE = "dialog"

/** `popover` mode of a hover / focus popup, where the browser has it. */
const HINT: PopoverMode = "hint"

/** Tooltips describe their target. */
const DESCRIBED_BY: AriaRelation = { attribute: "aria-describedby", property: "ariaDescribedByElements" }

/** Click popups are controlled by their target. */
const CONTROLS: AriaRelation = { attribute: "aria-controls", property: "ariaControlsElements" }

/** ARIA attribute set on a click popup's target. */
const ARIA_HASPOPUP = "aria-haspopup"

/** `ToggleEvent.newState` of a popover the browser closed. */
const CLOSED = "closed"

/** CSS property set inline on the target:  its anchor names. */
const ANCHOR_NAME = "anchor-name"

/** CSS property set inline on the host:  its anchor. */
const POSITION_ANCHOR = "position-anchor"

/** CSS property set inline on the host:  where it sits. */
const POSITION_AREA = "position-area"

/** `display` of a target with no box of its own. */
const CONTENTS = "contents"

/**
 * `position` => `position-area`:  the popup on that side, its edge lined up with the target's (`span-*` grows
 * away from the named corner), or centred on it.
 */
const POSITION_AREAS: Readonly<Record<string, string>> = {
  "top left": "top span-right",
  "top center": "top center",
  "top right": "top span-left",
  "bottom left": "bottom span-right",
  "bottom center": "bottom center",
  "bottom right": "bottom span-left",
  "left center": "left center",
  "right center": "right center",
  "left top": "left span-bottom",
  "left bottom": "left span-top",
  "right top": "right span-bottom",
  "right bottom": "right span-top"
}
