import { flush } from "solid-js"

import type { DOMElement } from "$/spell-element"
import { Fixture } from "$/spell-element/test/Fixture"

/**
 * `Fixture.render()` plus "wait until every element in it has rendered":
 * awaits each `DOMElement.ready`, then `flush()`es Solid's queue.
 * - Why:  Solid 2 applies signal writes on a microtask, so tests assert after `await ElementFixture.settle()`
 *   rather than after a guessed number of ticks.
 * - Spell UI has its own, with the same API and more.
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
}
