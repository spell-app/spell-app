import type { ChildProcess } from "node:child_process"
import { EventEmitter } from "node:events"
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { PassThrough } from "node:stream"
import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import { locationForDiskPath } from "$/spaces/server/node/projects/disk-fetch"
import { SP } from "spell-lang/spell"
import { ProjectBuild } from "$/spaces/server/node/routes/ProjectBuild"

////////////////
// ## Fakes
////////////////

/** A compile's child process:  output streams, `exit` when the test says. */
class FakeChild extends EventEmitter {
  stdout = new PassThrough()
  stderr = new PassThrough()
  pid = 4242
  kill = vi.fn()

  /** end the compile with `code` */
  exit(code = 0): void {
    this.emit("exit", code, null)
  }
}

/** A `spawn` stub handing out a new `FakeChild` each call, kept in `children`. */
function spawnStub() {
  const children: FakeChild[] = []
  const spawn = vi.fn(() => {
    const child = new FakeChild()
    children.push(child)
    return child as unknown as ChildProcess
  })
  return { spawn, children }
}

/** Write `text` at `path`, making folders. */
function put(path: string, text = ""): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

////////////////
// ## Tests
////////////////

describe("ProjectBuild", () => {
  // its REAL path:  on macOS `tmpdir()` is a symlink, and a project's location is worked out from real paths
  const root = realpathSync(mkdtempSync(join(tmpdir(), "app-project-build-")))
  const projectFolder = join(root, "projects", "Built")
  put(join(root, "cli/bin/spell.mjs"))
  put(join(projectFolder, SP.PROJECT_FILE), JSON.stringify({ imports: [{ path: "/Built.spell", active: true }] }))
  put(join(projectFolder, "Built.spell"), 'print "built"\n')
  // outside `packages/`:  its built files sit beside its source (`buildFolderFor()`)
  const projectId = locationForDiskPath(join(projectFolder, SP.PROJECT_FILE))!.projectId
  const compiled = SP.SpellLocation.getFileLocation(projectId, `Built${SP.COMPILED_JS_SUFFIX}`)

  beforeEach(() => vi.spyOn(console, "log").mockImplementation(() => {}))
  afterEach(() => {
    vi.restoreAllMocks()
    rmSync(compiled.serverPath, { force: true })
  })
  afterAll(() => rmSync(root, { recursive: true, force: true }))

  test("start():  the checkout's OWN CLI, `compile --stale --all @spell/examples @spell/library`, in a process group of its own", () => {
    const { spawn } = spawnStub()
    new ProjectBuild({ root, spawn }).start()
    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      [join(root, "cli/bin/spell.mjs"), "compile", "--stale", "--all", "@spell/examples", "@spell/library"],
      expect.objectContaining({ cwd: root, detached: true })
    )
  })

  test("a built file that's there:  at once, compiling nothing", async () => {
    const { spawn } = spawnStub()
    put(compiled.serverPath, "export {}\n")
    expect(await new ProjectBuild({ root, spawn }).untilBuilt(compiled)).toBe(true)
    expect(spawn).not.toHaveBeenCalled()
  })

  test("a missing one:  compiles its project ONCE for every request waiting on it, then it's there", async () => {
    const { spawn, children } = spawnStub()
    const build = new ProjectBuild({ root, spawn })
    const waiting = [build.untilBuilt(compiled), build.untilBuilt(compiled)]
    await vi.waitFor(() => expect(spawn).toHaveBeenCalledOnce())
    expect(spawn).toHaveBeenCalledWith(process.execPath, [build.cli, "compile", projectId], expect.anything())
    put(compiled.serverPath, "export {}\n")
    children[0]!.exit(0)
    expect(await Promise.all(waiting)).toEqual([true, true])
  })

  test("a project that isn't there:  no compile, not there", async () => {
    const { spawn } = spawnStub()
    const missing = SP.SpellLocation.getFileLocation(
      `${SP.SpellLocation.getProjectLocation(projectId).projectRoot}/nope`,
      "Nope.spell.js"
    )
    expect(await new ProjectBuild({ root, spawn }).untilBuilt(missing)).toBe(false)
    expect(spawn).not.toHaveBeenCalled()
  })

  test("while the startup build runs:  waits for it, instead of compiling the project again", async () => {
    const { spawn, children } = spawnStub()
    const build = new ProjectBuild({ root, spawn }).start()
    const waiting = build.untilBuilt(compiled)
    put(compiled.serverPath, "export {}\n")
    children[0]!.exit(0)
    expect(await waiting).toBe(true)
    expect(spawn).toHaveBeenCalledOnce()
  })

  test("a compile slower than `timeout`:  gives up, not there;  a request after waits on the same compile", async () => {
    const { spawn, children } = spawnStub()
    const build = new ProjectBuild({ root, spawn, timeout: 20 })
    expect(await build.untilBuilt(compiled)).toBe(false)
    expect(await build.untilBuilt(compiled)).toBe(false)
    expect(spawn).toHaveBeenCalledOnce()
    children[0]!.exit(0)
  })
})
