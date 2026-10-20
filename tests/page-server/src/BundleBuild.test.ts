import type { ChildProcess } from "node:child_process"
import { EventEmitter } from "node:events"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { PassThrough } from "node:stream"
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vite-plus/test"

import { SRV } from "@spell-app/server"
import { componentSetPath, componentSets } from "@spell-app/server/page"
import { ask } from "@spell-app/server/test/serve"
import { BundleBuild } from "$/page-server"

////////////////
// ## Fakes
////////////////

/** A build's child process:  output streams, `exit` when the test says. */
class FakeChild extends EventEmitter {
  stdout = new PassThrough()
  stderr = new PassThrough()
  pid = 4242
  kill = vi.fn()

  /** end the build with `code` */
  exit(code = 0): void {
    this.emit("exit", code, null)
  }
}

/** A `spawn` stub handing out `child`. */
function spawnOf(child: FakeChild) {
  return vi.fn(() => child as unknown as ChildProcess)
}

/** Write `text` at `path` under `root`, making folders. */
function put(root: string, path: string, text: string): void {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
}

/** The bundles' folders, as the repo root's `package.json` names them (`"pageServer": { "bundles": [...] }`). */
const BUNDLES = ["packages/ui/site/_assets", "packages/brand/_assets/ui"]

/** Two component sets, whose `_assets/` are Spell UI's bundle's folder, as the repo root's `package.json` names them. */
const SETS = {
  ui: { name: "Spell UI", dir: "packages/ui/docs", assets: "packages/ui/site/_assets" },
  epics: { name: "Epic UI", dir: "spell-epic/src/docs", assets: "packages/ui/site/_assets" }
}

/** A checkout's `package.json` naming `BUNDLES` and `SETS`. */
const SETTINGS = JSON.stringify({ pageServer: { bundles: BUNDLES, componentSets: SETS } })

////////////////
// ## Tests
////////////////

describe("BundleBuild", () => {
  const root = mkdtempSync(join(tmpdir(), "page-server-bundles-"))
  let web: SRV.WebServer | undefined
  let build: BundleBuild
  let child: FakeChild

  beforeAll(() => {
    put(root, "package.json", SETTINGS)
    put(root, "cli/bin/spell.mjs", "")
    put(root, "packages/brand/_assets/ui/brand-ui.js", "export const OLD = 1")
    put(root, "guides/page.html", "<p>page</p>")
  })

  /** a page server's shape:  the wait before the static files, the sets' overlay;  `timeout` ms per wait */
  async function serve(timeout?: number): Promise<number> {
    child = new FakeChild()
    build = new BundleBuild({ root, timeout, spawn: spawnOf(child) })
    web = new SRV.WebServer({ root, mounts: [{ prefix: "/", dir: root }] })
    web.files.overlays.push((path) => componentSetPath(path, componentSets({ componentSets: SETS })))
    web.router.use(build.wait)
    return (await web.listen({ port: 0 })).port
  }

  afterEach(async () => {
    vi.restoreAllMocks()
    await web?.close()
    web = undefined
  })

  afterAll(() => rmSync(root, { recursive: true, force: true }))

  test("runs the checkout's OWN CLI, `dev bundles build --stale`, in a process group of its own", () => {
    vi.spyOn(console, "log").mockImplementation(() => {})
    const spawn = spawnOf(new FakeChild())
    new BundleBuild({ root, spawn }).start()
    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      [join(root, "cli/bin/spell.mjs"), "dev", "bundles", "build", "--stale"],
      expect.objectContaining({ cwd: root, detached: true })
    )
  })

  test("builds nothing in a checkout without the CLI, and never waits there", async () => {
    const empty = mkdtempSync(join(tmpdir(), "srv-bundles-none-"))
    const spawn = spawnOf(new FakeChild())
    const none = new BundleBuild({ root: empty, spawn }).start()
    expect(spawn).not.toHaveBeenCalled()
    expect(none.isBuilding).toBe(false)
    expect(await none.untilBuilt()).toBe(true)
    rmSync(empty, { recursive: true, force: true })
  })

  test("a request for a MISSING bundle file waits for the build;  a file that's there, or any other, doesn't", async () => {
    const port = await serve()
    vi.spyOn(console, "log").mockImplementation(() => {})
    build.start()
    let answered = false
    const waiting = ask(port, "GET", "/components/ui/_assets/site.js").then((answer) => ((answered = true), answer))
    expect((await ask(port, "GET", "/packages/brand/_assets/ui/brand-ui.js")).text).toBe("export const OLD = 1")
    expect((await ask(port, "GET", "/guides/page.html")).status).toBe(200)
    expect(answered).toBe(false)
    put(root, "packages/ui/site/_assets/site.js", "export const NEW = 1")
    child.exit(0)
    expect(await waiting).toMatchObject({ status: 200, text: "export const NEW = 1" })
    expect(build.isBuilding).toBe(false)
  })

  test("a wait gives up after `timeout` ms:  the request is answered as it stands", async () => {
    const port = await serve(20)
    vi.spyOn(console, "log").mockImplementation(() => {})
    build.start()
    expect((await ask(port, "GET", "/packages/brand/_assets/ui/missing-chunk.js")).status).toBe(404)
    expect(build.isBuilding).toBe(true)
  })

  test("logs the build's output, each line prefixed;  and a failed build", async () => {
    await serve()
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    build.start()
    child.stdout.write("built brand in 1.5s\n")
    child.stderr.write("building ui-site ...\n")
    await vi.waitFor(() => expect(log).toHaveBeenCalledTimes(3))
    expect(log.mock.calls.map(([line]) => line)).toEqual([
      "bundles:  checking (spell dev bundles build --stale)",
      "bundles:  built brand in 1.5s",
      "bundles:  building ui-site ..."
    ])
    child.exit(1)
    expect(await build.untilBuilt()).toBe(true)
    expect(error).toHaveBeenCalledWith("bundles:  the build failed (exit 1);  see above")
  })

  test("stop() ends the build's whole process group", async () => {
    await serve()
    vi.spyOn(console, "log").mockImplementation(() => {})
    const kill = vi.spyOn(process, "kill").mockImplementation(() => true)
    build.start().stop()
    expect(kill).toHaveBeenCalledWith(-4242, "SIGTERM")
  })
})

