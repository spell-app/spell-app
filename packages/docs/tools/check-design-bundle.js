/**
 * Check the DESIGN bundle (`bundle-spell-ui.js --design`) the two ways Claude Design runs it (epic `claude-design`,
 * P8;  the P1 repro, kept).
 *
 *   node tools/check-design-bundle.js [bundle.js] [outDir]     (yarn design:check)
 *
 * - `bundle.js`:  default `../ui/build/design-system/project/components/bundle.js`,
 *   where `yarn design:bundle` writes it
 * - 1. a design system's preview card:  the bundle INLINED into an `about:srcdoc` iframe (what the system's cards
 *   do).  Fails unless:
 *   - no page errors (so `<ui-emoji>`, whose names don't load there, throws nothing)
 *   - `window.SpellUI` and `ui-button` defined
 *   - icons OUTSIDE the docs' ~90 (`ICONS`) draw an `<svg>`:  a solid, a regular (`… outline`), a brand, an FA alias
 *   - `<ui-code>` gets highlight.js tokens for `ts`, and for `spell` (spell's own highlighter)
 *   - `<ui-markdown>` renders a heading
 * - 2. a Design artboard:  a board (`BOARD`) under Claude Design's own runtime (`vendor/claude-design/dc-runtime.js`,
 *   React plus `dc-runtime`, copied from a Design on claude.ai, 2026-10-05), loading the bundle with
 *   `<script src>`, over http.  Fails unless a click on `<ui-button onClick="{{bump}}">` counts.
 * - Writes a screenshot of each (`card.png`, `board.png`) to `outDir` (default a temp folder);  prints a JSON
 *   summary on stdout, problems on stderr;  exits 1 on any.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs"
import { createServer } from "node:http"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium } from "playwright"

/** `packages/docs/tools`. */
const TOOLS = dirname(fileURLToPath(import.meta.url))
/** Claude Design's artboard runtime, as a Design loads it (`support.js` there). */
const DC_RUNTIME = join(TOOLS, "vendor/claude-design/dc-runtime.js")

/** A preview card's markup:  what each check below looks for, in one page. */
const CARD = `
<ui-button primary icon="check">Save</ui-button>
<ui-icon id="solid" name="dragon"></ui-icon>
<ui-icon id="outline" name="calendar days outline"></ui-icon>
<ui-icon id="brand" name="github"></ui-icon>
<ui-icon id="fa-alias" name="cog"></ui-icon>
<ui-code id="ts" language="ts"><script type="text/plain">const answer: number = 42 // a comment</script></ui-code>
<ui-code id="spell" language="spell"><script type="text/plain">## Piles
a pile is a list of cards</script></ui-code>
<ui-markdown><script type="text/markdown"># Hello

Some *markdown*.</script></ui-markdown>
<ui-emoji name="smile"></ui-emoji>`

/**
 * A Design artboard, as `Control.dc.html` in the P1 spike:  `<x-dc>` template holes, a `DCLogic` component, React
 * driving `onClick` on our element.
 */
const BOARD = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Click test</title>
<script src="./support.js"></script>
<script src="./bundle.js"></script>
</head>
<body>
<x-dc>
<div style="padding: 32px; display: flex; gap: 16px; align-items: center">
<span id="loaded">bundle loaded:  {{loaded}}</span>
<ui-button primary="" icon="rocket" onClick="{{bump}}">Clicked {{count}}</ui-button>
<ui-label>{{count}} clicks</ui-label>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":640,"height":200}}'>
class Component extends DCLogic {
  renderVals() {
    const count = (this.state || {}).count || 0;
    return { count: count, loaded: String(typeof window.SpellUI), bump: () => this.setState({ count: count + 1 }) };
  }
}
</script>
</body>
</html>`

const [bundleArg, outArg] = process.argv.slice(2)
const bundlePath = resolve(bundleArg || join(TOOLS, "../../ui/build/design-system/project/components/bundle.js"))
if (!existsSync(bundlePath)) {
  console.error(`!! no bundle at ${bundlePath}:  run \`yarn design:bundle\` first`)
  process.exit(2)
}
const out = outArg ?? mkdtempSync(join(tmpdir(), "check-design-"))
mkdirSync(out, { recursive: true })
const bundle = readFileSync(bundlePath, "utf8")
const problems = []
const browser = await chromium.launch()
const card = await checkCard()
const board = await checkBoard()
await browser.close()

console.log(JSON.stringify({ bundle: bundlePath, screenshots: out, card, board }, null, 2))
for (const text of problems) console.error(`!! ${text}`)
process.exit(problems.length ? 1 : 0)

////////////////
// ## Checks
////////////////

