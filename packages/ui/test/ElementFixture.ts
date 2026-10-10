import { flush } from "solid-js"

import { Fixture } from "$/ui/test/Fixture"
import type { DOMElement } from "$/ui/elements"

/**
 * `Fixture.render()` plus "wait until every element in it has rendered":
 * awaits each `DOMElement.ready`, then `flush()`es Solid's queue.
 * - Why:  Solid 2 applies signal writes on a microtask, and first render waits for `UI.load()`, so tests
 *   assert after `await ElementFixture.settle()` rather than after a guessed number of ticks.
 */
export class ElementFixture {
  /** Render `html` (see `Fixture.render()`), wait for its elements;  returns the first element. */
  static async render<T extends Element = HTMLElement>(html: string): Promise<T> {
    const element = Fixture.render<T>(html)
    await ElementFixture.settle(element.parentElement!)
    return element
  }

  /** Wait for every element under `root` (inclusive) to be ready, then flush pending updates. */
  static async settle(root: Element = document.body) {
    const hosts = [root, ...root.querySelectorAll("*")].filter((element): element is DOMElement => "ready" in element)
    await Promise.all(hosts.map((host) => host.ready))
    flush()
    await Promise.resolve()
    flush()
  }

  /** Flush after letting queued microtasks (event handlers' writes, `onSettled`) run. */
  static async tick() {
    await Promise.resolve()
    flush()
  }

  /**
   * Make `domElement`'s render throw NOW, as a bug in an update would, and wait for its fallback
   *   (a form control's native one, else a bare `<slot>`).
   * - How:  its component's `extraClass` starts throwing, then an attribute (`keyOnly` first, else the next that
   *   changes) is changed and changed back -- `rootClass` reads every class-emitting attribute, so the root's
   *   `class` binding re-reads it inside the render effect, and the element's error net catches the throw.
   *   The DOM element's attributes end as they were.
   * - The fallback is built a microtask after the error (`UIComponent.renderFallback()`), hence two ticks.
   */
  static async breakRender(domElement: DOMElement) {
    const { component } = domElement
    if (!component) throw new Error(`<${domElement.localName}> has not rendered`)
    Object.defineProperty(component, "extraClass", {
      get: () => {
        throw new Error(`forced render failure in <${domElement.localName}>`)
      }
    })
    const { attributes } = component.elementDefinition
    const self = domElement as unknown as Record<string, unknown>
    // a `keyOnly` attribute emits a class, so `rootClass` surely reads it;  the rest are tried in turn
    // (a write that converts to the SAME value recomputes nothing), until the error boundary has caught the throw
    const candidates = [...attributes].sort(
      (a, b) => Number(b.spec.kind === "keyOnly") - Number(a.spec.kind === "keyOnly")
    )
    for (const { spec, property } of candidates) {
      const before = self[property]
      self[property] = ElementFixture.otherValue(spec, before)
      self[property] = before
      flush()
      await ElementFixture.tick()
      if (domElement.matches(":state(errored)")) break
    }
    await ElementFixture.tick()
  }

  /** A value for `spec` that converts to something other than `before`:  toggled, another allowed value, or text. */
  private static otherValue(spec: { kind: string; values?: unknown }, before: unknown): unknown {
    if (spec.kind === "keyOnly") return !before
    if (Array.isArray(spec.values)) return spec.values.find((value) => value !== before) ?? "x"
    return before === "x" ? "y" : "x"
  }
}
