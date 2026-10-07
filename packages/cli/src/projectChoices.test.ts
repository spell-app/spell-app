import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { afterAll, describe, test, expect } from "vite-plus/test"

import { CLI } from "$/cli"

/** Values of the choices for `text`. */
async function values(text: string, recents: string[] = []) {
  return (await CLI.projectChoices(text, recents)).map((choice) => choice.value)
}

describe("projectChoices()", () => {
  test("nothing typed:  recent picks, then each root", async () => {
    const choices = await CLI.projectChoices("", ["@test/FizzBuzz"])
    expect(choices[0]).toEqual({ value: "@test/FizzBuzz", isFinal: true, isRecent: true })
    expect(choices.map((it) => it.value)).toEqual(expect.arrayContaining(["@examples/", "@library/", "@test/"]))
    expect(choices.filter((it) => !it.isRecent).every((it) => !it.isFinal)).toBe(true)
  })

  test("narrowed by what's typed, ignoring case", async () => {
    expect(await values("@TE")).toEqual(["@test/"])
  })

  test("a root:  its projects, to go into", async () => {
    expect(await values("@test/")).toEqual(["@test/FizzBuzz/", "@test/OutlineSolitaire/", "@test/Solitaire/"])
    expect(await values("@test/sol")).toEqual(["@test/Solitaire/"])
  })

  test("a project:  the entire project first, then its spell files", async () => {
    const choices = await CLI.projectChoices("@test/Solitaire/")
    expect(choices[0]).toEqual({ value: "@test/Solitaire", label: "entire project", isFinal: true })
    expect(choices.slice(1).map((it) => it.value)).toEqual([
      "@test/Solitaire/Card.spell",
      "@test/Solitaire/Deck.spell",
      "@test/Solitaire/Pile.spell",
      "@test/Solitaire/Solitaire.spell"
    ])
    expect(await values("@test/Solitaire/d")).toEqual(["@test/Solitaire/Deck.spell"])
  })

  test("nothing for what isn't there", async () => {
    expect(await values("@nope/")).toEqual([])
    expect(await values("@test/Nope/")).toEqual([])
  })
})

describe("commonPrefix()", () => {
  test("as far as they all agree", () => {
    expect(CLI.commonPrefix(["@test/FizzBuzz/", "@test/Solitaire/"])).toBe("@test/")
    expect(CLI.commonPrefix(["@examples/"])).toBe("@examples/")
    expect(CLI.commonPrefix([])).toBe("")
  })
})

describe("recentProjects()", () => {
  const folder = mkdtempSync(resolve(tmpdir(), "spell-recent-"))
  const file = resolve(folder, "recent.json")
  afterAll(() => rmSync(folder, { recursive: true, force: true }))

  test("none yet, or a broken file:  none", () => {
    expect(CLI.recentProjects(file)).toEqual([])
    writeFileSync(file, "not json")
    expect(CLI.recentProjects(file)).toEqual([])
  })

  test("newest first, no repeats, at most 3", () => {
    for (const arg of ["a", "b", "c", "a", "d"]) CLI.rememberProject(arg, file)
    expect(CLI.recentProjects(file)).toEqual(["d", "a", "c"])
  })

  test("an old .recent-targets.json beside it:  moved into place, unless there's a new one already", () => {
    const newFile = resolve(folder, ".recent-projects.json")
    const oldFile = resolve(folder, ".recent-targets.json")
    writeFileSync(oldFile, '["@test/FizzBuzz"]')
    expect(CLI.recentProjects(newFile)).toEqual(["@test/FizzBuzz"])
    expect(existsSync(oldFile)).toBe(false)
    expect(readFileSync(newFile, "utf8")).toBe('["@test/FizzBuzz"]')

    writeFileSync(oldFile, '["@test/Solitaire"]')
    expect(CLI.recentProjects(newFile)).toEqual(["@test/FizzBuzz"])
    expect(existsSync(oldFile)).toBe(true)
  })
})
