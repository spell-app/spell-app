/**
 * Tests of `ReviewInbox`:  the methods on an inbox, then the file (read, atomic write, delete when empty, the lock).
 * - From `packages/docs/tools/inbox.test.js` (epic `epic-components`, P7):  every case, on the class.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterAll, describe, expect, test } from "vite-plus/test"

import { InboxError, LISTEN_HEARTBEAT_MS, LISTEN_STALE_MS, ReviewInbox, isoTime } from "./ReviewInbox"

const T1 = "2026-10-04T15:00:00-04:00"
const T2 = "2026-10-04T15:01:00-04:00"
const T3 = "2026-10-04T15:02:00-04:00"

describe("ReviewInbox marks", () => {
  test("set, replace, remove;  ids lower-cased", () => {
    const inbox = new ReviewInbox()
    expect(inbox.setMark("J3", { action: "approve", at: "ignored" }, T1)).toEqual({ action: "approve", at: T1 })
    inbox.setMark("j3", { action: "todo" }, T2)
    expect(inbox.marks).toEqual({ j3: { action: "todo", at: T2 } })
    expect(inbox.setMark("j3", null)).toBeNull()
    expect(inbox.marks).toEqual({})
  })

  test("revisit and pick keep only their own fields", () => {
    expect(ReviewInbox.toMark({ action: "revisit", note: "  why?  ", extra: 1 })).toEqual({
      action: "revisit",
      when: "soon",
      note: "why?"
    })
    expect(ReviewInbox.toMark({ action: "pick", pick: "B", note: "x" })).toEqual({ action: "pick", pick: "B" })
  })

  test("a revisit may carry a pick:  'pick B, but ...'", () => {
    expect(ReviewInbox.toMark({ action: "revisit", note: " only plan docs? ", pick: "B" })).toEqual({
      action: "revisit",
      when: "soon",
      note: "only plan docs?",
      pick: "B"
    })
    expect(ReviewInbox.toMark({ action: "revisit", pick: null })).toEqual({ action: "revisit", when: "soon", note: "" })
    for (const pick of ["b", "BB", 2, ""])
      expect(() => ReviewInbox.toMark({ action: "revisit", pick })).toThrow(InboxError)
  })

  test("a pick with a revisit is unsent like any other, and sent with the send", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("q7", { action: "revisit", note: "why?", pick: "B" }, T1)
    expect(inbox.unsentMarks.map((mark) => mark.id)).toEqual(["q7"])
    inbox.markSent(T2)
    expect(inbox.takeWork()!.sent!.marks).toEqual([
      { id: "q7", action: "revisit", when: "soon", note: "why?", pick: "B", at: T1, again: false }
    ])
  })

  test("bad marks throw an InboxError", () => {
    for (const bad of [
      "approve",
      [],
      { action: "nope" },
      { action: "pick" },
      { action: "pick", pick: "b" },
      { action: "revisit", when: "later" },
      { action: "revisit", note: 3 }
    ])
      expect(() => ReviewInbox.toMark(bad)).toThrow(InboxError)
    expect(() => new ReviewInbox().setMark("not an id", { action: "approve" })).toThrow(InboxError)
  })

  test("unsent:  newer than the send, never an immediate request", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("j1", { action: "approve" }, T1)
    inbox.requestNow("i2", "details", "", T1)
    expect(inbox.unsentMarks.map((mark) => mark.id)).toEqual(["j1"])
    inbox.markSent(T2)
    expect(inbox.unsentMarks).toEqual([])
    inbox.setMark("q8", { action: "pick", pick: "B" }, T3)
    expect(inbox.unsentMarks).toEqual([{ id: "q8", action: "pick", pick: "B", at: T3 }])
  })

  test("clearMarks drops the marks and their requests;  returns the ids that had one", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("j1", { action: "approve" }, T1)
    inbox.requestNow("i2", "details", "", T1)
    expect(inbox.clearMarks(["J1", "i2", "t9"])).toEqual(["j1", "i2"])
    expect(inbox.marks).toEqual({})
    expect(inbox.now).toEqual([])
  })
})

// epic `windows-and-review` P2:  "nevermind" on a request Owen no longer wants
describe("ReviewInbox.cancelNow()", () => {
  test("a queued request:  gone with its mark, nobody to tell;  a pick-carrying revisit's pick goes too", () => {
    const inbox = new ReviewInbox()
    inbox.requestNow("i2", "details", "", T1)
    expect(inbox.cancelNow("I2", T2)).toEqual({ action: "details", at: T2, told: true })
    expect(inbox.now).toEqual([])
    expect(inbox.marks).toEqual({})
    expect(inbox.isCanceled("i2")).toBe(true)
    expect(inbox.hasWork).toBe(false)
  })

  test("work a session took:  its working goes, and the next take tells it once", () => {
    const inbox = new ReviewInbox()
    inbox.requestNow("q3", "revisit", "why?", T1)
    inbox.takeWork(T1)
    inbox.cancelNow("q3", T2)
    expect(inbox.working).toEqual({})
    expect(inbox.hasWork).toBe(true)
    expect(inbox.takeWork(T3)).toEqual({ now: [], sent: null, canceled: [{ id: "q3", action: "revisit", at: T2 }] })
    expect(inbox.hasWork).toBe(false)
  })

  test("nothing asked:  null, and a mark waiting for a send stays", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("j1", { action: "approve" }, T1)
    expect(inbox.cancelNow("j1")).toBe(null)
    expect(inbox.marks.j1.action).toBe("approve")
  })

  test("asked again, or done with:  the cancel is over", () => {
    const inbox = new ReviewInbox()
    inbox.requestNow("i2", "details", "", T1)
    inbox.cancelNow("i2", T2)
    inbox.requestNow("i2", "details", "", T3)
    expect(inbox.isCanceled("i2")).toBe(false)
    inbox.cancelNow("i2", T3)
    inbox.clearMarks(["i2"])
    expect(inbox.isCanceled("i2")).toBe(false)
    expect(inbox.isEmpty).toBe(true)
  })
})

describe("ReviewInbox todo notes", () => {
  test("Make Todo keeps a note, trimmed, only when there is one;  it drops the draft", () => {
    const inbox = new ReviewInbox()
    inbox.setDraft("q3", "todo", "check perf", T1)
    expect(inbox.setMark("q3", { action: "todo", note: "  check perf " }, T2)).toEqual({
      action: "todo",
      note: "check perf",
      at: T2
    })
    expect(inbox.drafts).toEqual({})
    expect(ReviewInbox.toMark({ action: "todo", note: "  " })).toEqual({ action: "todo" })
  })
})

// epic `windows-and-review` P1:  a note box's text kept on the server, as typed, so no address loses it
describe("ReviewInbox.setDraft()", () => {
  test("kept as typed (not trimmed);  blank or null drops it;  an inbox with only a draft isn't empty", () => {
    const inbox = new ReviewInbox()
    expect(inbox.setDraft("Q3", "revisit", "  why not B?\n", T1)).toEqual({
      action: "revisit",
      note: "  why not B?\n",
      at: T1
    })
    expect(inbox.isEmpty).toBe(false)
    expect(inbox.setDraft("q3", "revisit", "   ")).toBe(null)
    expect(inbox.drafts).toEqual({})
    inbox.setDraft("q3", "todo", "later", T1)
    inbox.setDraft("q3", "todo", null)
    expect(inbox.isEmpty).toBe(true)
  })

  test("never a mark:  not counted, never work for a waiting session", () => {
    const inbox = new ReviewInbox()
    inbox.setDraft("q3", "revisit", "why?", T1)
    expect(inbox.unsentMarks).toEqual([])
    expect(inbox.hasWork).toBe(false)
  })

  test("the mark that uses the note drops the draft:  revisit soon, revisit now, Clear;  approve doesn't", () => {
    const inbox = new ReviewInbox()
    inbox.setDraft("q3", "revisit", "why?", T1)
    inbox.setMark("q3", { action: "approve" }, T2)
    expect(inbox.drafts.q3).toBeDefined()
    inbox.setMark("q3", { action: "revisit", note: "why?" }, T2)
    expect(inbox.drafts.q3).toBeUndefined()
    inbox.setDraft("i2", "revisit", "and this", T1)
    inbox.requestNow("i2", "revisit", "and this", T2)
    expect(inbox.drafts.i2).toBeUndefined()
    inbox.setDraft("j1", "revisit", "hmm", T1)
    inbox.setMark("j1", null)
    expect(inbox.drafts.j1).toBeUndefined()
  })

  test("only note actions, only item ids", () => {
    expect(() => new ReviewInbox().setDraft("q3", "approve", "x")).toThrow(InboxError)
    expect(() => new ReviewInbox().setDraft("nope", "revisit", "x")).toThrow(InboxError)
  })
})

describe("ReviewInbox.requestNow()", () => {
  test("details:  queued, and marked", () => {
    const inbox = new ReviewInbox()
    expect(inbox.requestNow("I2", "details", "", T1)).toEqual({ id: "i2", action: "details", at: T1 })
    expect(inbox.marks.i2).toEqual({ action: "details", at: T1 })
  })

  test("revisit now:  the note travels;  a second request replaces the first", () => {
    const inbox = new ReviewInbox()
    inbox.requestNow("q7", "revisit", "first", T1)
    inbox.requestNow("q7", "revisit", " second ", T2)
    expect(inbox.now).toEqual([{ id: "q7", action: "revisit", at: T2, note: "second" }])
    expect(inbox.marks.q7).toEqual({ action: "revisit", when: "now", note: "second", at: T2 })
  })

  test("revisit now keeps the item's pick, on the mark and the request;  details doesn't", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("q7", { action: "pick", pick: "B" }, T1)
    expect(inbox.requestNow("q7", "revisit", "but?", T2)).toEqual({
      id: "q7",
      action: "revisit",
      at: T2,
      note: "but?",
      pick: "B"
    })
    expect(inbox.marks.q7).toEqual({ action: "revisit", when: "now", note: "but?", pick: "B", at: T2 })
    // again, from a revisit carrying it
    inbox.requestNow("q7", "revisit", "and?", T3)
    expect(inbox.marks.q7.pick).toBe("B")
    inbox.requestNow("q7", "details", "", T3)
    expect(inbox.marks.q7).toEqual({ action: "details", at: T3 })
  })

  test("a mark that waits for a send, or none, drops the queued request", () => {
    const inbox = new ReviewInbox()
    inbox.requestNow("q7", "revisit", "", T1)
    inbox.setMark("q7", { action: "revisit", when: "soon" }, T2)
    expect(inbox.now).toEqual([])
    inbox.requestNow("i2", "details", "", T1)
    inbox.setMark("i2", null)
    expect(inbox.now).toEqual([])
  })

  test("only details and revisit", () => {
    expect(() => new ReviewInbox().requestNow("j1", "approve")).toThrow(InboxError)
  })

  test("takeNow empties the queue", () => {
    const inbox = new ReviewInbox()
    inbox.requestNow("i2", "details", "", T1)
    expect(inbox.takeNow().map((each) => each.id)).toEqual(["i2"])
    expect(inbox.now).toEqual([])
    expect(inbox.marks.i2).toBeDefined()
  })
})

describe("ReviewInbox.reviewNow() (windows-and-review P4)", () => {
  test("every waiting revisit asked now, its note and pick kept;  the rest sent", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("j1", { action: "approve" }, T1)
    inbox.setMark("q7", { action: "revisit", when: "soon", note: "but?", pick: "B" }, T1)
    inbox.setMark("i2", { action: "revisit", when: "soon", note: "sent before" }, T1)
    inbox.markSent(T2)
    inbox.setMark("t1", { action: "todo", note: "later" }, T2)
    inbox.setMark("c3", { action: "revisit", when: "soon", note: "fresh" }, T2)
    inbox.requestNow("i5", "details", "", T2)
    expect(inbox.reviewNow(T3).sort((a, b) => a.localeCompare(b))).toEqual(["c3", "i2", "q7"])
    expect(inbox.sent).toBe(T3)
    expect(inbox.marks.q7).toEqual({ action: "revisit", when: "now", note: "but?", pick: "B", at: T3 })
    expect(inbox.now.map((each) => each.id).sort((a, b) => a.localeCompare(b))).toEqual(["c3", "i2", "i5", "q7"])
    // what the send hands over:  the approval and the todo, no revisit
    expect(inbox.sentMarks.map((mark) => mark.id)).toEqual(["j1", "t1"])
    expect(inbox.unsentMarks).toEqual([])
  })

  test("nothing to revisit:  a plain send", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("j1", { action: "approve" }, T1)
    expect(inbox.reviewNow(T2)).toEqual([])
    expect(inbox.sent).toBe(T2)
    expect(inbox.now).toEqual([])
  })
})

describe("ReviewInbox, Claude's side", () => {
  test("working and listening, set and cleared", () => {
    const inbox = new ReviewInbox()
    expect(inbox.setWorking("I2", "details", T1)).toEqual({ action: "details", since: T1 })
    expect(inbox.working).toEqual({ i2: { action: "details", since: T1 } })
    inbox.setWorking("i2", null)
    expect(inbox.working).toEqual({})
    expect(inbox.setListening("abc", T1)).toEqual({ session: "abc", since: T1, seen: T1 })
    expect(inbox.setListening(null)).toBeNull()
  })

  test("heartbeat:  touch stamps seen;  nobody listening, nothing starts", () => {
    const inbox = new ReviewInbox()
    expect(inbox.touchListening(T2)).toBeNull()
    expect(inbox.listening).toBeNull()
    inbox.setListening("abc", T1)
    expect(inbox.touchListening(T2)).toEqual({ session: "abc", since: T1, seen: T2 })
  })

  test("liveListener:  stale once seen is older than LISTEN_STALE_MS;  an old file's since counts", () => {
    const inbox = new ReviewInbox()
    expect(inbox.liveListener()).toBeNull()
    inbox.setListening("abc", T1)
    const seen = Date.parse(T1)
    expect(inbox.liveListener(seen + LISTEN_STALE_MS)).toEqual(inbox.listening)
    expect(inbox.liveListener(seen + LISTEN_STALE_MS + 1)).toBeNull()
    inbox.touchListening(T2)
    expect(inbox.liveListener(seen + LISTEN_STALE_MS + 1)).not.toBeNull()
    inbox.listening = { session: "old", since: T1 }
    expect(inbox.liveListener(seen + LISTEN_STALE_MS + 1)).toBeNull()
    expect(LISTEN_HEARTBEAT_MS * 3).toBe(LISTEN_STALE_MS)
  })

  test("forPage:  the whole inbox, listening null once stale;  the inbox itself untouched", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("j1", { action: "approve" }, T1)
    inbox.setListening("abc", T1)
    const late = inbox.forPage(Date.parse(T1) + LISTEN_STALE_MS + 1)
    expect(late).toEqual({ ...inbox.toRecord(), listening: null })
    expect(inbox.listening!.session).toBe("abc")
    expect(inbox.forPage(Date.parse(T1)).listening!.session).toBe("abc")
  })

  test("finishMarks:  immediate marks go;  one Owen changed meanwhile stays", () => {
    const inbox = new ReviewInbox()
    inbox.requestNow("i2", "details", "", T1)
    inbox.requestNow("q7", "revisit", "why?", T1)
    inbox.takeWork(T2)
    // Owen chooses B on Q7 while the agent works:  the note stays, the pick waits for the send
    inbox.setMark("q7", { action: "revisit", when: "soon", note: "why?", pick: "B" }, T3)
    expect(inbox.finishMarks(["I2", "q7", "t9"])).toEqual({ had: ["i2"], kept: ["q7"] })
    expect(inbox.marks).toEqual({ q7: { action: "revisit", when: "soon", note: "why?", pick: "B", at: T3 } })
  })
})

describe("ReviewInbox.takeWork()", () => {
  test("sentMarks:  at or before the send, never an immediate one;  none before a send", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("j1", { action: "approve" }, T1)
    expect(inbox.sentMarks).toEqual([])
    inbox.requestNow("i2", "details", "", T1)
    inbox.markSent(T2)
    inbox.setMark("q8", { action: "pick", pick: "B" }, T3)
    expect(inbox.sentMarks.map((mark) => mark.id)).toEqual(["j1"])
  })

  test("takeWork:  now requests taken and marked working, their marks kept", () => {
    const inbox = new ReviewInbox()
    inbox.requestNow("i2", "details", "", T1)
    expect(inbox.hasWork).toBe(true)
    expect(inbox.takeWork(T2)).toEqual({ now: [{ id: "i2", action: "details", at: T1 }], sent: null, canceled: [] })
    expect(inbox.working).toEqual({ i2: { action: "details", since: T2 } })
    expect(inbox.marks.i2).toBeDefined()
    expect(inbox.hasWork).toBe(false)
    expect(inbox.takeWork()).toBeNull()
  })

  test("takeWork:  a send is handed over once;  the next send repeats what's left, flagged again", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("j1", { action: "approve" }, T1)
    inbox.setMark("q7", { action: "revisit", note: "why?" }, T1)
    inbox.markSent(T2)
    expect(inbox.hasNewSend).toBe(true)
    const first = inbox.takeWork()!
    expect(first.sent!.at).toBe(T2)
    expect(first.sent!.marks.map((mark) => [mark.id, mark.again])).toEqual([
      ["j1", false],
      ["q7", false]
    ])
    expect(inbox.handedOver).toBe(T2)
    expect(inbox.hasWork).toBe(false)
    // j1 applied;  q7 still being talked over when Owen sends a new mark
    inbox.clearMarks(["j1"])
    inbox.setMark("c1", { action: "todo" }, T3)
    inbox.markSent("2026-10-04T15:03:00-04:00")
    expect(inbox.takeWork()!.sent!.marks.map((mark) => [mark.id, mark.again])).toEqual([
      ["q7", true],
      ["c1", false]
    ])
  })

  test("takeWork:  a send with no marks left is taken quietly", () => {
    const inbox = new ReviewInbox()
    inbox.setListening("abc", T1)
    inbox.markSent(T2)
    expect(inbox.hasWork).toBe(true)
    expect(inbox.takeWork()).toBeNull()
    expect(inbox.hasWork).toBe(false)
  })

  test("clearApplied:  only marks still as applied;  a newer one stays", () => {
    const inbox = new ReviewInbox()
    inbox.setMark("j1", { action: "approve" }, T1)
    inbox.setMark("j2", { action: "approve" }, T1)
    const applied = inbox.markList
    inbox.setMark("j2", { action: "todo" }, T2)
    expect(inbox.clearApplied(applied)).toEqual(["j1"])
    expect(Object.keys(inbox.marks)).toEqual(["j2"])
  })
})

describe("ReviewInbox files", () => {
  const dir = mkdtempSync(join(tmpdir(), "inbox-"))
  const file = join(dir, "x.inbox.json")
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  test("beside the plan doc, either name", () => {
    expect(ReviewInbox.pathFor("/a/epics/x/x.plan.html")).toBe("/a/epics/x/x.inbox.json")
    expect(ReviewInbox.pathFor("/a/epics/x/x.html")).toBe("/a/epics/x/x.inbox.json")
  })

  test("absent:  an empty inbox;  partial:  filled in", () => {
    expect(ReviewInbox.read(file)).toEqual(new ReviewInbox())
    writeFileSync(file, JSON.stringify({ marks: { j1: { action: "approve", at: T1 } } }))
    expect(ReviewInbox.read(file)).toEqual({
      ...new ReviewInbox().toRecord(),
      marks: { j1: { action: "approve", at: T1 } }
    })
    writeFileSync(file, "{ nope")
    expect(() => ReviewInbox.read(file)).toThrow(InboxError)
    rmSync(file)
  })

  test("written under the lock, no temp left;  deleted once empty", () => {
    ReviewInbox.update(file, (inbox) => inbox.setMark("j1", { action: "approve" }, T1))
    expect(JSON.parse(readFileSync(file, "utf8")).marks.j1.action).toBe("approve")
    expect(existsSync(`${file}.tmp`)).toBe(false)
    expect(existsSync(`${file}.lock`)).toBe(false)
    ReviewInbox.update(file, (inbox) => inbox.setMark("j1", null))
    expect(existsSync(file)).toBe(false)
  })

  test("parallel async writers take turns:  none lost", async () => {
    await Promise.all(
      ["j1", "j2", "j3", "j4", "j5"].map((id) =>
        ReviewInbox.updateAsync(file, (inbox) => inbox.setMark(id, { action: "approve" }))
      )
    )
    expect(Object.keys(ReviewInbox.read(file).marks).sort()).toEqual(["j1", "j2", "j3", "j4", "j5"])
  })
})

test("itemIds:  ui-items with an id and a status, not phases", () => {
  const html = `<ui-section id="p5" data-phase="5" data-status="active">
    <ui-item
      data-state="open"
      id="T1"
      data-status="open"></ui-item>
    <ui-item id="q2" data-answered data-status="decided"></ui-item>
    <ui-item icon="bullseye">Goal</ui-item>
    <ui-item data-id="x9" data-status="open"></ui-item>`
  expect([...ReviewInbox.itemIds(html)]).toEqual(["t1", "q2"])
})

test("itemIds:  <epic-item>s and the Overview's sub-sections (Q14), not phases or the page's sections", () => {
  const html = `<epic-overview id="overview"><epic-section
      id="o2" title="Structure"
      kind="overview-part" source="parts/o2.htm"></epic-section></epic-overview>
    <epic-section id="phases" kind="phases"><epic-phase id="p1" title="One" status="done"></epic-phase></epic-section>
    <epic-section id="decisions" kind="questions"><epic-item
      id="Q7" title="which?"
      status="open"></epic-item><epic-item id="q8" status="decided"><span slot="title">a <code>x</code></span></epic-item></epic-section>`
  expect([...ReviewInbox.itemIds(html)]).toEqual(["o2", "q7", "q8"])
})

test("isoTime:  local time with its offset, to the millisecond", () => {
  expect(isoTime(new Date())).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}[+-]\d\d:\d\d$/)
  expect(Date.parse(isoTime(new Date(1_700_000_000_042)))).toBe(1_700_000_000_042)
})

test("a mark in the same second as the send, after it, is unsent", () => {
  const inbox = new ReviewInbox()
  inbox.markSent(isoTime(new Date(1_700_000_000_100)))
  inbox.setMark("j1", { action: "approve" }, isoTime(new Date(1_700_000_000_900)))
  expect(inbox.unsentMarks.map((mark) => mark.id)).toEqual(["j1"])
})
