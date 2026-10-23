import { describe, expect, test } from "vite-plus/test"

import { P } from "spell-lang/parser"
import { SP } from "spell-lang/spell"
import { compiledFixture, fixtureProjectNames } from "spell-app/spaces/test"

/** English's tables, the pack's own:  the analysis edits them in place, and puts each word back. */
const identifierBlacklist = SP.english.words.blacklist
const MEMBER_STOP_WORDS = SP.english.words.memberStopWords

/**
 * Which words the identifier blacklist really needs (epic `spanish` P2):
 * drop ONE word at a time, recompile every rule test and every fixture project, and list what changed.
 * - A word whose removal changes nothing protects nothing today:  a candidate to drop.
 * - Slow (every word, the whole grammar):  runs only with `BLACKLIST_ANALYSIS=1`, and prints its findings.
 *   `BLACKLIST_ANALYSIS=1 yarn vp test run tests/spell/rules/identifierBlacklist.analysis.test.ts` in spell-app.
 */
describe.skipIf(!process.env.BLACKLIST_ANALYSIS)("identifier blacklist:  what each word protects", () => {
  test("drop each word in turn", { timeout: 60 * 60_000 }, () => {
    const baseline = compileEverything()
    const report: Record<string, string[]> = {}
    for (const word of Object.keys(identifierBlacklist)) {
      const saved = identifierBlacklist[word]
      delete identifierBlacklist[word]
      try {
        const now = compileEverything()
        report[word] = Object.keys(baseline).filter((key) => now[key] !== baseline[key])
      } finally {
        identifierBlacklist[word] = saved
      }
    }
    const needed = Object.entries(report).filter(([, changed]) => changed.length)
    const unneeded = Object.entries(report).filter(([, changed]) => !changed.length)
    console.log(
      `\n## NEEDED (${needed.length})\n` +
        needed
          .map(
            ([word, changed]) =>
              `- ${word}:  ${changed.slice(0, 6).join("  |  ")}${changed.length > 6 ? `  (+${changed.length - 6})` : ""}`
          )
          .join("\n") +
        `\n\n## UNNEEDED (${unneeded.length})\n${unneeded.map(([word]) => word).join(", ")}\n`
    )
    expect(Object.keys(report).length).toBe(Object.keys(identifierBlacklist).length)
  })

  test("drop each member stop word in turn", { timeout: 60 * 60_000 }, () => {
    const baseline = compileEverything()
    const needed: string[] = []
    const unneeded: string[] = []
    for (const word of [...MEMBER_STOP_WORDS]) {
      MEMBER_STOP_WORDS.delete(word)
      try {
        const now = compileEverything()
        ;(Object.keys(baseline).some((key) => now[key] !== baseline[key]) ? needed : unneeded).push(word)
      } finally {
        MEMBER_STOP_WORDS.add(word)
      }
    }
    console.log(
      `\n## STOP WORDS NEEDED (${needed.length}):  ${needed.join(", ")}\n## UNNEEDED (${unneeded.length}):  ${unneeded.join(", ")}\n`
    )
    expect(needed.length + unneeded.length).toBe(MEMBER_STOP_WORDS.size)
  })
})

/**
 * Every rule test's input, and every fixture project, compiled:  `{ key: output }`.
 * - A rule test as `unitTestModuleRules()` runs it:  a fresh scope, its `beforeEach`, parsed as its rule, written.
 * - A throw or a failed parse is its output too, as text.
 */
function compileEverything(): Record<string, string> {
  const out: Record<string, string> = {}
  const testable = SP.spellParser.rules._testable_
  const rules = testable instanceof P.Group ? testable.rules : []
  for (const rule of rules) {
    for (const block of rule.tests ?? []) {
      if (block.skip) continue
      const ruleName = block.compileAs ?? rule.name
      if (!ruleName) continue
      for (const { input, skip } of block.tests.map(P.normalizeRuleTest)) {
        if (skip || !input) continue
        const scope = SP.spellParser.getScope(`blacklist_${rule.module}`)
        block.beforeEach?.(scope)
        let written: string
        try {
          const match = scope.parse(input, ruleName)
          if (match) scope.parser?.commit(match)
          written = match ? String(P.JSWriter.instance.writeMatch(match)) : "(no match)"
        } catch (error) {
          written = `(throws) ${String(error)}`
        }
        out[`rule ${ruleName}:  ${input}`] = written
      }
    }
  }
  for (const name of fixtureProjectNames()) {
    try {
      out[`fixture ${name}`] = compiledFixture(name)
    } catch (error) {
      out[`fixture ${name}`] = `(throws) ${String(error)}`
    }
  }
  return out
}
