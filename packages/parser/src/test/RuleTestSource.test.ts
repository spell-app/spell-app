import { describe, expect, test } from "vite-plus/test"

import { RuleTestSource } from "./RuleTestSource"

/** A rule module's source, its tests in both shapes. */
const SOURCE = [
  `parser.addRule(Thing, {`,
  `  syntax: "thing",`,
  `  tests: [`,
  `    {`,
  `      tests: [`,
  `        ["a", "spellCore.a()"],`,
  `        ["b", "b", "stale"],`,
  `        ["c", "spellCore.c()", 'c()'],`,
  `        { title: "lines", input: ["d", "e"], output: ["d(", ")"] },`,
  `        { input: \`f\`, js: undefined }`,
  `      ]`,
  `    }`,
  `  ]`,
  `})`
].join("\n")

describe("RuleTestSource", () => {
  test("finds each test, tuple or object, its input and js lines joined", () => {
    const tests = new RuleTestSource("rules.ts", SOURCE).tests
    expect(tests.map(({ input, js, tsValue }) => [input, js, tsValue])).toEqual([
      ["a", "spellCore.a()", undefined],
      ["b", "b", "stale"],
      ["c", "spellCore.c()", "c()"],
      ["d\ne", "d(\n)", undefined],
      ["f", undefined, undefined]
    ])
  })

  test("`renameOutputs()` renames `output:` to `js:`, and nothing else", () => {
    const edited = new RuleTestSource("rules.ts", SOURCE).renameOutputs().edited
    expect(edited).toContain(`{ title: "lines", input: ["d", "e"], js: ["d(", ")"] }`)
    expect(edited.replace(`js: ["d(", ")"]`, `output: ["d(", ")"]`)).toBe(SOURCE)
  })

  test("`bless()` adds, replaces and removes `ts`:  left out where it's the same as `js`", () => {
    const source = new RuleTestSource("rules.ts", SOURCE)
    const warnings = source.bless([
      { input: "a", js: "spellCore.a()", ts: "a()" },
      { input: "b", js: "b", ts: "b" },
      { input: "c", js: "spellCore.c()", ts: "c()" },
      { input: "d\ne", js: "d(\n)", ts: "d(\n  e\n)" }
    ])
    expect(warnings).toEqual([])
    const { edited } = source
    expect(edited).toContain(`["a", "spellCore.a()", "a()"],`)
    expect(edited).toContain(`["b", "b"],`)
    expect(edited).toContain(`["c", "spellCore.c()", 'c()'],`)
    expect(edited).toContain(`output: ["d(", ")"], ts: ["d(", "  e", ")"] }`)
  })

  test("`bless()` leaves a test alone, with a warning, when it can't say one `ts`", () => {
    const source = new RuleTestSource("rules.ts", SOURCE)
    const warnings = source.bless([
      { input: "a", js: "spellCore.a()", ts: "a()" },
      { input: "a", js: "spellCore.a()", ts: "other()" },
      { input: "c", js: "spellCore.c()", ts: new Error("no") }
    ])
    expect(warnings).toHaveLength(2)
    expect(source.edited).toBe(SOURCE)
  })
})
