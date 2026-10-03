/**
 * A `ref` that listens for `type` on its element:  how Solid JSX hears `@spell-app/ui`'s `ui-*` events.
 * - Why:  Solid 2 dropped `on:`, and its `onUiChange` would listen for `uichange`, not `ui-change` -- a hyphenated
 *   event needs a real `addEventListener` (`packages/docs/solid/solid-2.md`, "DOM and `@spell-app/ui` elements").
 * - `handler` gets the event as a `CustomEvent<Detail>`:  `ui-*` events carry their state in `detail`.
 * - Use `onClick` etc. for native events:  they're delegated and cheaper.  `on()` is also how to pass native
 *   listener `options` (capture, passive).
 * - No cleanup:  the listener goes with the element.  The binding isn't reactive:  put any choice INSIDE `handler`.
 * - e.g. `<ui-dropdown ref={on<{ value: string }>("ui-change", (event) => pick(event.detail.value))} />`
 */
export function on<Detail = unknown>(
  type: string,
  handler: (event: CustomEvent<Detail>) => void,
  options?: AddEventListenerOptions
): (element: Element) => void {
  return (element) => element.addEventListener(type, handler as EventListener, options)
}
