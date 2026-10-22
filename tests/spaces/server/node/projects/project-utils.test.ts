import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"

import environment from "spell-app/spaces/server/node/environment"
import { SP } from "spell-lang/spell"
import { locationForDiskPath } from "spell-app/spaces/server/node/projects/disk-fetch"
import * as projectUtils from "spell-app/spaces/server/node/projects/project-utils"

/**
 * Where a project's files are on disk (epic `people-and-orgs` P11).
 * - What spell BUILDS for it, e.g. `solitaire.spell.js`:  in its build folder, `build/` at the repo root.
 * - Everything else:  beside its source.
 * - A temporary "repo" stands in for the real one:
 *   - its `packages/` and `build/` replace `environment`'s, but for the built-in roots' test (`useTempRepo()`)
 *   - its projects are a `@local/<folder>` group inside that `packages/`
 */
let repo: string
let packagesDir: string
let buildDir: string
let workspace: string
let realFolders: { packagesDir: string; buildDir: string }

/** Built file names of project `Proj`:  each goes in its build folder. */
const BUILT = ["Proj.spell.js", "Proj.spell.tsx", "Proj.spell.py", "Proj.elements.spell.js", "Proj.scopes.js"]
/** Files of project `Proj` which stay beside its source, built or not. */
const BESIDE = [
  "Proj.declarations.json5",
  "Proj.en.js",
  "Proj.py.en.json5",
  "Proj.lib.ts",
  "Proj.app.py",
  "__project.json5",
  "Proj.spell",
  "Other.spell.js",
  "sub/Proj.spell.js"
]

beforeAll(() => {
  repo = mkdtempSync(resolve(tmpdir(), "spell-build-"))
  packagesDir = resolve(repo, "packages")
  buildDir = resolve(repo, "build")
  workspace = resolve(packagesDir, "build-test-projects")
  realFolders = { packagesDir: environment.packagesDir, buildDir: environment.buildDir }
})

afterAll(() => rmSync(repo, { recursive: true, force: true }))

describe("buildFolderFor()", () => {
  const folders = {
    packagesDir: "/repo/packages",
    buildDir: "/repo/build",
    repoDir: "/repo",
    spellSpacesDir: "/spell-spaces"
  }

  test("a project under `packages/`:  the same path under `build/`", () => {
    expect(projectUtils.buildFolderFor("/repo/packages/spaces/@spell/examples/Proj", folders)).toBe(
      "/repo/build/spaces/@spell/examples/Proj"
    )
  })

  test("a test project, under `tests/`:  the same path under `build/`", () => {
    expect(projectUtils.buildFolderFor("/repo/tests/spaces/@spell/test/Proj", folders)).toBe(
      "/repo/build/spaces/@spell/test/Proj"
    )
  })

  test("a frozen test project, in the `tests` space folder (spell-lang's):  under `build/spaces/`", () => {
    const withTests = { ...folders, testsDir: "/spell-lang/tests/spaces" }
    expect(projectUtils.buildFolderFor("/spell-lang/tests/spaces/@spell/test/Proj", withTests)).toBe(
      "/repo/build/spaces/@spell/test/Proj"
    )
  })

  test("a project in spell-spaces:  under `build/spell-spaces/`, in THIS checkout", () => {
    expect(projectUtils.buildFolderFor("/spell-spaces/@spell/owen@/errors", folders)).toBe(
      "/repo/build/spell-spaces/@spell/owen@/errors"
    )
  })

  test("a project anywhere else:  its own folder, beside its source", () => {
    expect(projectUtils.buildFolderFor("/tmp/ws/Proj", folders)).toBe("/tmp/ws/Proj")
    expect(projectUtils.buildFolderFor("/repo/packages-old/Proj", folders)).toBe("/repo/packages-old/Proj")
    expect(projectUtils.buildFolderFor("/repo/packages", folders)).toBe("/repo/packages")
  })
})

describe("SpellLocation.serverPath, in this repo", () => {
  test("a built-in project's built file is in `build/`, at its path in the repo", () => {
    expect(environment.buildDir).toBe(resolve(environment.repoDir, "build"))
    expect(new SP.SpellLocation("@spell/examples/drawable-solitaire/drawable-solitaire.spell.js").serverPath).toBe(
      resolve(environment.buildDir, "spaces/@spell/examples/drawable-solitaire/drawable-solitaire.spell.js")
    )
    expect(new SP.SpellLocation("@spell/examples/drawable-solitaire/drawable-solitaire.en.js").serverPath).toBe(
      resolve(environment.systemFilesRoot, "examples/drawable-solitaire/drawable-solitaire.en.js")
    )
  })
})

