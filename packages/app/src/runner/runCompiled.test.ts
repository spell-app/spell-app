import { describe, expect, test } from "vite-plus/test"

import { linkModule, projectImportsOf, startChanged } from "$/app/runner"

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

  test("points `@spell/elements` at the runtime too:  it exports `SpellElement` (P10)", () => {
    const linked = linkModule(`import { E, SpellElement } from "@spell/elements"`, "blob:core")
    expect(linked).toBe(`import { E, SpellElement } from "blob:core"`)
  })

  test('handles minified `from"..."`', () => {
    expect(linkModule(`import{spellCore}from"@spell/core"`, "blob:core")).toBe(`import{spellCore}from"blob:core"`)
  })
})

describe("startChanged():  does a recompile change the program's start, so it runs afresh?  (P17)", () => {
  const SEPARATOR = "\n// -----------\n"
  const IMPORT = 'import { spellCore, Thing, App } from "@spell/core"\n'
  const CARD = "export class Card extends Thing {}\nif (!spellCore.isCarryingOver) testCardSetup()"
  const GAME = "export let game = new Game()\nresetTheGame()\nif (!spellCore.isCarryingOver) game.start()"
  const STYLES = "spellCore.installStyles(undefined, `.board {}`)"
  /** A project of `files`, compiled:  the runtime's import first, a separator between each file's code. */
  const project = (...files: string[]) => IMPORT + files.join(SEPARATOR)

  test("several files:  an edit to the file that starts its app does;  to a file of types, or styles, doesn't", () => {
    const before = project(CARD, GAME, STYLES)
    expect(startChanged(before, project(CARD.replace("{}", "{ x = 1 }"), GAME, STYLES))).toBe(false)
    expect(startChanged(before, project(CARD, GAME, STYLES.replace("{}", "{ color: red }")))).toBe(false)
    expect(startChanged(before, project(CARD, GAME.replace("resetTheGame()", "dealAgain()"), STYLES))).toBe(true)
    // a test call is part of the start, but its file doesn't start the app
    expect(startChanged(before, project(CARD.replace("testCardSetup", "testCardMoves"), GAME, STYLES))).toBe(false)
  })

  test("the lines importing from the runtime don't count;  a file more or less does", () => {
    const before = project(GAME, CARD)
    expect(startChanged(before, project(GAME, CARD).replace("Thing, App", "Thing, App, List"))).toBe(false)
    expect(startChanged(before, project(GAME, CARD, STYLES))).toBe(true)
  })

  test("one file:  only when its start's own lines change", () => {
    const before = project(`${CARD}\n${GAME}`, STYLES)
    expect(startChanged(before, project(`${CARD}\n${GAME.replace("resetTheGame()", "dealAgain()")}`, STYLES))).toBe(
      false
    )
    expect(startChanged(before, project(`${CARD}\n${GAME.replace("game.start()", "board.start()")}`, STYLES))).toBe(
      true
    )
    expect(startChanged(before, project(`${GAME}`, STYLES))).toBe(true)
  })

  test("no app started:  never", () => {
    const counter = "export let counter = new Counter()\ncounter.start()"
    expect(startChanged(project(counter, CARD), project(counter.replace("new", "new  "), CARD))).toBe(false)
  })
})
