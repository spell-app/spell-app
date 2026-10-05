import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { loadFixtureProject, parseSpellProject, summarize } from "$/spell/test"

/**
 * Whole-project parse of `examples/Solitaire`.
 * - Snapshot pins compiled output + errors, so parser changes that alter output show up in review.
 * - Benchmark only runs with `BENCH=1`:
 *   `BENCH=1 yarn vitest run src/SpellProject.test.ts --reporter=verbose --silent=false`
 */
describe("Solitaire project", () => {
  const files = loadFixtureProject("Solitaire")

  test("loads files in import order", () => {
    expect(files.map(({ path }) => path)).toEqual(["/Card.spell", "/Deck.spell", "/Pile.spell", "/Solitaire.spell"])
  })

  test("parses the same way every time", () => {
    expect(summarize(parseSpellProject(files))).toEqual(summarize(parseSpellProject(files)))
  })

  test("compiled output + errors", () => {
    expect(summarize(parseSpellProject(files))).toMatchSnapshot()
  })

  test.skipIf(!process.env.BENCH)("benchmark", () => {
    const RUNS = 20
    // warm up
    for (let run = 0; run < 3; run++) parseSpellProject(files)

    // Count / time `parser.rules` rebuilds -- every `addRule()` mid-parse clears the merged map.
    const { mergeRuleSets } = P.Parser.prototype
    let rebuilds = 0
    let rebuildMsec = 0
    P.Parser.prototype.mergeRuleSets = function (...sources: P.RuleMap[]) {
      const start = performance.now()
      const result = mergeRuleSets.apply(this, sources)
      rebuildMsec += performance.now() - start
      rebuilds++
      return result
    }

    const perFile: Record<string, { parse: number[]; compile: number[] }> = {}
    const totals: number[] = []
    try {
      for (let run = 0; run < RUNS; run++) {
        const project = parseSpellProject(files)
        let total = 0
        for (const { path, parseMsec, compileMsec } of project.files) {
          perFile[path] ??= { parse: [], compile: [] }
          perFile[path].parse.push(parseMsec)
          perFile[path].compile.push(compileMsec)
          total += parseMsec + compileMsec
        }
        totals.push(total)
      }
    } finally {
      P.Parser.prototype.mergeRuleSets = mergeRuleSets
    }

    for (const [path, { parse, compile }] of Object.entries(perFile)) {
      console.log(
        `BENCH ${path.padEnd(18)} parse ${median(parse).toFixed(1)}ms  compile ${median(compile).toFixed(1)}ms`
      )
    }
    console.log(`BENCH total (median of ${RUNS}) ${median(totals).toFixed(1)}ms`)
    console.log(`BENCH rules rebuilds per project parse ${rebuilds / RUNS}, ${(rebuildMsec / RUNS).toFixed(1)}ms`)
  })
})

/** Middle value of `values`. */
function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]!
}
