/**
 * Tests of `migrate.js`:  the docs' page kinds and their migration steps (epic `epic-workflow`, P8), and that the
 * `epic` tool's copy of the comment anchor rules (`PlanAnchors`) agrees with `BlockAnchors.js`.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { parseHTML } from "linkedom"
import { afterEach, describe, expect, test } from "vite-plus/test"

import { PAGE_KINDS } from "$/epics/tool/migrations"
import { PlanAnchors } from "$/epics/tool/PlanAnchors"

import { anchorOf, blocksIn, excerptOf, findBlock } from "./BlockAnchors.js"
import { KINDS, migratePages, pageKind, pagesFor, report, STEPS, stepsFor } from "./migrate.js"

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

/** A details page in the markup before epic `epic-workflow` P12:  a context section, one question of two options. */
const OLD_DETAILS =
  '<!doctype html><html><head><link rel="stylesheet" href="../../../packages/docs/tools/_assets/details.css"></head>' +
  '<body class="spell-doc-page"><div class="spell-doc"><main class="spell-doc-main">' +
  '<ui-sticky class="spell-h1"><header class="spell-page-head"><h1>Pick</h1></header></ui-sticky>' +
  '<ui-list class="spell-meta"><ui-item icon="comments">Asked by:  session <code>w</code></ui-item>' +
  '<ui-item icon="calendar" data-details-asked>Asked:  2026-10-05</ui-item>' +
  '<ui-item icon="flag">Status: <ui-label data-details-status>waiting</ui-label></ui-item></ui-list>' +
  '<ui-message class="spell-where" state="info" header="Where we are"><ul><li><b>Epic:</b>  <code>big</code></li></ul></ui-message>' +
  '<ui-section id="context" header="1. Context" sticky collapsible dividing><p>Some context.</p></ui-section>' +
  '<ui-section id="q1" class="spell-question" header="Q1 · Which?" sticky collapsible dividing data-multiple>' +
  '<ui-icon slot="icon" name="circle question"></ui-icon><p>Which one?</p>' +
  '<div class="spell-option" data-option="A" data-title="First" data-recommended data-checked><p>One.</p>' +
  '<div class="spell-option-details" data-title="Why"><p>Long.</p></div></div>' +
  '<div class="spell-option" data-option="B" data-title="Second"><p>Two.</p></div></ui-section>' +
  '</main></div><script src="../../../packages/docs/tools/_assets/details.js"></script>' +
  '<script src="../../../packages/docs/tools/_assets/spell-ui.js"></script></body></html>'

/** An old details page with no questions:  it had no form. */
const OLD_PLAIN =
  '<!doctype html><html><head><link rel="stylesheet" href="../../../packages/docs/tools/_assets/details.css"></head>' +
  '<body><main><p>Just words.</p></main><script src="../../../packages/docs/tools/_assets/details.js"></script>' +
  '<script src="../../../packages/docs/tools/_assets/spell-ui.js"></script></body></html>'

/** A choice page before P12:  its rows drawn by `syntax-choices.js`, from the rows file beside it. */
const OLD_CHOICES =
  '<!doctype html><html><head><link rel="stylesheet" href="../../packages/docs/tools/_assets/syntax-choices.css"></head>' +
  '<body class="spell-doc-page spell-choices-page" data-spell-needs-server><div class="spell-doc"><main class="spell-doc-main">' +
  "<h1>Names</h1><div data-choices-sections></div></main></div>" +
  '<script src="../../packages/docs/tools/_assets/syntax-choices.js"></script></body></html>'

