/**
 * Tests of `Sagas`:  the shared list of sagas, in Owen's order (epic `epic-workflow` P15), on a scratch checkout.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterAll, describe, expect, test } from "vite-plus/test"

import { Sagas } from "./Sagas"

const root = mkdtempSync(join(tmpdir(), "sagas-"))

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe("Sagas", () => {
  test("no list yet:  no sagas", () => {
    expect(new Sagas(root).list()).toEqual([])
  })

  test("saves and lists them in order, keeping the file's note", () => {
    mkdirSync(join(root, "sagas"), { recursive: true })
    writeFileSync(join(root, "sagas/sagas.json"), JSON.stringify({ "//": "a note", sagas: [] }))
    const sagas = new Sagas(root)
    sagas.save([
      { id: "drawable-spell", title: "Drawable Spell", purpose: "drawn" },
      { id: "epics", title: "Epic Tooling", purpose: "epics" }
    ])
    expect(sagas.list().map((saga) => saga.id)).toEqual(["drawable-spell", "epics"])
    expect(sagas.find("epics")?.title).toBe("Epic Tooling")
    expect(JSON.parse(readFileSync(sagas.file, "utf8"))["//"]).toBe("a note")
  })

  test("refuses a malformed or repeated id", () => {
    const sagas = new Sagas(root)
    expect(() => sagas.save([{ id: "Three Words Here", title: "x", purpose: "" }])).toThrow(/lower case/)
    expect(() => sagas.save([{ id: "a-b-c", title: "x", purpose: "" }])).toThrow(/lower case/)
    const twice = { id: "epics", title: "x", purpose: "" }
    expect(() => sagas.save([twice, twice])).toThrow(/twice/)
  })

  test("a saga's page", () => {
    expect(Sagas.pageOf("epics")).toBe("sagas/epics/epics.saga.html")
  })

  test("adds, moves, retitles and renames, keeping the order", () => {
    const sagas = new Sagas(root)
    sagas.add({ id: "agents", title: "Agents", purpose: "agents" })
    sagas.add({ id: "tooling", title: "Dev Tooling", purpose: "tools" }, { after: "drawable-spell" })
    expect(sagas.ids()).toEqual(["drawable-spell", "tooling", "epics", "agents"])
    sagas.move("agents", { before: "tooling" })
    expect(sagas.ids()).toEqual(["drawable-spell", "agents", "tooling", "epics"])
    sagas.retitle("agents", "The Agents")
    sagas.rename("agents", "agent-rules")
    expect(sagas.list()[1]).toEqual({ id: "agent-rules", title: "The Agents", purpose: "agents" })
    expect(() => sagas.add({ id: "epics", title: "x", purpose: "" })).toThrow(/a saga already/)
    expect(() => sagas.move("epics", { before: "nope" })).toThrow(/no saga "nope"/)
    expect(() => sagas.move("epics", {})).toThrow(/one of them/)
    expect(() => sagas.rename("epics", "tooling")).toThrow(/a saga already/)
    expect(() => sagas.need("nope", "saga set")).toThrow(/^saga set:  no saga "nope"/)
  })
})

describe("Sagas guides", () => {
  /** A page's head, its description meta over three lines as the formatter writes it. */
  const page =
    `<html>\n  <head>\n    <title>T</title>\n    <meta\n      name="description"\n      content="d"\n    />\n` +
    `    <link rel="stylesheet" href="x.css" />\n  </head>\n</html>\n`

  test("a guide's saga is spliced in after its description, changed and removed, every other byte kept", () => {
    const named = Sagas.withSaga(page, "epics")
    expect(named).toBe(page.replace(`/>\n`, `/>\n    <meta name="spell-saga" content="epics" />\n`))
    expect(Sagas.sagaOf(named)).toBe("epics")
    expect(Sagas.sagaOf(Sagas.withSaga(named, "tooling"))).toBe("tooling")
    expect(Sagas.withSaga(named, null)).toBe(page)
    expect(Sagas.withSaga(page, null)).toBe(page)
    expect(Sagas.sagaOf(page)).toBeNull()
  })

  test("every guide, by path, with the saga it names;  not the list page, nor experiments", () => {
    mkdirSync(join(root, "guides/topic/experiments"), { recursive: true })
    writeFileSync(join(root, "guides/index.html"), page)
    writeFileSync(join(root, "guides/a.html"), Sagas.withSaga(page, "epics"))
    writeFileSync(join(root, "guides/topic/topic.html"), page)
    writeFileSync(join(root, "guides/topic/experiments/x.html"), page)
    expect(new Sagas(root).guides()).toEqual([
      { path: "guides/a.html", saga: "epics" },
      { path: "guides/topic/topic.html", saga: null }
    ])
  })
})
