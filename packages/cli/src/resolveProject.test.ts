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

const FIZZBUZZ = fixtureProjectId("FizzBuzz")
const SOLITAIRE = fixtureProjectId("Solitaire")
const CARD = `${SOLITAIRE}/Card.spell`
const ALL_FIXTURES = fixtureProjectNames().map(fixtureProjectId)

describe("resolveProject()", () => {
  describe("spell paths", () => {
    test("a project, by its root's alias", async () => {
      expect(await named("@test/FizzBuzz")).toEqual({ kind: "project", id: FIZZBUZZ })
    })
    test("a project, by full id", async () => {
      expect(await named(SOLITAIRE)).toEqual({ kind: "project", id: SOLITAIRE })
    })
    test("a spell file", async () => {
      expect(await named("@test/Solitaire/Card.spell")).toEqual({ kind: "file", id: CARD })
    })
    test("a bare root, by alias or full path, holds only folders with a project.json", async () => {
      expect(await named("@test")).toEqual({ kind: "root", ids: ALL_FIXTURES })
      expect(await named("@test:fixtures")).toEqual({ kind: "root", ids: ALL_FIXTURES })
    })
  })

  describe("disk paths", () => {
    test("a project folder", async () => {
      expect(await named(fixturePath("Solitaire"))).toEqual({ kind: "project", id: SOLITAIRE })
    })
    test("a project's project.json", async () => {
      expect(await named(fixturePath("Solitaire", SP.PROJECT_FILE))).toEqual({ kind: "project", id: SOLITAIRE })
    })
    test("a spell file, relative to cwd", async () => {
      expect(await named("Card.spell", fixturePath("Solitaire"))).toEqual({ kind: "file", id: CARD })
    })
    test("a known root's folder", async () => {
      expect(await named(FIXTURES_DIR)).toEqual({ kind: "root", ids: ALL_FIXTURES })
    })
    test("`@workspace` is the current folder", async () => {
      expect(await named("@workspace", fixturePath("Solitaire"))).toEqual({ kind: "project", id: SOLITAIRE })
      expect(await named("@workspace/Card.spell", fixturePath("Solitaire"))).toEqual({ kind: "file", id: CARD })
    })
  })

  describe("errors", () => {
    test.each(["@nope", "@test/Nope", "@test/Solitaire/Nope.spell", "@test/Solitaire/project.json", "./no/such/thing"])(
      "%s",
      async (arg) => {
        await expect(CLI.resolveProject(arg, fixturePath())).rejects.toBeInstanceOf(CLI.CliError)
      }
    )

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

  test("full path, alias, domain, owner", () => {
    expect(paths("@system:guides")).toEqual(["@system:guides"])
    expect(paths("@library")).toEqual(["@system:library"])
    expect(paths("@examples")).toEqual(["@system:examples"])
    expect(paths("@user")).toEqual(["@user:projects"])
    expect(paths("@system")).toEqual(["@system:examples", "@system:guides", "@system:library"])
  })

  test("none for anything else", () => {
    expect(paths("@nope")).toEqual([])
  })
})
