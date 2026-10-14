/**
 * Tests of `SeeAlso`:  an epic's See Also, gathered from its files, and which epic a page belongs to
 * (epic `epic-workflow` P13;  Owen's Q12, Q13, Q15;  J88), on a scratch checkout.
 */
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test"

import { GUIDE_CHANGES, SeeAlso } from "./SeeAlso"

const root = mkdtempSync(join(tmpdir(), "see-also-"))

/** Write `html` at `path` (from the scratch root), its folders made. */
function write(path: string, html: string) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), html)
}

/** A page titled `title`. */
function page(title: string): string {
  return `<!doctype html><html><head><title>${title}</title></head><body></body></html>`
}

/**
 * Epic `name`'s plan doc:  its phases' statuses, its `updated` date, standing or not, a durable doc's link, and
 * `links` (from its folder) in its text.
 */
function epic(
  name: string,
  { phases = [], updated = "2026-10-10", standing = false, durable, links = [] }: EpicSpec = {}
) {
  const slot = durable ? `<a slot="durable" href="${durable}">Durable</a>` : ""
  const phaseTags = phases.map((status, n) => `<epic-phase id="p${n + 1}" status="${status}"></epic-phase>`).join("")
  const text = links.map((href) => `<a href="${href}">link</a>`).join("")
  write(
    `epics/${name}/${name}.plan.html`,
    `<html><head><title>${name}</title></head><body>` +
      `<epic-page epic="${name}" updated="${updated}"${standing ? " standing" : ""}>${slot}${phaseTags}${text}</epic-page>` +
      `</body></html>`
  )
}

/** How `epic()` writes an epic. */
type EpicSpec = { phases?: string[]; updated?: string; standing?: boolean; durable?: string; links?: string[] }

beforeAll(() => {
  write("guides/python-target.html", page("The Python Target"))
  write("guides/targets/targets.html", page("Targets and Writers"))
  write("guides/solid.html", page("Solid 2 · Spell docs"))
  write("guides/changelog.html", page("Changelog"))
  // done, its durable doc the Python guide;  a part links the targets guide, from `parts/`
  epic("python-target", {
    phases: ["done", "done"],
    updated: "2026-10-12",
    durable: "../../guides/python-target.html",
    links: ["../../guides/changelog.html#python-target"]
  })
  write("epics/python-target/parts/p1.html", `<a href="../../../guides/targets/targets.html#writers">targets</a>`)
  write("epics/python-target/details/bedtime.html", page("Bedtime:  python-target"))
  write("epics/python-target/details/names.html", page("Names"))
  write("epics/python-target/details/names.rows.json", "[]")
  utimesSync(join(root, "epics/python-target/details/bedtime.html"), new Date("2026-10-11"), new Date("2026-10-11"))
  utimesSync(join(root, "epics/python-target/details/names.html"), new Date("2026-10-12"), new Date("2026-10-12"))
  // the tooling home:  open for good, links both guides in passing
  epic("epic-workflow", {
    phases: ["done"],
    standing: true,
    updated: "2026-10-13",
    links: ["../../guides/python-target.html", "../../guides/targets/targets.html", "../../guides/missing.html"]
  })
  // done long ago, the targets guide's first writer
  epic("output-targets", { phases: ["done"], updated: "2026-10-01", links: ["../../guides/targets/targets.html"] })
  // the catch-all links every page it gathered:  never an owner
  epic(GUIDE_CHANGES, { phases: ["todo"], updated: "2026-10-14", links: ["../../guides/solid.html"] })
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe("linksOf():  an epic's See Also, gathered", () => {
  test("the durable doc, its own pages newest first, then the guides it links;  each with its kind", () => {
    const links = new SeeAlso(root).linksOf("python-target")
    expect(links.map(({ href, title, kind }) => [href, title, kind])).toEqual([
      ["../../guides/python-target.html", "The Python Target", "durable"],
      ["details/names.html", "Names", "choices"],
      ["details/bedtime.html", "Bedtime:  python-target", "details"],
      expect.arrayContaining(["guide"]),
      expect.arrayContaining(["guide"])
    ])
    expect(
      links
        .slice(3)
        .map((link) => link.href)
        .sort()
    ).toEqual(["../../guides/changelog.html", "../../guides/targets/targets.html"])
    expect(links.every((link) => !Number.isNaN(Date.parse(link.updated)))).toBe(true)
  })

  test("a link to a page that isn't there is left out;  an epic with no folder has none", () => {
    const see = new SeeAlso(root)
    expect(see.linksOf("epic-workflow").map((link) => link.href)).toEqual(
      expect.not.arrayContaining(["../../guides/missing.html"])
    )
    expect(see.linksOf("nothing-here")).toEqual([])
  })

  test("a title's site suffix goes", () => {
    expect(new SeeAlso(root).linksOf(GUIDE_CHANGES).map((link) => link.title)).toEqual(["Solid 2"])
  })
})

describe("ownerOf():  which epic a page belongs to", () => {
  test("its durable doc's epic, though done, before an open one that only links it (J88)", () => {
    expect(new SeeAlso(root).ownerOf("guides/python-target.html")).toBe("python-target")
  })

  test("no durable claim:  the open one wins over the done ones", () => {
    expect(new SeeAlso(root).ownerOf("guides/targets/targets.html")).toBe("epic-workflow")
  })

  test("all done:  the one updated last", () => {
    epic("zzz-later", { phases: ["done"], updated: "2026-10-05", links: ["../../guides/targets/targets.html"] })
    epic("epic-workflow", { phases: ["done"], updated: "2026-10-13" })
    try {
      expect(new SeeAlso(root).ownerOf("guides/targets/targets.html")).toBe("python-target")
      epic("zzz-later", { phases: ["done"], updated: "2026-10-13", links: ["../../guides/targets/targets.html"] })
      expect(new SeeAlso(root).ownerOf("guides/targets/targets.html")).toBe("zzz-later")
    } finally {
      rmSync(join(root, "epics", "zzz-later"), { recursive: true, force: true })
      epic("epic-workflow", {
        phases: ["done"],
        standing: true,
        updated: "2026-10-13",
        links: ["../../guides/python-target.html", "../../guides/targets/targets.html"]
      })
    }
  })

  test("never the changelog, nor anything only guide-changes links;  a details page is its own epic's", () => {
    const see = new SeeAlso(root)
    expect(see.ownerOf("guides/changelog.html")).toBeUndefined()
    expect(see.ownerOf("guides/solid.html")).toBeUndefined()
    expect(see.ownerOf("epics/python-target/details/bedtime.html")).toBe("python-target")
    expect(see.ownerOf("epics/nobody/details/x.html")).toBeUndefined()
  })

  test("ownedBy():  an epic's details pages and the guides it owns", () => {
    expect(new SeeAlso(root).ownedBy("python-target")).toEqual([
      "epics/python-target/details/bedtime.html",
      "epics/python-target/details/names.html",
      "guides/python-target.html"
    ])
    expect(new SeeAlso(root).ownedBy("epic-workflow")).toEqual(["guides/targets/targets.html"])
  })
})
