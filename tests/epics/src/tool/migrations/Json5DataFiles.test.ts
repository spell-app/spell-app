/**
 * Tests of the migration `json5-data-files` (epic `epic-workflow` P21):  an epic's data files beside its page found
 * for renaming (`.json` -> `.json5`), a clash left, the page's links to data files repointed, a second run changing
 * nothing;  and the runner renaming the files (`PlanDocFiles.migrate()`), a dry run renaming none.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { parseHTML } from "linkedom"
import { afterAll, describe, expect, test } from "vite-plus/test"

import type { MigrationContext } from "$/epics/tool/migrations/migrations.types"
import { Migrations } from "$/epics/tool/migrations/Migrations"
import { PlanDocFiles } from "$/epics/tool/PlanDocFiles"

/** The step under test. */
const STEP = Migrations.named("json5-data-files")!

const root = mkdtempSync(join(tmpdir(), "json5-data-files-"))
afterAll(() => rmSync(root, { recursive: true, force: true }))

/** Write `text` to `path`, from the scratch checkout's root, making its folders. */
function put(path: string, text = "{}"): void {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
}

/** An epic page whose item links its own inbox, another epic's rows, the docs home's list, and a page. */
function page(): Document {
  return parseHTML(
    `<html><body><main><epic-page epic="seo" title="SEO">` +
      `<epic-section id="todos" kind="todos"><epic-item id="t1" title="Links" status="open"><p>` +
      `<a href="seo.inbox.json">inbox</a> <a href="../big/details/names.rows.json">rows</a> ` +
      `<a href="../home.json">home</a> <a href="../../guides/x.html">a guide</a> ` +
      `<a href="../../package.json">package.json</a>` +
      `</p></epic-item></epic-section></epic-page></main></body></html>`
  ).document as unknown as Document
}

/** A context for epic `seo`'s page, in its folder of the scratch checkout. */
function context(): MigrationContext {
  return { now: new Date(), epic: "seo", folder: join(root, "epics", "seo"), root, notes: [] }
}

describe("json5-data-files", () => {
  put("epics/seo/seo.inbox.json")
  put("epics/seo/agents.json", "[]")
  put("epics/seo/details/names.answer.json")
  put("epics/seo/details/names.round2.answer.json")
  put("epics/seo/details/names.rows.json")
  put("epics/seo/details/names.draft.json")
  put("epics/seo/details/names.draft.json5")
  put("epics/seo/details/notes.json")

  test("finds the old-named data files (a clash left), repoints the page's links;  again:  nothing", () => {
    const document = page()
    const found = context()
    expect(STEP.run(document, found)).toBe(true)
    const named = (file: string) => file.slice(root.length + 1)
    expect(found.files!.map((move) => [named(move.from), move.clash])).toEqual([
      ["epics/seo/agents.json", false],
      ["epics/seo/seo.inbox.json", false],
      ["epics/seo/details/names.answer.json", false],
      ["epics/seo/details/names.draft.json", true],
      ["epics/seo/details/names.round2.answer.json", false],
      ["epics/seo/details/names.rows.json", false]
    ])
    expect([...document.querySelectorAll("a")].map((link) => link.getAttribute("href"))).toEqual([
      "seo.inbox.json5",
      "../big/details/names.rows.json5",
      "../home.json5",
      "../../guides/x.html",
      "../../package.json"
    ])
    expect(found.notes).toEqual([
      "json5-data-files:  3 links to .json5",
      expect.stringMatching(/^json5-data-files:  5 to \.json5 \(agents\.json, seo\.inbox\.json, /),
      "json5-data-files:  LEFT, both names there (merge them by hand):  details/names.draft.json"
    ])
    const again = context()
    for (const move of found.files!) if (!move.clash) writeFileSync(move.to, readFileSync(move.from))
    for (const move of found.files!) if (!move.clash) rmSync(move.from)
    expect(STEP.run(document, again)).toBe(false)
    expect(again.files?.map((move) => named(move.from))).toEqual(["epics/seo/details/names.draft.json"])
  })
})

describe("the runner renames them", () => {
  test("migrate():  a dry run renames nothing;  then each file renamed, the page's links too", async () => {
    const checkout = mkdtempSync(join(tmpdir(), "json5-data-files-runner-"))
    const write = (path: string, text: string) => {
      mkdirSync(dirname(join(checkout, path)), { recursive: true })
      writeFileSync(join(checkout, path), text)
    }
    const doc = join(checkout, "epics", "tiny", "tiny.plan.html")
    write(
      "epics/tiny/tiny.plan.html",
      `<!doctype html><html><head><title>Epic:  Tiny</title></head><body class="plan-doc"><main>` +
        `<epic-page epic="tiny" title="Tiny" updated="2026-10-14 09:00"><epic-summary>See ` +
        `<a href="tiny.inbox.json">the inbox</a>.</epic-summary>` +
        `<epic-section id="log" kind="log" title="Log" icon="clock rotate left"></epic-section>` +
        `</epic-page></main></body></html>\n`
    )
    write("epics/tiny/tiny.inbox.json", '{ "version": 1, "marks": {} }')
    const files = new PlanDocFiles({ root: checkout })
    const dry = await files.migrate(doc, { only: ["json5-data-files"], dryRun: true })
    expect(dry.files.map((move) => move.to.slice(checkout.length + 1))).toEqual(["epics/tiny/tiny.inbox.json5"])
    expect(existsSync(join(checkout, "epics/tiny/tiny.inbox.json"))).toBe(true)
    const done = await files.migrate(doc, { only: ["json5-data-files"] })
    expect(done.written).toBe(true)
    expect(existsSync(join(checkout, "epics/tiny/tiny.inbox.json"))).toBe(false)
    expect(existsSync(join(checkout, "epics/tiny/tiny.inbox.json5"))).toBe(true)
    expect(readFileSync(doc, "utf8")).toContain('href="tiny.inbox.json5"')
    rmSync(checkout, { recursive: true, force: true })
  })
})
