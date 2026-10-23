import { describe, test, expect } from "vite-plus/test"

import { parseSpellProject } from "spell-lang/spell/test"
import { loadFixtureProject } from "spell-app/spaces/test"

/**
 * Spell's words for one thing, by its name or its place, in the frozen `thing-references` project:
 * the warning when two things share the name a reference reads.
 * - Over lines written inline:  spell-lang's own `references.test.ts`.
 */
describe("thing references in spell", () => {
  test("the ThingReferences fixture:  a warning where a reference reads a name two tableaus share, none elsewhere", () => {
    const { files } = parseSpellProject(loadFixtureProject("thing-references"))
    expect(files[0]!.errors).toEqual([])
    expect(files[0]!.warnings).toEqual(['28:18 More than one tableau is named "T1":  this finds the first one made'])
  })
})
