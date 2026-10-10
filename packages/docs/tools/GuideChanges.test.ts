/**
 * Tests of `GuideChanges`, in a scratch checkout:  comments and page notes gathered into an epic, one phase per page;
 * a second gather updates the page's open phase;  what went in is marked taken.
 */
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, test, vi } from "vite-plus/test"

import { PlanDocFiles } from "$/epics/tool/PlanDocFiles"

import { GuideChanges } from "./GuideChanges"
import { GuideInbox } from "./GuideInbox"

/** A guide, its `<title>` carrying a site suffix, with a page note not yet answered. */
const GUIDE = `<!doctype html>
<html lang="en">
  <head><title>Memory · Spell docs</title></head>
  <body>
    <main class="spell-doc-main">
      <ui-sticky class="spell-h1"><header class="spell-page-head"><h1>Memory</h1></header></ui-sticky>
      <ui-section id="sizes" header="2. Sizes">
        <p>Body.</p>
        <spell-notes for="sizes"><spell-note id="n1" status="new" at="2026-10-10 10:00"><p>Still true?</p></spell-note></spell-notes>
      </ui-section>
    </main>
  </body>
</html>
`

const root = mkdtempSync(join(tmpdir(), "guide-changes-"))
mkdirSync(join(root, "epics"))
mkdirSync(join(root, "guides", "memory"), { recursive: true })
writeFileSync(join(root, "guides", "memory", "memory.html"), GUIDE)
writeFileSync(join(root, "guides", "plain.html"), GUIDE.replace(/<spell-notes[\s\S]*<\/spell-notes>/, ""))
// the scratch checkout has no docs tools:  the docs index isn't rebuilt, and says so on stderr
vi.spyOn(process.stderr, "write").mockImplementation(() => true)

afterAll(() => rmSync(root, { recursive: true, force: true }))

/** Comment `text` on page `page`'s second table in section `sizes`;  returns its id. */
function comment(page: string, text: string, quote?: string): string {
  return GuideInbox.update(GuideInbox.fileFor(join(root, page)), (comments) =>
    comments.add({ anchor: "sizes#table-2", kind: "table", label: "2. Sizes", excerpt: "Name Size", quote }, text)
  )
}

/** The scratch epic's whole doc, its parts assembled. */
function epicText(): string {
  return new PlanDocFiles({ root }).read(join(root, "epics", "gc", "gc.plan.html")).toString()
}

describe("GuideChanges.gather()", () => {
  const changes = new GuideChanges({ root, epic: "gc" })

  test("nothing waiting:  no epic is made", async () => {
    rmSync(join(root, "guides", "memory", "memory.html"))
    expect(await changes.gather()).toEqual([])
    expect(readdirSync(join(root, "epics"))).toEqual([])
    writeFileSync(join(root, "guides", "memory", "memory.html"), GUIDE)
  })

  test("ONE PHASE PER PAGE:  its comments and new notes, quoted and linked back;  each marked taken", async () => {
    const id = comment("guides/memory/memory.html", "Too wide on a phone?", "Name Size")
    expect(changes.waiting().map((page) => [page.page, page.title, page.comments.length, page.notes.length])).toEqual([
      ["guides/memory/memory.html", "Memory", 1, 1]
    ])
    expect(await changes.gather()).toEqual([
      { page: "guides/memory/memory.html", epic: "gc", phase: 1, as: "phase", comments: [id], notes: ["n1"] }
    ])
    const doc = epicText()
    expect(doc).toMatch(/<epic-phase[^>]*title="Memory"/)
    expect(doc).toMatch(
      /href="\.\.\/\.\.\/guides\/memory\/memory\.html#sizes"[^>]*>table in 2\. Sizes<\/a>\s+on\s+<q>Name Size<\/q>/
    )
    expect(doc).toContain("Too wide on a phone?")
    expect(doc).toContain("Still true?")
    const inbox = GuideInbox.read(join(root, "guides", "memory", "memory.inbox.json"))
    expect(inbox.comments[id]).toMatchObject({ status: "taken", taken: { epic: "gc", phase: 1 } })
    const page = readFileSync(join(root, "guides", "memory", "memory.html"), "utf8")
    expect(page).toMatch(
      /<spell-note id="n1" status="answered"[\s\S]*Taken into <a href="..\/..\/epics\/gc\/gc.plan.html#p1">gc P1/
    )
    expect(changes.waiting()).toEqual([])
  })

  test("a page with its phase still open gets an Updated block;  another page its own phase;  one page alone", async () => {
    const more = comment("guides/memory/memory.html", "And the second table?")
    const other = comment("guides/plain.html", "A picture here")
    expect(await changes.gather(["guides/plain.html"])).toMatchObject([{ page: "guides/plain.html", phase: 2 }])
    expect(await changes.gather()).toMatchObject([
      { page: "guides/memory/memory.html", phase: 1, as: "update", comments: [more] }
    ])
    expect(epicText()).toMatch(/<epic-updated[^>]*>[\s\S]*1 comment more from Owen[\s\S]*And the second table\?/)
    expect(other).toBe("cm1")
  })
})
