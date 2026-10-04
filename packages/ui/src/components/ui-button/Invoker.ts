/****************
 * ### `Invoker`
 * Invoker commands (`<button commandfor="id" command="show-modal">`) for a `<ui-button>`.
 * - With `UI.browser.supports.invokers` the browser does it all:  the element only gives its inner `<button>` the
 *   `command` and a `commandForElement` that `resolve()` finds (a shadow button can't name a light-DOM id).
 * - Without it, `run()` does what the browser would on a click:  fires the cancelable `command` event on the target
 *   (`event.command`, `event.source`), then, unless that was prevented, a built-in command on a `<dialog>`
 *   (`show-modal`, `close`, `request-close`) or a popover (`show-popover`, `hide-popover`, `toggle-popover`).
 *   Custom commands (`--foo`) stop at the event.
 ****************/
export class Invoker {
  /**
   * The element `commandfor` names, looked up from `host`'s root node (document or shadow root);  `null` for no id
   * or no such element.
   */
  static resolve(host: Element, id: string | undefined): Element | null {
    if (!id) return null
    // duck-typed, not `instanceof Document / ShadowRoot`:  the static render resolves ids in node (`$/ui/server`)
    const root = host.getRootNode() as Partial<Document>
    return typeof root.getElementById === "function" ? root.getElementById(id) : null
  }

  /** Run `command` on `target`, as the browser's invoker activation would. */
  static run(target: Element, command: string, source: Element): void {
    const event = this.event(command, source)
    if (!target.dispatchEvent(event) || !command || command.startsWith("--")) return
    if (target instanceof HTMLDialogElement) this.dialog(target, command)
    else if (target instanceof HTMLElement) this.popover(target, command)
  }

  /** The `command` event:  a real `CommandEvent` where there is one. */
  private static event(command: string, source: Element): Event {
    const init = { command, source, cancelable: true }
    const CommandEventClass = (globalThis as { CommandEvent?: new (type: string, init: object) => Event }).CommandEvent
    if (CommandEventClass) return new CommandEventClass("command", init)
    return Object.assign(new Event("command", { cancelable: true }), { command, source })
  }

  /** Built-in dialog commands. */
  private static dialog(dialog: HTMLDialogElement, command: string) {
    if (command === "show-modal") {
      if (!dialog.open) dialog.showModal()
    } else if (command === "close") dialog.close()
    else if (command === "request-close") {
      const request = dialog as { requestClose?: () => void }
      if (request.requestClose) request.requestClose()
      else if (dialog.dispatchEvent(new Event("cancel", { cancelable: true }))) dialog.close()
    }
  }

  /** Built-in popover commands. */
  private static popover(element: HTMLElement, command: string) {
    if (!element.hasAttribute("popover")) return
    if (command === "show-popover") element.showPopover()
    else if (command === "hide-popover") element.hidePopover()
    else if (command === "toggle-popover") element.togglePopover()
  }
}
