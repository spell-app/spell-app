import { Show, createEffect, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import {
  Cell,
  HostAttribute,
  IconGlyph,
  MODAL_ACTION_SELECTORS,
  MODAL_COMMANDS,
  UI,
  UIElement,
  type AttributeName,
  type AttributeValues,
  type CamelCase,
  type ComponentVocabulary,
  type DismissReason,
  type EventName,
  type ModalActionDetail,
  type ModalCloseDetail,
  type ModalCloseReason,
  type ModalOpenDetail,
  type OverlayEntry,
  type OverlayKind,
  type PartName,
  type TextKey
} from "$/ui/core"

/****************
 * ### `DialogElement`
 * The CONTROLLER logic `<ui-modal>` and `<ui-flyout>` share:  a shadow `<dialog class="ui ... <noun>"
 * part="<rootPart>">` shown with `showModal()` -- the browser's focus trap, `inert` page, top layer and
 * `::backdrop` (the dimmer).  A subclass adds only its names and looks:  vocabulary, `styles`, `Fallback`,
 * `rootPart`, `overlayKind`.
 * - Why a base in the modal family, not `src/elements/`:  a flyout IS Fomantic's side modal -- same parts, buttons,
 *   events and dismissal;  nothing else shares it yet.  The plan's `OverlayElement` (`src/elements/`) would host
 *   it once a third, non-modal-family element needs it.
 * - Vocabulary contract (checked by each family's tests, not by types):  attributes `open`, `closable`, `closedby`,
 *   `header`, `content`;  events `ui-open`, `ui-show`, `ui-close`, `ui-hide`, `ui-approve`, `ui-deny`;  parts
 *   `rootPart`, `header`, `content`, `close`;  state `open`;  text `close`.
 * - `open` is auto-controlled:  `ui-open` / `ui-close` (with a `reason`) come first and can veto;  `ui-show` /
 *   `ui-hide` follow once the CSS transition has finished.
 * - Dismissal, by `closedby` (read when it opens):
 *   - Escape:  through `UI.overlays` (kind `overlayKind`:  scroll lock, keyboard scope, focus restore), so only the
 *     topmost overlay closes and `ui-close` can veto;  the dialog's own `cancel` is always prevented
 *   - a click on the `::backdrop`:  the browser's light dismiss (`<dialog closedby>`) when
 *     `UI.browser.supports.dialogClosedBy`, reported as `cancel`;  else `UI.overlays`' outside click, which
 *     tells a backdrop click from one on the dialog by the pointer position
 *   - a close the browser forces anyway (a repeated Escape it won't let a page veto) is followed:  a `ui-close`
 *     that can't veto, then `open` off
 * - Opening as a USER action (so `ui-open` fires):  an invoker command, `<button commandfor="id" command="--show">`
 *   (`MODAL_COMMANDS`;  `--close` closes);  an `open` write is the app's own decision and fires nothing.
 * - Buttons:  a click on an approve / deny element (`MODAL_ACTION_SELECTORS`:  Fomantic's `.approve` / `.deny`
 *   classes, `<ui-button positive / negative>`) fires the cancelable `ui-approve` / `ui-deny`, then closes;  the
 *   `closable` icon closes (reason `close`).
 * - Name:  the host's `aria-label`, else the `header` shorthand, else a slotted `<ui-header>` (element
 *   reflection:  an idref can't reach into the light DOM from here).
 ****************/
export abstract class DialogElement<V extends ComponentVocabulary = ComponentVocabulary> extends UIElement<V> {
  /** Part name of the `<dialog>`, e.g. `modal`. */
  declare rootPart: string

  /** `UI.overlays` kind:  `modal` or `flyout`. */
  declare overlayKind: OverlayKind

  ////////////////
  // ## State
  ////////////////

  /** `open`:  host-controlled, or internal. */
  readonly openState = this.controlled(OPEN as AttributeName<V>, false as OpenValue<V>)

  /** Glyph of the close icon. */
  readonly closeGlyph = new IconGlyph(() => (this.dialogAttrs.closable ? CLOSE_ICON : undefined))

  /** Host `aria-label`, forwarded to the dialog. */
  readonly ariaLabel = new HostAttribute(this.host, ARIA_LABEL)

  /** First slotted `<ui-header>` (any tag whose noun is `header`), which names the dialog. */
  readonly heading = new Cell<Element | null>(this.findHeading())

  /** The dialog. */
  protected dialog?: HTMLDialogElement

  /** Id of the `header` shorthand, from `UI.ids` once rendering. */
  private headerId = ""

  /** Bumped on every show / hide, so a late `ui-show` / `ui-hide` of an earlier one is dropped. */
  private generation = 0

  /** A dismissal was asked for in this task:  the dialog's own `cancel` for the same key press is ignored. */
  private dismissing = false

  /** The last press started on the `::backdrop`. */
  private backdropPress = false

  /**
   * This element's `UI.overlays` entry;  its Escape / outside options follow `closedby` when it opens.
   * - `kind` is the subclass's `overlayKind`, set in the constructor (a prototype value TypeScript can't see here).
   */
  private readonly overlay: OverlayEntry = {
    element: this.host,
    kind: "modal",
    onDismiss: (reason: DismissReason) => void this.requestClose(reason)
  }

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    this.overlay.kind = this.overlayKind
    const { host } = this
    const listeners = new AbortController()
    const options = { signal: listeners.signal }
    host.renderRoot.addEventListener("slotchange", () => this.heading.set(this.findHeading()), options)
    host.addEventListener("command", this.onCommand, options)
    host.addReleaseCallback(() => listeners.abort())
  }

  /** Open now. */
  isOpen(): boolean {
    return this.openState.get() as boolean
  }

  /** The dialog attributes this base reads, whatever the subclass's vocabulary (see the class docs). */
  protected get dialogAttrs(): DialogAttributes {
    return this.attrs as unknown as DialogAttributes
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: AttributeName<V>): unknown {
    if (name === OPEN) return this.isOpen()
    return super.classValue(name)
  }

  protected hostStates() {
    return { open: this.isOpen() } as ReturnType<UIElement<V>["hostStates"]>
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.headerId = UI.ids.next(`ui-${this.definition.vocabulary.noun}`)
    this.effects()
    return (
      <dialog
        ref={(element) => (this.dialog = element)}
        class={this.classes()}
        part={this.part(this.rootPart as PartName<V>)}
        onCancel={this.onCancel}
        onClose={this.onClose}
        onPointerDown={this.onPointerDown}
        onClick={this.onDialogClick}
      >
        <Show when={this.dialogAttrs.header}>
          <div id={this.headerId} class={HEADER} part={this.part(HEADER as PartName<V>)}>
            {this.dialogAttrs.header}
          </div>
        </Show>
        <Show when={this.dialogAttrs.content}>
          <div class={CONTENT} part={this.part(CONTENT as PartName<V>)}>
            {this.dialogAttrs.content}
          </div>
        </Show>
        <slot />
        <Show when={this.dialogAttrs.closable}>
          <button
            type="button"
            class={CLOSE_CLASS}
            part={this.part(CLOSE as PartName<V>)}
            aria-label={this.text(CLOSE as TextKey<V>)}
            onClick={this.onCloseIcon}
          >
            {this.closeGlyph.svg()}
          </button>
        </Show>
      </dialog>
    )
  }

  ////////////////
  // ## Effects
  ////////////////

  /** The dialog's name, and showing / hiding it while open AND connected. */
  private effects() {
    createEffect(
      () => ({ label: this.ariaLabel.get(), header: !!this.dialogAttrs.header, heading: this.heading.get() }),
      ({ label, header, heading }) => {
        const dialog = this.dialog
        if (!dialog) return
        const reflected = dialog as unknown as { ariaLabelledByElements: Element[] | null }
        if (label) dialog.setAttribute(ARIA_LABEL, label)
        else dialog.removeAttribute(ARIA_LABEL)
        // NOTE: setting the reflected list (even to `null`) rewrites the attribute, so it goes first
        reflected.ariaLabelledByElements = !label && !header && heading ? [heading] : null
        if (!label && header) dialog.setAttribute(ARIA_LABELLEDBY, this.headerId)
      }
    )
    createEffect(
      () => this.connected.get() && this.isOpen(),
      (open) => {
        if (!open) return
        this.show()
        return () => this.hide()
      }
    )
  }

  /**
   * `showModal()`, register with `UI.overlays`, `ui-show` once the entry transition ends.
   * - `closedby` is applied here:  natively when supported (the browser's light dismiss), else by the overlay
   *   entry's outside-click handling.
   */
  private show() {
    const dialog = this.dialog
    if (!dialog) return
    const closedBy = untrack(() => this.dialogAttrs.closedby) ?? ANY
    const native = UI.browser.supports.dialogClosedBy
    if (native) dialog.setAttribute(CLOSEDBY, closedBy)
    else dialog.removeAttribute(CLOSEDBY)
    this.overlay.closeOnEscape = closedBy !== NONE
    this.overlay.closeOnOutsideClick = !native && closedBy === ANY
    if (!dialog.open) dialog.showModal()
    UI.overlays.open(this.overlay)
    this.after(() => {
      const detail: ModalOpenDetail = { open: true }
      if (untrack(() => this.isOpen())) this.fire("ui-show", detail)
    })
  }

  /**
   * `close()` the dialog, THEN leave `UI.overlays` (whose focus restore needs the page no longer `inert`),
   * `ui-hide` once the exit transition ends.
   */
  private hide() {
    const dialog = this.dialog
    if (dialog?.open) dialog.close()
    UI.overlays.close(this.overlay)
    this.after(() => {
      const detail: ModalOpenDetail = { open: false }
      if (!untrack(() => this.isOpen()) && this.host.isConnected) this.fire("ui-hide", detail)
    })
  }

  /** Run `then` once the dialog's own transitions end, unless another show / hide started meanwhile. */
  private after(then: () => void) {
    const generation = ++this.generation
    const animations = this.dialog?.getAnimations() ?? []
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (generation === this.generation) then()
    })
  }

  ////////////////
  // ## Transitions
  ////////////////

  /** Show, dispatching the cancelable `ui-open` first;  true when applied. */
  setOpen(originalEvent?: Event): boolean {
    if (untrack(() => this.isOpen())) return false
    const detail: ModalOpenDetail = { open: true, originalEvent }
    return this.openState.request(true as OpenValue<V>, () => this.fire("ui-open", detail))
  }

  /** Hide for `reason`, dispatching the cancelable `ui-close` first;  true when applied. */
  requestClose(reason: ModalCloseReason, originalEvent?: Event): boolean {
    if (!untrack(() => this.isOpen())) return false
    this.dismissing = true
    setTimeout(() => (this.dismissing = false))
    const detail: ModalCloseDetail = { open: false, reason, originalEvent }
    return this.openState.request(false as OpenValue<V>, () => this.fire("ui-close", detail))
  }

  /** `emit()` one of the events every dialog vocabulary names (see the class docs). */
  private fire(name: DialogEventName, detail: object): boolean {
    return this.emit(name as EventName<V>, detail)
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** An invoker command aimed at the host (`MODAL_COMMANDS`). */
  private readonly onCommand = (event: Event) => {
    const { command } = event as Event & { command: string }
    if (command === MODAL_COMMANDS.show) this.setOpen(event)
    else if (command === MODAL_COMMANDS.close) this.requestClose(CLOSE, event)
  }

  /** Close icon. */
  private readonly onCloseIcon = (event: MouseEvent) => {
    event.stopPropagation()
    this.requestClose(CLOSE, event)
  }

  /** Remember whether a press started on the `::backdrop` (the dialog itself, outside its box). */
  private readonly onPointerDown = (event: PointerEvent) => {
    const dialog = this.dialog
    if (!dialog || event.target !== dialog) return void (this.backdropPress = false)
    const box = dialog.getBoundingClientRect()
    const { clientX: x, clientY: y } = event
    this.backdropPress = x < box.left || x > box.right || y < box.top || y > box.bottom
  }

  /**
   * The dialog's `cancel`:  Escape the overlay didn't take, or the browser's light dismiss (`closedby`).
   * - Always prevented;  the element decides, by `closedby`, and `ui-close` may veto.
   */
  private readonly onCancel = (event: Event) => {
    event.preventDefault()
    const reason = this.backdropPress ? OUTSIDE : ESCAPE
    this.backdropPress = false
    if (this.dismissing) return
    const closedBy = untrack(() => this.dialogAttrs.closedby) ?? ANY
    if (closedBy === NONE || (reason === OUTSIDE && closedBy !== ANY)) return
    this.requestClose(reason, event)
  }

  /**
   * The dialog closed while the element thinks it's open:  the browser forced it -- follow.
   * - `close` is queued as a task:  one from an earlier close can arrive after a quick re-open, when the dialog is
   *   open again -- ignored.
   */
  private readonly onClose = (event: Event) => {
    if (this.dialog?.open || !this.host.isConnected || !untrack(() => this.isOpen())) return
    const detail: ModalCloseDetail = { open: false, reason: ESCAPE, originalEvent: event }
    this.fire("ui-close", detail)
    this.openState.set(false as OpenValue<V>)
  }

  /** A click inside:  an approve / deny element asks, then closes. */
  private readonly onDialogClick = (event: MouseEvent) => {
    const found = this.actionOf(event)
    if (!found) return
    const [kind, action] = found
    const detail: ModalActionDetail = { action, originalEvent: event }
    if (!this.fire(kind === APPROVE ? "ui-approve" : "ui-deny", detail)) return
    this.requestClose(kind, event)
  }

  ////////////////
  // ## Reading the light DOM
  ////////////////

  /**
   * The approve / deny element `event` activated:  the innermost light-DOM element on its path matching
   * `MODAL_ACTION_SELECTORS`, up to the host.
   */
  private actionOf(event: Event): [typeof APPROVE | typeof DENY, Element] | undefined {
    const scope = this.host.getRootNode()
    for (const target of event.composedPath()) {
      if (target === this.host) return undefined
      if (!(target instanceof Element) || target.getRootNode() !== scope) continue
      if (target.matches(MODAL_ACTION_SELECTORS.approve)) return [APPROVE, target]
      if (target.matches(MODAL_ACTION_SELECTORS.deny)) return [DENY, target]
    }
    return undefined
  }

  /** First child element whose definition's noun is `header` (a `<ui-header>`, or a translated one). */
  private findHeading(): Element | null {
    for (const child of this.host.children) {
      if (UIElement.definitions.get(child.localName)?.vocabulary.noun === HEADER) return child
    }
    return null
  }
}

