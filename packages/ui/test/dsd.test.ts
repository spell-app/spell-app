import { expect, it } from "vite-plus/test"
import ssrButton from "/.cache/ssr-button.html?raw"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

/**
 * The browser half of the SSR probe:  the DSD string from `ssr.ssr.test.tsx` paints a styled button BEFORE any
 * script, and the element then upgrades over it.
 * - NOTE: no hydration:  `attachShadow()` on a declarative root empties it and the controller re-renders.
 */
it("paints the server-rendered DSD button, then upgrades", async () => {
  const container = document.createElement("div")
  container.setHTMLUnsafe(ssrButton.replaceAll("ui-button", "ssr-button"))
  document.body.append(container)
  const host = container.firstElementChild as UIHost
  const button = host.shadowRoot!.querySelector("button")!
  expect(button.className).toBe("ui primary button")
  expect(getComputedStyle(button).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
  const { UIButton } = await import("$/ui/components/ui-button")
  UIButton.define("ssr-button")
  await ElementFixture.settle(container)
  expect(host.shadowRoot!.querySelector("button")!.className).toBe("ui primary button")
  container.remove()
})
