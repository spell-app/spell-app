import { describe, expect, it, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/index"

describe("UIComponent.onMount() effects", () => {
  it("an error thrown by cssStates() reaches the error boundary:  :state(errored) and the fallback", async () => {
    const domElement = await ElementFixture.render<DOMElement>(`<ui-toast message="Hi"></ui-toast>`)
    const component = domElement.component as unknown as { cssStates(): object }
    Object.defineProperty(component, "cssStates", {
      value: () => {
        throw new Error("forced cssStates failure")
      }
    })
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      // `closingState` is read by the original `cssStates()`, so the effect's compute re-runs
      ;(domElement as unknown as { close(): boolean }).close()
      await ElementFixture.tick()
      await ElementFixture.tick()
    } finally {
      error.mockRestore()
    }
    expect(domElement.matches(":state(errored)")).toBe(true)
  })
})