describe("BundleBuild.bundleFileFor()", () => {
  const repo = mkdtempSync(join(tmpdir(), "page-server-bundles-files-"))
  put(repo, "package.json", SETTINGS)
  const build = new BundleBuild({ root: repo })

  afterAll(() => rmSync(repo, { recursive: true, force: true }))

  test("this checkout's bundle folders, through the sets' overlay;  nothing else", () => {
    expect(build.folders).toEqual(BUNDLES)
    expect(build.bundleFileFor("/components/ui/_assets/ui-button.js")).toBe(
      join(repo, "packages/ui/site/_assets/ui-button.js")
    )
    expect(build.bundleFileFor("/packages/ui/site/_assets/site.css")).toBe(
      join(repo, "packages/ui/site/_assets/site.css")
    )
    expect(build.bundleFileFor("/packages/brand/_assets/ui/a%20b.js")).toBe(
      join(repo, "packages/brand/_assets/ui/a b.js")
    )
    expect(build.bundleFileFor("/components/ui/__data/components.json5")).toBeUndefined()
    expect(build.bundleFileFor("/components/epics/_assets/site.js")).toBe(
      join(repo, "packages/ui/site/_assets/site.js")
    )
    expect(build.bundleFileFor("/packages/brand/_assets/brand-pages.js")).toBeUndefined()
    expect(build.bundleFileFor("/worktrees/seo/components/ui/_assets/site.js")).toBeUndefined()
    expect(build.bundleFileFor("/packages/brand/_assets/ui/../../../x")).toBeUndefined()
    expect(build.bundleFileFor("/packages/brand/_assets/ui/%E0%A4%A")).toBeUndefined()
  })

  // epic `repo-split` P8:  spell-app names Spell UI's and the brand's bundles in their repos, beside it
  test("a bundle folder beside the checkout, at /_beside/ (folderUrl()), and through the sets' overlay", () => {
    const beside = mkdtempSync(join(tmpdir(), "page-server-bundles-beside-"))
    const app = join(beside, "spell-app")
    const sets = { ui: { name: "Spell UI", dir: "../spell-ui/docs", assets: "../spell-ui/site/_assets" } }
    put(
      app,
      "package.json",
      JSON.stringify({ pageServer: { bundles: ["../spell-ui/site/_assets"], componentSets: sets } })
    )
    const there = new BundleBuild({ root: app })
    expect(there.bundleFileFor("/_beside/spell-ui/site/_assets/site.js")).toBe(
      join(beside, "spell-ui/site/_assets/site.js")
    )
    expect(there.bundleFileFor("/components/ui/_assets/site.js")).toBe(join(beside, "spell-ui/site/_assets/site.js"))
    expect(there.bundleFileFor("/_beside/spell-ui/docs/ui-button.html")).toBeUndefined()
    rmSync(beside, { recursive: true, force: true })
  })

  test("a checkout whose settings name no bundles has none", () => {
    const bare = new BundleBuild({ root: join(repo, "nowhere") })
    expect(bare.folders).toEqual([])
    expect(bare.bundleFileFor("/packages/ui/site/_assets/site.css")).toBeUndefined()
  })
})
