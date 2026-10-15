/**
 * Tests of `EpicTargets`:  what a link to a saga, an epic, a phase or an item finds in a checkout, and the link check
 * (epic `epic-workflow` P15, J32), on a scratch checkout.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

import { EpicAddress } from "$/epics/links"

import { EpicTargets } from "$/epics/tool/EpicTargets"

const root = mkdtempSync(join(tmpdir(), "epic-targets-"))

/** Write `html` at `path` (from the scratch root), its folders made. */
function write(path: string, html: string) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), html)
}

/** Epic `name`'s page, naming `saga` (none:  no attribute), its body `inner`. */
function epic(name: string, saga: string | undefined, inner: string) {
  const named = saga ? ` saga="${saga}"` : ""
  write(
    `epics/${name}/${name}.plan.html`,
    `<html><head><title>Epic: ${name}</title></head><body><epic-page epic="${name}"${named}>${inner}</epic-page></body></html>`
  )
}

beforeAll(() => {
  write(
    "sagas/sagas.json",
    JSON.stringify({
      sagas: [
        { id: "epics", title: "Epic Tooling", purpose: "" },
        { id: "spell-ui", title: "Spell UI", purpose: "" }
      ]
    })
  )
  write(
    "sagas/epics/epics.saga.html",
    `<html><head><title>Saga: Epic Tooling</title></head><body><epic-item id="t3" title="Saga todo"></epic-item></body></html>`
  )
  epic(
    "seo",
    "spell-ui",
    `<epic-section id="phases" kind="phases"><epic-phase id="p1" title="Meta Tags"></epic-phase>` +
      `<epic-phase id="p-epic-migrate" title="Epic Migrate"></epic-phase></epic-section>` +
      `<epic-item id="j3" title="Titles from the page"></epic-item>` +
      `<epic-section id="o1" kind="overview-part" source="parts/o1.html"></epic-section>`
  )
  write("epics/seo/parts/o1.html", `<h4 id="h4">A heading</h4>`)
  epic("loose", undefined, `<epic-item id="t1" title="Loose todo"></epic-item>`)
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe("EpicTargets.resolve()", () => {
  const targets = () => new EpicTargets(root)

  test("an item on an epic page:  its href and title, the short form", () => {
    expect(targets().resolve(EpicAddress.parse("SAGA:/spell-ui/seo#J3"))).toEqual({
      href: "epics/seo/seo.plan.html#j3",
      title: "Titles from the page",
      label: "seo J3",
      found: true
    })
  })

  test("a saga page, an item on it;  a page's own title when no id", () => {
    expect(targets().resolve(EpicAddress.parse("SAGA:/epics"))).toMatchObject({
      href: "sagas/epics/epics.saga.html",
      title: "Saga: Epic Tooling",
      found: true
    })
    expect(targets().resolve(EpicAddress.parse("SAGA:/epics#T3"))).toMatchObject({ title: "Saga todo", found: true })
  })

  test("a phase by name or number:  its id, number and title", () => {
    expect(targets().resolve(new EpicAddress({ epic: "seo", phase: "epic-migrate" }))).toMatchObject({
      href: "epics/seo/seo.plan.html#p-epic-migrate",
      label: "seo P2 · Epic Migrate",
      found: true
    })
    expect(targets().resolve(new EpicAddress({ epic: "seo", phase: "1" })).label).toBe("seo P1 · Meta Tags")
  })

  test("an id only a part holds counts", () => {
    expect(targets().resolve(new EpicAddress({ epic: "seo", item: "h4" })).found).toBe(true)
  })

  test("broken:  no saga, no saga page, no epic page, no id;  a saga the epic doesn't name links, but is a problem", () => {
    const problem = (text: string) => targets().resolve(EpicAddress.parse(text))
    expect(problem("SAGA:/nope")).toMatchObject({ found: false, problem: expect.stringContaining('no saga "nope"') })
    expect(problem("SAGA:/spell-ui")).toMatchObject({
      found: false,
      problem: expect.stringContaining("has no page yet")
    })
    expect(problem("SAGA:/spell-ui/gone")).toMatchObject({ found: false, problem: "no page epics/gone/gone.plan.html" })
    expect(problem("SAGA:/spell-ui/seo#T9")).toMatchObject({
      found: false,
      problem: "no #t9 on epics/seo/seo.plan.html"
    })
    expect(problem("SAGA:/epics/seo#J3")).toMatchObject({
      found: true,
      problem: 'epic seo names saga "spell-ui", not "epics"'
    })
    expect(problem("SAGA:/epics/loose").problem).toBe("epic loose names no saga")
  })
})

describe("EpicTargets.problemsIn():  the link check", () => {
  test("every broken SAGA:/ href and <epic-link>;  same-page links against the page itself;  <pre> and <script> skipped", () => {
    const html =
      `<epic-item id="t1" title="Here"></epic-item>` +
      `<a href="SAGA:/spell-ui/seo#J3">fine</a> <a href="SAGA:/spell-ui/seo#J9">gone</a> <a href="../x.html">other</a>` +
      `<epic-link item="T1"></epic-link><epic-link item="T2"></epic-link>` +
      `<epic-link epic="seo" phase="Meta Tags"></epic-link><epic-link saga="epics" epic="seo" item="J3"></epic-link>` +
      `<epic-link saga="Bad Name"></epic-link>` +
      `<pre><a href="SAGA:/nope">an example</a></pre>` +
      `<script type="text/plain"><epic-link saga="nope"></epic-link></script>`
    expect(new EpicTargets(root).problemsIn(html, "epics/loose/loose.plan.html")).toEqual([
      "broken link:  SAGA:/spell-ui/seo#J9 -- no #j9 on epics/seo/seo.plan.html",
      'broken link:  <epic-link item="T2"> -- no #t2 on epics/loose/loose.plan.html',
      'broken link:  <epic-link saga="epics" epic="seo" item="J3"> -- epic seo names saga "spell-ui", not "epics"',
      `broken link:  <epic-link saga="Bad Name"> -- EpicAddress:  saga "Bad Name" isn't lower-kebab-case, e.g. drawable-spell`
    ])
  })
})
