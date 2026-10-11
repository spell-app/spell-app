import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { SP } from "$/spell"
import { describeWarnings, loadFixtureProject, parseSpellProject } from "$/spell/test"

/**
 * Spell's words for one thing, by its name or its place (epic `drawable-thing` P19):
 * `tableau T1`, `the first tableau` -- and the warning when two things share the name a reference reads.
 * - What each compiles to:  the rules' own tests (`named_thing`, `thing_at_place`).
 * - What they find when the program runs:  the `ThingReferences` fixture, printed by cli's core contract test.
 */
describe("thing references in spell", () => {
  /** Piles, and a tableau that is one. */
  const PILES = ["a pile is a list of things", "a pile has a name as text", "a tableau is a pile"]

  /** `lines` as one file of a test project:  its warnings, `line:column message`. */
  function warnings(lines: string[]): string[] {
    const { files } = parseSpellProject([{ path: "/Main.spell", contents: lines.join("\n") }])
    return files[0]!.warnings
  }

  test("the ThingReferences fixture:  a warning where a reference reads a name two tableaus share, none elsewhere", () => {
    const { files } = parseSpellProject(loadFixtureProject("ThingReferences"))
    expect(files[0]!.errors).toEqual([])
    expect(files[0]!.warnings).toEqual(['28:18 More than one tableau is named "T1":  this finds the first one made'])
  })

  test("two things named T1, and nothing reads T1:  no warning", () => {
    const named = [...PILES, 'set a to a new tableau with name = "T1"', 'set b to a new tableau with name = "T1"']
    expect(warnings(named)).toEqual([])
    expect(warnings([...named, "print tableau T1"])).toEqual([
      '6:6 More than one tableau is named "T1":  this finds the first one made'
    ])
  })

  test("a super-type sees its sub-types' names;  a name worked out as the program runs isn't counted", () => {
    const lines = [
      ...PILES,
      'set a to a new tableau with name = "T1"',
      'get a new pile with name = "T1"',
      "for each number from 1 to 2",
      '\tget a new tableau with name = ("T" + the number)'
    ]
    expect(warnings([...lines, "print pile T1"])).toEqual([
      '8:6 More than one pile is named "T1":  this finds the first one made'
    ])
    expect(warnings([...lines, "print tableau T1"])).toEqual([])
  })

  test("a reference written ABOVE the things it names warns too:  the whole project is seen", () => {
    const lines = [
      ...PILES,
      "to show it",
      "\tprint the name of tableau T1",
      'set a to a new tableau with name = "T1"',
      'set b to a new tableau with name = "T1"'
    ]
    expect(warnings(lines)).toEqual(['5:19 More than one tableau is named "T1":  this finds the first one made'])
  })

  test("edited as it's typed:  the warning goes once the second T1 is renamed", () => {
    const lines = [...PILES, 'set a to a new tableau with name = "T1"', 'set b to a new tableau with name = "T1"']
    const text = [...lines, "print tableau T1"].join("\n")
    const rootScope = SP.SpellParser.rootScope
    const scope = new P.ProjectScope({
      name: "test-project",
      path: "/test-project",
      parser: rootScope.parser!.clone({ module: "/test-project" }),
      parentScope: rootScope
    })
    const project = new P.IncrementalProject({ scope, files: [{ path: "/Main.spell", text }] })
    const shown = () => describeWarnings(project.files[0]!.parse.match)
    expect(shown()).toHaveLength(1)
    project.update(
      "/Main.spell",
      text.replace('set b to a new tableau with name = "T1"', 'set b to a new tableau with name = "T2"')
    )
    expect(shown()).toEqual([])
    project.update("/Main.spell", text)
    expect(shown()).toHaveLength(1)
  })
})
