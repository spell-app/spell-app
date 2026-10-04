import { describe, expect, it } from "vitest"

import { MD, type SpecExample } from "$/markdown"

import { comparableHTML, specOptions } from "./spec.types"
import spec from "./gfm-spec.json"

/**
 * The GFM spec, example by example:  how many pass, per section.
 * - Pinned in a snapshot:  a regression (fewer passing) fails;  a gain fails too, until the snapshot is updated
 *   (`vitest -u`) -- read the diff first, it's the progress report.
 * - Compares normalized HTML (`comparableHTML()`):  whitespace between tags and line ends don't count.
 * - `disabled` examples (cmark-gfm doesn't run them either) are left out.
 */
describe("GFM spec", () => {
  const examples = (spec.examples as SpecExample[]).filter((example) => example.extension !== "disabled")

  it("passes per section", () => {
    const sections: Record<string, string> = {}
    const counts = new Map<string, { passed: number; total: number }>()
    for (const example of examples) {
      const count = counts.get(example.section) ?? { passed: 0, total: 0 }
      count.total++
      if (passes(example)) count.passed++
      counts.set(example.section, count)
    }
    let passed = 0
    for (const [section, count] of counts) {
      sections[section] = `${count.passed}/${count.total}`
      passed += count.passed
    }
    expect({ total: `${passed}/${examples.length}`, sections }).toMatchSnapshot()
  })
})

/** Does `MD.toHTML()` render `example` as the spec says?  A throw counts as a fail. */
function passes(example: SpecExample) {
  try {
    return comparableHTML(MD.toHTML(example.markdown, specOptions(example))) === comparableHTML(example.html)
  } catch {
    return false
  }
}
