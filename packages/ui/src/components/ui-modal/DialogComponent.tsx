import { Show, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { CLOSEDBY, type DialogAttributes, type DialogEventName } from "./UIModal.types"

/****************
 * ### `DialogComponent`
 * The base of the components behind `<ui-modal>` and `<ui-flyout>`:  everything they do,
 * on a shadow `<dialog class="ui … <noun>" part="<rootPart>">` shown with `showModal()`.
 * The browser gives it the focus trap, the `inert` page, the top layer and the `::backdrop` (the dimmer).
 *
 * - A subclass adds only its names and looks:  `vocabulary`, `styleSheets`, `rootPart`, `overlayKind`.
 *
 * - In the modal family, not `src/elements/`:  a flyout IS Fomantic's side modal
 *   (the same parts, buttons, events and dismissal), and nothing else shares it yet.
 *   A third, non-modal overlay would move it to `src/elements/` (`agents/CODE-DEBT.md`, `ui`).
 *
 * - Every dialog vocabulary MUST name (each family's tests check it;  types can't):
 *   - attributes `open`, `closable`, `closedby`, `header`, `content`
 *   - events `ui-open`, `ui-show`, `ui-close`, `ui-hide`, `ui-approve`, `ui-deny`
 *   - parts `rootPart`, `header`, `content`, `close`;  state `open`;  text `close`.
 *
 * - `open` is controlled (`isOpen`):  `ui-open` / `ui-close` (with a `reason`) come first and can veto;
 *   `ui-show` / `ui-hide` follow once the CSS transition has finished.
 *
 * - Dismissal, by `closedby` (read when it opens;  `closedBy` says what an absent one means):
 *   - Escape:  through `UI.overlays` (kind `overlayKind`:  scroll lock, keyboard scope, focus restore),
 *     so only the topmost overlay closes, and `ui-close` can veto.
 *     The dialog's own `cancel` is always prevented.
 *   - A click on the `::backdrop`:  the browser's light dismiss (`<dialog closedby>`)
 *     when `UI.browser.supports.dialogClosedBy`, reported as `cancel`;
 *     else `UI.overlays`' outside click, which tells a backdrop click from one on the dialog by where the pointer is.
 *   - A close the browser forces anyway (a repeated Escape it won't let a page veto) is followed:
 *     a `ui-close` that can't veto, then `open` off.
 *
 * - Opening as a PERSON'S action, so `ui-open` fires:  an invoker command,
 *   `<button commandfor="id" command="--show">` (`ToggleCommands`;  `--close` closes, `--toggle` flips).
 *   Writing `open` is the app's own decision, and fires nothing.
 *
 * - Buttons:  a click on an approve / deny element (`ModalActionSelectors`:  Fomantic's `.approve` / `.deny`
 *   classes, `<ui-button positive / negative>`) fires the cancelable `ui-approve` / `ui-deny`, then closes.
 *   The `closable` icon closes (reason `close`).
 *
 * - `closable="false"` is Fomantic's `closable: false` AND `closeIcon: false`:
 *   no icon, and (unless `closedby` is set) `closedby="none"`, so Escape and the dimmer do nothing.
 *
 * - Its name:  the DOM element's `aria-label`, else the `header` shorthand, else a slotted `<ui-header>`
 *   (by element reflection:  an idref can't reach into the light DOM from the shadow root).
 ****************/
export abstract class DialogComponent<
  V extends E.ComponentVocabulary = E.ComponentVocabulary
> extends E.UIComponent<V> {
  /** Part name of the `<dialog>`, e.g. `modal`. */
  declare rootPart: string

  /** `UI.overlays` kind:  `modal` or `flyout`. */
  declare overlayKind: E.OverlayKind

  // The dialog attributes this base reads (see the class docs):  each vocabulary's getters, declared here since `V`
  // is unknown to this class.

  /** `closable`:  the close icon;  `false` (written) is also Fomantic's `closable: false`. */
  declare closable: boolean

  /** `closedby`:  what dismisses it, as written;  see `closedBy` for what it means. */
  declare closedby: DialogAttributes["closedby"] | undefined

  /** `header`:  the header shorthand. */
  declare header: string | undefined

  /** `content`:  the content shorthand. */
  declare content: string | undefined

  /** The dialog. */
  protected dialog?: HTMLDialogElement

  /**
   * This element's `UI.overlays` entry;  its Escape / outside options follow `closedby` when it opens.
   * - `kind` is the subclass's `overlayKind`, set in the constructor (a prototype value TypeScript can't see here).
   */
  private readonly overlayEntry: E.OverlayEntry = {
    element: this.domElement,
    kind: "modal",
    onDismiss: (reason: E.DismissReason) => void this.requestClose(reason)
  }

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    this.overlayEntry.kind = this.overlayKind
    if (isServer) return
    this.on("slotchange", this.onSlotChange, { target: this.domElement.renderRoot })
    this.on("command", this.onCommand)
  }

  ////////////////
  // ## Open
  ////////////////

  /** `open`:  shown.  The DOM element's `open` property when set, else kept here. */
  @E.cssState("open")
  @E.controlled("open")
  accessor isOpen = false

  /** Bumped on every show / hide, so a late `ui-show` / `ui-hide` of an earlier one is dropped. */
  private generation = 0

  protected classValue(name: E.AttributeName<V>): unknown {
    if (name === OPEN) return this.isOpen
    return super.classValue(name)
  }

  /** Show, dispatching the cancelable `ui-open` first;  true when applied. */
  requestOpen(originalEvent?: Event): boolean {
    if (untrack(() => this.isOpen)) return false
    const detail: UIT.ModalOpenDetail = { open: true, originalEvent }
    return this.requestChange("isOpen", true, () => this.fire("ui-open", detail))
  }

  /** Hide for `reason`, dispatching the cancelable `ui-close` first;  true when applied. */
  requestClose(reason: UIT.ModalCloseReason, originalEvent?: Event): boolean {
    if (!untrack(() => this.isOpen)) return false
    this.isDismissing = true
    setTimeout(() => (this.isDismissing = false))
    const detail: UIT.ModalCloseDetail = { open: false, reason, originalEvent }
    return this.requestChange("isOpen", false, () => this.fire("ui-close", detail))
  }

  /**
   * Shown while open AND connected, once the runtime is loaded (`isReady`, as the render waits for):
   * it acts on the rendered `<dialog>`;  hidden by the cleanup.
   */
  @E.onChange("isConnected", "isReady", "isOpen")
  protected onOpenChanged(isConnected: boolean, isReady: boolean, isOpen: boolean) {
    if (!(isConnected && isReady && isOpen)) return
    this.show()
    return () => this.hide()
  }

  /**
   * `showModal()`, register with `UI.overlays`, `ui-show` once the entry transition ends.
   * - `closedby` is applied here:
   *   natively when supported (the browser's light dismiss), else by the overlay entry's outside-click handling.
   */
  private show() {
    const dialog = this.dialog
    if (!dialog) return
    const closedBy = this.closedBy
    const isNative = UI.browser.supports.dialogClosedBy
    if (isNative) dialog.setAttribute(CLOSEDBY, closedBy)
    else dialog.removeAttribute(CLOSEDBY)
    this.overlayEntry.closeOnEscape = closedBy !== UIT.NONE
    this.overlayEntry.closeOnOutsideClick = !isNative && closedBy === ANY
    if (!dialog.open) {
      dialog.showModal()
      UI.focus.enter(dialog)
    }
    UI.overlays.open(this.overlayEntry)
    this.after(() => {
      const detail: UIT.ModalOpenDetail = { open: true }
      if (untrack(() => this.isOpen)) this.fire("ui-show", detail)
    })
  }

  /**
   * `close()` the dialog, THEN leave `UI.overlays` (whose focus restore needs the page no longer `inert`),
   * `ui-hide` once the exit transition ends.
   */
  private hide() {
    const dialog = this.dialog
    if (dialog?.open) dialog.close()
    UI.overlays.close(this.overlayEntry)
    this.after(() => {
      const detail: UIT.ModalOpenDetail = { open: false }
      if (!untrack(() => this.isOpen) && this.domElement.isConnected) this.fire("ui-hide", detail)
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

  /** `send()` one of the events every dialog vocabulary names (see the class docs). */
  private fire(name: DialogEventName, detail: object): boolean {
    return this.send(name as E.EventName<V>, detail)
  }

  /** An invoker command aimed at the DOM element (`UIT.ToggleCommands`). */
  private readonly onCommand = (event: Event) => {
    const action = UIT.ToggleCommands.action(
      event,
      untrack(() => this.isOpen)
    )
    if (action === "show") this.requestOpen(event)
    else if (action === "close") this.requestClose("close", event)
  }

  ////////////////
  // ## Dismissal
  ////////////////

  /** A dismissal was asked for in this task:  the dialog's own `cancel` for the same key press is ignored. */
  private isDismissing = false

  /** The last press started on the `::backdrop`. */
  private pressStartedOnBackdrop = false

  /**
   * What dismisses it:  an explicit `closedby` wins;
   * else `none` for `closable="false"` (Fomantic's `closable: false`), else `any`.
   * - NOTE: `closedby` has a vocabulary default, so whether it was written is read off the DOM element.
   */
  private get closedBy(): NonNullable<DialogAttributes["closedby"]> {
    if (this.domElement.hasAttribute(CLOSEDBY)) return untrack(() => this.closedby) ?? ANY
    // NOTE: an absent boolean also converts to `false`, so `closable` must be present to mean "closable: false"
    const isOff = this.domElement.hasAttribute(CLOSABLE) && !untrack(() => this.closable)
    return isOff ? UIT.NONE : ANY
  }

  /** Remember whether a press started on the `::backdrop` (the dialog itself, outside its box). */
  private readonly onPointerDown = (event: PointerEvent) => {
    const dialog = this.dialog
    if (!dialog || event.target !== dialog) return void (this.pressStartedOnBackdrop = false)
    const box = dialog.getBoundingClientRect()
    const { clientX: x, clientY: y } = event
    this.pressStartedOnBackdrop = x < box.left || x > box.right || y < box.top || y > box.bottom
  }

  /**
   * The dialog's `cancel`:  Escape the overlay didn't take, or the browser's light dismiss (`closedby`).
   * - Always prevented;  the element decides, by `closedby`, and `ui-close` may veto.
   */
  private readonly onCancel = (event: Event) => {
    event.preventDefault()
    const reason = this.pressStartedOnBackdrop ? "outside" : "escape"
    this.pressStartedOnBackdrop = false
    if (this.isDismissing) return
    const closedBy = this.closedBy
    if (closedBy === UIT.NONE || (reason === "outside" && closedBy !== ANY)) return
    this.requestClose(reason, event)
  }

  /**
   * The dialog closed while the element thinks it's open:  the browser forced it -- follow.
   * - `close` is queued as a task:
   *   one from an earlier close can arrive after a quick re-open, when the dialog is open again -- ignored.
   */
  private readonly onClose = (event: Event) => {
    if (this.dialog?.open || !this.domElement.isConnected || !untrack(() => this.isOpen)) return
    const detail: UIT.ModalCloseDetail = { open: false, reason: "escape", originalEvent: event }
    this.fire("ui-close", detail)
    this.isOpen = false
  }

  ////////////////
  // ## Buttons
  ////////////////

  /** Glyph of the close icon. */
  readonly closeGlyph = new E.IconGlyph({
    owner: this,
    name: () => (this.closable ? UIT.CLOSE_ICON : undefined)
  })

  /**
   * The close icon's label (`translationForKey("close")`).
   * - Not a cast in the JSX, for the reason `dialogPart()` is a method.
   */
  private get closeText(): string {
    return this.translationForKey(UIT.CLOSE as E.TextKey<V>)
  }

  /** Close icon. */
  private readonly onCloseIcon = (event: MouseEvent) => {
    event.stopPropagation()
    this.requestClose("close", event)
  }

  /** A click inside:  an approve / deny element asks, then closes. */
  private readonly onDialogClick = (event: MouseEvent) => {
    const found = DialogComponent.actionFor(event, this.domElement)
    if (!found) return
    const [kind, action] = found
    const detail: UIT.ModalActionDetail = { action, originalEvent: event }
    if (!this.fire(kind === "approve" ? "ui-approve" : "ui-deny", detail)) return
    this.requestClose(kind, event)
  }

  ////////////////
  // ## The name
  ////////////////

  /** The DOM element's `aria-label`, forwarded to the dialog. */
  get ariaLabel(): string | undefined {
    return this.attributes[UIT.ARIA_LABEL] ?? undefined
  }

  /**
   * First slotted `<ui-header>` (any tag whose noun is `header`), which names the dialog.
   * - Read on the server too, NO `isServer` guard:
   *   the static render (`$/ui/static`, on linkedom elements) names the dialog by it (`serverLabelledBy()`).
   */
  @E.state accessor heading: Element | undefined = this.findHeading()

  /** Id of the `header` shorthand, from `UI.ids` once rendering. */
  private headerId = ""

  /** The light DOM's slotted children changed:  look for the heading again. */
  private readonly onSlotChange = () => (this.heading = this.findHeading())

  /** First child element whose definition's noun is `header` (a `<ui-header>`, or a translated one). */
  private findHeading(): Element | undefined {
    for (const child of this.domElement.children) {
      if (E.UIComponent.definitions.get(child.localName)?.vocabulary.noun === UIT.HEADER) return child
    }
    return undefined
  }

  /** The dialog's name:  its `aria-label`, else `aria-labelledby` the `header` shorthand, else the slotted heading. */
  @E.onChange("isReady", "ariaLabel", "header", "heading")
  protected onNameChanged(
    _isReady: boolean,
    label: string | undefined,
    header: string | undefined,
    heading: Element | undefined
  ) {
    const dialog = this.dialog
    if (!dialog) return
    const hasHeader = !!header
    const reflected = dialog as unknown as { ariaLabelledByElements: Element[] | null }
    if (label) dialog.setAttribute(UIT.ARIA_LABEL, label)
    else dialog.removeAttribute(UIT.ARIA_LABEL)
    // NOTE: setting the reflected list (even to `null`, the platform's "none") rewrites the attribute,
    // so it goes first
    reflected.ariaLabelledByElements = !label && !hasHeader && heading ? [heading] : null
    if (!label && hasHeader) dialog.setAttribute(ARIA_LABELLEDBY, this.headerId)
  }

  /**
   * The dialog's `aria-labelledby` in a server render (`$/ui/static`), where no effect applies and no element
   * reflects:  the `header` shorthand's id, else the slotted heading's,
   * unless the DOM element has an `aria-label` (which the static output moves onto the dialog).
   * - SIDE EFFECT:  gives the slotted heading (the render's parsed copy) an id if it has none.
   */
  private serverLabelledBy(): string | undefined {
    if (this.ariaLabel) return undefined
    if (this.header) return this.headerId
    const heading = this.heading
    return heading ? UI.ids.ensure(heading, `ui-${this.elementDefinition.vocabulary.noun}-heading`) : undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.headerId = UI.ids.next(`ui-${this.elementDefinition.vocabulary.noun}`)
    return (
      <dialog
        ref={(element) => (this.dialog = element)}
        class={this.rootClasses}
        part={this.dialogPart(this.rootPart)}
        aria-labelledby={isServer ? this.serverLabelledBy() : undefined}
        onCancel={this.onCancel}
        onClose={this.onClose}
        onPointerDown={this.onPointerDown}
        onClick={this.onDialogClick}
      >
        <Show when={this.header}>
          <div id={this.headerId} class={UIT.HEADER} part={this.dialogPart(UIT.HEADER)}>
            {this.header}
          </div>
        </Show>
        <Show when={this.content}>
          <div class={UIT.CONTENT} part={this.dialogPart(UIT.CONTENT)}>
            {this.content}
          </div>
        </Show>
        <slot />
        <Show when={this.closable}>
          <button
            type="button"
            class={UIT.CLOSE_CLASS}
            part={this.dialogPart(UIT.CLOSE)}
            aria-label={this.closeText}
            onClick={this.onCloseIcon}
          >
            {this.closeGlyph.svg}
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
    return this.partForName(name as E.PartName<V>)
  }

  /**
   * The approve / deny element `event` activated, with which it is;  `undefined` for none.
   * - The innermost light-DOM element on its path (in `domElement`'s tree)
   *   matching `UIT.ModalActionSelectors`, up to `domElement`.
   */
  private static actionFor(event: Event, domElement: Element): [DialogAction, Element] | undefined {
    const scope = domElement.getRootNode()
    for (const target of event.composedPath()) {
      if (target === domElement) return undefined
      if (!(target instanceof Element) || target.getRootNode() !== scope) continue
      if (target.matches(UIT.ModalActionSelectors.approve)) return ["approve", target]
      if (target.matches(UIT.ModalActionSelectors.deny)) return ["deny", target]
    }
    return undefined
  }
}

/** What an activated element inside a dialog does:  `approve` or `deny` it (`UIT.ModalActionSelectors`). */
type DialogAction = keyof typeof UIT.ModalActionSelectors

/** The controlled attribute:  shown. */
const OPEN = "open"

/** The attribute of the close icon (and of Fomantic's `closable: false`). */
const CLOSABLE = "closable"

/** The `<dialog>` attribute naming it by its header's id. */
const ARIA_LABELLEDBY = "aria-labelledby"

/** `closedby` value:  anything dismisses it (Escape, the dimmer). */
const ANY = "any"