describe("page kinds", () => {
  test("the same kinds as the `epic` tool's", () => {
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
      "guides:  1 of 2 would change (ui-section 1)"
    ])
    const real = migratePages(pages, { tidied: false })
    expect(real.written).toEqual([join(root, "guides/old.html")])
    expect(readFileSync(join(root, "guides/old.html"), "utf8")).toMatch(/<ui-section id="one"/)
    const again = migratePages(pages, { tidied: false })
    expect(again.written).toEqual([])
    expect(report(again.results, root).at(-1)).toBe("guides:  0 of 2 changed")
  })

  test("answer-elements:  an old details page in the epics pack's elements, every word and answer key kept;  once", () => {
    const root = checkout({ "epics/big/details/pick.html": OLD_DETAILS, "epics/big/details/plain.html": OLD_PLAIN })
    const pages = pagesFor(root, "detail")
    expect(pages.map((page) => page.file.split("/").pop())).toEqual(["pick.html", "plain.html"])
    const { results } = migratePages(pages, { tidied: false })
    expect(report(results, root)).toEqual([
      "epics/big/details/pick.html:  answer-elements",
      "  answer-elements:  meta list -> <epic-field>s",
      "  answer-elements:  Where we are -> <epic-field>s",
      "  answer-elements:  1 questions -> <epic-ask>",
      "  answer-elements:  1 comment boxes",
      "epics/big/details/plain.html:  answer-elements",
      "  answer-elements:  no questions:  its old script and sheet dropped",
      "details pages:  2 of 2 changed (answer-elements 2)"
    ])
    const html = readFileSync(join(root, "epics/big/details/pick.html"), "utf8")
    expect(html).not.toMatch(/spell-question|spell-option|details\.(js|css)|data-details-status/)
    expect(html).toContain(
      '<ui-root><ui-components source="../../../packages/epics/pack/epics.pack.js"></ui-components>'
    )
    expect(html).toContain("<h1>Pick</h1><epic-send></epic-send>")
    expect(html).toContain('<epic-field label="Asked by" data-details-by>session <code>w</code></epic-field>')
    expect(html).toContain('<epic-field label="Asked" data-details-asked>2026-10-05</epic-field>')
    expect(html).toContain('<epic-field label="Epic"><code>big</code></epic-field>')
    expect(html).toContain('<p>Some context.</p><epic-text-box for="context"></epic-text-box>')
    expect(html).toContain(
      '<ui-section id="q1" header="Q1 · Which?" sticky collapsible dividing><ui-icon slot="icon" name="circle question"></ui-icon>' +
        "<epic-ask multiple><epic-question><p>Which one?</p></epic-question><epic-choices>" +
        '<epic-option letter="A" title="First" recommended selected><p>One.</p>' +
        '<epic-aside title="Why"><p>Long.</p></epic-aside></epic-option>' +
        '<epic-option letter="B" title="Second"><p>Two.</p></epic-option></epic-choices></epic-ask></ui-section>'
    )
    expect(html).toContain('</ui-section><epic-text-box type="notes"></epic-text-box>')
    expect(html).toContain('<script src="../../../packages/docs/tools/_assets/spell-ui.js"></script>')
    const plain = readFileSync(join(root, "epics/big/details/plain.html"), "utf8")
    expect(plain).not.toMatch(/details\.(js|css)|ui-root|epic-send/)
    expect(migratePages(pages, { tidied: false }).written).toEqual([])
  })

  test("answer-elements:  an old choice page's rows written into it from its rows file, with its bar", () => {
    const rows = {
      sections: [{ id: "q1", title: "Q1 · Names", description: "`is` first" }],
      rows: [
        {
          id: "q1-A-7",
          section: "q1",
          file: "a/A.ts",
          line: 7,
          purpose: "open",
          current: "open",
          recommended: "isOpen"
        }
      ]
    }
    const root = checkout({
      "pages/details/names.html": OLD_CHOICES,
      "pages/details/names.rows.json": JSON.stringify(rows)
    })
    const pages = pagesFor(root, "choice")
    expect(migratePages(pages, { tidied: false }).written).toHaveLength(1)
    const html = readFileSync(join(root, "pages/details/names.html"), "utf8")
    expect(html).not.toMatch(/syntax-choices\.(js|css)|data-choices-sections|data-spell-needs-server/)
    expect(html).toContain(
      '<epic-choice-rows><epic-choice-row name="q1-A-7" file="a/A.ts" line="7" purpose="open" current="open" recommended="isOpen"></epic-choice-row></epic-choice-rows>'
    )
    expect(html).toContain('<p class="spell-choices-rule"><code>is</code> first</p>')
    expect(html).toContain("<epic-choices-bar></epic-choices-bar></main>")
    expect(html).toContain('<script src="../../packages/docs/tools/_assets/highlight.min.js"></script>')
    expect(migratePages(pages, { tidied: false }).written).toEqual([])
  })

  test("answer-elements:  the old shared templates become copies of the tools' own", () => {
    const root = checkout({ "templates/details.html": OLD_DETAILS })
    migratePages(pagesFor(root, "template"), { tidied: false })
    const html = readFileSync(join(root, "templates/details.html"), "utf8")
    expect(html).toContain("<epic-ask>")
    expect(html).toContain('source="../packages/epics/pack/epics.pack.js"')
  })

  test("a saga page is never a step's:  it keeps the old markup", () => {
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
