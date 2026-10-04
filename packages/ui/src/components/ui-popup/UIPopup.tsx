import { Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, UI, UIElement, type AttributeName, type OverlayEntry, UIT } from "$/ui/core"

import { popupVocabulary } from "./ui-popup.vocabulary.en"
import { PopupFallback } from "./ui-popup.fallback"

import popupCSS from "./ui-popup.css?inline"
import anchoredCSS from "./ui-popup.anchored.css?raw"
import {
  DEFAULT_TRIGGER,
  DEFAULT_POSITION,
  DIALOG,
  TOOLTIP,
  POSITION_AREAS,
  POSITION_AREA,
  ARIA_EXPANDED,
  HINT,
  POSITION_ANCHOR,
  ID_PREFIX,
  CONTROLS,
  DESCRIBED_BY,
  ARIA_HASPOPUP,
  CLOSED,
  CONTENTS,
  ANCHOR_NAME,
  ELEMENT_NODE
} from "./ui-popup.types"
import type { PopupVocabulary, ShowPopoverOptions, AriaRelation } from "./ui-popup.types"
import { HEADER, CONTENT, MANUAL, AUTO, NONE, POPOVER_OPEN } from "$/ui/components/components.types"

/****************
 * ### `<ui-popup>`
 * A popup anchored to a TARGET:  the HOST is a popover in the top layer, positioned with CSS anchor positioning
 * only (`ui-popup.css`), holding `<div class="ui ... popup [position]" part="popup">`.
 * - Target:  the `target` property, else the element `for` names (in the popup's own tree), else the previous
 *   element sibling -- Fomantic's `inline` markup, a popup right after its activator.
 * - `on`:  `hover` (with `show-delay` / `hide-delay`, and on keyboard focus too), `focus`, `click` (toggles),
 *   `manual` (only `open`).  A hovered popup stays open while the pointer is over it (WCAG 1.4.13), unlike
 *   Fomantic's default `hoverable: false`;  `hoverable="false"` gives Fomantic's behaviour back (it hides as the
 *   pointer leaves the target, after `hide-delay`).
 * - Invoker commands (`<button commandfor="id" command="--toggle">`, `TOGGLE_COMMANDS`) are user actions too:  the
 *   popup opens at ITS target, whichever button sent the command.
 * - `open` is auto-controlled:  the cancelable `ui-open` / `ui-close` come first.  Escape and outside clicks come
 *   from `UI.overlays` (kind `popover`, the target counts as inside).
 * - Popover mode:  `hint` for hover / focus popups when `UI.browser.supports.popoverHint` (they don't close an
 *   open dropdown's menu), else `manual`;  click and manual popups are always `manual` -- `auto`'s light dismiss
 *   would skip the cancelable `ui-close`.  When the browser dismisses a `hint` popover itself, the element follows (a
 *   `ui-close` that can no longer veto).
 * - Accessibility, by `on`:
 *   - `hover` / `focus` / `manual`:  host `role=tooltip`;  the target is `aria-describedby` it
 *   - `click`:  host `role=dialog` (non-modal, named by `header` or the host's `aria-label`);  the target gets
 *     `aria-haspopup=dialog`, `aria-expanded`, `aria-controls`
 *   - the ARIA goes on the element that takes focus:  a `delegatesFocus` target's (`<ui-button>`'s) first
 *     focusable, through element reflection (`ariaDescribedByElements`) when that is in another tree
 * - SIDE EFFECTS on light DOM the element doesn't own, undone when it unbinds:  the target's inline
 *   `anchor-name` (a per-instance name ADDED to its list) and ARIA attributes;  the host's `popover`, `id` and
 *   inline `position-anchor` / `position-area`.
 ****************/
export class UIPopup extends UIElement<PopupVocabulary> {
  @proto static vocabulary = popupVocabulary
  @proto static styles = { popup: popupCSS, "popup-anchored": anchoredCSS }
  @proto static Fallback = PopupFallback
  // nothing inside needs focus delegated:  a click on a tooltip's text must not jump to a link in it
  @proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** `open`:  host-controlled, or internal. */
  readonly openState = this.controlled("open", false)

  /** Element carrying the target's ARIA (see class docs), while bound. */
  readonly ariaElement = new Cell<Element | null>(null)

