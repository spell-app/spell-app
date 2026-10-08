/****************
 * ### `Invoker`
 * Invoker commands (`<button commandfor="id" command="show-modal">`) for a `<ui-button>`.
 *
 * - Where the browser has them (`UI.browser.supports.invokers`), it does it all:
 *   the button only gives its inner `<button>` the `command`, and a `commandForElement` that `resolve()` finds
 *   (a button inside a shadow root can't name a light-DOM id).
 * - Elsewhere `run()` does what the browser would on a click:
 *   it sends the cancelable `command` event to the target (`event.command`, `event.source`),
 *   then, unless that was cancelled, runs a built-in command on a `<dialog>` (`show-modal`, `close`,
 *   `request-close`) or a popover (`show-popover`, `hide-popover`, `toggle-popover`).
 *   Custom commands (`--foo`) stop at the event.
 * - Static:  the component and its native fallback share it, and neither holds one.
 ****************/
export class Invoker {
  /**
   * The element `commandfor` names, looked up in `domElement`'s root node (the document or a shadow root).
   * - `undefined` for no id, or no such element.
   */
  static resolve(domElement: Element, id: string | undefined): Element | undefined {
    if (!id) return undefined
    // duck-typed, not `instanceof Document / ShadowRoot`:  the static render resolves ids in node (`$/ui/static`)
    const root = domElement.getRootNode() as Partial<Document>
    return typeof root.getElementById === "function" ? (root.getElementById(id) ?? undefined) : undefined
  }

  /** Run `command` on `target`, as the browser's invoker activation would. */
  static run(target: Element, command: string, source: Element): void {
    const event = this.event(command, source)
    if (!target.dispatchEvent(event) || !command || command.startsWith(CUSTOM_PREFIX)) return
    if (target instanceof HTMLDialogElement) this.dialog(target, command)
    else if (target instanceof HTMLElement) this.popover(target, command)
  }

  /** The `command` event:  a real `CommandEvent` where there is one. */
  private static event(command: string, source: Element): Event {
    const init = { command, source, cancelable: true }
    const CommandEventClass = (globalThis as { CommandEvent?: new (type: string, init: object) => Event }).CommandEvent
    if (CommandEventClass) return new CommandEventClass(COMMAND_EVENT, init)
    return Object.assign(new Event(COMMAND_EVENT, { cancelable: true }), { command, source })
  }

  /** Built-in dialog commands. */
  private static dialog(dialog: HTMLDialogElement, command: string) {
    if (command === Command.showModal) {
      if (!dialog.open) dialog.showModal()
    } else if (command === Command.close) dialog.close()
    else if (command === Command.requestClose) {
      const request = dialog as { requestClose?: () => void }
      if (request.requestClose) request.requestClose()
      else if (dialog.dispatchEvent(new Event(CANCEL_EVENT, { cancelable: true }))) dialog.close()
    }
  }

  /** Built-in popover commands. */
  private static popover(element: HTMLElement, command: string) {
    if (!element.hasAttribute(POPOVER)) return
    if (command === Command.showPopover) element.showPopover()
    else if (command === Command.hidePopover) element.hidePopover()
    else if (command === Command.togglePopover) element.togglePopover()
  }
}

/** The built-in commands `run()` carries out, as the platform spells them. */
const Command = {
  showModal: "show-modal",
  close: "close",
  requestClose: "request-close",
  showPopover: "show-popover",
  hidePopover: "hide-popover",
  togglePopover: "toggle-popover"
} as const

/** A custom command starts with it (`--foo`):  only the `command` event, no built-in action. */
const CUSTOM_PREFIX = "--"

/** The event the target gets before any built-in action. */
const COMMAND_EVENT = "command"

/** The event a dialog without `requestClose()` gets first, as the platform's own `request-close` would send. */
const CANCEL_EVENT = "cancel"

/** The attribute that makes an element a popover. */
const POPOVER = "popover"
