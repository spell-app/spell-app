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
})
