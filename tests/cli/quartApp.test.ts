import { spawn, spawnSync, type ChildProcess } from "child_process"
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs"
import { createRequire } from "module"
import { tmpdir } from "os"
import { dirname, join, resolve } from "path"
import { chromium, type Browser, type BrowserContext, type Page } from "playwright"
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

import { SRV } from "spell-kit/server"

/**
 * A Python spell app in a real browser (epic `python-target` P20):
 * Solitaire compiled to `py`, served on Quart as `spell run --target py` serves it, and played in headless Chromium.
 * - Its cards and its piles are drawable:  each its own element, `<solitaire-card>` inside
 *   `<solitaire-tableau>` ... (epic `python-target` P28;  epic `spanish` P11, P21).
 * - A project it imports goes beside it, as `counter.py` and its drawing half:
 *   `spell run` writes them in its temp folder, `spell compile` beside the compiled program (J97),
 *   so the app compiling writes runs as it is.
 *   - Solitaire imports nothing since epic `spanish` P21:  `counter-app`, which imports the frozen counter library,
 *     checks it.
 * - Temp copies:  tests never write into `spaces/@spell/`.
 * - Seeded (`$SPELL_SEED`), so its deal is the javascript run's, the core contract's snapshot.
 * - The page side, `app/dist-page/`, is built first (`yarn build:page`, a few seconds):  never a stale one.
 */
const REPO = resolve(import.meta.dirname, "../..")
/** The kit's `spell`, by package:  `spell-kit`'s `bin/spell.mjs` (spell-app's own until epic `repo-split` P13). */
const SPELL = resolve(dirname(createRequire(import.meta.url).resolve("spell-kit/package.json")), "bin/spell.mjs")
/** The Solitaire example, which this plays. */
const SOLITAIRE = resolve(REPO, "spaces/@spell/examples/Solitaire")
/** A frozen test project that imports another:  the counter library, `@spell/test/counter`. */
const IMPORTER = resolve(REPO, "spaces/@spell/test/counter-app")
/** `spell_quart`'s uv project, which serves a Python app:  Python's web server, in spaces. */
const SPELL_QUART_DIR = resolve(REPO, "src/spaces/server/py")
/** A card's element, Solitaire's own. */
const CARD = "solitaire-card"
/** The cards on the stock, and on the discards. */
const STOCK = `solitaire-stock-pile ${CARD}`
const DISCARDS = `solitaire-discard-pile ${CARD}`

let folder: string
let server: ChildProcess
let browser: Browser
let url: string

beforeAll(async () => {
  const built = spawnSync("yarn", ["build:page"], { cwd: resolve(REPO, "app"), encoding: "utf8" })
  expect(built.status, built.stderr).toBe(0)
  folder = mkdtempSync(join(tmpdir(), "spell-quart-"))
  cpSync(SOLITAIRE, join(folder, "Solitaire"), { recursive: true })
  cpSync(IMPORTER, join(folder, "counter-app"), {
    recursive: true,
    filter: (file) => !file.includes(".snapshot.")
  })
  compile()
  server = spawn(process.execPath, [SPELL, "run", join(folder, "Solitaire"), "--target", "py", "--seed", "1"], {
    env: { ...process.env, SPELL_NO_BROWSER: "1" },
    stdio: ["ignore", "pipe", "ignore"]
  })
  let out = ""
  server.stdout!.on("data", (data) => (out += data))
  const served = /http:\/\/127\.0\.0\.1:\d+\//
  for (let tries = 0; !served.test(out) && tries < 180; tries++) await new Promise((wait) => setTimeout(wait, 500))
  url = served.exec(out)![0]
  await waitFor(url)
  browser = await chromium.launch()
}, 120_000)

afterAll(async () => {
  await browser?.close()
  server?.kill()
  rmSync(folder, { recursive: true, force: true })
})