/** Check 1:  the bundle inlined into an `about:srcdoc` frame, as a design system's preview card runs it. */
async function checkCard() {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
  const errors = watchErrors(page)
  const html = `<!doctype html><html><head><meta charset="utf-8"><script>${bundle}</script></head><body class="ui-typography">${CARD}</body></html>`
  await page.setContent(`<iframe id="card" style="width: 780px; height: 580px; border: 0"></iframe>`)
  await page.$eval("#card", (frame, srcdoc) => (frame.srcdoc = srcdoc), html)
  await page.waitForFunction(() => document.querySelector("iframe")?.contentDocument?.readyState === "complete")
  const frame = page.frames()[1]
  // icons, code colours and markdown each draw a little after the bundle runs:  poll until all have, or 8s
  let state = await frame.evaluate(inspectCard)
  for (let waited = 0; waited < 8000 && !state.ready; waited += 200) {
    await page.waitForTimeout(200)
    state = await frame.evaluate(inspectCard)
  }
  await page.screenshot({ path: join(out, "card.png") })
  await page.close()
  if (errors.length) problems.push(`card:  page errors:\n   ${errors.join("\n   ")}`)
  if (state.spellUI !== "object") problems.push(`card:  window.SpellUI is ${state.spellUI}`)
  if (!state.buttonDefined) problems.push("card:  ui-button isn't defined")
  for (const [id, drawn] of Object.entries(state.icons)) if (!drawn) problems.push(`card:  icon #${id} drew no <svg>`)
  for (const [language, count] of Object.entries(state.codeTokens)) {
    if (!count) problems.push(`card:  <ui-code language="${language}"> has no highlight tokens`)
  }
  if (!state.markdownHeading) problems.push("card:  <ui-markdown> rendered no heading")
  return { ...state, errors }
}

/** Check 2:  the bundle under Claude Design's own runtime, in a board whose `<ui-button onClick>` counts clicks. */
async function checkBoard() {
  const files = { "/board.html": BOARD, "/support.js": readFileSync(DC_RUNTIME, "utf8"), "/bundle.js": bundle }
  const server = createServer((request, response) => {
    const body = files[new URL(request.url ?? "/", "http://x").pathname]
    if (body === undefined) return response.writeHead(404).end()
    const type = request.url?.endsWith(".js") ? "text/javascript" : "text/html"
    response.writeHead(200, { "content-type": `${type}; charset=utf-8` }).end(body)
  })
  await new Promise((done) => server.listen(0, "127.0.0.1", () => done(undefined)))
  const address = server.address()
  const port = typeof address === "object" && address ? address.port : 0
  const page = await browser.newPage({ viewport: { width: 700, height: 260 } })
  const errors = watchErrors(page)
  await page.goto(`http://127.0.0.1:${port}/board.html`)
  const button = page.locator("ui-button", { hasText: "Clicked" })
  await button.waitFor({ timeout: 8000 }).catch(() => undefined)
  const before = await button.textContent({ timeout: 1000 }).catch(() => null)
  await button.click({ timeout: 3000 }).catch((error) => errors.push(`click:  ${error.message.split("\n")[0]}`))
  await page.waitForTimeout(300)
  const after = await button.textContent({ timeout: 1000 }).catch(() => null)
  const loaded = await page
    .locator("#loaded")
    .textContent({ timeout: 1000 })
    .catch(() => null)
  await page.screenshot({ path: join(out, "board.png") })
  await page.close()
  server.close()
  if (errors.length) problems.push(`board:  page errors:\n   ${errors.join("\n   ")}`)
  if (!loaded?.includes("object")) problems.push(`board:  the bundle didn't load (${loaded})`)
  if (before?.trim() !== "Clicked 0" || after?.trim() !== "Clicked 1") {
    problems.push(`board:  the click didn't count ("${before?.trim()}" -> "${after?.trim()}")`)
  }
  return { before: before?.trim(), after: after?.trim(), loaded, errors }
}

////////////////
// ## In the page
////////////////

/**
 * Everything `checkCard()` checks, read inside the card's frame;  `ready` once all of it has drawn.
 * - Self-contained:  Playwright sends only this function's source to the frame.
 */
function inspectCard() {
  const markdown = document.querySelector("ui-markdown")?.shadowRoot?.querySelector("[part~=body]")
  const icons = Object.fromEntries(["solid", "outline", "brand", "fa-alias"].map((id) => [id, drawn(`#${id}`)]))
  const codeTokens = { ts: tokens("#ts"), spell: tokens("#spell") }
  const markdownHeading = markdown?.querySelector("h1, h2, h3")?.textContent ?? null
  return {
    ready: Object.values(icons).every(Boolean) && Object.values(codeTokens).every(Boolean) && Boolean(markdownHeading),
    spellUI: typeof window.SpellUI,
    buttonDefined: Boolean(customElements.get("ui-button")),
    icons,
    codeTokens,
    markdownHeading
  }

  /** Does `selector`'s shadow tree hold a `<svg>`? */
  function drawn(selector) {
    return Boolean(document.querySelector(selector)?.shadowRoot?.querySelector("svg"))
  }

  /** How many highlight.js tokens `selector`'s `<ui-code>` drew. */
  function tokens(selector) {
    const code = document.querySelector(selector)?.shadowRoot?.querySelector("[part~=code]")
    return code?.querySelectorAll("[class^=hljs-]").length ?? 0
  }
}

/** Collects `page`'s uncaught errors and console errors, as text. */
function watchErrors(page) {
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
  return errors
}
