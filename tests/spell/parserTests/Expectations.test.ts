import { describe, test, expect } from "vite-plus/test"

import { parseSpellProject } from "spell-lang/spell/test"
import { loadFixtureProject } from "spell-app/spaces/test"

/**
 * `expectedAfter()` on a whole frozen project:  quick enough to ask on every keystroke.
 * - What it expects, rule by rule:  spell-lang's own `Expectations.test.ts`.
 */
describe("expectedAfter()", () => {
  test("quick enough for every keystroke, on every line of Solitaire", () => {
    const project = parseSpellProject(loadFixtureProject("solitaire"))
    let calls = 0
    const start = performance.now()
    for (const file of project.files) {
      for (const line of file.contents.split("\n")) {
        const words = line.trim().split(/\s+/).filter(Boolean)
        for (let count = 1; count <= words.length; count++) {
          file.scope.parser!.expectedAfter(words.slice(0, count).join(" "), "statement", file.scope)
          calls++
        }
      }
    }
    const average = (performance.now() - start) / calls
    // ~0.2 msec each when written;  WITHOUT `Expectations.memoized()` it was ~9 msec, and over a second at worst
    expect(average).toBeLessThan(2)
    // the AVERAGE is the guard:  the whole loop takes ~1s here but over 5s on a busy CI runner
  }, 30_000)
})
