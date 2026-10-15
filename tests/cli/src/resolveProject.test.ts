import { existsSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { SP } from "$/spell"
import { CLI } from "$/cli"
import { fixturePath, fixtureProjectId, fixtureProjectNames, FIXTURES_DIR } from "$/spell/test"

/** What `arg` names, reduced to `kind` + id for comparing. */
async function named(arg: string, cwd?: string) {
  const resolved = await CLI.resolveProject(arg, cwd)
  if (resolved.kind === "project") return { kind: resolved.kind, id: resolved.project.projectId }
  if (resolved.kind === "file") return { kind: resolved.kind, id: resolved.file.path }
  return { kind: resolved.kind, ids: resolved.projectIds }
}

const FIZZBUZZ = fixtureProjectId("fizzbuzz")
const SOLITAIRE = fixtureProjectId("solitaire")
const CARD = `${SOLITAIRE}/Card.spell`
// in the order a group lists its projects:  by name
const ALL_FIXTURES = fixtureProjectNames()
  .map(fixtureProjectId)
  .sort((a, b) => a.localeCompare(b))

describe("resolveProject()", () => {
  describe("spell paths", () => {
    test("a project, by its address", async () => {
      expect(await named("@spell/test/fizzbuzz")).toEqual({ kind: "project", id: FIZZBUZZ })
    })
    test("a project, by its id (its address)", async () => {
      expect(await named(SOLITAIRE)).toEqual({ kind: "project", id: SOLITAIRE })
    })
    test("a spell file", async () => {
      expect(await named("@spell/test/solitaire/Card.spell")).toEqual({ kind: "file", id: CARD })
    })
    test("a group, by its address, holds only folders with a project.json", async () => {
      expect(await named("@spell/test")).toEqual({ kind: "root", ids: ALL_FIXTURES })
    })
  })

  describe("disk paths", () => {
    test("a project folder", async () => {
      expect(await named(fixturePath("solitaire"))).toEqual({ kind: "project", id: SOLITAIRE })
    })
    test("a project's project.json", async () => {
      expect(await named(fixturePath("solitaire", SP.PROJECT_FILE))).toEqual({ kind: "project", id: SOLITAIRE })
    })
    test("a spell file, relative to cwd", async () => {
      expect(await named("Card.spell", fixturePath("solitaire"))).toEqual({ kind: "file", id: CARD })
    })
    test("a known root's folder", async () => {
      expect(await named(FIXTURES_DIR)).toEqual({ kind: "root", ids: ALL_FIXTURES })
    })
    test("`@here` is the current folder", async () => {
      expect(await named("@here", fixturePath("solitaire"))).toEqual({ kind: "project", id: SOLITAIRE })
      expect(await named("@here/Card.spell", fixturePath("solitaire"))).toEqual({ kind: "file", id: CARD })
    })
  })

  describe("errors", () => {
    test.each([
      "@nope",
      "@spell/test/nope",
      "@spell/test/solitaire/Nope.spell",
      "@spell/test/solitaire/project.json",
      "./no/such/thing"
    ])("%s", async (arg) => {
      await expect(CLI.resolveProject(arg, fixturePath())).rejects.toBeInstanceOf(CLI.CliError)
    })

    test("a folder outside any project -- and writes NO project.json into it", async () => {
      const folder = mkdtempSync(resolve(tmpdir(), "spell-cli-"))
      try {
        writeFileSync(resolve(folder, "Loose.spell"), "print 1")
        await expect(CLI.resolveProject(folder)).rejects.toThrow(/isn't in a spell project/)
        await expect(CLI.resolveProject(resolve(folder, "Loose.spell"))).rejects.toThrow(/isn't in a spell project/)
        expect(existsSync(resolve(folder, SP.PROJECT_FILE))).toBe(false)
      } finally {
        rmSync(folder, { recursive: true })
      }
    })
  })
})

describe("rootsNamed()", () => {
  const paths = (name: string) => CLI.rootsNamed(name).map((spec) => spec.path)

  test("a group's address, or a space:  every group in it", () => {
    expect(paths("@spell/guides")).toEqual(["@spell/guides"])
    expect(paths("@spell/library")).toEqual(["@spell/library"])
    expect(paths("owen@spell")).toEqual(["owen@spell"])
    expect(paths("@spell")).toEqual(["@spell/examples", "@spell/guides", "@spell/library", "@spell/test"])
  })

  test("none for anything else", () => {
    expect(paths("@nope")).toEqual([])
    // the short names before the addresses (`@examples`) name nothing
    expect(paths("@examples")).toEqual([])
  })
})
