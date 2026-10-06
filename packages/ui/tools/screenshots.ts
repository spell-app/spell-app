/// <reference types="node" />

/**
 * `yarn screenshots [families]`:  one PNG per class-grammar / element pair of the demo page
 * (`tools/demo/index.html`), into `.cache/screenshots/`, for a quick look;  then the console errors / warnings seen.
 * - `families`:  comma separated, `ui-` optional, e.g. `yarn screenshots label,parts`;  default `DEFAULT_FAMILIES`.
 * - No baselines, no verdict:  regression tests are `yarn test:visual` (`tools/visual/`).
 */

import { mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { chromium, type Page } from "playwright"

import { DevServer } from "./DevServer.ts"
import { Terminal } from "./Terminal.ts"

/****************
 * ### `DemoScreenshots`
 * One run of `yarn screenshots`:  a dev server, headless chromium, the demo page once per family.
 ****************/
class DemoScreenshots {
  /** the dev server */
  private readonly server: DevServer
  /** the demo page */
  private readonly page: Page
  /** page errors, console errors and warnings, in order */
  private readonly problems: string[] = []

  constructor({ server, page }: { server: DevServer; page: Page }) {
    this.server = server
    this.page = page
    page.on("pageerror", (error) => this.problems.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        this.problems.push(`${message.type()}: ${message.text()}`)
      }
    })
  }

  /** Shoot every family in `families`;  print what it wrote and the problems seen (at most `MAX_PROBLEMS`). */
  async run(families: readonly string[]) {
    mkdirSync(OUT, { recursive: true })
    let count = 0
    for (const family of families) count += await this.shoot(family)
    Terminal.out(`${count} screenshot(s) in ${OUT}`)
    Terminal.out(JSON.stringify(this.problems.slice(0, MAX_PROBLEMS), null, 1))
  }

  /** Load the demo page on `family` alone and screenshot each pair;  returns how many. */
  private async shoot(family: string): Promise<number> {
    await this.page.goto(this.server.url(`/tools/demo/index.html?only=${encodeURIComponent(family)}`))
    await this.page.locator(".pair").first().waitFor({ timeout: PAGE_TIMEOUT })
    await this.settle()
    const pairs = this.page.locator(".pair")
    const count = await pairs.count()
    for (let index = 0; index < count; index++) {
      const pair = pairs.nth(index)
      // `ui-button/content.html -- class grammar` => `ui-button-content`
      const heading = (await pair.locator("h3").first().textContent()) ?? `${family}-${index}`
      const name = heading
        .split(" ")[0]!
        .replace(/\.html$/, "")
        .replace("/", "-")
      await pair.screenshot({ path: `${OUT}/${name}.png` })
    }
    return count
  }

  /** Wait until the page is still:  no requests in flight, every `ui-*` element `ready`, fonts in, two frames. */
  private async settle() {
    await this.page.waitForLoadState("networkidle")
    await this.page.evaluate(async () => {
      const ready = [...document.querySelectorAll<Element & { ready?: unknown }>("*")]
        .filter((element) => element.localName.startsWith("ui-"))
        .map((element) => element.ready)
        .filter((promise): promise is Promise<void> => promise instanceof Promise)
      await Promise.all(ready)
      await document.fonts.ready
      for (let frame = 0; frame < 2; frame++) await new Promise((resolve) => requestAnimationFrame(resolve))
    })
  }
}

/** The package root, with a trailing slash. */
const ROOT = fileURLToPath(new URL("../", import.meta.url))

/** Where the PNGs go (git-ignored). */
const OUT = `${ROOT}.cache/screenshots`

/** Families shot when none are named:  the first ones ported, a quick cross-section. */
const DEFAULT_FAMILIES = "button,dropdown,icon,label,divider,segment,container,parts"

/** Preferred dev server port (the next free one is taken if busy). */
const PORT = 5198

/** How long to wait for the demo page's first pair, ms:  the first load compiles every family. */
const PAGE_TIMEOUT = 30_000

/** Problems printed at most:  the first ones say what's wrong. */
const MAX_PROBLEMS = 30

const { positionals } = parseArgs({ allowPositionals: true, options: {} })
const families = (positionals[0] ?? DEFAULT_FAMILIES).split(",").map((family) => family.trim().replace(/^ui-/, ""))
const server = await DevServer.start({ port: PORT, logLevel: "error" })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
  await new DemoScreenshots({ server, page }).run(families.filter(Boolean))
} finally {
  await browser.close()
  await server.close()
}
