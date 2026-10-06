import { spawnSync } from "child_process"
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"
import { describe, test, expect, beforeAll } from "vite-plus/test"

import environment from "$/spell/node/environment"
import { P } from "$/parser"
import { SP } from "$/spell"
import { installDiskFetch, locationForDiskPath } from "$/spell/node/disk-fetch"
import { describeParseErrors, fixturePath, tsxBinary } from "$/spell/test"

/**
 * A project importing another, through `project.json` -- as `SpellProject` does it in the app.
 * - Solitaire split in two, in a temp `@workspace`:  `lib` (`Card`, `Deck`, `Pile`) and apps importing it.
 * - Nothing is written into the repo.
 */
describe("SpellProject imports", () => {
  const solitaire = fixturePath("Solitaire")
  const workspace = mkdtempSync(resolve(tmpdir(), "spell-imports-"))
  let root = ""

  /**
   * Project `name` in the workspace:  `spellFiles` copied from Solitaire -- or written, if given `sources` for them --
   * then `imports` ahead of them.
   */
  function makeProject(
    name: string,
    spellFiles: string[],
    json: Record<string, unknown> = {},
    sources: Record<string, string> = {}
  ) {
    const dir = resolve(workspace, name)
    mkdirSync(dir)
    for (const file of spellFiles) {
      if (sources[file] !== undefined) writeFileSync(resolve(dir, file), sources[file])
      else copyFileSync(resolve(solitaire, file), resolve(dir, file))
    }
    const { imports = [], ...rest } = json as { imports?: unknown[] }
    const files = spellFiles.map((file) => ({ path: `/${file}`, active: true }))
    writeFileSync(resolve(dir, SP.PROJECT_FILE), JSON.stringify({ ...rest, imports: [...imports, ...files] }))
    // registers the `@workspace` root, first time round
    root = locationForDiskPath(resolve(dir, SP.PROJECT_FILE))!.projectRoot
    return new SP.SpellProject(`${root}:${name}`)
  }

  /** `"<line>:<ch> <message>"` for each parse error in `project`'s files. */
  function errorsIn(project: SP.SpellProject) {
    return project.spellFiles.flatMap((file) => describeParseErrors(file.match))
  }

  /**
   * Run compiled `app` in node, linked as a runner links it -- `libIds` are the projects it imports.
   * - A resolve hook does `runCompiled()`'s linking:  `@spell/core` => `spellCore`'s source (via `tsx`),
   *   `@spell/project/<id>` => that project's compiled file.
   */
  function runLinked(app: SP.SpellProject, libIds: string[]) {
    // compiled `.js` files are ES modules
    writeFileSync(resolve(workspace, "package.json"), JSON.stringify({ type: "module" }))
    const hooks = resolve(workspace, "hooks.mjs")
    writeFileSync(
      hooks,
      [
        "import { register } from 'node:module'",
        "const projects = JSON.parse(process.env.SPELL_PROJECTS)",
        "export async function resolve(specifier, context, next) {",
        "  if (specifier === '@spell/core') return next(process.env.SPELL_CORE, context)",
        "  const project = specifier.startsWith('@spell/project/') && projects[decodeURI(specifier.slice(15))]",
        "  return project ? { url: project, shortCircuit: true } : next(specifier, context)",
        "}",
        "register(import.meta.url)"
      ].join("\n")
    )
    const runner = resolve(workspace, `run-${app.projectId.split(":").at(-1)}.mjs`)
    writeFileSync(runner, `await import("@spell/project/${encodeURI(app.projectId)}")`)
    const projects = Object.fromEntries(
      [...libIds, app.projectId].map((id) => {
        const name = id.split(":").at(-1)!
        return [id, pathToFileURL(resolve(workspace, name, `${name}${SP.COMPILED_JS_SUFFIX}`)).href]
      })
    )
    const tsx = tsxBinary()
    return spawnSync(tsx, ["--import", hooks, runner], {
      cwd: resolve(environment.srcDir, ".."),
      encoding: "utf8",
      env: {
        ...process.env,
        SPELL_CORE: pathToFileURL(resolve(environment.spellCoreDir, "index.ts")).href,
        SPELL_PROJECTS: JSON.stringify(projects)
      }
    })
  }

  let lib: SP.SpellProject
  beforeAll(async () => {
    installDiskFetch()
    lib = makeProject("lib", ["Card.spell", "Deck.spell", "Pile.spell"], { version: "1.2.0" })
    await lib.compile()
  })

  test("targets:  `js/solid` always, then `project.json`'s;  an unknown one throws, naming the ones there are", async () => {
    expect(lib.targets.map(({ name }) => name)).toEqual(["js/solid"])
    const project = makeProject("targets", ["Deck.spell"], { targets: ["nope"] })
    await project.load(undefined)
    expect(() => project.targets).toThrow(/There's no target 'nope':  try js\/solid/)
  })

  test("a project that draws can't compile to a target that can't draw", async () => {
    SP.TARGETS["test/no-draw"] = {
      ...SP.TARGETS["js/solid"]!,
      name: "test/no-draw",
      suffix: ".nodraw.js",
      can: { draw: false }
    }
    try {
      const draws = makeProject("draws", ["Card.spell"], { targets: ["test/no-draw"] })
      await expect(draws.compile()).rejects.toThrow(/'draws' draws a UI, which target 'test\/no-draw' can't/)
      const quiet = makeProject(
        "quiet",
        ["Quiet.spell"],
        { targets: ["test/no-draw"] },
        { "Quiet.spell": 'print "hi"\n' }
      )
      await quiet.compile()
      expect(readFileSync(resolve(workspace, "quiet", "quiet.nodraw.js"), "utf8")).toContain(
        'spellCore.console.log("hi")'
      )
    } finally {
      delete SP.TARGETS["test/no-draw"]
    }
  })

  test("compiling a project writes its declarations beside its compiled file, which holds just code", () => {
    const json = readFileSync(resolve(workspace, "lib", `lib${SP.DECLARATIONS_JSON_SUFFIX}`), "utf8")
    const declarations = SP.SpellDeclarations.read(json)!
    expect(declarations.version).toBe("1.2.0")
    expect(declarations.provides).toEqual(expect.arrayContaining(["Card", "Deck", "Pile"]))
    const compiled = readFileSync(resolve(workspace, "lib", `lib${SP.COMPILED_JS_SUFFIX}`), "utf8")
    expect(compiled).toContain("export class Card extends Thing {\n")
    expect(compiled).not.toContain("SPELL:")
  })

  test("a project compiled before declarations files still imports, from the comments in its compiled file", async () => {
    const lib = resolve(workspace, "lib")
    const json = readFileSync(resolve(lib, `lib${SP.DECLARATIONS_JSON_SUFFIX}`), "utf8")
    const declarations = SP.SpellDeclarations.read(json)!
    // what an older compile wrote:  a header, then each statement's comment -- here, all at the top
    const header = `/*! SPELL: PROJECT ${JSON.stringify({ spellVersion: declarations.spellVersion, provides: declarations.provides })} */\n`
    const comments = declarations.statements.map((it) => `/*! SPELL: DECLARES ${JSON.stringify(it)} */\n`).join("")
    const older = SP.SpellDeclarations.fromComments(header + comments)!
    expect(older.provides).toEqual(declarations.provides)
    expect(older.statements).toEqual(declarations.statements)
  })

  test("a project parses against another's compiled declarations -- not its sources", async () => {
    const app = makeProject("app", ["Solitaire.spell"], { imports: [{ path: `${root}:lib`, active: true }] })
    await app.parse()
    expect(app.parseError).toBeUndefined()
    expect(app.spellFiles.map((file) => file.filePath)).toEqual(["/Solitaire.spell"])
    expect(app.scope!.parentScope).toBeInstanceOf(P.ImportScope)
    expect(errorsIn(app)).toEqual([])
  })

  test("`source: true` parses the other project's files ahead of ours instead", async () => {
    const imports = [{ path: `${root}:lib`, active: true, source: true }]
    const app = makeProject("app_from_source", ["Solitaire.spell"], { imports })
    await app.parse()
    expect(app.spellFiles.map((file) => file.filePath)).toEqual([
      "/Card.spell",
      "/Deck.spell",
      "/Pile.spell",
      "/Solitaire.spell"
    ])
    expect(app.scope!.parentScope).not.toBeInstanceOf(P.ImportScope)
    expect(errorsIn(app)).toEqual([])
  })

  test("declaring something it also imports is a parse error", async () => {
    const app = makeProject("app_clash", ["Card.spell"], { imports: [{ path: `${root}:lib`, active: true }] })
    await expect(app.parse()).rejects.toThrow()
    expect(app.parseError).toMatch(/declares 'Card', which it also imports from '@workspace:.*:lib'/)
  })

  test("importing a project that's never been compiled is a parse error", async () => {
    makeProject("never_compiled", ["Card.spell"])
    const app = makeProject("app_uncompiled", ["Solitaire.spell"], {
      imports: [{ path: `${root}:never_compiled`, active: true }]
    })
    await expect(app.parse()).rejects.toThrow()
    expect(app.parseError).toMatch(/no compiled declarations -- compile it first/)
  })

  /**
   * The acid test for "no globals":  RUN a compiled app which imports a compiled library, in node -- see
   * `runLinked()`.
   * - Anything still relying on a global would throw a `ReferenceError`.
   */
  test("compiled projects link through ES imports, with no globals -- and run", async () => {
    const libId = `${root}:lib`
    const source = "set stack to a new pile\nprint card suits\nprint stack is a pile"
    const app = makeProject(
      "linked_app",
      ["main.spell"],
      { imports: [{ path: libId, active: true }] },
      {
        "main.spell": source
      }
    )
    await app.compile()
    const compiled = readFileSync(resolve(workspace, "linked_app", `linked_app${SP.COMPILED_JS_SUFFIX}`), "utf8")
    expect(compiled).toContain(`import { spellCore, Thing, List, App } from "@spell/core"`)
    expect(compiled).toMatch(/import \{ Card, Deck, Pile[^}]* \} from "@spell\/project\/@workspace:[^"]*:lib"/)

    const run = runLinked(app, [libId])
    expect(run.stderr).not.toMatch(/Error/)
    expect(run.status).toBe(0)
    // `card suits` came from the library's `Card`;  `is a pile` checked the library's `Pile`
    expect(run.stdout).toContain("clubs")
    expect(run.stdout).toContain("true")
  }, 60_000)

  test("`Card:Playingcard` imports `Card` renamed -- and runs, type checks included", async () => {
    const libId = `${root}:lib`
    const source = [
      "set top to a new playingcard",
      "print playingcard suits",
      "print top is a playingcard",
      "set stack to a new pile",
      "print stack is a playingcard"
    ].join("\n")
    const app = makeProject(
      "renamed_app",
      ["main.spell"],
      { imports: [{ path: libId, active: true, import: ["Card:Playingcard", "*"] }] },
      { "main.spell": source }
    )
    await app.compile()
    expect(errorsIn(app)).toEqual([])
    const compiled = readFileSync(resolve(workspace, "renamed_app", `renamed_app${SP.COMPILED_JS_SUFFIX}`), "utf8")
    expect(compiled).toMatch(/import \{ Card as Playingcard, Deck, Pile[^}]* \} from "@spell\/project\/[^"]*:lib"/)
    // its class is still `Card` when the code runs
    expect(compiled).toContain("spellCore.isOfType(top, 'Card')")

    const run = runLinked(app, [libId])
    expect(run.stderr).not.toMatch(/Error/)
    expect(run.status).toBe(0)
    // after the library's own tests' output:  `playingcard suits`, `top is a playingcard`, `stack is a playingcard`
    expect(run.stdout.trim().split("\n").slice(-3)).toEqual([
      "[ 'clubs', 'diamonds', 'hearts', 'spades' ]",
      "true",
      "false"
    ])
  }, 60_000)

  test("a `source: true` import can't rename -- its sources parse as they are", async () => {
    const imports = [{ path: `${root}:lib`, active: true, source: true, import: ["Card:Playingcard"] }]
    const app = makeProject("renamed_from_source", ["main.spell"], { imports }, { "main.spell": "print 1" })
    await expect(app.parse()).rejects.toThrow()
    expect(app.parseError).toMatch(/renaming \('Card:Playingcard'\) needs a compiled import/)
  })

  test("a root's alias names a project in it, e.g. `@library/<name>` in `@system:library`", () => {
    expect(SP.SpellProject.projectIdForImport("@library/cards")).toBe("@system:library:cards")
    expect(SP.SpellProject.projectIdForImport("@test/Solitaire")).toBe("@test:fixtures:Solitaire")
    expect(SP.SpellProject.projectIdForImport("@user:projects:mine")).toBe("@user:projects:mine")
  })
})
