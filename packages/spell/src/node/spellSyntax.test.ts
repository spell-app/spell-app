import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, expect, test } from "vite-plus/test"

import { SPELL_SYNTAX_FILE, purposeOf, spellSyntax, withoutComments } from "$/spell/node/spellSyntax"

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

  test("a rule's syntax, its example in each writer, and its aliases", () => {
    expect(rows.find((row) => row.className === "IsGtLt")).toMatchObject({
      ruleNames: ["is_gt_lt"],
      internal: false,
      file: "packages/spell/src/rules/math/IsGtLt.ts",
      syntaxes: [
        {
          syntax: "(operator:is (greater|less) than (or equal to)?) {expression:operand}",
          example: "salary is greater than expenses",
          outputs: {
            js: { code: "(salary > expenses)" },
            ts: { code: "(salary > expenses)" },
            py: { code: "(salary > expenses)" }
          }
        }
      ],
      aliases: ["expression_suffix"]
    })
  })

  test("a rule registered with several syntaxes:  each, with an example from its own tests", () => {
    const { syntaxes } = rows.find((row) => row.className === "AssignmentStatement")!
    expect(syntaxes.map(({ syntax, example }) => [syntax, example])).toEqual([
      ["(thing:{expression}|{variable}) = {value:expression}", "unknown-var = yes"],
      ["let (thing:{expression}|{variable}) = {value:expression}", 'let the name of thing = "bob"'],
      ["set (thing:{expression}|{variable}) to {value:expression}", "set unknown-var to yes"],
      ["{thing:variable} is {value:expression}", 'bob is a new person whose name is "bob"']
    ])
  })

  test("a base class nobody registers is internal, with no syntax, but its aliases", () => {
    expect(rows.find((it) => it.className === "SpellExpression")).toMatchObject({
      internal: true,
      ruleNames: [],
      syntaxes: [],
      aliases: ["expression"]
    })
  })

  test("in each module, its internal rows come first", () => {
    for (const { rules } of data.modules) {
      const firstRegistered = rules.findIndex((rule) => !rule.internal)
      expect(rules.slice(firstRegistered).some((rule) => rule.internal)).toBe(false)
    }
  })

  test("a class specialized into several rules is one row, with each rule's syntax", () => {
    const row = rows.find((it) => it.className === "Negatable")
    expect(row?.ruleNames).toEqual(["is", "can", "will", "has"])
    expect(row?.syntaxes[0]).toEqual({ syntax: "(is|(negated:is not|isn't|isnt))" })
  })

  test("no comments in the examples, nor in what the writers write, but in the comment rule's own", () => {
    const pile = rows.find((row) => row.className === "CreateDrawableListType")!.syntaxes[0]!.outputs!.ts
    expect("code" in pile && pile.code).toContain("class PileElement")
    const commented = rows
      .filter((row) => row.className !== "CommentLine")
      .flatMap((row) => row.syntaxes)
      .flatMap(({ example = "", outputs }) => [example, ...Object.values(outputs ?? {})])
      .map((each) => (typeof each === "string" ? each : "code" in each ? each.code : ""))
      .filter((code) => /^\s*(\/\/|#(?!#))|\/\*/m.test(code))
    expect(commented).toEqual([])
  })
})

describe("withoutComments()", () => {
  test("javascript and TypeScript:  line and block comments go, quoted text stays", () => {
    expect(
      withoutComments(
        [
          "/**",
          " * A pile.",
          " */",
          "export class Pile {",
          '  url = "http://x" // where',
          "  value: any /* spell: type unknown */ = 1",
          "}"
        ].join("\n"),
        "js"
      )
    ).toBe(["export class Pile {", '  url = "http://x"', "  value: any = 1", "}"].join("\n"))
  })

  test("Python:  `#` comments go, but not in a string", () => {
    expect(withoutComments('x = "#1"  # the first\n# done\ny = 2', "py")).toBe('x = "#1"\ny = 2')
  })

  test("spell:  an apostrophe is no quote;  a comment that's all there is stays", () => {
    expect(withoutComments("it isn't red // yet", "spell")).toBe("it isn't red")
    expect(withoutComments("// foo", "spell")).toBe("// foo")
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
