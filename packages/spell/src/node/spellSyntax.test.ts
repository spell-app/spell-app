import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, expect, test } from "vite-plus/test"

import { SPELL_SYNTAX_FILE, purposeOf, spellSyntax } from "$/spell/node/spellSyntax"

/** Where `yarn gen:syntax` writes the spell syntax table. */
const SYNTAX_FILE = resolve(import.meta.dirname, "../..", SPELL_SYNTAX_FILE)

describe("the spell syntax table, spellSyntax.json", () => {
  const data = spellSyntax()
  const rows = data.modules.flatMap((module) => module.rules)

  test("is up to date with the rules:  if not, run `yarn gen:syntax` in packages/spell", () => {
    const written = JSON.parse(readFileSync(SYNTAX_FILE, "utf8")) as unknown
    expect(written, "spellSyntax.json is out of date:  run `yarn gen:syntax` in packages/spell").toEqual(data)
  })

  test("lists each rule class once, every rule name under one", () => {
    const classes = rows.map((row) => row.className)
    expect(new Set(classes).size).toBe(classes.length)
    const names = rows.flatMap((row) => row.ruleNames)
    expect(new Set(names).size).toBe(names.length)
    expect(names).toEqual(expect.arrayContaining(["is_gt_lt", "list_add_relative", "is", "can"]))
  })

  test("a rule's example, in each writer", () => {
    expect(rows.find((row) => row.className === "IsGtLt")).toMatchObject({
      ruleNames: ["is_gt_lt"],
      internal: false,
      file: "packages/spell/src/rules/math/IsGtLt.ts",
      example: "salary is greater than expenses",
      outputs: {
        js: { code: "(salary > expenses)" },
        ts: { code: "(salary > expenses)" },
        py: { code: "(salary > expenses)" }
      }
    })
  })

  test("a base class nobody registers is internal, with no example", () => {
    const row = rows.find((it) => it.className === "SpellExpression")
    expect(row).toMatchObject({ internal: true, ruleNames: [], syntax: [] })
    expect(row?.example).toBeUndefined()
  })

  test("a class specialized into several rules is one row", () => {
    expect(rows.find((row) => row.className === "Negatable")?.ruleNames).toEqual(["is", "can", "will", "has"])
  })
})

describe("purposeOf()", () => {
  test("the docstring's first sentence, without its rule's name", () => {
    expect(purposeOf("`is_gt_lt` rule:  `is greater than`, e.g. `a is greater than b`.\n- more")).toBe(
      "`is greater than`, e.g. `a is greater than b`."
    )
    expect(purposeOf("Base class for all spell statement rules.  Second sentence.")).toBe(
      "Base class for all spell statement rules."
    )
  })

  test("a lead ending in a colon ends in a period;  none:  blank", () => {
    expect(purposeOf("a class variable, e.g.:\n- `card suits`")).toBe("A class variable, e.g.")
    expect(purposeOf(undefined)).toBe("")
  })
})