describe("SpellLocation.serverPath", () => {
  useTempRepo()

  test("ONLY `<Project>` + a built suffix, at the top of the project, goes in its build folder", () => {
    const projectId = project("Proj")
    for (const name of BUILT) {
      expect(SP.SpellLocation.getFileLocation(projectId, name).serverPath, name).toBe(
        resolve(buildDir, "build-test-projects/Proj", name)
      )
    }
    for (const name of BESIDE) {
      expect(SP.SpellLocation.getFileLocation(projectId, name).serverPath, name).toBe(resolve(workspace, "Proj", name))
    }
  })

  test("a project outside `packages/` keeps its built files beside its source", () => {
    const elsewhere = mkdtempSync(resolve(tmpdir(), "spell-ws-"))
    mkdirSync(resolve(elsewhere, "Out"))
    writeFileSync(resolve(elsewhere, "Out", SP.PROJECT_FILE), JSON.stringify({ imports: [] }))
    const location = locationForDiskPath(resolve(elsewhere, "Out", "Out.spell.js"))!
    expect(location.serverPath).toBe(resolve(elsewhere, "Out", "Out.spell.js"))
    expect(projectUtils.buildFolderInBuild(location.projectId)).toBeUndefined()
    rmSync(elsewhere, { recursive: true, force: true })
  })
})

describe("project-utils", () => {
  useTempRepo()
  test("saving a built file makes its build folder, and leaves the source folder be", async () => {
    const projectId = project("Saved")
    await projectUtils.saveFile(projectId, "Saved.spell.js", "export default 1\n")
    expect(readFileSync(resolve(buildDir, "build-test-projects/Saved/Saved.spell.js"), "utf8")).toBe(
      "export default 1\n"
    )
    expect(existsSync(resolve(workspace, "Saved/Saved.spell.js"))).toBe(false)
  })

  test("a project's index says where its build folder is, inside the build folder:  no ../ (J33)", async () => {
    const projectId = project("Indexed")
    expect((await projectUtils.getIndex(projectId)).buildFolder).toBe("build-test-projects/Indexed")
  })

  test("a property editor page is one of a project's files:  its index lists it (property-editor P6)", async () => {
    const projectId = project("Paged")
    await projectUtils.createFile(
      projectId,
      `Card${SP.EDITOR_PAGE_SUFFIX}`,
      "<ui-property-editor></ui-property-editor>\n"
    )
    const index = await projectUtils.getIndex(projectId)
    expect(index.imports.map((it) => it.path)).toEqual(["/Paged.spell", `/Card${SP.EDITOR_PAGE_SUFFIX}`])
  })

  // the bug of 2026-10-22:  a project copied to a folder of another name read its old words file as spell
  test("a words file is never one of a project's files, whatever its name:  an old name's is left out", async () => {
    const projectId = project("calc2")
    const folder = resolve(workspace, "calc2")
    const words = SP.SpellWords.script({ lang: "en", types: { Calculator: { clear: "clear (a calculator)" } } }, "x")
    writeFileSync(resolve(folder, "calc2.en.js"), words)
    writeFileSync(resolve(folder, "calculator.en.js"), words)
    writeFileSync(resolve(folder, "Calculator.es.js"), words)
    // a helper whose name looks like one, but isn't:  still listed
    writeFileSync(resolve(folder, "socket.io.js"), "export const io = 1\n")

    const index = await projectUtils.getIndex(projectId)
    expect(index.imports.map((it) => it.path)).toEqual(["/calc2.spell", "/socket.io.js"])
    expect(Object.keys(index.manifest).map((path) => path.split("/").pop())).toEqual(["calc2.spell", "socket.io.js"])
    expect((await projectUtils.loadProjectFile(projectId)).imports.map((it) => it.path)).toEqual([
      "/calc2.spell",
      "/socket.io.js"
    ])
  })

  // the suspected bug of 2026-10-13:  renaming or duplicating a project moved only its source folder
  test("renaming a project deletes what was built for the old name:  NOTHING of it is served for the new", async () => {
    const projectId = await built("Old")
    const newProjectId = projectId.replace(/Old$/, "New")
    // left by a project of that name deleted before `deleteApp()` deleted build folders
    await projectUtils.saveFile(newProjectId, "New.spell.js", "// not ours\n")
    expect(existsSync(resolve(workspace, "New"))).toBe(false)

    await projectUtils.renameApp(projectId, newProjectId)
    expect(filesIn("New")).toEqual(["Old.app.py", "Old.lib.ts", "Old.spell", "__project.json5"])
    expect(existsSync(resolve(buildDir, "build-test-projects/Old"))).toBe(false)
    expect(existsSync(resolve(buildDir, "build-test-projects/New"))).toBe(false)
  })

  test("duplicating a project copies its source, NOT what was built for it", async () => {
    const projectId = await built("Original")
    await projectUtils.duplicateApp(projectId, projectId.replace(/Original$/, "Copy"))
    expect(filesIn("Copy")).toEqual(["Original.app.py", "Original.lib.ts", "Original.spell", "__project.json5"])
    expect(filesIn("Original")).toEqual([...GENERATED("Original"), ...filesIn("Copy")].sort())
    expect(existsSync(resolve(buildDir, "build-test-projects/Original/Original.spell.js"))).toBe(true)
    expect(existsSync(resolve(buildDir, "build-test-projects/Copy"))).toBe(false)
  })

  test("an old project.json is read, and saved as __project.json5, its comments kept (P12, T1)", async () => {
    const projectId = project("Older")
    const folder = resolve(workspace, "Older")
    rmSync(resolve(folder, SP.PROJECT_FILE))
    writeFileSync(
      resolve(folder, "project.json"),
      '{\n  // mine\n  "imports": [{ "path": "/Older.spell", "active": true }],\n  "targets": ["py"]\n}\n'
    )
    expect((await projectUtils.getIndex(projectId)).targets).toEqual(["py"])
    await projectUtils.saveProjectFile(projectId, {
      ...(await projectUtils.loadProjectFile(projectId)),
      version: "1.0.0"
    })
    expect(existsSync(resolve(folder, "project.json"))).toBe(false)
    const saved = readFileSync(resolve(folder, SP.PROJECT_FILE), "utf8")
    expect(saved).toContain("// mine")
    expect(saved).toContain('"version": "1.0.0"')
  })

  test("a project's title:  in its file, its index and its group's list;  null takes it out (Q45)", async () => {
    const projectId = project("todos-form-based")
    await projectUtils.setProjectTitle(projectId, "Todos - Form Based")
    expect((await projectUtils.getIndex(projectId)).title).toBe("Todos - Form Based")
    expect(await projectUtils.getProjectList(projectId)).toContainEqual({
      path: projectId,
      title: "Todos - Form Based"
    })
    await projectUtils.setProjectTitle(projectId, undefined)
    expect((await projectUtils.loadProjectFile(projectId)).title).toBe("Todos - Form Based")
    await projectUtils.setProjectTitle(projectId, null)
    expect((await projectUtils.loadProjectFile(projectId)).title).toBeUndefined()
    expect(await projectUtils.getProjectList(projectId)).toContainEqual({ path: projectId })
  })

  test("deleting a project deletes its build folder too", async () => {
    const projectId = await built("Gone")
    await projectUtils.deleteApp(projectId)
    expect(existsSync(resolve(workspace, "Gone"))).toBe(false)
    expect(existsSync(resolve(buildDir, "build-test-projects/Gone"))).toBe(false)
  })
})

