import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { afterAll, describe, test, expect } from "vite-plus/test"

import { CLI } from "spell-app/cli"

/** Values of the choices for `text`. */
async function values(text: string, recents: string[] = []) {
  return (await CLI.projectChoices(text, recents)).map((choice) => choice.value)
}

describe("projectChoices()", () => {
  test("nothing typed:  recent picks, then each group", async () => {
    const choices = await CLI.projectChoices("", ["@spell/test/fizzbuzz"])
    expect(choices[0]).toEqual({ value: "@spell/test/fizzbuzz", isFinal: true, isRecent: true })
    expect(choices.map((it) => it.value)).toEqual(
      expect.arrayContaining(["owen@spell/", "@spell/examples/", "@spell/library/", "@spell/test/"])
    )
    expect(choices.filter((it) => !it.isRecent).every((it) => !it.isFinal)).toBe(true)
  })

  test("narrowed by what's typed, ignoring case", async () => {
    expect(await values("@SPELL/TE")).toEqual(["@spell/test/"])
  })

  test("a group:  its projects, to go into", async () => {
    expect(await values("@spell/test/")).toEqual([
      "@spell/test/counter/",
      "@spell/test/counter-app/",
      "@spell/test/fizzbuzz/",
      "@spell/test/lists-from-zero/",
      "@spell/test/people/",
      "@spell/test/thing-references/",
      "@spell/test/todos-form-based/"
    ])
    expect(await values("@spell/test/li")).toEqual(["@spell/test/lists-from-zero/"])
  })

  test("a project:  the entire project first, then its spell files", async () => {
    const choices = await CLI.projectChoices("@spell/examples/Solitaire/")
    expect(choices[0]).toEqual({ value: "@spell/examples/Solitaire", label: "entire project", isFinal: true })
    expect(choices.slice(1).map((it) => it.value)).toEqual([
      "@spell/examples/Solitaire/Card.spellx",
      "@spell/examples/Solitaire/Deck.spellx",
      "@spell/examples/Solitaire/Pile.spellx",
      "@spell/examples/Solitaire/Solitaire.spellx"
    ])
    expect(await values("@spell/examples/Solitaire/s")).toEqual(["@spell/examples/Solitaire/Solitaire.spellx"])
    expect(await values("@spell/examples/Solitaire/x")).toEqual([])
  })

  test("nothing for what isn't there", async () => {
    expect(await values("@nope/")).toEqual([])
    expect(await values("@spell/test/nope/")).toEqual([])
  })
})

describe("commonPrefix()", () => {
  test("as far as they all agree", () => {
    expect(CLI.commonPrefix(["@spell/test/fizzbuzz/", "@spell/test/people/"])).toBe("@spell/test/")
    expect(CLI.commonPrefix(["@spell/examples/"])).toBe("@spell/examples/")
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
    writeFileSync(oldFile, '["@spell/test/fizzbuzz"]')
    expect(CLI.recentProjects(newFile)).toEqual(["@spell/test/fizzbuzz"])
    expect(existsSync(oldFile)).toBe(false)
    expect(readFileSync(newFile, "utf8")).toBe('["@spell/test/fizzbuzz"]')

    writeFileSync(oldFile, '["@spell/examples/Solitaire"]')
    expect(CLI.recentProjects(newFile)).toEqual(["@spell/test/fizzbuzz"])
    expect(existsSync(oldFile)).toBe(true)
  })
})
