import { describe, expect, test } from "vite-plus/test"

import { linkModule, projectImportsOf } from "$/app/runner"

const COMPILED = `/*! SPELL: PROJECT { spellVersion: "0.8.0" } */
import { spellCore, Thing, List, App } from "@spell/core"
import { Card, Deck } from "@spell/project/@system:library:cards"
import { Pile } from "@spell/project/@system:examples:Solitaire"
import { Card as Again } from "@spell/project/@system:library:cards"

export class Game extends App {}
`

describe("projectImportsOf()", () => {
  test("lists each imported project once, in order", () => {
    expect(projectImportsOf(COMPILED)).toEqual(["@system:library:cards", "@system:examples:Solitaire"])
  })

  test("is empty with no project imports", () => {
    expect(projectImportsOf(`import { spellCore } from "@spell/core"`)).toEqual([])
  })
})

describe("linkModule()", () => {
  test("points `@spell/core` and each project at its URL", () => {
    const linked = linkModule(COMPILED, "blob:core", {
      "@system:library:cards": "blob:cards",
      "@system:examples:Solitaire": "blob:solitaire"
    })
    expect(linked).toContain(`import { spellCore, Thing, List, App } from "blob:core"`)
    expect(linked).toContain(`import { Card, Deck } from "blob:cards"`)
    expect(linked).toContain(`import { Pile } from "blob:solitaire"`)
    expect(linked).toContain(`import { Card as Again } from "blob:cards"`)
    expect(linked).not.toContain("@spell/")
  })

  test("leaves a project it has no URL for alone", () => {
    const linked = linkModule(COMPILED, "blob:core")
    expect(linked).toContain(`from "@spell/project/@system:library:cards"`)
    expect(linked).toContain(`from "blob:core"`)
  })

  test('handles minified `from"..."`', () => {
    expect(linkModule(`import{spellCore}from"@spell/core"`, "blob:core")).toBe(`import{spellCore}from"blob:core"`)
  })
})
