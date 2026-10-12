import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { spellCore } from "$/core"
import { coreDeclarations, docsIn, paramNamesOf, unlistedCoreNames } from "./coreDeclarations"

/** Where `yarn gen:declarations` writes the core's method list. */
const DECLARATIONS_FILE = resolve(import.meta.dirname, "..", "spellCore.declarations.json")

describe("the core's method list, spellCore.declarations.json", () => {
  test("is up to date with the core:  if not, run `yarn gen:declarations` in packages/core", () => {
    const written = JSON.parse(readFileSync(DECLARATIONS_FILE, "utf8")) as unknown
    expect(
      written,
      "spellCore.declarations.json is out of date:  run `yarn gen:declarations` in packages/core"
    ).toEqual(coreDeclarations())
  })

  test("lists every name on spellCore, except old names and the core's own `_` helpers", () => {
    const { statements } = coreDeclarations()
    const listed = statements.filter((it) => it.of === "spellCore").map((it) => it.name ?? it.property)
    const unlisted = unlistedCoreNames()
    const shouldList = Object.keys(spellCore).filter((name) => !unlisted.includes(name))
    expect(new Set(shouldList)).toEqual(new Set(listed))
  })

  test("lists each name once", () => {
    const { statements } = coreDeclarations()
    const names = statements.map((it) => `${it.of ?? ""}.${it.name ?? it.property ?? it.type}`)
    expect(new Set(names).size).toBe(names.length)
  })

  test("a method with its parameters, a property, a class and a function", () => {
    const { provides, statements } = coreDeclarations()
    expect(provides.slice(0, 2)).toEqual(["spellCore", "Thing"])
    expect(statements).toContainEqual(
      expect.objectContaining({
        kind: "method",
        name: "getItemAt",
        of: "spellCore",
        module: "collection-core",
        params: [{ name: "collection" }, { name: "position" }]
      })
    )
    expect(statements).toContainEqual(
      expect.objectContaining({ property: "console", of: "spellCore", module: "console" })
    )
    expect(statements).toContainEqual(
      expect.objectContaining({ type: "App", superType: "Thing", module: "classes/App" })
    )
    expect(statements).toContainEqual(
      expect.objectContaining({
        kind: "function",
        name: "trigger",
        module: "runtime",
        params: [{ name: "event" }, { name: "props" }]
      })
    )
  })

  test("each name with its docstring's lead, and the section it's under:  what the core reference page shows", () => {
    const { statements } = coreDeclarations()
    expect(statements.filter((it) => !it.description).map((it) => it.name ?? it.property ?? it.type)).toEqual([])
    expect(statements).toContainEqual(
      expect.objectContaining({
        name: "seedRandom",
        section: "random numbers",
        description: expect.stringMatching(/^Start the random numbers again from `seed`/)
      })
    )
  })
})

describe("docsIn()", () => {
  test("the lead, up to the first bullet, on one line;  a re-export;  a folder's index", () => {
    expect(docsIn("drawing").get("h")?.description).toBe(
      'Solid\'s own `h()`, what compiled JavaScript draws with:  `import { h } from "@spell/core"`.'
    )
    expect(docsIn("classes").size).toBeGreaterThan(0)
    expect(docsIn("no-such-module").size).toBe(0)
  })
})

describe("paramNamesOf()", () => {
  test("names, without their defaults", () => {
    expect(paramNamesOf(function pause(number: number, units = "seconds, or (minutes)") {})).toEqual([
      "number",
      "units"
    ])
  })
  test("a rest parameter keeps its dots;  a destructured one is `options`", () => {
    const add = (list: unknown, { at = [1, 2] }: { at?: number[] } = {}, ...things: unknown[]) => [list, at, things]
    expect(paramNamesOf(add)).toEqual(["list", "options", "...things"])
  })
  test("none at all", () => {
    expect(paramNamesOf(() => {})).toEqual([])
    expect(paramNamesOf(function doNothing() {})).toEqual([])
  })
})
