import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vite-plus/test"

import { Definitions } from "$/epics/definitions"

import { EpicUISite, type EpicUIPages } from "./EpicUISite"

/** Temporary set folders, removed after each case. */
const made: string[] = []

afterEach(() => {
  for (const folder of made.splice(0)) rmSync(folder, { recursive: true, force: true })
})

/** A set folder holding `pages` as its `pages.json`, and `files` (relative path => text). */
function setFolder(pages: EpicUIPages, files: Record<string, string> = {}): string {
  const folder = mkdtempSync(join(tmpdir(), "epic-ui-"))
  made.push(folder)
  mkdirSync(join(folder, "_data"), { recursive: true })
  writeFileSync(join(folder, "_data", "pages.json"), JSON.stringify(pages))
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(folder, path, ".."), { recursive: true })
    writeFileSync(join(folder, path), text)
  }
  return folder
}

/** A page in the set's shape:  `title` on its `main`, `summary` its description, `sections` its section ids. */
function page(title: string, summary: string, sections: string[] = []): string {
  const body = sections.map((id) => `<ui-section id="${id}" header="${id.toUpperCase()}"></ui-section>`).join("")
  return `<!doctype html><html><head><title>${title}</title><meta name="description" content="${summary}" /></head><body><main id="main" class="site-main" data-toc-header="${title}">${body}</main></body></html>`
}

/** Hand-kept facts filing two elements, the rest left to Other. */
const PAGES: EpicUIPages = {
  groups: [{ id: "items", title: "Items", tags: ["epic-item", "epic-reply"] }],
  drawnOnly: ["epic-review", "epic-new-item", "epic-agents"],
  nav: { start: [{ id: "index", file: "index.html", label: "Home", icon: "house" }], foundation: [] }
}

describe("EpicUISite", () => {
  it("writes the committed data as it is:  `yarn site:data` in packages/epics if not", () => {
    const site = new EpicUISite()
    for (const [name, text] of Object.entries(site.files()))
      expect(readFileSync(join(site.folder, "_data", name), "utf8"), `${name} is stale:  yarn site:data`).toBe(text)
  })

  it("lists every element of the pack's definitions but the drawn-only ones, A-Z, filed by pages.json", () => {
    const data = new EpicUISite(
      setFolder(PAGES, { "elements/epic-item.html": page("<epic-item>", "One item.") })
    ).data()
    const listed = Definitions.tags.filter((tag) => !PAGES.drawnOnly.includes(tag))
    expect(data.components.map((tag) => tag.tag)).toEqual([...listed].sort())
    expect(data.topics).toEqual([
      { id: "items", title: "Items" },
      { id: "other", title: "Other" }
    ])
    const item = data.components.find((tag) => tag.tag === "epic-item")!
    expect(item).toMatchObject({ name: "epic-item", href: "elements/epic-item.html", page: true, topics: ["items"] })
    expect(item.attributes.find((spec) => spec.name === "status")?.values).toEqual([
      "open",
      "decided",
      "done",
      "canceled"
    ])
    expect(data.components.find((tag) => tag.tag === "epic-code")?.topics).toEqual(["other"])
    expect(data.nav).toEqual(PAGES.nav)
  })

  it("marks an element without a page `planned`;  one with a page takes its summary", () => {
    const data = new EpicUISite(
      setFolder(PAGES, { "elements/epic-item.html": page("<epic-item>", "One item.") })
    ).data()
    expect(data.families["epic-item"]).toMatchObject({ title: "<epic-item>", summary: "One item.", status: "done" })
    expect(data.families["epic-reply"]?.status).toBe("planned")
  })

  it("indexes the home, then each element page A-Z, with their sections", () => {
    const folder = setFolder(PAGES, {
      "index.html": page("The Epic Elements", "How they nest.", ["nesting"]),
      "elements/epic-reply.html": page("<epic-reply>", "A reply.", ["examples"]),
      "elements/epic-item.html": page("<epic-item>", "One item.", ["examples", "attributes"])
    })
    const search = new EpicUISite(folder).search()
    expect(search.pages.map((each) => each.path)).toEqual([
      "index.html",
      "elements/epic-item.html",
      "elements/epic-reply.html"
    ])
    expect(search.pages[1]).toMatchObject({ title: "<epic-item>", summary: "One item.", tag: "epic-item" })
    expect(search.pages[1]!.sections.map((section) => section.id)).toEqual(["examples", "attributes"])
    expect(search.pages[0]!.tag).toBeUndefined()
  })
})
