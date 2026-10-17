/**
 * Every writer and reader of the tooling's data files (epic `epic-workflow` P21), on a scratch checkout:
 * - each WRITER keeps a comment Owen added to the file by hand, and writes the `.json5` name (its old `.json` gone)
 * - each READER still reads a file by its old `.json` name, as a checkout on older code writes it
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { afterAll, describe, expect, test } from "vite-plus/test"

import { FAVORITES_FILE } from "$/epics/list/EpicCards"
import { RunningEpics } from "$/epics/list/RunningEpics"
import { setFavorite } from "$/epics/tool/epicRoutes"
import { GuideInbox } from "$/epics/tool/GuideInbox"
import { ReviewInbox } from "$/epics/tool/ReviewInbox"
import { Sagas } from "$/epics/tool/Sagas"

import { AgentList } from "../../../../packages/epics/tools/AgentList"
import { isChoicesPage, readRows } from "../../../../packages/epics/tools/choices.js"
import { saveAnswer as saveChoices } from "../../../../packages/epics/tools/choicesRoutes"
import { readAnswer, readDraft } from "../../../../packages/epics/tools/details.js"
import { saveAnswer as saveDetails } from "../../../../packages/epics/tools/detailsRoutes"
import { GuideChanges } from "../../../../packages/epics/tools/GuideChanges"

const root = mkdtempSync(join(tmpdir(), "data-files-"))
afterAll(() => rmSync(root, { recursive: true, force: true }))

/** Write `text` to `path` (from the checkout's root), making its folders;  its absolute path. */
function put(path: string, text: string): string {
  const file = join(root, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
  return file
}

/** The text of `path`, from the checkout's root. */
function read(path: string): string {
  return readFileSync(join(root, path), "utf8")
}

/** Owen's comment, as he'd add it by hand at a data file's top. */
const NOTE = "// Owen:  leave this here"

/** `json` with Owen's comment on a line of its own at the top. */
function commented(json: string): string {
  return `${NOTE}\n${json}\n`
}

describe("writers keep a hand-added comment", () => {
  test("ReviewInbox:  update() and updateAsync()", async () => {
    const file = put("epics/a/a.inbox.json5", commented('{ "version": 1, "marks": {} }'))
    ReviewInbox.update(file, (inbox) => inbox.setListening("session-1"))
    expect(read("epics/a/a.inbox.json5")).toContain(NOTE)
    await ReviewInbox.updateAsync(file, (inbox) => inbox.setListening("session-2"))
    expect(read("epics/a/a.inbox.json5")).toContain(NOTE)
    expect(ReviewInbox.read(file).listening?.session).toBe("session-2")
  })

  test("GuideInbox", () => {
    const file = put("guides/g.inbox.json5", commented('{ "version": 1, "comments": {} }'))
    put("guides/g.html", "<title>G</title>")
    GuideInbox.update(file, (comments) =>
      comments.add({ anchor: "model#table-2", kind: "table", label: "1. The model", excerpt: "x" }, "Too long?")
    )
    expect(read("guides/g.inbox.json5")).toContain(NOTE)
    expect(Object.keys(GuideInbox.read(file).comments)).toEqual(["m1"])
  })

  test("AgentList:  add(), and redirect() through the page server's save", async () => {
    put("epics/b/b.plan.html", "<!doctype html>")
    put("epics/b/agents.json5", commented("[]"))
    const list = new AgentList(root, { epic: "b" })
    list.add("one", "a task")
    expect(read("epics/b/agents.json5")).toContain(NOTE)
    await list.redirect("one", "look at P3 first")
    expect(read("epics/b/agents.json5")).toContain(NOTE)
    expect(list.agents[0]!.redirects?.[0]?.note).toBe("look at P3 first")
  })

  test("a details page's answer (detailsRoutes)", async () => {
    const page = put("pages/details/d.html", "<title>D</title>")
    put("pages/details/d.answer.json5", commented('{ "changes": 0 }'))
    await saveDetails(page, "/pages/details/d.html", {}, "my notes")
    expect(read("pages/details/d.answer.json5")).toContain(NOTE)
    expect(readAnswer(page)).toMatchObject({ changes: 1, notes: "my notes" })
  })

  test("a choice page's draft and answer (choicesRoutes)", async () => {
    const page = put("pages/details/c.html", "<title>C</title>")
    put("pages/details/c.draft.json5", commented("{}"))
    put("pages/details/c.answer.json5", commented('{ "changes": 0 }'))
    await saveChoices(page, "/pages/details/c.html", { r1: "isOpen" }, "")
    expect(read("pages/details/c.draft.json5")).toContain(NOTE)
    expect(read("pages/details/c.answer.json5")).toContain(NOTE)
  })

  test("Sagas:  save()", () => {
    put("sagas/sagas.json5", commented('{ "sagas": [] }'))
    new Sagas(root).save([{ id: "epics", title: "Epic Tooling", purpose: "how Owen works" }])
    expect(read("sagas/sagas.json5")).toContain(NOTE)
  })

  test("the favourites:  setFavorite() (epicRoutes)", async () => {
    put(FAVORITES_FILE, commented('["airplane"]'))
    expect(await setFavorite(root, "seo", true)).toEqual(["airplane", "seo"])
    expect(read(FAVORITES_FILE)).toContain(NOTE)
  })
})

describe("readers read the old .json name", () => {
  test("ReviewInbox:  read, then written as .json5, the old file gone", () => {
    put("epics/old/old.inbox.json", '{ "version": 1, "marks": { "j1": { "action": "approve", "at": "x" } } }')
    const file = ReviewInbox.pathFor(join(root, "epics/old/old.plan.html"))
    expect(Object.keys(ReviewInbox.read(file).marks)).toEqual(["j1"])
    ReviewInbox.update(file, (inbox) => inbox.setListening("session-1"))
    expect(existsSync(join(root, "epics/old/old.inbox.json"))).toBe(false)
    expect(Object.keys(ReviewInbox.read(file).marks)).toEqual(["j1"])
  })

  test("GuideInbox (its comments' old cm1 keys read as m1), and GuideChanges listing it by its new name", () => {
    put("guides/old/old.html", "<title>Old</title>")
    put("guides/old/old.inbox.json", JSON.stringify({ version: 1, comments: { cm1: { text: "x", status: "new" } } }))
    const file = GuideInbox.fileFor(join(root, "guides/old/old.html"))
    expect(Object.keys(GuideInbox.read(file).comments)).toEqual(["m1"])
    expect(new GuideChanges({ root }).inboxFiles()).toContain(file)
  })

  test("AgentList", () => {
    put("epics/c/c.plan.html", "<!doctype html>")
    put("epics/c/agents.json", JSON.stringify([{ name: "c-one", task: "t", status: "active", started: "x" }]))
    expect(new AgentList(root, { epic: "c" }).agents.map((agent) => agent.name)).toEqual(["c-one"])
  })

  test("a details page's answer and draft (details.js)", () => {
    const page = put("pages/details/old.html", "<title>Old</title>")
    put("pages/details/old.answer.json", JSON.stringify({ answered: "2026-10-01T00:00:00Z", answers: {} }))
    put("pages/details/old.draft.json", JSON.stringify({ saved: "2026-10-02T00:00:00Z", answers: {} }))
    expect(readAnswer(page)).toMatchObject({ answered: "2026-10-01T00:00:00Z" })
    expect(readDraft(page)).toMatchObject({ saved: "2026-10-02T00:00:00Z" })
  })

  test("a choice page's rows (choices.js)", () => {
    const page = put("pages/details/rows.html", "<title>Rows</title>")
    put("pages/details/rows.rows.json", JSON.stringify({ sections: [], rows: [{ id: "r1" }] }))
    expect(isChoicesPage(page)).toBe(true)
    expect(readRows(page).rows).toEqual([{ id: "r1" }])
  })

  test("Sagas", () => {
    const other = mkdtempSync(join(tmpdir(), "data-files-sagas-"))
    mkdirSync(join(other, "sagas"))
    writeFileSync(join(other, "sagas/sagas.json"), JSON.stringify({ sagas: [{ id: "x", title: "X", purpose: "" }] }))
    expect(new Sagas(other).ids()).toEqual(["x"])
    rmSync(other, { recursive: true, force: true })
  })

  test("the favourites (RunningEpics)", () => {
    const other = mkdtempSync(join(tmpdir(), "data-files-favorites-"))
    mkdirSync(join(other, "epics"))
    writeFileSync(join(other, "epics/favorites.json"), '["seo"]')
    expect(new RunningEpics(other).favorites()).toEqual(new Set(["seo"]))
    rmSync(other, { recursive: true, force: true })
  })
})
