import { describe, test, expect, beforeAll } from "vite-plus/test"
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "fs"
import { tmpdir } from "os"
import { basename, resolve } from "path"

import environment from "spell-app/spaces/server/node/environment"
import { P } from "spell-lang/parser"
import { SP } from "spell-lang/spell"
import {
  loadFixtureProject,
  parseSpellProject,
  describeParseErrors,
  fixturePath,
  fixtureProjectId,
  FIXTURES_DIR
} from "spell-lang/spell/test"
import { SPACES } from "spell-app/spaces"
import { diskFetch, installDiskFetch, locationForDiskPath } from "spell-app/spaces/server/node/projects/disk-fetch"
import { serverPathForRoot } from "spell-app/spaces/server/node/projects/project-utils"

/**
 * `SpellProject` & co. hosted in node, loading from disk instead of over HTTP -- what the language server does:
 * spaces' disk reader answers the URLs spell builds (`SP.SpellUrls`).
 */
describe("diskFetch", () => {
  beforeAll(installDiskFetch)
  const solitaire = fixtureProjectId("solitaire")

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
    const reference = parseSpellProject(loadFixtureProject("solitaire"))
    spellFiles.forEach((file, index) => {
      expect(file.match, file.path).toBeDefined()
      expect(describeParseErrors(file.match)).toEqual(reference.files[index]!.errors)
      expect(P.JSWriter.instance.writeMatch(file.match)).toEqual(reference.files[index]!.compiled)
    })
  })

  test("it answers a file's URL, split by its group and project:  `/spaces/<project>/<file>`", async () => {
    const url = SP.SpellUrls.fileUrl(`${solitaire}/Card.spell`)
    expect(url).toBe("/spaces/@spell/test/solitaire/Card.spell")
    expect(await diskFetch({ url })).toBe(readFileSync(fixturePath("solitaire", "Card.spell"), "utf8"))
    expect(await diskFetch({ url: SP.SpellUrls.indexUrl(solitaire) })).toHaveProperty("imports")
    expect(await diskFetch({ url: SP.SpellUrls.listUrl("@spell/test") })).toContainEqual({ path: solitaire })
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
      expect(locationForDiskPath(fixturePath("solitaire", "Card.spell"))?.path).toBe(`${solitaire}/Card.spell`)
    })

    // where each group's folder is -- NOT what's in it, which tests never depend on
    test("a group's folder is its place's:  the `@spell` space's built-ins, the test projects, your own space", () => {
      expect(serverPathForRoot("@spell/examples")).toBe(resolve(environment.systemFilesRoot, "examples"))
      expect(serverPathForRoot("@spell/library")).toBe(resolve(environment.systemFilesRoot, "library"))
      expect(serverPathForRoot("@spell/guides")).toBe(resolve(environment.systemFilesRoot, "guides"))
      expect(serverPathForRoot("owen@spell")).toBe(environment.userFilesRoot)
      expect(serverPathForRoot("@spell/test")).toBe(environment.testFilesRoot)
      expect(environment.systemFilesRoot).toBe(resolve(environment.packagesDir, "spaces", "@spell"))
      // spell's frozen test projects:  spell-lang's (epic `repo-split` C11), found through `spell-lang/spell`
      expect(environment.testFilesRoot).toMatch(/[/\\]spell-lang[/\\]tests[/\\]spaces[/\\]@spell[/\\]test$/)
      expect(existsSync(resolve(environment.testFilesRoot, "solitaire", "__project.json5"))).toBe(true)
    })

    test("spell's test helpers and spaces agree where the test projects are, and whose space is yours", () => {
      expect(FIXTURES_DIR).toBe(environment.testFilesRoot)
      expect(environment.userFilesRoot).toBe(resolve(environment.spellSpacesDir, "@spell", `${SPACES.LOCAL_PERSON}@`))
    })

    test("a file elsewhere gets a `@local/<folder>` group, and loads + saves through it", async () => {
      const workspace = mkdtempSync(resolve(tmpdir(), "spell-ws-"))
      const projectDir = resolve(workspace, "MyProject")
      mkdirSync(projectDir)
      writeFileSync(
        resolve(projectDir, SP.PROJECT_FILE),
        JSON.stringify({ imports: [{ path: "/a.spell", active: true }] })
      )
      writeFileSync(resolve(projectDir, "a.spell"), "set foo to 1\nprint the foo")

      const location = locationForDiskPath(resolve(projectDir, "a.spell"))!
      expect(location.path).toBe(`@local/${basename(workspace)}/MyProject/a.spell`)

      const file = new SP.SpellFile(location.path)
      await file.project.parse()
      expect(file.match?.compile()).toBe("export const foo = 1\ncore.console.log(foo)")

      await file.save({ contents: "set foo to 2" })
      expect(readFileSync(resolve(projectDir, "a.spell"), "utf8")).toBe("set foo to 2")
    })

    test("a name that can't be a path segment gives `undefined`", () => {
      expect(locationForDiskPath("/tmp/bad@name/x.spell")).toBeUndefined()
    })
  })
})
