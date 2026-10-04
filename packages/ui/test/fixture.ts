import { afterEach, onTestFinished } from "vite-plus/test"

/**
 * Render HTML into the live document for a test, and remove it again afterwards.
 * - Real document, not a detached fragment:  custom elements only upgrade, run `connectedCallback`,
 *   and get styles / layout once connected.
 * - Cleanup is registered per render with `onTestFinished()`, so a test never sees a previous test's DOM
 *   and callers never write their own `afterEach`.
 */
export class Fixture {
  /**
   * Append `html` inside a fresh `<div>` on `document.body`;  return the first element child.
   * - Typed by the caller, e.g. `Fixture.render<HTMLButtonElement>("<button>Hi</button>")`.
   * - MUST be called inside a test (or `beforeEach`), where `onTestFinished()` is available.
   * - Throws if `html` has no element, so a typo fails loudly rather than as a `null` deref later.
   */
  static render<T extends Element = HTMLElement>(html: string): T {
    const container = document.createElement("div")
    container.setAttribute("data-fixture", "")
    container.innerHTML = html
    document.body.append(container)
    onTestFinished(() => container.remove())
    const element = container.firstElementChild
    if (!element) throw new Error(`Fixture.render(): no element in ${JSON.stringify(html)}`)
    return element as T
  }

  /**
   * Remove every fixture container still in the document.
   * - Backstop for a fixture rendered outside a test (e.g. at describe time), where
   *   `onTestFinished()` isn't available -- call from `afterEach` / `afterAll` there.
   */
  static cleanup() {
    for (const container of document.querySelectorAll("[data-fixture]")) container.remove()
  }
}

// SIDE EFFECT:  every file that imports `Fixture` also clears stray fixtures after each test.
afterEach(() => Fixture.cleanup())
