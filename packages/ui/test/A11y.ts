import axe from "axe-core"
import { expect } from "vite-plus/test"

import { closestAcrossShadow } from "$/ui/util"

/**
 * Accessibility assertions via `axe-core`, run against live, rendered elements.
 * - Checks the element's subtree INCLUDING open shadow roots -- axe walks the flat tree.
 * - `color-contrast` ignores anything inside a `.ui.disabled` element (see `DISABLED`).
 */
export class A11y {
  /**
   * Run axe on `element` and fail with a readable list of violations if there are any.
   * - Failure lists each violation's rule id, impact, help text and offending node selectors,
   *   so a test failure says what to fix without re-running axe by hand.
   * - Pass `options` to tweak rules, e.g. `{ rules: { "color-contrast": { enabled: false } } }` --
   *   say why in a comment where you do.
   * - Returns the full axe result, for tests that want to inspect passes / incompletes.
   */
  static async check(element: Element, options: axe.RunOptions = {}): Promise<axe.AxeResults> {
    const results = await axe.run(element, { resultTypes: ["violations"], elementRef: true, ...options })
    const violations = A11y.#withoutDisabledContrast(results.violations)
    expect(violations.length, A11y.format(violations)).toBe(0)
    return results
  }

  /**
   * `violations` minus `color-contrast` nodes inside a `.ui.disabled` element (across shadow roots).
   * - WCAG 1.4.3 exempts text of INACTIVE components, and Fomantic's `disabled` (a faded label, header,
   *   segment ...) is exactly that look.  axe only knows native `disabled` and `aria-disabled`, which a
   *   non-control can't carry.
   * - Needs `elementRef: true`;  a rule left with no nodes is dropped.
   */
  static #withoutDisabledContrast(violations: axe.Result[]): axe.Result[] {
    return violations
      .map((violation) => {
        if (violation.id !== "color-contrast") return violation
        const nodes = violation.nodes.filter((node) => !(node.element && closestAcrossShadow(node.element, DISABLED)))
        return { ...violation, nodes }
      })
      .filter((violation) => violation.nodes.length)
  }

  /**
   * WCAG contrast ratio of text `color` over a stack of `layers`, bottom first (e.g. the page, then a translucent
   * `::backdrop`).
   * - For what axe can't see:  it ignores `::backdrop`, so text drawn over a dialog's dimmer is measured against
   *   the page.  Any CSS colour works;  the canvas resolves and composites them in sRGB.
   */
  static contrast(color: string, layers: string[]): number {
    const [text, background] = [[...layers, color], layers].map(A11y.#composite)
    const [light, dark] = [A11y.#luminance(text!), A11y.#luminance(background!)].sort((a, b) => b - a)
    return (light! + 0.05) / (dark! + 0.05)
  }

  /** sRGB of `layers` painted over each other on one canvas pixel, bottom first, over opaque white. */
  static #composite(layers: string[]): [number, number, number] {
    const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!
    for (const fill of ["white", ...layers]) {
      context.fillStyle = fill
      context.fillRect(0, 0, 1, 1)
    }
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
    return [red!, green!, blue!]
  }

  /** WCAG relative luminance of an sRGB colour (0-255 channels). */
  static #luminance(rgb: [number, number, number]): number {
    const [red, green, blue] = rgb.map((channel) => {
      const value = channel / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!
  }

  /** Human-readable summary of `violations`, one block per rule. */
  static format(violations: axe.Result[]) {
    if (!violations.length) return "no accessibility violations"
    const lines = violations.map((violation) => {
      const nodes = violation.nodes.map((node) => `    - ${node.target.join(" >>> ")}: ${node.failureSummary ?? ""}`)
      return [
        `  [${violation.impact ?? "?"}] ${violation.id}: ${violation.help} (${violation.helpUrl})`,
        ...nodes
      ].join("\n")
    })
    return `${violations.length} accessibility violation(s):\n${lines.join("\n")}`
  }
}

/** Class-grammar state whose contents are exempt from `color-contrast`. */
const DISABLED = ".ui.disabled"

/** Shorthand for `A11y.check(element)`. */
export function expectAccessible(element: Element, options?: axe.RunOptions) {
  return A11y.check(element, options)
}