/** The dialog attributes `DialogElement` reads, as converted values. */
export type DialogAttributes = {
  closable?: boolean
  closedby?: "any" | "closerequest" | "none"
  header?: string
  content?: string
}

/** Events every dialog vocabulary names. */
type DialogEventName = "ui-open" | "ui-show" | "ui-close" | "ui-hide" | "ui-approve" | "ui-deny"

/** The converted type of `V`'s `open`. */
type OpenValue<V extends ComponentVocabulary> = AttributeValues<V>[CamelCase<AttributeName<V>> &
  keyof AttributeValues<V>]

/** The controlled attribute. */
const OPEN = "open"

/** `closedby` values the element reads. */
const ANY = "any"
const NONE = "none"

/** Close reasons it names itself. */
const ESCAPE = "escape"
const OUTSIDE = "outside"
const CLOSE = "close"
const APPROVE = "approve"
const DENY = "deny"

/** Attributes set on the dialog. */
const ARIA_LABEL = "aria-label"
const ARIA_LABELLEDBY = "aria-labelledby"
const CLOSEDBY = "closedby"

/** Class words of the markup contract (`modal.css`, `flyout.css`) -- grammar, not attributes. */
const HEADER = "header"
const CONTENT = "content"
const CLOSE_CLASS = "close icon"

/** Glyph of the close icon (Fomantic's `close icon`). */
const CLOSE_ICON = "xmark"
