import { Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { popupVocabulary } from "./UIPopup.en"

import popupCSS from "./UIPopup.css?inline"
import anchoredCSS from "./UIPopup.anchored.css?raw"

/****************
 * ### `UIPopup`
 * The component behind `<ui-popup>`:  a popup anchored to a TARGET.
 * The DOM element is a popover in the top layer, placed by CSS anchor positioning only (`UIPopup.css`),
 * holding `<div class="ui … popup [position]" part="popup">`.
 *
 * - Its target:  the `target` property, else the element `for` names (in the popup's own tree),
 *   else the previous element sibling (Fomantic's `inline` markup:  a popup right after what opens it).
 *
 * - `open-on`:  `hover` (with `show-delay` / `hide-delay`, and on keyboard focus too), `focus`,
 *   `click` (toggles), `manual` (only `open`).
 *   - A hovered popup stays open while the pointer is over it (WCAG 1.4.13),
 *     unlike Fomantic's default `hoverable: false`.  `hoverable="false"` gives Fomantic's behaviour back:
 *     it hides as the pointer leaves the target, after `hide-delay`.
 *
 * - Invoker commands (`<button commandfor="id" command="--toggle">`, `UIT.ToggleCommands`) are a person's actions
 *   too:  the popup opens at ITS target, whichever button sent the command.
 *
 * - `open` is controlled:  the cancelable `ui-open` / `ui-close` come first.
 *   Escape and outside clicks come from `UI.overlays` (kind `popover`;  the target counts as inside).
 *
 * - Its popover mode:  `hint` for hover / focus popups when `UI.browser.supports.popoverHint`
 *   (they don't close an open dropdown's menu), else `manual`.
 *   - Click and manual popups are always `manual`:  `auto`'s light dismiss would skip the cancelable `ui-close`.
 *   - When the browser dismisses a `hint` popover itself,
 *     the component follows (with a `ui-close` that can no longer veto).
 *
 * - Accessibility, by `open-on`:
 *   - `hover` / `focus` / `manual`:  the DOM element is `role=tooltip`;  the target is `aria-describedby` it
 *   - `click`:  the DOM element is `role=dialog` (non-modal, named by `header` or its `aria-label`);
 *     the target gets `aria-haspopup=dialog`, `aria-expanded`, `aria-controls`
 *   - the ARIA goes on the element that takes focus:  a `delegatesFocus` target's (`<ui-button>`'s) first
 *     focusable, through element reflection (`ariaDescribedByElements`) when that is in another tree.
 *
 * - SIDE EFFECTS on light DOM the popup doesn't own, undone when it unbinds:
 *   - the target's inline `anchor-name` (a per-instance name ADDED to its list) and its ARIA attributes
 *   - the DOM element's `popover`, `id`, and inline `position-anchor` / `position-area`.
 ****************/
@E.cssStates("fluid")
export class UIPopup extends E.UIComponent<Vocabulary> {
  @E.proto static vocabulary = popupVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { popup: popupCSS, "popup-anchored": anchoredCSS },
    // nothing inside needs focus delegated:  a click on a tooltip's text must not jump to a link in it
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Open
  ////////////////

  /** `open`:  the DOM element's `open` property when set, else kept here;  `:state(open)`. */
  @E.cssState("open")
  @E.controlled("open")
  accessor isOpen = false

  /** Pending delayed show / hide. */
  private delayTimer?: E.CancelablePromise<unknown>

  /** This element's `UI.overlays` entry;  `anchor` follows the target. */
  private readonly overlay: E.OverlayEntry = {
    element: this.domElement,
    kind: "popover",
    onDismiss: () => void this.requestOpen(false)
  }

  /** Show or hide, dispatching the cancelable `ui-open` / `ui-close` first;  true when applied. */
  @E.untracked
  requestOpen(open: boolean, originalEvent?: Event): boolean {
    this.delayTimer?.cancel()
    if (open === this.isOpen) return false
    const detail: UIT.PopupOpenDetail = { open, originalEvent }
    return this.requestChange("isOpen", open, () => this.send(open ? "ui-open" : "ui-close", detail))
  }

  /** `requestOpen()` after `delay` ms (at once for `0`);  a newer call replaces a pending one. */
  private schedule(open: boolean, delay: number, originalEvent?: Event) {
    this.delayTimer?.cancel()
    if (delay <= 0) return void this.requestOpen(open, originalEvent)
    this.delayTimer = E.after(delay / 1000, () => this.requestOpen(open, originalEvent))
  }

  /** Ready, connected and open:  show (once a `ui-*` target is ready);  the cleanup hides. */
  @E.onChange("isReady", "isConnected", "isOpen")
  protected onOpenChanged(isReady: boolean, isConnected: boolean, isOpen: boolean) {
    if (!isReady || !isConnected || !isOpen) return undefined
    // a `ui-*` target renders async:  its box (or `display: contents`) is only known once it's ready
    let isCancelled = false
    const target = this.targetElement as { ready?: Promise<void> } | undefined
    void (target?.ready ?? Promise.resolve()).then(() => isCancelled || this.show())
    return () => {
      isCancelled = true
      this.hide()
    }
  }

  /**
   * Show the popover against the target and register with `UI.overlays`.
   * - Anchor:  the target's `anchor-name` when it has a box, else the implicit anchor of `source` (see
   *   `UIPopup.css`).  `source` also makes the target the popover's invoker, so Tab from it continues inside.
   */
  @E.untracked
  private show() {
    const { domElement } = this
    const target = this.targetElement
    const anchor = target ? UIPopup.anchorBoxFor(target) : undefined
    domElement.popover ||= this.popoverMode
    domElement.style.setProperty("position-anchor", anchor === target ? this.anchorName : anchor ? "auto" : "none")
    if (!domElement.matches(":popover-open")) {
      domElement.showPopover(anchor ? ({ source: anchor } as ShowPopoverOptions) : undefined)
    }
    this.overlay.anchor = target
    this.overlay.restoreFocus = this.isInteractive
    UI.overlays.open(this.overlay)
  }

  /** Hide the popover and leave `UI.overlays`. */
  private hide() {
    this.delayTimer?.cancel()
    if (this.domElement.matches(":popover-open")) this.domElement.hidePopover()
    UI.overlays.close(this.overlay)
  }

  /**
   * The popover's `toggle`:  the browser closed it (a `hint` popover's light dismiss) while the element thinks it's
   * open -- follow, announcing a `ui-close` that can't veto any more.
   */
  @E.on("toggle")
  protected onToggle(event: Event) {
    if ((event as ToggleEvent).newState !== CLOSED || !this.domElement.isConnected || !this.isOpen) return
    const detail: UIT.PopupOpenDetail = { open: false, originalEvent: event }
    this.send("ui-close", detail)
    this.isOpen = false
  }

  /** An invoker command aimed at the DOM element (`ToggleCommands`). */
  @E.on("command")
  protected onCommand(event: Event) {
    const action = UIT.ToggleCommands.action(event, this.isOpen)
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
    if (id) return (this.domElement.getRootNode() as Document | ShadowRoot).getElementById?.(id) ?? undefined
    return this.domElement.previousElementSibling ?? undefined
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
    const { domElement } = this
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
    UI.ids.ensure(domElement, ID_PREFIX)
    const element = UIPopup.ariaTargetFor(target)
    const unrelate = UIPopup.addAriaRelation({ element, relation: isClick ? CONTROLS : DESCRIBED_BY, domElement })
    if (isClick) element.setAttribute("aria-haspopup", "dialog")
    this.ariaElement = element
    return () => {
      listeners.abort()
      this.delayTimer?.cancel()
      UIPopup.removeAnchorName(target, this.anchorName)
      unrelate()
      if (isClick) {
        element.removeAttribute("aria-haspopup")
        element.removeAttribute("aria-expanded")
      }
      this.ariaElement = undefined
    }
  }

  /**
   * A server render's binding:  the target's ARIA, as `bind()` adds it, without listeners.
   * - SIDE EFFECTS:  gives the DOM element (the render's parsed copy) an id, which its root keeps,
   *   and sets the target's `aria-describedby` / `aria-controls` and `aria-haspopup`.  No `aria-expanded`:
   *   a native invoker reports its popover's state itself.
   */
  private serverBind() {
    const target = this.targetElement
    if (!target) return
    const isInteractive = this.isInteractive
    UI.ids.ensure(this.domElement, ID_PREFIX)
    const element = UIPopup.ariaTargetFor(target)
    UIPopup.addAriaRelation({ element, relation: isInteractive ? CONTROLS : DESCRIBED_BY, domElement: this.domElement })
    if (isInteractive) element.setAttribute("aria-haspopup", "dialog")
  }

  /** A click popup's target says whether it's open (`aria-expanded`). */
  @E.onChange("ariaElement", "isInteractive", "isOpen")
  protected onExpandedChanged(element: Element | undefined, isInteractive: boolean, isOpen: boolean) {
    if (element && isInteractive) element.setAttribute("aria-expanded", String(isOpen))
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
    if (UI.focus.containsDeep(this.domElement, event.relatedTarget as Node | null)) return
    this.schedule(false, 0, event)
  }

  /** Click on the target (`click`):  toggle. */
  @E.untracked
  private readonly onTargetClick = (event: MouseEvent) => {
    this.requestOpen(!this.isOpen, event)
  }

  ////////////////
  // ## The popup itself
  ////////////////

  /** Pointer onto the popup:  keep a hovered popup open, unless `hoverable` is off (Fomantic's default). */
  @E.on("pointerenter")
  protected onPopupEnter() {
    if (this.trigger !== UIT.PopupTrigger.hover) return
    if (this.hoverable !== false) this.delayTimer?.cancel()
  }

  /** Pointer off the popup:  hide a hovered popup after `hide-delay`. */
  @E.on("pointerleave")
  protected onPopupLeave(event: PointerEvent) {
    if (this.trigger === UIT.PopupTrigger.hover) this.schedule(false, this.hideDelay ?? 0, event)
  }

  /** Focus off the popup (`focus`):  hide, unless it went back to the target. */
  @E.on("focusout")
  protected onPopupFocusOut(event: FocusEvent) {
    if (this.trigger !== UIT.PopupTrigger.focus) return
    const next = event.relatedTarget as Node | null
    const target = this.targetElement
    if (UI.focus.containsDeep(this.domElement, next) || (target && next && UI.focus.containsDeep(target, next))) return
    this.schedule(false, 0, event)
  }

  ////////////////
  // ## The DOM element's role, name, position and popover
  ////////////////

  /** The DOM element is a dialog for a click popup, else a tooltip. */
  @E.aria("role")
  protected get ariaRole(): string {
    return this.isInteractive ? "dialog" : "tooltip"
  }

  /** A click popup's dialog is named by `header`. */
  @E.aria("ariaLabel")
  protected get accessibleName(): string | undefined {
    return this.isInteractive ? this.header : undefined
  }

  /** SIDE EFFECT:  the DOM element's `position-area` follows `position`. */
  @E.onChange("position", { writesDOMElement: true })
  protected onPositionChanged(position: string | undefined) {
    this.domElement.style.setProperty("position-area", POSITION_AREAS[position ?? DEFAULT_POSITION])
  }

  /**
   * `popover` mode for the current trigger, see class docs.
   * - `manual` popups too stay `manual`:
   *   the page decides, so several may be open at once (a `hint` closes the other hints).
   */
  private get popoverMode(): PopoverMode {
    const trigger = this.trigger
    const isHintable = trigger === UIT.PopupTrigger.hover || trigger === UIT.PopupTrigger.focus
    return isHintable && UI.browser.supports.popoverHint ? "hint" : "manual"
  }

  /**
   * Once ready, the DOM element's `popover` follows the trigger (`popoverMode`).
   * - Reads `popoverMode` HERE, not as a member of the effect:  it reads `UI.browser`, which exists only once ready.
   */
  @E.onChange("isReady", "trigger")
  protected onPopoverModeChanged(isReady: boolean) {
    if (!isReady) return
    const mode = this.popoverMode
    if (this.domElement.popover !== mode) this.domElement.popover = mode
  }

  /**
   * `popover` of the ROOT in a server render (`$/ui/static`), where the root replaces the DOM element:
   * hidden until opened, in the HTML.
   * - `auto` for a click popup:  light dismiss and Escape without JS, once something opens it (`popovertarget`);
   *   `manual` for the rest (`hint` isn't everywhere, and an unknown value means `manual`).
   */
  private get serverPopover(): PopoverMode {
    return this.isInteractive ? "auto" : "manual"
  }

  ////////////////
  // ## Classes and states
  ////////////////

  /** The `open` class:  the controlled state, not just the attribute. */
  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "open") return this.isOpen
    return super.classValue(name)
  }

  /** The position words, before the noun:  `ui top left popup`. */
  protected get extraClass(): string | undefined {
    return this.position ?? DEFAULT_POSITION
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Adds the server render's target binding (`serverBind()`) to `UIComponent.onMount()`;  the role and name
   * (`@aria`) and the position effect (`writesDOMElement`) write the DOM element there too.
   */
  onMount(): JSX.Element {
    if (isServer) this.serverBind()
    return super.onMount()
  }

  render(): JSX.Element {
    if (isServer) return this.serverMarkup()
    return (
      <div class={this.rootClass} part={this.partForName("popup")}>
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
   * The static markup of a server render (`$/ui/static`), where the root replaces the DOM element:
   * - a popover itself (`serverPopover`):  hidden until opened, in the HTML
   * - PHRASING content (`<span>`s):  a popup often sits in running text, after a `<dfn>` or a button in a `<p>`,
   *   where its DOM element was valid;  a `<div>` would close the `<p>` when a browser parses the page
   */
  private serverMarkup(): JSX.Element {
    return (
      <span class={this.rootClass} part={this.partForName("popup")} popover={this.serverPopover}>
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
   * The element that takes focus for `target`:  a `delegatesFocus` DOM element's first focusable, else `target`.
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
   * Add `name` to `element`'s inline `anchor-name` LIST:
   * several popups can share one target, and the page may name it too.
   * - STATIC:  needs no instance;  every popup bound to one target writes the same list.
   */
  private static addAnchorName(element: Element, name: string) {
    const style = (element as HTMLElement).style
    if (!style) return
    const names = UIPopup.anchorNamesIn(style)
    if (!names.includes(name)) style.setProperty("anchor-name", [...names, name].join(", "))
  }

  /**
   * Remove `name` from `element`'s inline `anchor-name`;  drops the property when none are left.
   * - STATIC:  as `addAnchorName()`.
   */
  private static removeAnchorName(element: Element, name: string) {
    const style = (element as HTMLElement).style
    if (!style) return
    const names = UIPopup.anchorNamesIn(style).filter((each) => each !== name)
    if (names.length) style.setProperty("anchor-name", names.join(", "))
    else style.removeProperty("anchor-name")
  }

  /**
   * Names in `style`'s `anchor-name`.
   * - STATIC:  pure.
   */
  private static anchorNamesIn(style: CSSStyleDeclaration): string[] {
    const value = style.getPropertyValue("anchor-name").trim()
    return value && value !== "none" ? value.split(",").map((name) => name.trim()) : []
  }

  /**
   * Point `element`'s idref `relation` (`aria-describedby`, `aria-controls`) at `domElement` too,
   * ADDED to what's there;  returns the undo.
   * - The attribute's token list when both share a tree, else element reflection (`ariaDescribedByElements`),
   *   since an idref can't cross a shadow boundary.
   * - The undo keeps the way it was added:  by the time it runs the DOM element may be detached (its root is then
   *   itself), which must not switch an attribute token list over to reflection.
   * - STATIC:  needs no instance;  a server render (`serverBind()`) and a live binding (`bind()`) share it.
   */
  private static addAriaRelation({ element, relation, domElement }: AriaRelationProps): () => void {
    const reflected = element as unknown as Record<string, Element[] | null>
    if (element.getRootNode() === domElement.getRootNode()) {
      const id = domElement.id
      const ids = UIPopup.idsIn(element, relation.attribute)
      if (!ids.includes(id)) element.setAttribute(relation.attribute, [...ids, id].join(" "))
      return () => {
        const rest = UIPopup.idsIn(element, relation.attribute).filter((each) => each !== id)
        if (rest.length) element.setAttribute(relation.attribute, rest.join(" "))
        else element.removeAttribute(relation.attribute)
      }
    }
    const elements = reflected[relation.property] ?? []
    if (!elements.includes(domElement)) reflected[relation.property] = [...elements, domElement]
    return () => {
      const rest = (reflected[relation.property] ?? []).filter((each) => each !== domElement)
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIPopup extends E.AttributeValues<Vocabulary> {}

/** The vocabulary type, for brevity. */
type Vocabulary = typeof popupVocabulary

/** An idref ARIA relation:  its attribute and its element-reflection property. */
type AriaRelation = {
  /** the idref attribute, e.g. `aria-describedby` */
  attribute: string
  /** its element-reflection property, e.g. `ariaDescribedByElements` (an idref can't cross a shadow boundary) */
  property: string
}

/** `showPopover()` options with `source` (not in every DOM lib yet). */
type ShowPopoverOptions = {
  /** the invoker:  the implicit anchor, and where Tab continues from */
  source?: HTMLElement
}

/**
 * A `popover` value the component sets on its DOM element (or, in a server render, on its root):
 * - `auto`:  light dismiss;  only a server render's click popup
 * - `manual`:  the page (or the component) decides;  click and manual popups
 * - `hint`:  hover / focus popups, where the browser has it (`UI.browser.supports.popoverHint`)
 */
type PopoverMode = "auto" | "manual" | "hint"

/** What `UIPopup.addAriaRelation()` takes. */
type AriaRelationProps = {
  /** the element that takes focus for the target */
  element: Element
  /** which idref relation */
  relation: AriaRelation
  /** the popup's DOM element it points at */
  domElement: Element
}

////////////////
// ## Constants
////////////////

/** Fomantic's default position:  the popup's class words before its noun, `ui top left popup`. */
const DEFAULT_POSITION = "top left"

/** Fomantic's default trigger. */
const DEFAULT_TRIGGER: UIT.PopupTrigger = UIT.PopupTrigger.hover

/** `UI.ids` prefix. */
const ID_PREFIX = "ui-popup"

/** Tooltips describe their target. */
const DESCRIBED_BY: AriaRelation = { attribute: "aria-describedby", property: "ariaDescribedByElements" }

/** Click popups are controlled by their target. */
const CONTROLS: AriaRelation = { attribute: "aria-controls", property: "ariaControlsElements" }

/** `ToggleEvent.newState` of a popover the browser closed. */
const CLOSED = "closed"

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
