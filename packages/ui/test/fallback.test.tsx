import { describe, it } from "vitest"

import { expectAccessible } from "$test/a11y"
import { ElementFixture } from "$test/ElementFixture"
import { FALLBACK_CASES, type FallbackAdapter } from "$test/fallback.cases"
import type { UIHost } from "$/elements"

import "$/index"

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

describe("native fallback", () => {
  for (const test of FALLBACK_CASES) it(test.name, () => test.run(SOLID))
})
