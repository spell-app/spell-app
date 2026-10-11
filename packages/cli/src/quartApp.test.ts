import { spawn, spawnSync, type ChildProcess } from "child_process"
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs"
import { createServer } from "net"
import { tmpdir } from "os"
import { join, resolve } from "path"
import { chromium, type Browser, type Page } from "playwright"
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

/**
 * A Python spell app in a real browser (epic `python-target` P20):  Solitaire compiled to `py/asyncio`,
 * served by the app compiling writes, `Solitaire.app.py`, on Quart, played in headless Chromium.
 * - A temp copy of the fixture:  tests never write into `projects/test/`.
 * - Seeded (`$SPELL_SEED`), so its deal is the javascript run's, the core contract's snapshot.
 * - The page side, `packages/app/dist-page/`, is built first if it isn't there (`yarn build:page`).
 */
const PACKAGES = resolve(import.meta.dirname, "../..")
const SPELL = resolve(PACKAGES, "cli/bin/spell.mjs")
const SPELL_QUART = resolve(PACKAGES, "py/quart")

let folder: string
let server: ChildProcess
let browser: Browser
let url: string

beforeAll(async () => {
  if (!existsSync(resolve(PACKAGES, "app/dist-page/spell-page.js"))) {
    const built = spawnSync("yarn", ["build:page"], { cwd: resolve(PACKAGES, "app"), encoding: "utf8" })
    expect(built.status, built.stderr).toBe(0)
  }
  folder = mkdtempSync(join(tmpdir(), "spell-quart-"))
  cpSync(resolve(PACKAGES, "spell/projects/test/Solitaire"), join(folder, "Solitaire"), {
    recursive: true,
    filter: (file) => !file.includes(".snapshot.") && !file.endsWith(".snapshot.js")
  })
  compile()
  const port = await freePort()
  url = `http://127.0.0.1:${port}/`
  server = spawn("uv", ["run", "--quiet", "--project", SPELL_QUART, "python", appFile()], {
    env: { ...process.env, PORT: String(port), SPELL_SEED: "1" },
    stdio: "ignore"
  })
  await waitFor(url)
  browser = await chromium.launch()
}, 120_000)

afterAll(async () => {
  await browser?.close()
  server?.kill()
  rmSync(folder, { recursive: true, force: true })
})

describe("a Python spell app, in a real browser", () => {
  test("compiling to py/asyncio writes the program, its drawing half and its app", () => {
    const files = readdirSync(join(folder, "Solitaire"))
    expect(files).toEqual(
      expect.arrayContaining(["Solitaire.compiled.asyncio.py", "Solitaire.elements.js", "Solitaire.app.py"])
    )
  })

  test("the page draws the javascript run's board, and each click plays in Python", async () => {
    const page = await opened()
    const snapshot = readFileSync(resolve(import.meta.dirname, "__snapshots__/contract/Solitaire.out.txt"), "utf8")
    const board = snapshot.trimEnd().split("\n").at(-1)!
    // the javascript run's board, by its cards:  each as the browser draws it
    expect(await page.page.locator(".Card").count()).toBe(board.match(/class="Card /g)!.length)

    // the stock's top card:  turned over onto the discards
    const discards = await page.page.locator(".Pile.Discards").innerHTML()
    await page.page.locator(".Pile.Stock .Card").last().click()
    await expect.poll(() => page.page.locator(".Pile.Discards").innerHTML()).not.toBe(discards)

    // each patch a small part of the whole state
    const [state, ...patches] = page.sizes
    expect(patches.length).toBeGreaterThan(0)
    for (const size of patches) expect(size).toBeLessThan(state! / 4)
    process.stderr.write(`Solitaire's frames:  the state ${state} characters, then patches of ${patches.join(", ")}\n`)
    await page.page.context().close()
  }, 60_000)

  test("AutoPlay's pauses reach the page:  a patch at each, so it animates", async () => {
    const page = await opened()
    const before = page.sizes.length
    await page.page.getByText("AutoPlay").click()
    await page.page.waitForTimeout(3000)
    const frames = page.sizes.slice(before)
    process.stderr.write(`AutoPlay's frames:  ${frames.length}, of ${frames.join(", ")} characters\n`)
    expect(frames.length).toBeGreaterThan(1)
    await page.page.context().close()
  }, 60_000)

  test("each visitor plays their own game", async () => {
    const ann = await opened()
    const bob = await opened()
    const before = await bob.page.locator(".Pile.Discards").innerHTML()
    await ann.page.locator(".Pile.Stock .Card").last().click()
    await expect.poll(() => ann.page.locator(".Pile.Discards").innerHTML()).not.toBe(before)
    expect(await bob.page.locator(".Pile.Discards").innerHTML()).toBe(before)
    await ann.page.context().close()
    await bob.page.context().close()
  }, 60_000)

  test("compiling again leaves an edited app be, and rewrites an unedited one", () => {
    const app = appFile()
    const written = readFileSync(app, "utf8")
    writeFileSync(app, written.replace("# Your own routes go here", "# my routes"))
    compile()
    expect(readFileSync(app, "utf8")).toContain("# my routes")
    writeFileSync(app, written)
    compile()
    expect(readFileSync(app, "utf8")).toBe(written)
  }, 60_000)
})

/** A new visitor's page, open on the app:  its board drawn, and the size of each frame it's sent. */
async function opened(): Promise<{ page: Page; sizes: number[] }> {
  const page = await (await browser.newContext()).newPage()
  const sizes: number[] = []
  page.on("websocket", (socket) =>
    socket.on("framereceived", ({ payload }) => sizes.push(typeof payload === "string" ? payload.length : 0))
  )
  await page.goto(url)
  await page.locator(".Pile.Stock").waitFor({ timeout: 20_000 })
  return { page, sizes }
}

/** SIDE EFFECT:  compile the temp Solitaire to `py/asyncio`. */
function compile(): void {
  const compiled = spawnSync("node", [SPELL, "compile", join(folder, "Solitaire"), "--target", "py/asyncio"], {
    encoding: "utf8"
  })
  expect(compiled.status, compiled.stderr).toBe(0)
}

/** The temp Solitaire's app. */
function appFile(): string {
  return join(folder, "Solitaire", "Solitaire.app.py")
}

/** A port nothing's listening on. */
function freePort(): Promise<number> {
  return new Promise((done) => {
    const probe = createServer().listen(0, () => {
      const { port } = probe.address() as { port: number }
      probe.close(() => done(port))
    })
  })
}

/** Wait until `url` answers, up to 30 seconds. */
async function waitFor(url: string): Promise<void> {
  for (let tries = 0; tries < 60; tries++) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // not up yet
    }
    await new Promise((wait) => setTimeout(wait, 500))
  }
  throw new Error(`${url} never answered`)
}
