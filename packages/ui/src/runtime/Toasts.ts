import type { Disposer, ToastHandle, ToastOptions, ToastProvider } from "./runtime.types"

/****************
 * ### `Toasts`
 * Programmatic toasts, as `UI.toasts` (and the `UI.toast()` shortcut).
 * - A thin front door:  the `ui-toast` family registers its provider (`register()`) when it's imported, so the
 *   runtime chunk carries no toast markup or CSS.
 * - Until then `show()` throws, rather than silently dropping a message.
 ****************/
export class Toasts {
  /**
   * The provider rendering toasts:  set by the `ui-toast` family through `register()`.
   * - STATIC:  one per page, like the runtime;  tests set and clear it without reaching the instance.
   */
  static provider?: ToastProvider

  /**
   * Make `provider` render the toasts;  returns the undo (which restores the previous one).
   * - Through the INSTANCE (`UI.toasts.register()`):  a component can't reach the class, which lives in the lazy
   *   runtime chunk (the barrel exports it as a type only).
   */
  register(provider: ToastProvider): Disposer {
    const previous = Toasts.provider
    Toasts.provider = provider
    return () => {
      if (Toasts.provider === provider) Toasts.provider = previous
    }
  }

  /** Show a toast;  see `ToastOptions`. */
  show(options: ToastOptions): ToastHandle {
    return this.registeredProvider.show(options)
  }

  /** Remove toast `id` early. */
  dismiss(id: string) {
    this.registeredProvider.dismiss(id)
  }

  /** `Toasts.provider`;  throws until the `ui-toast` family has registered one. */
  private get registeredProvider(): ToastProvider {
    if (!Toasts.provider) {
      throw new Error("UI.toasts:  ui-toast not registered;  import its family (`@spell-app/ui/ui-toast`) first")
    }
    return Toasts.provider
  }
}
