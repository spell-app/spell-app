/// <reference types="node" />

/**
 * Screenshots every class-grammar / element pair of the demo page (`tools/demo/index.html`), one PNG per example,
 * into `.cache/screenshots/`, for visual comparison.  Prints console errors / warnings seen.
 * - Run:  `yarn screenshots [components]`, e.g. `yarn screenshots label,parts`.
 */

import { chromium } from "playwright"
import { createServer } from "vite"
import { mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const OUT = `${ROOT}/.cache/screenshots`
mkdirSync(OUT, { recursive: true })
const server = await createServer({
  root: ROOT,
  configFile: `${ROOT}/vite.config.ts`,
  server: { port: 5198 },
  logLevel: "error"
})
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
const errors: string[] = []
page.on("pageerror", (e) => errors.push(e.message))
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(`${m.type()}: ${m.text()}`))
for (const only of (process.argv[2] ?? "button,dropdown,icon,label,divider,segment,container,parts").split(",")) {
  await page.goto(`http://localhost:5198/tools/demo/index.html?only=${only}`)
  await page.locator(".pair").first().waitFor({ timeout: 30000 })
  await page.waitForTimeout(2000)
  const pairs = await page.locator(".pair").count()
  for (let i = 0; i < pairs; i++) {
    const pair = page.locator(".pair").nth(i)
    const name = (await pair.locator("h3").first().textContent())!.split(" ")[0]!.replace("/", "-")
    await pair.screenshot({ path: `${OUT}/${name}.png` })
  }
}
console.log(JSON.stringify(errors.slice(0, 30), null, 1))
await browser.close()
await server.close()
