import { createSignal, type Accessor, type SignalOptions } from "solid-js"

/****************
 * ### `Cell`
 * A signal as one object (`cell.get()` / `cell.set(value)`), so a component can declare state as an ordinary class
 * FIELD initializer.
 * - In a controller (or any class), state is `@state accessor x = v` (`Reactive`) instead:  fresh right after a
 *   write.  `Cell` stays for a lone signal outside one (a closure), and for `brand`'s controllers, until they move to the decorators.
 * - A leaf of the element core:  imports only `solid-js`.
 * - Why:  Solid 2 memos compute EAGERLY on creation, and field initializers run in declaration order, BEFORE
 *   the subclass constructor body -- a memo field reading a signal assigned in the constructor sees
 *   `undefined`.  Declaring every signal as a field (above the memos that read it) keeps the order obvious.
 * - NOTE: `set()` from an owned scope (component body, memo, effect compute) throws in dev;  see `UIElement`.
 ****************/
export class Cell<T> {
  /** Read (tracked). */
  readonly get: Accessor<T>

  /** Write;  visible to reads after the microtask flush (or `flush()`). */
  readonly set: (value: T) => void

  constructor(initial: T, options?: SignalOptions<T>) {
    const [get, set] = createSignal<T>(initial as Exclude<T, Function>, options)
    this.get = get
    this.set = (value: T) => void set(value as Exclude<T, Function>)
  }
}
