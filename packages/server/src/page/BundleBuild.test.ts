import type { ChildProcess } from "node:child_process"
import { EventEmitter } from "node:events"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { PassThrough } from "node:stream"
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vite-plus/test"

import { SRV } from "$/server"
import { BundleBuild, uiBuildPath } from "$/server/page"
import { ask } from "$/server/test/serve"

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

////////////////
// ## Tests
////////////////

describe("BundleBuild", () => {
  const root = mkdtempSync(join(tmpdir(), "srv-bundles-"))
  let web: SRV.WebServer | undefined
  let build: BundleBuild
  let child: FakeChild

  beforeAll(() => {
    put(root, "packages/cli/bin/spell.mjs", "")
    put(root, "packages/brand/_assets/ui/brand-ui.js", "export const OLD = 1")
    put(root, "guides/page.html", "<p>page</p>")
  })

  /** a page server's shape:  the wait before the static files, the `/ui/` overlay;  `timeout` ms per wait */
  async function serve(timeout?: number): Promise<number> {
    child = new FakeChild()
    build = new BundleBuild({ root, timeout, spawn: spawnOf(child) })
    web = new SRV.WebServer({ root, mounts: [{ prefix: "/", dir: root }] })
    web.files.overlays.push(uiBuildPath)
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
      [join(root, "packages/cli/bin/spell.mjs"), "dev", "bundles", "build", "--stale"],
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
    const waiting = ask(port, "GET", "/ui/_assets/site.js").then((answer) => ((answered = true), answer))
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
  const build = new BundleBuild({ root: "/repo" })

  test("this checkout's bundle folders, through the `/ui/` overlay;  nothing else", () => {
    expect(build.bundleFileFor("/ui/_assets/ui-button.js")).toBe("/repo/packages/ui/site/_assets/ui-button.js")
    expect(build.bundleFileFor("/packages/ui/site/_assets/site.css")).toBe("/repo/packages/ui/site/_assets/site.css")
    expect(build.bundleFileFor("/packages/brand/_assets/ui/a%20b.js")).toBe("/repo/packages/brand/_assets/ui/a b.js")
    expect(build.bundleFileFor("/ui/_data/components.json")).toBeUndefined()
    expect(build.bundleFileFor("/packages/brand/_assets/brand-pages.js")).toBeUndefined()
    expect(build.bundleFileFor("/worktrees/seo/ui/_assets/site.js")).toBeUndefined()
    expect(build.bundleFileFor("/packages/brand/_assets/ui/../../../x")).toBeUndefined()
    expect(build.bundleFileFor("/packages/brand/_assets/ui/%E0%A4%A")).toBeUndefined()
  })
})