describe("a Python spell app, in a real browser", () => {
  test("compiling to py writes the program, its drawing half and its app", () => {
    const files = readdirSync(join(folder, "Solitaire"))
    expect(files).toEqual(
      expect.arrayContaining(["Solitaire.spell.py", "Solitaire.elements.spell.js", "Solitaire.app.py"])
    )
    expect(readFileSync(join(folder, "Solitaire", "Solitaire.spell.py"), "utf8")).toMatch(/^class Card\(/m)
  })

  test("compiling a project that imports another writes that one's beside it too (J97)", () => {
    const compiled = spawnSync("node", [SPELL, "compile", join(folder, "counter-app"), "--target", "py"], {
      encoding: "utf8"
    })
    expect(compiled.status, compiled.stderr).toBe(0)
    const files = readdirSync(join(folder, "counter-app"))
    // the library's Python, and its drawing half:  the counter draws
    expect(files).toEqual(expect.arrayContaining(["counter-app.spell.py", "counter.py", "counter.elements.spell.js"]))
    expect(readFileSync(join(folder, "counter-app", "counter.py"), "utf8")).toMatch(/^class Counter\(/m)
  }, 60_000)

  test("the app compiling wrote runs as it is:  `uv run python Solitaire.app.py`", async () => {
    const port = await SRV.freePort()
    const app = spawn("uv", ["run", "--quiet", "--project", SPELL_QUART_DIR, "python", appFile()], {
      env: { ...process.env, PORT: String(port), SPELL_SEED: "1" },
      stdio: "ignore"
    })
    try {
      const served = `http://${SRV.LOCALHOST}:${port}/`
      await waitFor(served)
      const page = await (await browser.newContext()).newPage()
      await page.goto(served)
      await expect.poll(() => page.locator(CARD).count(), { timeout: 20_000 }).toBe(52)
      await page.context().close()
    } finally {
      app.kill()
    }
  }, 120_000)

  test("the page draws its own elements, a card each, and each click plays in Python", async () => {
    const page = await opened()
    // each card its own element, named by its card (drawable-thing's J43), the piles too (epic `python-target` P28)
    await expect.poll(() => page.page.locator(CARD).count(), { timeout: 20_000 }).toBe(52)
    expect(await page.page.locator("solitaire-tableau").count()).toBe(7)
    expect(await page.page.locator(CARD).first().getAttribute("id")).toMatch(/^[a-z0-9]+-of-[a-z]+$/)

    // the stock's top card:  turned over onto the discards
    const discards = await page.page.locator(DISCARDS).count()
    await page.page.locator(STOCK).last().click()
    await expect.poll(() => page.page.locator(DISCARDS).count()).toBe(discards + 1)

    // what came back:  only what the click changed, in two patches, as the program paused between
    const [state, ...patches] = page.received as [unknown, ...Array<Array<Record<string, any>>>]
    // at the pause:  the card, turned up
    const turned = patches[0]![0]!
    expect(patches[0]).toEqual([expect.objectContaining({ $type: "Card", direction: "up" })])
    const cardId = turned["$id"] as string
    // what the page sent:  the click, naming the card by reference, its name (epic `python-target` P27):
    // the card's `its "name" is its rank + " of " + its suit`
    const reference = `Card#${turned.rank} of ${turned.suit}`
    expect(page.sent).toEqual([{ trigger: "card-click", target: reference, details: {} }])
    // then its move:  the pile it joined, and the pile it left
    expect(patches[1]!.map((thing) => thing["$type"])).toEqual(["DiscardPile", "StockPile"])
    const [joined] = patches[1]!
    expect(joined!["$items"].at(-1)).toEqual({ $id: cardId })

    // the console shows each frame, both ways, its badge first:  the state, the click up, the two patches down
    const frames = page.logged.filter((line) => /^%c(SENDING  >|RECEIVED <)%c/.test(line))
    expect(frames[0]).toMatch(/^%cRECEIVED <%c {2}state: {2}solitaire/)
    expect(frames).toContainEqual(expect.stringMatching(`^%cSENDING  >%c  event card-click \\(${reference}\\)`))
    expect(frames).toContainEqual(expect.stringMatching(`^%cRECEIVED <%c  patch:  DiscardPile #\\d+, StockPile #`))

    // each patch a small part of the whole state
    const size = (frame: unknown) => JSON.stringify(frame).length
    for (const each of patches) expect(size(each)).toBeLessThan(size(state) / 4)
    process.stderr.write(
      `Solitaire's frames:  the state ${size(state)} characters, then patches of ${patches.map(size).join(", ")}\n`
    )
    await page.page.context().close()
  }, 60_000)

  test("the page loads cleanly:  a loading card first, its icon, nothing red in its console, files checked before reuse", async () => {
    const page = await opened()
    await page.page.waitForLoadState("networkidle")
    expect(page.errors).toEqual([])
    // the page side's files keep their names when built again:  a browser must ask before reusing one
    const asset = await fetch(new URL("spell/spell-page.js", url))
    expect(asset.headers.get("cache-control")).toContain("no-cache")
    expect((await fetch(new URL("spell/favicon/favicon.svg", url))).status).toBe(200)
    // "Loading Solitaire":  in the page ahead of every script, so it shows at once;  gone once the board is drawn
    const html = await (await fetch(url)).text()
    expect(html.indexOf('id="spell-loading"')).toBeGreaterThan(0)
    expect(html.indexOf('id="spell-loading"')).toBeLessThan(html.indexOf('<script type="module"'))
    expect(html).toContain("<h1>Loading Solitaire</h1>")
    await expect.poll(() => page.page.locator("#spell-loading").count(), { timeout: 5000 }).toBe(0)
    await page.page.context().close()
  }, 60_000)

  test("a message the program can't run comes back as an error:  < ERROR  > in the console", async () => {
    const page = await opened()
    // what a stand-in in the drawing half would send, for a function the program doesn't have
    // (a string:  vitest would rewrite a function's `import()`)
    await page.page.evaluate(`import("@spell/core").then((core) => core.sendCall("no_such_function", []))`)
    await expect
      .poll(() => page.logged.find((line) => line.startsWith("%c< ERROR  >%c")), { timeout: 5000 })
      .toMatch(/the program couldn't run a message: {2}ValueError: The program has no function 'no_such_function'/)
    // and the page goes on:  a click still plays
    const discards = await page.page.locator(DISCARDS).count()
    await page.page.locator(STOCK).last().click()
    await expect.poll(() => page.page.locator(DISCARDS).count(), { timeout: 5000 }).toBe(discards + 1)
    await page.page.context().close()
  }, 60_000)

  test("AutoPlay's pauses reach the page:  a patch at each, so it animates", async () => {
    const page = await opened()
    const before = page.received.length
    await page.page.getByText("AutoPlay").click()
    await page.page.waitForTimeout(3000)
    const frames = page.received.slice(before).map((frame) => JSON.stringify(frame).length)
    process.stderr.write(`AutoPlay's frames:  ${frames.length}, of ${frames.join(", ")} characters\n`)
    expect(frames.length).toBeGreaterThan(1)
    await page.page.context().close()
  }, 60_000)

  test("each visitor plays their own game", async () => {
    const ann = await opened()
    const bob = await opened()
    const before = await bob.page.locator(DISCARDS).count()
    await ann.page.locator(STOCK).last().click()
    await expect.poll(() => ann.page.locator(DISCARDS).count(), { timeout: 5000 }).toBe(before + 1)
    expect(await bob.page.locator(DISCARDS).count()).toBe(before)
    await ann.page.context().close()
    await bob.page.context().close()
  }, 60_000)

  test("a visitor's tabs share one game, each following the other's clicks, both ways", async () => {
    const first = await opened()
    const second = await opened(first.page.context())
    for (const [round, [clicked, other]] of [
      [first, second],
      [second, first]
    ].entries()) {
      // the last click done in both tabs:  the state, then two patches a click (the card turned up at its pause,
      // then its move, sent at the move's own 50 msec pause)
      for (const tab of [clicked, other]) {
        await expect.poll(() => tab!.received.length, { timeout: 5000 }).toBe(1 + 2 * round)
      }
      // and past that last pause:  Solitaire plays from the stock one card at a time, ignoring a click meanwhile
      await clicked!.page.waitForTimeout(250)
      const discards = await clicked!.page.locator(DISCARDS).count()
      expect(await other!.page.locator(DISCARDS).count()).toBe(discards)
      await clicked!.page.locator(STOCK).last().click()
      // the click shows in both tabs, and both draw the same discards
      await expect.poll(() => clicked!.page.locator(DISCARDS).count(), { timeout: 5000 }).toBe(discards + 1)
      await expect.poll(() => other!.page.locator(DISCARDS).count(), { timeout: 5000 }).toBe(discards + 1)
      await expect
        .poll(() => other!.page.locator(DISCARDS).last().getAttribute("id"), { timeout: 5000 })
        .toBe(await clicked!.page.locator(DISCARDS).last().getAttribute("id"))
    }
    await first.page.context().close()
  }, 60_000)

  test("spell run --target py:  serves the app, until Ctrl-C, writing nothing into the project", async () => {
    const child = spawn(process.execPath, [SPELL, "run", join(folder, "Solitaire"), "--target", "py", "--seed", "1"], {
      env: { ...process.env, SPELL_NO_BROWSER: "1" },
      stdio: ["ignore", "pipe", "pipe"]
    })
    let out = ""
    child.stdout!.on("data", (data) => (out += data))
    await expect
      .poll(() => /http:\/\/127\.0\.0\.1:\d+\//.exec(out)?.[0], { timeout: 60_000, interval: 500 })
      .toBeTruthy()
    const served = /http:\/\/127\.0\.0\.1:\d+\//.exec(out)![0]
    const page = await (await browser.newContext()).newPage()
    await page.goto(served)
    await page.locator("solitaire-stock-pile").waitFor({ timeout: 20_000 })
    await page.context().close()
    child.kill("SIGINT")
    expect(await new Promise((done) => child.on("exit", done))).toBe(0)
    // the app came from a temp folder:  the project has only what compiling wrote before
    expect(
      readdirSync(join(folder, "Solitaire"))
        .filter((file) => file.endsWith(".py"))
        .sort()
    ).toEqual(["Solitaire.app.py", "Solitaire.spell.py"])
  }, 120_000)

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

/**
 * A new visitor's page, open on the app -- or, given `context`, another tab of that browser's:
 * its board drawn, with each message it sent and each frame it received, read as JSON.
 * - Received:  the whole state first, then a patch, a list of the things that changed (epic `python-target` P30).
 * - Logged:  each line the page wrote to its console, e.g. each frame, both ways (`logFrame()`).
 * - Errors:  each console error, a failed load (`404`) among them, and each error the page didn't catch.
 */
async function opened(
  context?: BrowserContext
): Promise<{ page: Page; sent: unknown[]; received: unknown[]; logged: string[]; errors: string[] }> {
  const page = await (context ?? (await browser.newContext())).newPage()
  const sent: unknown[] = []
  const received: unknown[] = []
  const logged: string[] = []
  const errors: string[] = []
  page.on("console", (message) => {
    logged.push(message.text())
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(String(error)))
  const read = (payload: string | Buffer) => JSON.parse(String(payload)) as unknown
  page.on("websocket", (socket) => {
    socket.on("framesent", ({ payload }) => sent.push(read(payload)))
    socket.on("framereceived", ({ payload }) => received.push(read(payload)))
  })
  await page.goto(url)
  await page.locator("solitaire-stock-pile").waitFor({ timeout: 20_000 })
  return { page, sent, received, logged, errors }
}

/** SIDE EFFECT:  compile the temp Solitaire to `py`. */
function compile(): void {
  const compiled = spawnSync("node", [SPELL, "compile", join(folder, "Solitaire"), "--target", "py"], {
    encoding: "utf8"
  })
  expect(compiled.status, compiled.stderr).toBe(0)
}

/** The temp Solitaire's app. */
function appFile(): string {
  return join(folder, "Solitaire", "Solitaire.app.py")
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
