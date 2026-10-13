/**
 * Tests of `migrate.js`:  the docs' page kinds and their migration steps (epic `epic-workflow`, P8), and that the
 * plan-doc tool's copy of the comment anchor rules (`PlanAnchors`) agrees with `BlockAnchors.js`.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { parseHTML } from "linkedom"
import { afterEach, describe, expect, test } from "vite-plus/test"

import { PAGE_KINDS } from "$/epics/tool/migrations"
import { PlanAnchors } from "$/epics/tool/PlanAnchors"

import { anchorOf, blocksIn, excerptOf, findBlock } from "../../../packages/epics/tools/BlockAnchors.js"
import {
  KINDS,
  migratePages,
  pageKind,
  pagesFor,
  report,
  STEPS,
  stepsFor
} from "../../../packages/epics/tools/migrate.js"

const dirs: string[] = []
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

/** A scratch checkout with `files` (`{ path: html }`) written into it:  its root. */
function checkout(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "docs-migrate-"))
  dirs.push(root)
  for (const [path, html] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true })
    writeFileSync(join(root, path), html)
  }
  return root
}

/** A page in the OLD section markup:  one `section.s2` with a heading id. */
const OLD_PAGE =
  '<!doctype html><html><body><main><section class="s2"><ui-sticky class="spell-h2"><h2 id="one">One</h2></ui-sticky>' +
  "<p>Words.</p></section></main></body></html>"

describe("page kinds", () => {
  test("the same kinds as the plan-doc tool's", () => {
    expect(KINDS).toEqual([...PAGE_KINDS])
  })

  test("a page's kind:  from where it lives and what it loads", () => {
    const root = checkout({
      "guides/x/x.html": "<main></main>",
      "guides/c.html": '<div class="spell-filter"></div>',
      "guides/dev/commands/commands.html": '<script src="commands.js"></script><div class="spell-filter"></div>',
      "guides/changelog.html": "",
      "pages/index.html": "",
      "guides/index.html": "",
      "templates/durable.html": "",
      "templates/goals/index.html": "",
      "epics/seo/seo.plan.html": "<epic-page></epic-page>",
      "epics/seo/details/q1.html": "",
      "pages/details/pick.html": "",
      "pages/details/pick.rows.json": "[]",
      "brand/pony.html": "",
      "ui/button.html": ""
    })
    const kind = (path: string) => pageKind(join(root, path), root)
    expect(
      [
        "guides/x/x.html",
        "guides/c.html",
        "guides/dev/commands/commands.html",
        "guides/changelog.html",
        "pages/index.html",
        "guides/index.html",
        "templates/durable.html",
        "templates/goals/index.html",
        "epics/seo/seo.plan.html",
        "epics/seo/details/q1.html",
        "pages/details/pick.html",
        "brand/pony.html",
        "ui/button.html"
      ].map(kind)
    ).toEqual([
      "guide",
      "cheatsheet",
      "command",
      "changelog",
      "home",
      "list",
      "template",
      "goal-set",
      "epic",
      "detail",
      "choice",
      "brand",
      "component"
    ])
  })

  test("the steps:  each with a day and kinds;  a step for a kind;  an unknown step refused", () => {
    for (const step of STEPS) {
      expect(step.date).toMatch(/^\d{4}-\d\d-\d\d$/)
      expect(step.kinds.every((kind) => KINDS.includes(kind) && kind !== "epic")).toBe(true)
    }
    expect(stepsFor("cheatsheet").map((step) => step.name)).toEqual(["ui-section"])
    expect(stepsFor("goal-set")).toEqual([])
    expect(() => stepsFor("guide", "nope")).toThrow(/no step "nope"/)
  })
})

describe("migratePages", () => {
  test("ui-section:  --dry-run writes nothing;  then it converts;  a second run changes nothing", () => {
    const root = checkout({ "guides/old.html": OLD_PAGE, "guides/new.html": "<main><p>new</p></main>" })
    const pages = pagesFor(root)
    expect(pages.map((page) => page.kind)).toEqual(["guide", "guide"])
    const dry = migratePages(pages, { dryRun: true, tidied: false })
    expect(readFileSync(join(root, "guides/old.html"), "utf8")).toBe(OLD_PAGE)
    expect(report(dry.results, root, { dryRun: true })).toEqual([
      "guides/old.html:  would run ui-section",
      "  ui-section:  1 sections -> <ui-section>",
      "guide pages:  1 of 2 would change (ui-section 1)"
    ])
    const real = migratePages(pages, { tidied: false })
    expect(real.written).toEqual([join(root, "guides/old.html")])
    expect(readFileSync(join(root, "guides/old.html"), "utf8")).toMatch(/<ui-section id="one"/)
    const again = migratePages(pages, { tidied: false })
    expect(again.written).toEqual([])
    expect(report(again.results, root).at(-1)).toBe("guide pages:  0 of 2 changed")
  })

  test("a goals page is never a step's:  it keeps the old markup", () => {
    const root = checkout({ "templates/goals/index.html": OLD_PAGE })
    expect(pagesFor(root)).toEqual([])
  })
})

describe("PlanAnchors agrees with BlockAnchors", () => {
  /** An epic page with every kind of block an anchor names. */
  const html =
    `<html><body><main><epic-page epic="x" title="X"><epic-overview id="overview"><epic-summary>s</epic-summary>` +
    `<p>Prose one.</p><epic-section id="o1" kind="overview-part" title="Why"><p>Why.</p><ul><li>a</li></ul></epic-section>` +
    `</epic-overview><epic-section id="phases" kind="phases">` +
    `<epic-phase id="p1" title="One"><epic-field name="goal"><ul><li>Goal <code>x</code> one.</li></ul></epic-field>` +
    `<epic-update at="2026-10-11 09:00" summary="s"><p>Changed.</p></epic-update>` +
    `<epic-field name="files"><p>Files.</p></epic-field></epic-phase>` +
    `<epic-phase id="p2" title="Two"><epic-field name="goal"><p>Two.</p></epic-field></epic-phase></epic-section>` +
    `<epic-section id="todos" kind="todos"><epic-item id="t1" title="Do"><p>Details.</p>` +
    `<epic-update at="2026-10-11 10:00"><p>Item update.</p></epic-update></epic-item></epic-section>` +
    `</epic-page></main></body></html>`

  test("the same blocks, anchors and excerpts;  a moved block found the same", () => {
    const document = parseHTML(html).document as unknown as Document
    const main = document.querySelector("main")!
    const blocks = blocksIn(main)
    expect(PlanAnchors.blocksIn(main)).toEqual(blocks)
    expect(blocks.map((block) => PlanAnchors.anchorOf(block))).toEqual(blocks.map((block) => anchorOf(block, main)))
    expect(blocks.map((block) => PlanAnchors.excerptOf(block))).toEqual(blocks.map((block) => excerptOf(block)))
    // p2's field, saved when it was p1's second:  both find it by its excerpt
    const moved = { anchor: "p1#field-3", excerpt: "Two." }
    expect(PlanAnchors.find(document, moved.anchor, moved.excerpt).block).toBe(findBlock(main, moved).block)
  })
})
