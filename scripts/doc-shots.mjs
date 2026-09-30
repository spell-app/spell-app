/**
 * Check an HTML doc in a real browser -- see "Creating docs" in AGENTS.md.
 * Usage:  node scripts/doc-shots.mjs docs/<folder>/<doc>.html [outDir]
 * - screenshots:  desktop top, desktop mid-page, phone mid-page, phone contents drawer (outDir, default a temp folder)
 * - fails (exit 1) on:  console / page errors, horizontal scroll at phone width, a contents list that doesn't match
 *   the headings, an h2 that doesn't stick when scrolled into its section
 * - Look at the screenshots too:  the checks can't see overlap, clipping or ugly wrapping.
 */
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

import { chromium } from "playwright"

const [docPath, outArg] = process.argv.slice(2)
if (!docPath) {
  console.error("usage:  node scripts/doc-shots.mjs docs/<folder>/<doc>.html [outDir]")
  process.exit(2)
}
const out = outArg ?? mkdtempSync(join(tmpdir(), "doc-shots-"))
const url = pathToFileURL(resolve(docPath)).href
const problems = []
const browser = await chromium.launch()

const desk = await open({ width: 1440, height: 900 })
await desk.screenshot({ path: join(out, "desk-top.png") })
const desktop = await desk.evaluate(() => {
  const headings = document.querySelectorAll("main h2[id], main h3[id], main h4[id]").length
  const tocLinks = document.querySelectorAll("#toc-list a").length
  // only sections that can scroll up to the top:  a short page's last section never sticks
  const room = document.documentElement.scrollHeight - innerHeight
  const sections = [...document.querySelectorAll("section.s2")].filter((s) => s.offsetTop + 200 < room)
  const middle = sections[Math.floor(sections.length / 2)]
  middle?.scrollIntoView()
  window.scrollBy(0, Math.min(600, (middle?.offsetHeight ?? 0) / 2))
  return { headings, tocLinks, middleId: middle?.querySelector(":scope > h2")?.id }
})
await desk.waitForTimeout(400)
await desk.screenshot({ path: join(out, "desk-mid.png") })
const stuck = await desk.evaluate(() => ({
  h2: document.elementFromPoint(document.querySelector("main").getBoundingClientRect().left + 40, 16)?.closest("h2")
    ?.id,
  active: document.querySelector("#toc-list a.active")?.textContent
}))
if (desktop.headings !== desktop.tocLinks)
  problems.push(`contents has ${desktop.tocLinks} links for ${desktop.headings} headings`)
if (desktop.middleId && stuck.h2 !== desktop.middleId) problems.push(`h2 #${desktop.middleId} not stuck at the top`)
if (!stuck.active) problems.push("no active contents link")

const phone = await open({ width: 390, height: 844 })
await phone.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
await phone.waitForTimeout(300)
await phone.screenshot({ path: join(out, "phone-mid.png") })
const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth)
if (overflow > 0) problems.push(`${overflow}px horizontal scroll at phone width`)
await phone.click(".toc-open")
await phone.waitForTimeout(400)
await phone.screenshot({ path: join(out, "phone-toc.png") })

await browser.close()
console.log(JSON.stringify({ ...desktop, stuck: stuck.h2, active: stuck.active, overflow, screenshots: out }, null, 1))
for (const problem of problems) console.error("PROBLEM:", problem)
process.exit(problems.length ? 1 : 0)

/** A page at `viewport`, collecting errors into `problems`. */
async function open(viewport) {
  const page = await browser.newPage({ viewport })
  page.on("pageerror", (error) => problems.push(`page error:  ${error}`))
  page.on("console", (message) => message.type() === "error" && problems.push(`console:  ${message.text()}`))
  await page.goto(url)
  await page.waitForTimeout(800)
  return page
}
