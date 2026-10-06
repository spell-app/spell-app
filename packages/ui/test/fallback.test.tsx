import { describe, it } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { FALLBACK_CASES, type FallbackAdapter } from "$/ui/test/fallback.cases"
import type { UIHost } from "$/ui/elements"

import "$/ui/index"

/**
 * The native-fallback cases (`fallback.cases.ts`) on the Solid elements:  the fork's `onError` + `fallback` options
 * (`UIElement.define()`), a family's `<Name>Fallback` in the shadow root.
 */
const SOLID: FallbackAdapter = {
  mount: (html) => ElementFixture.render(`<div>${html}</div>`),
  breakRender: (element) => ElementFixture.breakRender(element as UIHost),
  settle: () => ElementFixture.tick(),
  axe: async (root) => void (await expectAccessible(root))
}

describe("UIElement.Fallback", () => {
  for (const test of FALLBACK_CASES) it(test.name, () => test.run(SOLID))
})
