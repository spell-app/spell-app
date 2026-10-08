import type { Disposer, ModalOptions, ModalProvider } from "./runtime.types"

/****************
 * ### `Modals`
 * Promise-based dialogs, as `UI.modals`:  `confirm()`, `alert()`, `prompt()` -- the Fomantic
 * `$.modal('confirm', ...)` shortcuts.
 * - A thin front door:  the `ui-modal` family registers its provider (`register()`) when it's imported, so the
 *   runtime chunk carries no modal markup.
 * - Until then every method throws, rather than falling back to `window.confirm()` with different behaviour.
 * - Strings accept plain text or options:  `UI.modals.confirm("Delete?")`.
 ****************/
export class Modals {
  /**
   * The provider rendering dialogs:  set by the `ui-modal` family through `register()`.
   * - STATIC:  one per page, like the runtime;  tests set and clear it without reaching the instance.
   */
  static provider?: ModalProvider

  /**
   * Make `provider` render the dialogs;  returns the undo (which restores the previous one).
   * - Through the INSTANCE (`UI.modals.register()`):  a component can't reach the class, which lives in the lazy
   *   runtime chunk (the barrel exports it as a type only).
   */
  register(provider: ModalProvider): Disposer {
    const previous = Modals.provider
    Modals.provider = provider
    return () => {
      if (Modals.provider === provider) Modals.provider = previous
    }
  }

  /** Resolves `true` on approve, `false` on deny / dismiss. */
  confirm(options: ModalOptions | string): Promise<boolean> {
    return this.registeredProvider.confirm(this.optionsFor(options))
  }

  /** Resolves once acknowledged. */
  alert(options: ModalOptions | string): Promise<void> {
    return this.registeredProvider.alert(this.optionsFor(options))
  }

  /** Resolves with the entered text, or `undefined` on deny / dismiss. */
  prompt(options: ModalOptions | string): Promise<string | undefined> {
    return this.registeredProvider.prompt(this.optionsFor(options))
  }

  /** `Modals.provider`;  throws until the `ui-modal` family has registered one. */
  private get registeredProvider(): ModalProvider {
    if (!Modals.provider) {
      throw new Error("UI.modals:  ui-modal not registered;  import its family (`@spell-app/ui/ui-modal`) first")
    }
    return Modals.provider
  }

  /** Options for `input`:  a bare string is the message. */
  private optionsFor(input: ModalOptions | string): ModalOptions {
    return typeof input === "string" ? { message: input } : input
  }
}
