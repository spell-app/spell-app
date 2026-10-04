/**
 * Tests of `yarn details`' functions (`scripts/details.js`), in a scratch `packages/docs`:  the real template, a
 * scratch `details/` and an epic.
 */
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, expect, test } from "vitest"

import {
  answerFile,
  createPage,
  duration,
  findPage,
  formatAnswer,
  listPages,
  readAnswer,
  sweep,
  waitForAnswer
} from "./details.js"
import { DOCS } from "./pages.js"

let docs

beforeAll(() => {
  docs = mkdtempSync(join(tmpdir(), "details-cli-"))
  mkdirSync(join(docs, "templates"))
  copyFileSync(join(DOCS, "templates/details.html"), join(docs, "templates/details.html"))
  mkdirSync(join(docs, "epics/big"), { recursive: true })
})

afterAll(() => rmSync(docs, { recursive: true, force: true }))

test("new:  scratch and epic pages, assets fixed for their depth", () => {
  const scratch = createPage(docs, "pick-layout", { title: "Pick a layout" })
  expect(scratch).toBe(join(docs, "details/pick-layout.html"))
  const html = readFileSync(scratch, "utf8")
  expect(html).toContain("<title>Pick a layout</title>")
  expect(html).toContain('href="../_assets/details.css"')
  expect(html).toContain('<script src="../_assets/details.js">')
  expect(html).not.toContain("TEMPLATE:")
  expect(html).toMatch(/Asked \d{4}-\d\d-\d\d\./)

  const epic = createPage(docs, "shape", { title: "Shape", epic: "big" })
  expect(epic).toBe(join(docs, "epics/big/details/shape.html"))
  const deep = readFileSync(epic, "utf8")
  expect(deep).toContain('href="../../../_assets/details.css"')
  expect(deep).toContain('root="../../../../.."')
})

test("new:  refuses a bad slug, a missing epic, an existing page", () => {
  expect(() => createPage(docs, "Bad Slug")).toThrow(/kebab/)
  expect(() => createPage(docs, "x", { epic: "nope" })).toThrow(/no epic/)
  expect(() => createPage(docs, "pick-layout")).toThrow(/already exists/)
})

test("finds pages by slug, <epic>/<slug>, or an epic's slug alone", () => {
  expect(findPage(docs, "pick-layout")).toBe(join(docs, "details/pick-layout.html"))
  expect(findPage(docs, "big/shape")).toBe(join(docs, "epics/big/details/shape.html"))
  expect(findPage(docs, "shape")).toBe(join(docs, "epics/big/details/shape.html"))
  expect(() => findPage(docs, "nothing")).toThrow(/no details page/)
  expect(listPages(docs)).toEqual([join(docs, "details/pick-layout.html"), join(docs, "epics/big/details/shape.html")])
})

test("formats an answer with the page's titles", () => {
  const page = join(docs, "details/pick-layout.html")
  const answer = {
    page: "/packages/docs/details/pick-layout.html",
    answered: "2026-10-03T22:00:00.000Z",
    changes: 1,
    answers: { q1: { picked: ["A"], other: "and more" } },
    notes: "fine"
  }
  expect(formatAnswer(page, answer)).toBe(
    [
      `Answer to "Pick a layout" (${page}), sent 2026-10-03T22:00:00.000Z:  (changed 1×)`,
      "  Q1 · Short question:  A · First option (recommended);  Other:  and more",
      "  Notes:  fine"
    ].join("\n")
  )
})

test("waits for an answer newer than its start;  gives up after the timeout", async () => {
  const page = join(docs, "details/pick-layout.html")
  expect(readAnswer(page)).toBeUndefined()
  expect(await waitForAnswer(page, { timeout: 50, poll: 10 })).toBeUndefined()
  const waiting = waitForAnswer(page, { timeout: 2000, poll: 10 })
  setTimeout(() => writeFileSync(answerFile(page), JSON.stringify({ answers: {}, notes: "hi" })), 50)
  expect((await waiting).notes).toBe("hi")
  // an answer from before the wait started doesn't count
  expect(await waitForAnswer(page, { since: Date.now() + 1000, timeout: 50, poll: 10 })).toBeUndefined()
})

test("sweep:  old scratch pages and answers go;  new ones and epics' stay", () => {
  const old = (Date.now() - 20 * 86_400_000) / 1000
  utimesSync(join(docs, "details/pick-layout.html"), old, old)
  utimesSync(answerFile(join(docs, "details/pick-layout.html")), old, old)
  utimesSync(join(docs, "epics/big/details/shape.html"), old, old)
  createPage(docs, "fresh")
  expect(sweep(docs, 14).sort()).toEqual(
    [join(docs, "details/pick-layout.answer.json"), join(docs, "details/pick-layout.html")].sort()
  )
  expect(listPages(docs)).toEqual([join(docs, "details/fresh.html"), join(docs, "epics/big/details/shape.html")])
})

test("durations", () => {
  expect(duration("8h")).toBe(8 * 3_600_000)
  expect(duration("1h30m")).toBe(90 * 60_000)
  expect(duration("45s")).toBe(45_000)
  expect(() => duration("soon")).toThrow(/duration/)
})
