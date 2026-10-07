// Scratch smoke check (not shipped):  load a page in Chromium, report whether the epics pack defined its tags.
import { chromium } from "playwright"

const url = process.argv[2]
const browser = await chromium.launch()
const page = await browser.newPage()
const logs = []
page.on("console", (m) => logs.push(`${m.type()}: ${m.text()}`))
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`))
await page.goto(url)
await page.waitForTimeout(3000)
const out = await page.evaluate(() => ({
  defined: !!customElements.get("epic-page"),
  shadow: document.querySelector("epic-page")?.shadowRoot?.innerHTML?.slice(0, 200) ?? null,
  ready: document.querySelector("ui-root")?.matches(":state(ready)"),
  packs: Object.keys(window.SpellUI ?? {}).filter((k) => /pack/i.test(k)),
}))
console.log(JSON.stringify(out, null, 2))
console.log(logs.join("\n"))
await browser.close()
