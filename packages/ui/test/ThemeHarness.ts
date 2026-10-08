import { onTestFinished } from "vite-plus/test"

import { UI } from "$/ui/runtime"

import { ElementFixture } from "./ElementFixture"

/**
 * Helpers for theme tests (`src/styles/themes/themes.test.ts`, `src/runtime/Themes.test.ts`).
 * - `ThemeHarness.use(name)`:  apply a theme for this test only (cleared when it finishes).
 * - `ThemeHarness.inner(html, selector)`:  render element markup, wait for it, return the box INSIDE the first
 *   element's shadow root that `selector` matches, and its computed style.  Themes MUST be asserted there:  the
 *   class-grammar half of a sheet only reaches component markup through the shadow root.
 * - `ThemeHarness.page(html, selector)`:  the same for class-grammar markup in the page (static examples).
 * - A test file imports the families its cases render (`import "$/ui/components/ui-<name>"`).
 */
export class ThemeHarness {
  /**
   * Apply `name` (`UI.themes.apply()`) for the current test;  back to our own look when it finishes.
   * - MUST be called inside a test.
   */
  static async use(name: string | undefined) {
    await UI.load()
    await UI.themes.apply(name)
    onTestFinished(() => UI.themes.apply(undefined))
  }

  /**
   * Render `html`;  the element matching `selector` in the first element's shadow root, and its computed style.
   * - throws if the shadow root has no match
   */
  static async inner(
    html: string,
    selector: string
  ): Promise<{ host: HTMLElement; box: Element; style: CSSStyleDeclaration }> {
    const host = await ElementFixture.render<HTMLElement>(html)
    const box = host.shadowRoot?.querySelector(selector)
    if (!box) throw new Error(`ThemeHarness.inner: no "${selector}" in <${host.localName}>'s shadow root`)
    return { host, box, style: getComputedStyle(box) }
  }

  /**
   * Render class-grammar `html` in the page;  the element matching `selector` and its computed style.
   * - throws if the markup has no match
   */
  static async page(html: string, selector: string): Promise<{ box: Element; style: CSSStyleDeclaration }> {
    const wrapper = await ElementFixture.render<HTMLElement>(`<div>${html}</div>`)
    const box = wrapper.querySelector(selector)
    if (!box) throw new Error(`ThemeHarness.page: no "${selector}" in the markup`)
    return { box, style: getComputedStyle(box) }
  }
}
