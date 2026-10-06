import { Show, createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import {
  ARIA_LABELLEDBY,
  CLOSABLE,
  CLOSEDBY,
  DialogActions,
  OPEN,
  type DialogAttributes,
  type DialogEventName,
  type OpenValue
} from "./ui-modal.types"

/****************
 * ### `DialogElement`
 * The CONTROLLER logic `<ui-modal>` and `<ui-flyout>` share:  a shadow `<dialog class="ui ... <noun>"
 * part="<rootPart>">` shown with `showModal()` -- the browser's focus trap, `inert` page, top layer and
 * `::backdrop` (the dimmer).  A subclass adds only its names and looks:  vocabulary, `styles`, `Fallback`,
 * `rootPart`, `overlayKind`.
 * - Why a base in the modal family, not `src/elements/`:  a flyout IS Fomantic's side modal -- same parts, buttons,
 *   events and dismissal;  nothing else shares it yet.  The plan's `OverlayElement` (`src/elements/`) would host
 *   it once a third, non-modal-family element needs it (`agents/CODE-DEBT.md`, `ui`).
 * - Vocabulary contract (checked by each family's tests, not by types):  attributes `open`, `closable`, `closedby`,
 *   `header`, `content`;  events `ui-open`, `ui-show`, `ui-close`, `ui-hide`, `ui-approve`, `ui-deny`;  parts
 *   `rootPart`, `header`, `content`, `close`;  state `open`;  text `close`.
 * - `open` is auto-controlled:  `ui-open` / `ui-close` (with a `reason`) come first and can veto;  `ui-show` /
 *   `ui-hide` follow once the CSS transition has finished.
 * - Dismissal, by `closedby` (read when it opens;  see `closedBy()` for what an absent one means):
 *   - Escape:  through `UI.overlays` (kind `overlayKind`:  scroll lock, keyboard scope, focus restore), so only the
 *     topmost overlay closes and `ui-close` can veto;  the dialog's own `cancel` is always prevented
 *   - a click on the `::backdrop`:  the browser's light dismiss (`<dialog closedby>`) when
 *     `UI.browser.supports.dialogClosedBy`, reported as `cancel`;  else `UI.overlays`' outside click, which
 *     tells a backdrop click from one on the dialog by the pointer position
 *   - a close the browser forces anyway (a repeated Escape it won't let a page veto) is followed:  a `ui-close`
 *     that can't veto, then `open` off
 * - Opening as a PERSON'S action (so `ui-open` fires):  an invoker command, `<button commandfor="id"
 *   command="--show">` (`TOGGLE_COMMANDS`;  `--close` closes, `--toggle` flips);  an `open` write is the app's own
 *   decision and fires nothing.
 * - Buttons:  a click on an approve / deny element (`MODAL_ACTION_SELECTORS`:  Fomantic's `.approve` / `.deny`
 *   classes, `<ui-button positive / negative>`) fires the cancelable `ui-approve` / `ui-deny`, then closes;  the
 *   `closable` icon closes (reason `close`).
 * - `closable="false"` is Fomantic's `closable: false` AND `closeIcon: false`:  no icon, and (unless `closedby` is
 *   set) `closedby="none"` -- Escape and the dimmer do nothing.
 * - Name:  the host's `aria-label`, else the `header` shorthand, else a slotted `<ui-header>` (element
 *   reflection:  an idref can't reach into the light DOM from here).
 ****************/
export abstract class DialogElement<V extends E.ComponentVocabulary = E.ComponentVocabulary> extends E.UIElement<V> {
  /** Part name of the `<dialog>`, e.g. `modal`. */
  declare rootPart: string

  /** `UI.overlays` kind:  `modal` or `flyout`. */
  declare overlayKind: E.OverlayKind

  ////////////////
  // ## State
  ////////////////

  /** `open`:  host-controlled, or internal. */
  readonly openState = this.controlled(OPEN as E.AttributeName<V>, false as OpenValue<V>)

  /** Glyph of the close icon. */
  readonly closeGlyph = new E.IconGlyph(this, () => (this.dialogAttrs.closable ? UIT.CLOSE_ICON : undefined))

  /** Host `aria-label`, forwarded to the dialog. */
  readonly ariaLabel = new E.HostAttribute({ host: this.host, name: UIT.ARIA_LABEL })

  /**
   * First slotted `<ui-header>` (any tag whose noun is `header`), which names the dialog.
   * - Read on the server too, NO `isServer` guard:  the static render (`$/ui/static`, linkedom hosts) names the
   *   dialog by it (`serverLabelledBy()`).
   */
  readonly heading = new E.Cell<Element | undefined>(this.findHeading())

  /** The dialog. */
  protected dialog?: HTMLDialogElement

  /** Id of the `header` shorthand, from `UI.ids` once rendering. */
  private headerId = ""

  /** Bumped on every show / hide, so a late `ui-show` / `ui-hide` of an earlier one is dropped. */
  private generation = 0

  /** A dismissal was asked for in this task:  the dialog's own `cancel` for the same key press is ignored. */
  private isDismissing = false

  /** The last press started on the `::backdrop`. */
  private isBackdropPress = false

  /**
   * This element's `UI.overlays` entry;  its Escape / outside options follow `closedby` when it opens.
   * - `kind` is the subclass's `overlayKind`, set in the constructor (a prototype value TypeScript can't see here).
   */
  private readonly overlay: E.OverlayEntry = {
    element: this.host,
    kind: "modal",
    onDismiss: (reason: E.DismissReason) => void this.requestClose(reason)
  }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    this.overlay.kind = this.overlayKind
    if (isServer) return
    const { host } = this
    const listeners = new AbortController()
    const options = { signal: listeners.signal }
    host.renderRoot.addEventListener("slotchange", () => this.heading.set(this.findHeading()), options)
    host.addEventListener("command", this.onCommand, options)
    host.addReleaseCallback(() => listeners.abort())
  }

  /** Open now.  Tracked. */
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

  protected classValue(name: E.AttributeName<V>): unknown {
    if (name === OPEN) return this.isOpen()
    return super.classValue(name)
  }

  protected hostStates() {
    return { open: this.isOpen() } as ReturnType<E.UIElement<V>["hostStates"]>
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Adds the naming and show / hide effects (`effects()`):  they call `isOpen()`, which a subclass may override. */
  mount(): JSX.Element {
    this.effects()
    return super.mount()
  }

  render(): JSX.Element {
    this.headerId = UI.ids.next(`ui-${this.definition.vocabulary.noun}`)
    return (
      <dialog
        ref={(element) => (this.dialog = element)}
        class={this.classes()}
        part={this.dialogPart(this.rootPart)}
        aria-labelledby={isServer ? this.serverLabelledBy() : undefined}
        onCancel={this.onCancel}
        onClose={this.onClose}
        onPointerDown={this.onPointerDown}
        onClick={this.onDialogClick}
      >
        <Show when={this.dialogAttrs.header}>
          <div id={this.headerId} class={UIT.HEADER} part={this.dialogPart(UIT.HEADER)}>
            {this.dialogAttrs.header}
          </div>
        </Show>
        <Show when={this.dialogAttrs.content}>
          <div class={UIT.CONTENT} part={this.dialogPart(UIT.CONTENT)}>
            {this.dialogAttrs.content}
          </div>
        </Show>
        <slot />
        <Show when={this.dialogAttrs.closable}>
          <button
            type="button"
            class={UIT.CLOSE_CLASS}
            part={this.dialogPart(UIT.CLOSE)}
            aria-label={this.closeText()}
            onClick={this.onCloseIcon}
          >
            {this.closeGlyph.svg()}
          </button>
        </Show>
      </dialog>
    )
  }

  /**
   * `part` value of one of the parts every dialog vocabulary names (see the class docs).
   * - A method, not a cast in the JSX:  Solid's SSR compile (`hoistProps`) hoists a `<Show>`'s children into a
   *   module-level constructor and passes it every free identifier they use -- the type parameter `V` of a
   *   `PartName<V>` cast too, as a VALUE ("V is not defined").
   */
  private dialogPart(name: string): string {
    return this.part(name as E.PartName<V>)
  }

  /**
   * The dialog's `aria-labelledby` in a server render (`$/ui/static`), where no effect applies and no element
   * reflects:  the `header` shorthand's id, else the slotted heading's, unless the host has an `aria-label` (which
   * the static output moves onto the dialog).
   * - SIDE EFFECT:  gives the slotted heading (the render's parsed copy) an id if it has none.
   */
  private serverLabelledBy(): string | undefined {
    if (this.ariaLabel.get()) return undefined
    if (this.dialogAttrs.header) return this.headerId
    const heading = this.heading.get()
    return heading ? UI.ids.ensure(heading, `ui-${this.definition.vocabulary.noun}-heading`) : undefined
  }

  /** Label of the close icon (`text("close")`);  a method for the reason `dialogPart()` is. */
  private closeText(): string {
    return this.text(UIT.CLOSE as E.TextKey<V>)
  }

  ////////////////
  // ## Effects
  ////////////////

  /**
   * The dialog's name, and showing / hiding it while open AND connected.
   * - Both wait for the runtime (`loaded`), as the render does:  they act on the rendered `<dialog>`.
   */
  private effects() {
    createEffect(
      () => ({
        isRendered: this.loaded(),
        label: this.ariaLabel.get(),
        hasHeader: !!this.dialogAttrs.header,
        heading: this.heading.get()
      }),
      ({ label, hasHeader, heading }) => {
        const dialog = this.dialog
        if (!dialog) return
        const reflected = dialog as unknown as { ariaLabelledByElements: Element[] | null }
        if (label) dialog.setAttribute(UIT.ARIA_LABEL, label)
        else dialog.removeAttribute(UIT.ARIA_LABEL)
        // NOTE: setting the reflected list (even to `null`, the platform's "none") rewrites the attribute, so it
        // goes first
        reflected.ariaLabelledByElements = !label && !hasHeader && heading ? [heading] : null
        if (!label && hasHeader) dialog.setAttribute(ARIA_LABELLEDBY, this.headerId)
      }
    )
    createEffect(
      () => this.connected.get() && this.loaded() && this.isOpen(),
      (isShowing) => {
        if (!isShowing) return
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
    const closedBy = this.closedBy()
    const isNative = UI.browser.supports.dialogClosedBy
    if (isNative) dialog.setAttribute(CLOSEDBY, closedBy)
    else dialog.removeAttribute(CLOSEDBY)
    this.overlay.closeOnEscape = closedBy !== UIT.NONE
    this.overlay.closeOnOutsideClick = !isNative && closedBy === ANY
    if (!dialog.open) {
      dialog.showModal()
      UI.focus.enter(dialog)
    }
    UI.overlays.open(this.overlay)
    this.after(() => {
      const detail: UIT.ModalOpenDetail = { open: true }
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
      const detail: UIT.ModalOpenDetail = { open: false }
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
  requestOpen(originalEvent?: Event): boolean {
    if (untrack(() => this.isOpen())) return false
    const detail: UIT.ModalOpenDetail = { open: true, originalEvent }
    return this.openState.request(true as OpenValue<V>, () => this.fire("ui-open", detail))
  }

  /** Hide for `reason`, dispatching the cancelable `ui-close` first;  true when applied. */
  requestClose(reason: UIT.ModalCloseReason, originalEvent?: Event): boolean {
    if (!untrack(() => this.isOpen())) return false
    this.isDismissing = true
    setTimeout(() => (this.isDismissing = false))
    const detail: UIT.ModalCloseDetail = { open: false, reason, originalEvent }
    return this.openState.request(false as OpenValue<V>, () => this.fire("ui-close", detail))
  }

  /** `emit()` one of the events every dialog vocabulary names (see the class docs). */
  private fire(name: DialogEventName, detail: object): boolean {
    return this.emit(name as E.EventName<V>, detail)
  }

  /**
   * What dismisses it:  an explicit `closedby` wins;  else `none` for `closable="false"` (Fomantic's `closable:
   * false`), else `any`.
   * - NOTE: `closedby` has a vocabulary default, so presence is read off the host.
   */
  private closedBy(): NonNullable<DialogAttributes["closedby"]> {
    if (this.host.hasAttribute(CLOSEDBY)) return untrack(() => this.dialogAttrs.closedby) ?? ANY
    // NOTE: an absent boolean also converts to `false`, so `closable` must be present to mean "closable: false"
    const isOff = this.host.hasAttribute(CLOSABLE) && !untrack(() => this.dialogAttrs.closable)
    return isOff ? UIT.NONE : ANY
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** An invoker command aimed at the host (`TOGGLE_COMMANDS`). */
  private readonly onCommand = (event: Event) => {
    const action = UIT.ToggleCommands.action(
      event,
      untrack(() => this.isOpen())
    )
    if (action === "show") this.requestOpen(event)
    else if (action === "close") this.requestClose("close", event)
  }

  /** Close icon. */
  private readonly onCloseIcon = (event: MouseEvent) => {
    event.stopPropagation()
    this.requestClose("close", event)
  }

  /** Remember whether a press started on the `::backdrop` (the dialog itself, outside its box). */
  private readonly onPointerDown = (event: PointerEvent) => {
    const dialog = this.dialog
    if (!dialog || event.target !== dialog) return void (this.isBackdropPress = false)
    const box = dialog.getBoundingClientRect()
    const { clientX: x, clientY: y } = event
    this.isBackdropPress = x < box.left || x > box.right || y < box.top || y > box.bottom
  }

  /**
   * The dialog's `cancel`:  Escape the overlay didn't take, or the browser's light dismiss (`closedby`).
   * - Always prevented;  the element decides, by `closedby`, and `ui-close` may veto.
   */
  private readonly onCancel = (event: Event) => {
    event.preventDefault()
    const reason = this.isBackdropPress ? "outside" : "escape"
    this.isBackdropPress = false
    if (this.isDismissing) return
    const closedBy = this.closedBy()
    if (closedBy === UIT.NONE || (reason === "outside" && closedBy !== ANY)) return
    this.requestClose(reason, event)
  }

  /**
   * The dialog closed while the element thinks it's open:  the browser forced it -- follow.
   * - `close` is queued as a task:  one from an earlier close can arrive after a quick re-open, when the dialog is
   *   open again -- ignored.
   */
  private readonly onClose = (event: Event) => {
    if (this.dialog?.open || !this.host.isConnected || !untrack(() => this.isOpen())) return
    const detail: UIT.ModalCloseDetail = { open: false, reason: "escape", originalEvent: event }
    this.fire("ui-close", detail)
    this.openState.set(false as OpenValue<V>)
  }

  /** A click inside:  an approve / deny element asks, then closes. */
  private readonly onDialogClick = (event: MouseEvent) => {
    const found = DialogActions.actionFor(event, this.host)
    if (!found) return
    const [kind, action] = found
    const detail: UIT.ModalActionDetail = { action, originalEvent: event }
    if (!this.fire(kind === "approve" ? "ui-approve" : "ui-deny", detail)) return
    this.requestClose(kind, event)
  }

  ////////////////
  // ## Reading the light DOM
  ////////////////

  /** First child element whose definition's noun is `header` (a `<ui-header>`, or a translated one). */
  private findHeading(): Element | undefined {
    for (const child of this.host.children) {
      if (E.UIElement.definitions.get(child.localName)?.vocabulary.noun === UIT.HEADER) return child
    }
    return undefined
  }
}

/** `closedby` value:  anything dismisses it (Escape, the dimmer). */
const ANY = "any"
