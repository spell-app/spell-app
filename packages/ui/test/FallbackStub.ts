import type { E } from "$/ui/core"

/**
 * Throwaway host element for `*.fallback.test.ts`:  an open shadow root that "failed" and renders its fallback.
 * - Stands in for a real `<ui-*>` so the fallbacks are tested with no base library.
 * - Test-only:  nothing exports it.
 */
export class FallbackStub {
  /**
   * Define custom element `tag` whose `connectedCallback` runs `render` on itself.
   * - `formAssociated` makes it a form control with `internals`, as `<ui-button>` / `<ui-dropdown>` are.
   * - `render` may be called again through `host.render()` after a test sets a property.
   */
  static define(tag: string, render: FallbackRender, formAssociated = false): void {
    if (customElements.get(tag)) return
    customElements.define(
      tag,
      class extends HTMLElement implements StubHost {
        static formAssociated = formAssociated
        readonly internals = this.attachInternals()
        handle: E.NativeFallbackHandle | undefined

        constructor() {
          super()
          this.attachShadow({ mode: "open" })
        }

        connectedCallback() {
          this.render()
        }

        render() {
          this.handle?.dispose()
          this.handle = render(this, this.shadowRoot!, this.internals)
        }
      }
    )
  }

  /** `host`'s shadow root, asserted. */
  static shadow(host: Element): ShadowRoot {
    return host.shadowRoot!
  }
}

/** Runs the fallback under test for a stub. */
export type FallbackRender = (
  host: HTMLElement,
  root: ShadowRoot,
  internals: ElementInternals
) => E.NativeFallbackHandle

/** What a stub adds to `HTMLElement`. */
export type StubHost = HTMLElement & {
  /** its `attachInternals()`, as a form-associated `<ui-*>` host has */
  internals: ElementInternals
  /** what the last `render()` returned;  disposed before the next */
  handle: E.NativeFallbackHandle | undefined
  /** run the fallback again, e.g. after a test sets a property */
  render(): void
}
