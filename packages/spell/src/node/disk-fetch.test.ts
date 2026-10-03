import { describe, test, expect, beforeAll } from "vite-plus/test"
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "fs"
import { tmpdir } from "os"
import { basename, resolve } from "path"

import environment from "$/spell/node/environment"
import { SP } from "$/spell"
import { loadFixtureProject, parseSpellProject, describeParseErrors, fixturePath, fixtureProjectId } from "$/spell/test"
import { installDiskFetch, locationForDiskPath } from "./disk-fetch"
import { serverPathForRoot } from "./project-utils"

/**
 * `SpellProject` & co. hosted in node, loading from disk instead of over HTTP -- what the language server does.
 */
describe("diskFetch", () => {
  beforeAll(installDiskFetch)
  const solitaire = fixtureProjectId("Solitaire")

  test("a SpellProject loads, parses and compiles from disk the same as the headless reference", async () => {
    const project = new SP.SpellProject(solitaire)
    await project.load(undefined)
    const spellFiles = project.activeImports.filter((file) => file instanceof SP.SpellFile)
    expect(spellFiles.map((file) => file.filePath)).toEqual([
      "/Card.spell",
      "/Deck.spell",
      "/Pile.spell",
      "/Solitaire.spell"
    ])

    await project.parse()
    const reference = parseSpellProject(loadFixtureProject("Solitaire"))
    spellFiles.forEach((file, index) => {
      expect(file.match, file.path).toBeDefined()
      expect(describeParseErrors(file.match)).toEqual(reference.files[index]!.errors)
      expect(file.match!.compile()).toEqual(reference.files[index]!.compiled)
    })
  })

  test("a missing file falls back to `defaultContents`, else fails like a 404", async () => {
    const file = new SP.SpellFile(`${solitaire}/Nope.spell`)
    file.defaultContents = "// nothing"
    expect(await file.load(undefined)).toBe("// nothing")
    const other = new SP.SpellFile(`${solitaire}/Nope-2.spell`)
    await expect(other.load(undefined)).rejects.toThrow(/Not found on disk/)
  })

  describe("locationForDiskPath", () => {
    test("a file under a known root's folder maps onto that root", () => {
      expect(locationForDiskPath(fixturePath("Solitaire", "Card.spell"))?.path).toBe(`${solitaire}/Card.spell`)
    })

    // where each built-in root's folder is -- NOT what's in it, which tests never depend on
    test("a built-in root's folder is in `projects/`, under its owner's files root", () => {
      expect(serverPathForRoot("@system:examples")).toBe(resolve(environment.systemFilesRoot, "examples"))
      expect(serverPathForRoot("@system:library")).toBe(resolve(environment.systemFilesRoot, "library"))
      expect(serverPathForRoot("@system:guides")).toBe(resolve(environment.systemFilesRoot, "guides"))
      expect(serverPathForRoot("@user:projects")).toBe(environment.userFilesRoot)
      expect(serverPathForRoot("@test:fixtures")).toBe(environment.testFilesRoot)
      expect(environment.systemFilesRoot).toBe(resolve(environment.projectsDir, "system"))
    })

    test("a file elsewhere gets a `@workspace` root, and loads + saves through it", async () => {
      const workspace = mkdtempSync(resolve(tmpdir(), "spell-ws-"))
      const projectDir = resolve(workspace, "MyProject")
      mkdirSync(projectDir)
      writeFileSync(
        resolve(projectDir, SP.PROJECT_FILE),
        JSON.stringify({ imports: [{ path: "/a.spell", active: true }] })
      )
      writeFileSync(resolve(projectDir, "a.spell"), "set foo to 1\nprint the foo")

      const location = locationForDiskPath(resolve(projectDir, "a.spell"))!
      expect(location.path).toBe(`@workspace:${basename(workspace)}:MyProject/a.spell`)

      const file = new SP.SpellFile(location.path)
      await file.project.parse()
      expect(file.match?.compile()).toBe("export let foo = 1\nspellCore.console.log(foo)")

      await file.save({ contents: "set foo to 2" })
      expect(readFileSync(resolve(projectDir, "a.spell"), "utf8")).toBe("set foo to 2")
    })

    test("a name that can't be a path segment gives `undefined`", () => {
      expect(locationForDiskPath("/tmp/bad@name/x.spell")).toBeUndefined()
    })
  })
})