/** SIDE EFFECT:  the temp repo's `packages/` and `build/` replace `environment`'s, for the `describe()` it's in. */
function useTempRepo(): void {
  beforeAll(() => void Object.assign(environment, { packagesDir, buildDir }))
  afterAll(() => void Object.assign(environment, realFolders))
}

/** SIDE EFFECT:  make project `projectName` in the temp workspace, with one spell file;  returns its id. */
function project(projectName: string): string {
  const folder = resolve(workspace, projectName)
  mkdirSync(folder, { recursive: true })
  writeFileSync(
    resolve(folder, SP.PROJECT_FILE),
    JSON.stringify({ imports: [{ path: `/${projectName}.spell`, active: true }] })
  )
  writeFileSync(resolve(folder, `${projectName}.spell`), "set foo to 1\n")
  return locationForDiskPath(resolve(folder, `${projectName}.spell`))!.projectId
}

/** SIDE EFFECT:  `project()`, with a compiled file in its build folder;  returns its id. */
async function built(projectName: string): Promise<string> {
  const projectId = project(projectName)
  await projectUtils.saveFile(projectId, `${projectName}.spell.js`, "export default 1\n")
  expect(existsSync(resolve(buildDir, "build-test-projects", projectName, `${projectName}.spell.js`))).toBe(true)
  for (const name of [...GENERATED(projectName), `${projectName}.lib.ts`, `${projectName}.app.py`]) {
    writeFileSync(resolve(workspace, projectName, name), "// written by spell\n")
  }
  return projectId
}

/**
 * Files spell writes beside project `projectName`'s source, and writes again on each compile:
 * declarations, words, a target's words, and compiled output by its name before `build/`.
 */
function GENERATED(projectName: string): string[] {
  return [".compiled.js", ".declarations.json5", ".en.js", ".py.en.json5"].map((suffix) => `${projectName}${suffix}`)
}

/** Names of the files in the temp workspace's project `projectName`, sorted. */
function filesIn(projectName: string): string[] {
  return readdirSync(resolve(workspace, projectName)).sort()
}
