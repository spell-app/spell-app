import type { Disposer, ToastHandle, ToastOptions, ToastProvider } from "./runtime.types"

/**
 * Programmatic toasts, as `UI.toasts` (and the `UI.toast()` shortcut).
 * - A thin front door:  the `ui-toast` family registers its provider (`register()`) when it's imported, so the
 *   runtime chunk carries no toast markup or CSS.
 * - Until then `show()` throws, rather than silently dropping a message.
 */
export class Toasts {
  /** set by the toast component on definition */
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
    return this.provider.show(options)
  }

  /** Remove toast `id` early. */
  dismiss(id: string) {
    this.provider.dismiss(id)
  }

  /** The registered provider, or a helpful error. */
  private get provider(): ToastProvider {
    if (!Toasts.provider) throw new Error("ui-toast not registered:  import the toast component first")
    return Toasts.provider
  }
}