  /** The target:  `target` property, else `for`, else the previous element sibling;  `null` when unbound. */
  readonly target = createMemo((): Element | null => {
    if (!this.connected.get()) return null
    const property = this.attrs.target
    if (UIPopup.isElement(property)) return property
    const id = this.attrs.for
    if (id) return (this.host.getRootNode() as Document | ShadowRoot).getElementById?.(id) ?? null
    return this.host.previousElementSibling
  })

  /** What opens it. */
  readonly trigger = createMemo((): UIT.PopupTrigger => this.attrs.on ?? DEFAULT_TRIGGER)

  /** A click popup:  a non-modal dialog with interactive content, not a tooltip. */
  readonly interactive = createMemo(() => this.trigger() === "click")

  /** Pending delayed show / hide. */
  private timer?: ReturnType<typeof setTimeout>

  /** Per-instance anchor name, from `UI.ids` on first bind. */
  private anchorName = ""

  /** This element's `UI.overlays` entry;  `anchor` follows the target. */
  private readonly overlay: OverlayEntry = {
    element: this.host,
    kind: "popover",
    onDismiss: () => void this.setOpen(false)
  }

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    const { host } = this
    const listeners = new AbortController()
    const options = { signal: listeners.signal }
    host.addEventListener("pointerenter", this.onPopupEnter, options)
    host.addEventListener("pointerleave", this.onPopupLeave, options)
    host.addEventListener("focusout", this.onPopupFocusOut, options)
    host.addEventListener("toggle", this.onToggle, options)
    host.addEventListener("command", this.onCommand, options)
    host.addReleaseCallback(() => listeners.abort())
  }

  /** Open now. */
  isOpen(): boolean {
    return this.openState.get()
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: AttributeName<PopupVocabulary>): unknown {
    if (name === "open") return this.isOpen()
    return super.classValue(name)
  }

  /** The position words, after the noun:  `ui popup top left`. */
  protected extraClasses(): string | undefined {
    return this.attrs.position ?? DEFAULT_POSITION
  }

  protected hostStates() {
    return { open: this.isOpen(), fluid: this.attrs.fluid }
  }

  ////////////////
  // ## Rendering
  ////////////////

  mount(): JSX.Element {
    this.effects()
    return super.mount()
  }

  render(): JSX.Element {
    if (isServer) return this.renderServer()
    return (
      <div class={this.classes()} part={this.part("popup")}>
        <Show when={this.attrs.header}>
          <div class={HEADER} part={this.part("header")}>
            {this.attrs.header}
          </div>
        </Show>
        <Show when={this.attrs.content}>
          <div class={CONTENT} part={this.part("content")}>
            {this.attrs.content}
          </div>
        </Show>
        <slot />
      </div>
    )
  }

  /**
   * The static markup of a server render (`$/ui/server`), where the root replaces the host:
   * - a popover itself (`serverPopover()`):  hidden until opened, in the HTML
   * - PHRASING content (`<span>`s):  a popup often sits in running text, after a `<dfn>` or a button in a `<p>`,
   *   where its host was valid;  a `<div>` would close the `<p>` when a browser parses the page
   */
  private renderServer(): JSX.Element {
    return (
      <span class={this.classes()} part={this.part("popup")} popover={this.serverPopover()}>
        <Show when={this.attrs.header}>
          <span class={HEADER} part={this.part("header")}>
            {this.attrs.header}
          </span>
        </Show>
        <Show when={this.attrs.content}>
          <span class={CONTENT} part={this.part("content")}>
            {this.attrs.content}
          </span>
        </Show>
        <slot />
      </span>
    )
  }

  ////////////////
  // ## Effects
  ////////////////

  /**
   * Role / name, popover mode, position, target binding, and showing -- all once the runtime is loaded (`UI`).
   * - Created in `mount()`:  they read overridable methods and every field.
   * - Role, name and position are host effects:  a static render (`$/ui/server`) writes them out;  it binds the
   *   target's ARIA once (`serverBind()`) instead of the rest.
   */
  private effects() {
    const { host } = this
    this.hostEffect(
      () => (this.interactive() ? DIALOG : TOOLTIP),
      (role) => {
        host.internals.role = role
      }
    )
    this.hostEffect(
      () => (this.interactive() ? (this.attrs.header ?? null) : null),
      (label) => {
        host.internals.ariaLabel = label
      }
    )
    this.hostEffect(
      () => POSITION_AREAS[this.attrs.position ?? DEFAULT_POSITION],
      (area) => {
        host.style.setProperty(POSITION_AREA, area)
      }
    )
    if (isServer) return this.serverBind()
    createEffect(
      () => (this.loaded() ? this.popoverMode() : undefined),
      (mode) => {
        if (mode && host.popover !== mode) host.popover = mode
      }
    )
    createEffect(
      () => (this.loaded() ? { target: this.target(), trigger: this.trigger() } : undefined),
      (binding) => (binding?.target ? this.bind(binding.target, binding.trigger) : undefined)
    )
    createEffect(
      () => {
        const element = this.ariaElement.get()
        return element && this.interactive() ? { element, open: this.isOpen() } : undefined
      },
      (expanded) => expanded?.element.setAttribute(ARIA_EXPANDED, String(expanded.open))
    )
    createEffect(
      () => this.loaded() && this.connected.get() && this.isOpen(),
      (open) => {
        if (!open) return
        // a `ui-*` target renders async:  its box (or `display: contents`) is only known once it's ready
        let cancelled = false
        const target = untrack(this.target) as { ready?: Promise<void> } | null
        void (target?.ready ?? Promise.resolve()).then(() => cancelled || this.show())
        return () => {
          cancelled = true
          this.hide()
        }
      }
    )
  }

  /**
   * `popover` of the ROOT in a server render (`$/ui/server`), where the root replaces the host:  hidden until
   * opened, in the HTML.
   * - `auto` for a click popup:  light dismiss and Escape without JS, once something opens it (`popovertarget`);
   *   `manual` for the rest (`hint` isn't everywhere, and an unknown value means `manual`).
   */
  private serverPopover(): "auto" | "manual" {
    return this.interactive() ? AUTO : MANUAL
  }

  /**
   * A server render's binding:  the target's ARIA, as `bind()` adds it, without listeners.
   * - SIDE EFFECTS:  gives the host (the render's parsed copy) an id, which its root keeps, and sets the target's
   *   `aria-describedby` / `aria-controls` and `aria-haspopup`.  No `aria-expanded`:  a native invoker reports its
   *   popover's state itself.
   */
  private serverBind() {
    const target = this.target()
    if (!target) return
    const interactive = this.interactive()
    UI.ids.ensure(this.host, ID_PREFIX)
    const element = UIPopup.ariaTarget(target)
    AriaRefs.add(element, interactive ? CONTROLS : DESCRIBED_BY, this.host)
    if (interactive) element.setAttribute(ARIA_HASPOPUP, DIALOG)
  }

  /**
   * `popover` mode for the current trigger, see class docs.
   * - `manual` popups too stay `manual`:  the page decides, so several may be open at once (a `hint` closes the
   *   other hints).
   */
  private popoverMode(): "hint" | "manual" {
    const trigger = this.trigger()
    return (trigger === "hover" || trigger === "focus") && UI.browser.supports.popoverHint ? HINT : MANUAL
  }

  /**
   * Show the popover against the target and register with `UI.overlays`.
   * - Anchor:  the target's `anchor-name` when it has a box, else the implicit anchor of `source` (see
   *   `ui-popup.css`).  `source` also makes the target the popover's invoker, so Tab from it continues inside.
   */
  private show() {
    const { host } = this
    const target = untrack(this.target)
    const anchor = target ? UIPopup.anchorBox(target) : undefined
    host.popover ||= this.popoverMode()
    host.style.setProperty(POSITION_ANCHOR, anchor === target ? this.anchorName : anchor ? AUTO : NONE)
    if (!host.matches(POPOVER_OPEN)) host.showPopover(anchor ? ({ source: anchor } as ShowPopoverOptions) : undefined)
    this.overlay.anchor = target ?? undefined
    this.overlay.restoreFocus = untrack(this.interactive)
    UI.overlays.open(this.overlay)
  }

  /** Hide the popover and leave `UI.overlays`. */
  private hide() {
    clearTimeout(this.timer)
    if (this.host.matches(POPOVER_OPEN)) this.host.hidePopover()
    UI.overlays.close(this.overlay)
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
    // `HTMLElement`'s event map:  an SVG target fires the same pointer / focus events
    const events = target as HTMLElement
    if (trigger === "hover") {
      events.addEventListener("pointerenter", this.onTargetEnter, options)
      events.addEventListener("pointerleave", this.onTargetLeave, options)
    }
    if (trigger === "hover" || trigger === "focus") {
      events.addEventListener("focusin", this.onTargetFocus, options)
      events.addEventListener("focusout", this.onTargetBlur, options)
    }
    if (trigger === "click") events.addEventListener("click", this.onTargetClick, options)
    AnchorNames.add(target, this.anchorName)
    UI.ids.ensure(host, ID_PREFIX)
    const element = UIPopup.ariaTarget(target)
    const refs = trigger === "click" ? CONTROLS : DESCRIBED_BY
    const unrelate = AriaRefs.add(element, refs, host)
    if (trigger === "click") element.setAttribute(ARIA_HASPOPUP, DIALOG)
    this.ariaElement.set(element)
    return () => {
      listeners.abort()
      clearTimeout(this.timer)
      AnchorNames.remove(target, this.anchorName)
      unrelate()
      if (trigger === "click") {
        element.removeAttribute(ARIA_HASPOPUP)
        element.removeAttribute(ARIA_EXPANDED)
      }
      this.ariaElement.set(null)
    }
  }

  ////////////////
  // ## Transitions
  ////////////////

  /** Show or hide, dispatching the cancelable `ui-open` / `ui-close` first;  true when applied. */
  setOpen(open: boolean, originalEvent?: Event): boolean {
    clearTimeout(this.timer)
    if (open === untrack(() => this.isOpen())) return false
    const detail: UIT.PopupOpenDetail = { open, originalEvent }
    return this.openState.request(open, () => this.emit(open ? "ui-open" : "ui-close", detail))
  }

  /** `setOpen()` after `delay` ms (at once for `0`);  a newer call replaces a pending one. */
  private schedule(open: boolean, delay: number, originalEvent?: Event) {
    clearTimeout(this.timer)
    if (delay <= 0) return void this.setOpen(open, originalEvent)
    this.timer = setTimeout(() => this.setOpen(open, originalEvent), delay)
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Pointer onto the target (`hover`):  show after `show-delay`. */
  private readonly onTargetEnter = (event: PointerEvent) => {
    this.schedule(true, this.attrs.showDelay ?? 0, event)
  }

  /** Pointer off the target (`hover`):  hide after `hide-delay`, unless it reaches the popup first. */
  private readonly onTargetLeave = (event: PointerEvent) => {
    this.schedule(false, this.attrs.hideDelay ?? 0, event)
  }

  /** Pointer onto the popup:  keep a hovered popup open, unless `hoverable` is off (Fomantic's default). */
  private readonly onPopupEnter = () => {
    if (untrack(this.trigger) === "hover" && untrack(() => this.attrs.hoverable) !== false) clearTimeout(this.timer)
  }

  /** Pointer off the popup:  hide a hovered popup after `hide-delay`. */
  private readonly onPopupLeave = (event: PointerEvent) => {
    if (untrack(this.trigger) === "hover") this.schedule(false, this.attrs.hideDelay ?? 0, event)
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

  /** Focus off the popup (`focus`):  hide, unless it went back to the target. */
  private readonly onPopupFocusOut = (event: FocusEvent) => {
    if (untrack(this.trigger) !== "focus") return
    const next = event.relatedTarget as Node | null
    const target = untrack(this.target)
    if (UI.focus.containsDeep(this.host, next) || (target && next && UI.focus.containsDeep(target, next))) return
    this.schedule(false, 0, event)
  }

  /** Click on the target (`click`):  toggle. */
  private readonly onTargetClick = (event: MouseEvent) => {
    this.setOpen(!untrack(() => this.isOpen()), event)
  }

  /** An invoker command aimed at the host (`TOGGLE_COMMANDS`). */
  private readonly onCommand = (event: Event) => {
    const action = UIT.ToggleCommands.action(
      event,
      untrack(() => this.isOpen())
    )
    if (action) this.setOpen(action === "show", event)
  }

  /**
   * The popover's `toggle`:  the browser closed it (a `hint` popover's light dismiss) while the element thinks it's
   * open -- follow, announcing a `ui-close` that can't veto any more.
   */
  private readonly onToggle = (event: Event) => {
    if ((event as ToggleEvent).newState !== CLOSED || !this.host.isConnected || !untrack(() => this.isOpen())) return
    const detail: UIT.PopupOpenDetail = { open: false, originalEvent: event }
    this.emit("ui-close", detail)
    this.openState.set(false)
  }

  ////////////////
  // ## Targets
  ////////////////

  /** `value` is an element:  by node type, since a server render (`$/ui/server`) has no `Element` global. */
  private static isElement(value: unknown): value is Element {
    return typeof value === "object" && value !== null && (value as Node).nodeType === ELEMENT_NODE
  }

  /**
   * The box to anchor to:  `target`, or -- when it has none (`display: contents`) -- the first element of its
   * shadow root, else its first child element.
   */
  private static anchorBox(target: Element): Element {
    if (getComputedStyle(target).display !== CONTENTS) return target
    return target.shadowRoot?.firstElementChild ?? target.firstElementChild ?? target
  }

  /** The element that takes focus for `target`:  a `delegatesFocus` host's first focusable, else `target`. */
  private static ariaTarget(target: Element): Element {
    const root = target.shadowRoot
    return (root?.delegatesFocus && UI.focus.first(root)) || target
  }
}

////////////////
// ## Helpers
////////////////

/**
 * The inline `anchor-name` LIST of an element that isn't ours:  several popups can share one target, and the
 * page may name it too.
 */
class AnchorNames {
  /** Add `name` to `element`'s inline `anchor-name`. */
  static add(element: Element, name: string) {
    const style = (element as HTMLElement).style
    if (!style) return
    const names = AnchorNames.read(style)
    if (!names.includes(name)) style.setProperty(ANCHOR_NAME, [...names, name].join(", "))
  }

  /** Remove `name` from `element`'s inline `anchor-name`;  drops the property when none are left. */
  static remove(element: Element, name: string) {
    const style = (element as HTMLElement).style
    if (!style) return
    const names = AnchorNames.read(style).filter((each) => each !== name)
    if (names.length) style.setProperty(ANCHOR_NAME, names.join(", "))
    else style.removeProperty(ANCHOR_NAME)
  }

  /** Names in `style`'s `anchor-name`. */
  private static read(style: CSSStyleDeclaration): string[] {
    const value = style.getPropertyValue(ANCHOR_NAME).trim()
    return value && value !== NONE ? value.split(",").map((name) => name.trim()) : []
  }
}

/**
 * An idref relation (`aria-describedby`, `aria-controls`) from an element that isn't ours to the popup host,
 * ADDED to what's there:  the attribute's token list when both share a tree, else element reflection
 * (`ariaDescribedByElements`), since an idref can't cross a shadow boundary.
 */
class AriaRefs {
  /**
   * Point `element`'s `relation` at `host` too;  returns the undo.
   * - The undo keeps the way it was added:  by the time it runs the host may be detached (its root is then
   *   itself), which must not switch an attribute token list over to reflection.
   */
  static add(element: Element, relation: AriaRelation, host: Element): () => void {
    const reflected = element as unknown as Record<string, Element[] | null>
    if (element.getRootNode() === host.getRootNode()) {
      const id = host.id
      const ids = AriaRefs.ids(element, relation.attribute)
      if (!ids.includes(id)) element.setAttribute(relation.attribute, [...ids, id].join(" "))
      return () => {
        const rest = AriaRefs.ids(element, relation.attribute).filter((each) => each !== id)
        if (rest.length) element.setAttribute(relation.attribute, rest.join(" "))
        else element.removeAttribute(relation.attribute)
      }
    }
    const elements = reflected[relation.property] ?? []
    if (!elements.includes(host)) reflected[relation.property] = [...elements, host]
    return () => {
      const rest = (reflected[relation.property] ?? []).filter((each) => each !== host)
      reflected[relation.property] = rest.length ? rest : null
    }
  }

  /** Ids in `element`'s `attribute`. */
  private static ids(element: Element, attribute: string): string[] {
    return (element.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean)
  }
}
