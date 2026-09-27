import { describe, test, expect } from "vitest"

import { P } from "~/parser"
import { SP } from "~/languages/spell"
import { loadExampleProject } from "~/test"

/**
 * `P.ParseJournal` MUST take back everything parsing changes in shared state, and put it all back again.
 * - Parses the Solitaire files into a journaled project, rewinds to before them, then replays.
 */
describe("ParseJournal", () => {
  test("rewind undoes a whole project's parse, replay redoes it", () => {
    const rootScope = SP.SpellParser.rootScope
    const parser = rootScope.parser!.clone({ module: "/journal-test" })
    parser.journal = new P.ParseJournal()
    const projectScope = new P.ProjectScope({ name: "journal-test", path: "/journal-test", parser, parentScope: rootScope })
    const fileScopes = loadExampleProject("Solitaire").map(
      ({ path }) => new P.FileScope({ name: path, path, parentScope: projectScope })
    )

    const before = describeState(parser, projectScope, fileScopes)
    const mark = parser.journal.mark()
    loadExampleProject("Solitaire").forEach(({ contents }, index) => fileScopes[index]!.parse(contents, "block"))
    const parsed = describeState(parser, projectScope, fileScopes)
    // Make sure there's something to take back.
    expect(parsed.types.length).toBeGreaterThan(before.types.length)
    expect(parsed.rules.length).toBeGreaterThan(before.rules.length)

    const undone = parser.journal.rewindTo(mark)
    expect(describeState(parser, projectScope, fileScopes)).toEqual(before)

    parser.journal.replay(undone)
    expect(describeState(parser, projectScope, fileScopes)).toEqual(parsed)
  })
})

/**
 * Everything parsing can change in shared state, as plain data to compare:
 * - project types (and each type's variables), constants, recorded rules
 * - each file's variables
 * - the parser's rules, with how many alternatives each has
 */
function describeState(parser: P.Parser, projectScope: P.ProjectScope, fileScopes: P.FileScope[]) {
  const names = (list: { get(): readonly { name: string }[] } | undefined) => list?.get().map(({ name }) => name)
  return {
    types: projectScope.types.get().map((type) => ({
      name: type.name,
      variables: names(type.variables),
      classVariables: names(type.classVariables)
    })),
    constants: names(projectScope.constants),
    scopeRules: names(projectScope.rules),
    fileVariables: fileScopes.map((scope) => names(scope.variables)),
    rules: Object.entries(parser.rules).map(([name, rule]) => `${name}:${rule instanceof P.Group ? rule.rules.length : 1}`)
  }
}
