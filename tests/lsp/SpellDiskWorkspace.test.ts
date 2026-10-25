import { describe, test, expect } from "vite-plus/test"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { fileURLToPath, pathToFileURL } from "url"

import { SP } from "spell-parser/spell"
import { LSP } from "spell-app/lsp"
import { locationForDiskPath } from "spell-app/spaces/server/node/projects/disk-fetch"
import { SpellDiskWorkspace } from "spell-app/lsp/SpellDiskWorkspace"

/**
 * A fresh checkout's editor, opening a project that imports one nobody has compiled yet (epic `elemental-spell` C13):
 * the workspace compiles the import first, as `spell` commands do, so the project parses.
 */
describe("SpellDiskWorkspace:  an import never compiled", () => {
  // its group is its folder's name, `@local/imports`:  a temp folder's random one can't be a project path
  const dir = resolve(mkdtempSync(resolve(tmpdir(), "spell-lsp-imports-")), "imports")
  mkdirSync(dir)
  const counterSource = 'a "counter" is a thing where:\n\t- its "count" is a number\n'
  const appSource = 'a "tally" is a thing where:\n\t- its "counter" is a counter\n'
  project("Counter", counterSource)
  const counterId = locationForDiskPath(resolve(dir, "Counter", "Counter.spell"))!.projectId
  project("App", appSource, { path: counterId, active: true, import: ["Counter"] })
  const appUri = pathToFileURL(resolve(dir, "App", "App.spell")).href

  test("is compiled before the project that imports it parses:  no `compile it first`", async () => {
    const workspace = new SpellDiskWorkspace()
    const service = new LSP.SpellLanguageService(workspace)
    const { project: counter } = workspace.fileFor(pathToFileURL(resolve(dir, "Counter", "Counter.spell")).href)!
    expect(SpellDiskWorkspace.isNeverCompiled(counter)).toBe(true)

    await workspace.update(appUri, appSource)
    const app = workspace.fileFor(appUri)!
    expect(SpellDiskWorkspace.isNeverCompiled(counter)).toBe(false)
    expect(service.diagnostics(app).map((it) => it.message)).toEqual([])
  })

  /** Project `name` in `dir`, of one file `<name>.spell` holding `source`, importing `imports` before it. */
  function project(name: string, source: string, ...imports: object[]) {
    const folder = resolve(dir, name)
    mkdirSync(folder)
    writeFileSync(resolve(folder, `${name}.spell`), source)
    const file = { path: `/${name}.spell`, active: true }
    writeFileSync(resolve(folder, SP.PROJECT_FILE), JSON.stringify({ imports: [...imports, file] }))
  }
})

/**
 * A view made from a built-in template written in spell, `two sided view` (epic `elemental-spell` C20):
 * hover and go-to on the template's words open its source, the core's `templates/TwoSidedView.spell`.
 */
describe("SpellDiskWorkspace:  a built-in template's source", () => {
  const dir = resolve(mkdtempSync(resolve(tmpdir(), "spell-lsp-templates-")), "templates")
  const folder = resolve(dir, "Cards")
  mkdirSync(folder, { recursive: true })
  const source = 'a "card" is a two sided view\n\nto test the card\n\tget a new card\n\tturn it over\n'
  writeFileSync(resolve(folder, "Cards.spell"), source)
  writeFileSync(resolve(folder, SP.PROJECT_FILE), JSON.stringify({ imports: [{ path: "/Cards.spell", active: true }] }))
  const uri = pathToFileURL(resolve(folder, "Cards.spell")).href
  const workspace = new SpellDiskWorkspace()
  const service = new LSP.SpellLanguageService(workspace)

  test("go-to on `turn it over` opens TwoSidedView.spell, at its method;  hover says it's declared there", async () => {
    await workspace.update(uri, source)
    const cards = workspace.fileFor(uri)!
    const position = { line: 4, character: 2 }
    const [where] = service.definition(cards, position)
    expect(where?.uri).toMatch(/\/core\/templates\/TwoSidedView\.spell$/)
    const template = readFileSync(fileURLToPath(where!.uri), "utf8").split("\n")
    expect(template[where!.range.start.line]).toContain("to turn it over:")
    expect(JSON.stringify(service.hover(cards, position)?.contents)).toContain("TwoSidedView.spell:")
  })

  test("only a built-in template's address is one", () => {
    expect(SP.builtInTemplateFileFor("@spell/core/TwoSidedView/TwoSidedView.es.spell")).toBe("TwoSidedView.es.spell")
    expect(SP.builtInTemplateFileFor("@spell/core/Nothing/Nothing.spell")).toBeUndefined()
    expect(workspace.sourceFor("@spell/examples/Solitaire/Card.spell")).toBeUndefined()
  })
})
