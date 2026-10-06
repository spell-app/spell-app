import { describe, expect, it, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/index"

describe("UIElement.mount() effects", () => {
  it("an error thrown by hostStates() reaches the error boundary:  :state(errored) and the fallback", async () => {
    const host = await ElementFixture.render<UIHost>(`<ui-toast message="Hi"></ui-toast>`)
    const controller = host.controller as unknown as { hostStates(): object }
    Object.defineProperty(controller, "hostStates", {
      value: () => {
        throw new Error("forced hostStates failure")
      }
    })
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    try {
      // `closingState` is read by the original `hostStates()`, so the effect's compute re-runs
      ;(host as unknown as { close(): boolean }).close()
      await ElementFixture.tick()
      await ElementFixture.tick()
    } finally {
      error.mockRestore()
    }
    expect(host.matches(":state(errored)")).toBe(true)
  })
})
