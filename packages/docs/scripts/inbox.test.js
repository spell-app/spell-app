/**
 * Tests of `inbox.js`:  the helpers on an inbox object, then the file (read, atomic write, delete when empty, the
 * lock).
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, test } from "vitest"

import {
  InboxError,
  LISTEN_HEARTBEAT_MS,
  LISTEN_STALE_MS,
  clearApplied,
  clearMarks,
  emptyInbox,
  finishMarks,
  forPage,
  hasWork,
  inboxPath,
  isoTime,
  itemIds,
  liveListener,
  markList,
  markSent,
  newSend,
  readInbox,
  requestNow,
  sentMarks,
  setListening,
  setMark,
  setWorking,
  takeNow,
  takeWork,
  toMark,
  touchListening,
  unsentMarks,
  updateInbox,
  updateInboxAsync
} from "./inbox.js"

const T1 = "2026-10-04T15:00:00-04:00"
const T2 = "2026-10-04T15:01:00-04:00"
const T3 = "2026-10-04T15:02:00-04:00"

describe("marks", () => {
  test("set, replace, remove;  ids lower-cased", () => {
    const inbox = emptyInbox()
    expect(setMark(inbox, "J3", { action: "approve", at: "ignored" }, T1)).toEqual({ action: "approve", at: T1 })
    setMark(inbox, "j3", { action: "todo" }, T2)
    expect(inbox.marks).toEqual({ j3: { action: "todo", at: T2 } })
    expect(setMark(inbox, "j3", null)).toBeNull()
    expect(inbox.marks).toEqual({})
  })

  test("revisit and pick keep only their own fields", () => {
    expect(toMark({ action: "revisit", note: "  why?  ", extra: 1 })).toEqual({
      action: "revisit",
      when: "soon",
      note: "why?"
    })
    expect(toMark({ action: "pick", pick: "B", note: "x" })).toEqual({ action: "pick", pick: "B" })
  })

  test("a revisit may carry a pick:  'pick B, but ...'", () => {
    expect(toMark({ action: "revisit", note: " only plan docs? ", pick: "B" })).toEqual({
      action: "revisit",
      when: "soon",
      note: "only plan docs?",
      pick: "B"
    })
    expect(toMark({ action: "revisit", pick: null })).toEqual({ action: "revisit", when: "soon", note: "" })
    for (const pick of ["b", "BB", 2, ""]) expect(() => toMark({ action: "revisit", pick })).toThrow(InboxError)
  })

  test("a pick with a revisit is unsent like any other, and sent with the send", () => {
    const inbox = emptyInbox()
    setMark(inbox, "q7", { action: "revisit", note: "why?", pick: "B" }, T1)
    expect(unsentMarks(inbox).map((mark) => mark.id)).toEqual(["q7"])
    markSent(inbox, T2)
    expect(takeWork(inbox).sent.marks).toEqual([
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
      expect(() => toMark(bad)).toThrow(InboxError)
    expect(() => setMark(emptyInbox(), "not an id", { action: "approve" })).toThrow(InboxError)
  })

  test("unsent:  newer than the send, never an immediate request", () => {
    const inbox = emptyInbox()
    setMark(inbox, "j1", { action: "approve" }, T1)
    requestNow(inbox, "i2", "details", "", T1)
    expect(unsentMarks(inbox).map((mark) => mark.id)).toEqual(["j1"])
    markSent(inbox, T2)
    expect(unsentMarks(inbox)).toEqual([])
    setMark(inbox, "q8", { action: "pick", pick: "B" }, T3)
    expect(unsentMarks(inbox)).toEqual([{ id: "q8", action: "pick", pick: "B", at: T3 }])
  })

  test("clearMarks drops the marks and their requests;  returns the ids that had one", () => {
    const inbox = emptyInbox()
    setMark(inbox, "j1", { action: "approve" }, T1)
    requestNow(inbox, "i2", "details", "", T1)
    expect(clearMarks(inbox, ["J1", "i2", "t9"])).toEqual(["j1", "i2"])
    expect(inbox.marks).toEqual({})
    expect(inbox.now).toEqual([])
  })
})

describe("immediate requests", () => {
  test("details:  queued, and marked", () => {
    const inbox = emptyInbox()
    expect(requestNow(inbox, "I2", "details", "", T1)).toEqual({ id: "i2", action: "details", at: T1 })
    expect(inbox.marks.i2).toEqual({ action: "details", at: T1 })
  })

  test("revisit now:  the note travels;  a second request replaces the first", () => {
    const inbox = emptyInbox()
    requestNow(inbox, "q7", "revisit", "first", T1)
    requestNow(inbox, "q7", "revisit", " second ", T2)
    expect(inbox.now).toEqual([{ id: "q7", action: "revisit", at: T2, note: "second" }])
    expect(inbox.marks.q7).toEqual({ action: "revisit", when: "now", note: "second", at: T2 })
  })

  test("revisit now keeps the item's pick, on the mark and the request;  details doesn't", () => {
    const inbox = emptyInbox()
    setMark(inbox, "q7", { action: "pick", pick: "B" }, T1)
    expect(requestNow(inbox, "q7", "revisit", "but?", T2)).toEqual({
      id: "q7",
      action: "revisit",
      at: T2,
      note: "but?",
      pick: "B"
    })
    expect(inbox.marks.q7).toEqual({ action: "revisit", when: "now", note: "but?", pick: "B", at: T2 })
    // again, from a revisit carrying it
    requestNow(inbox, "q7", "revisit", "and?", T3)
    expect(inbox.marks.q7.pick).toBe("B")
    requestNow(inbox, "q7", "details", "", T3)
    expect(inbox.marks.q7).toEqual({ action: "details", at: T3 })
  })

  test("a mark that waits for a send, or none, drops the queued request", () => {
    const inbox = emptyInbox()
    requestNow(inbox, "q7", "revisit", "", T1)
    setMark(inbox, "q7", { action: "revisit", when: "soon" }, T2)
    expect(inbox.now).toEqual([])
    requestNow(inbox, "i2", "details", "", T1)
    setMark(inbox, "i2", null)
    expect(inbox.now).toEqual([])
  })

  test("only details and revisit", () => {
    expect(() => requestNow(emptyInbox(), "j1", "approve")).toThrow(InboxError)
  })

  test("takeNow empties the queue", () => {
    const inbox = emptyInbox()
    requestNow(inbox, "i2", "details", "", T1)
    expect(takeNow(inbox).map((each) => each.id)).toEqual(["i2"])
    expect(inbox.now).toEqual([])
    expect(inbox.marks.i2).toBeDefined()
  })
})

describe("Claude's side", () => {
  test("working and listening, set and cleared", () => {
    const inbox = emptyInbox()
    expect(setWorking(inbox, "I2", "details", T1)).toEqual({ action: "details", since: T1 })
    expect(inbox.working).toEqual({ i2: { action: "details", since: T1 } })
    setWorking(inbox, "i2", null)
    expect(inbox.working).toEqual({})
    expect(setListening(inbox, "abc", T1)).toEqual({ session: "abc", since: T1, seen: T1 })
    expect(setListening(inbox, null)).toBeNull()
  })

  test("heartbeat:  touch stamps seen;  nobody listening, nothing starts", () => {
    const inbox = emptyInbox()
    expect(touchListening(inbox, T2)).toBeNull()
    expect(inbox.listening).toBeNull()
    setListening(inbox, "abc", T1)
    expect(touchListening(inbox, T2)).toEqual({ session: "abc", since: T1, seen: T2 })
  })

  test("liveListener:  stale once seen is older than LISTEN_STALE_MS;  an old file's since counts", () => {
    const inbox = emptyInbox()
    expect(liveListener(inbox)).toBeNull()
    setListening(inbox, "abc", T1)
    const seen = Date.parse(T1)
    expect(liveListener(inbox, seen + LISTEN_STALE_MS)).toEqual(inbox.listening)
    expect(liveListener(inbox, seen + LISTEN_STALE_MS + 1)).toBeNull()
    touchListening(inbox, T2)
    expect(liveListener(inbox, seen + LISTEN_STALE_MS + 1)).not.toBeNull()
    inbox.listening = { session: "old", since: T1 }
    expect(liveListener(inbox, seen + LISTEN_STALE_MS + 1)).toBeNull()
    expect(LISTEN_HEARTBEAT_MS * 3).toBe(LISTEN_STALE_MS)
  })

  test("forPage:  the whole inbox, listening null once stale;  the inbox itself untouched", () => {
    const inbox = emptyInbox()
    setMark(inbox, "j1", { action: "approve" }, T1)
    setListening(inbox, "abc", T1)
    const late = forPage(inbox, Date.parse(T1) + LISTEN_STALE_MS + 1)
    expect(late).toEqual({ ...inbox, listening: null })
    expect(inbox.listening.session).toBe("abc")
    expect(forPage(inbox, Date.parse(T1)).listening.session).toBe("abc")
  })

  test("finishMarks:  immediate marks go;  one Owen changed meanwhile stays", () => {
    const inbox = emptyInbox()
    requestNow(inbox, "i2", "details", "", T1)
    requestNow(inbox, "q7", "revisit", "why?", T1)
    takeWork(inbox, T2)
    // Owen chooses B on Q7 while the agent works:  the note stays, the pick waits for the send
    setMark(inbox, "q7", { action: "revisit", when: "soon", note: "why?", pick: "B" }, T3)
    expect(finishMarks(inbox, ["I2", "q7", "t9"])).toEqual({ had: ["i2"], kept: ["q7"] })
    expect(inbox.marks).toEqual({ q7: { action: "revisit", when: "soon", note: "why?", pick: "B", at: T3 } })
  })
})

describe("waiting for work", () => {
  test("sentMarks:  at or before the send, never an immediate one;  none before a send", () => {
    const inbox = emptyInbox()
    setMark(inbox, "j1", { action: "approve" }, T1)
    expect(sentMarks(inbox)).toEqual([])
    requestNow(inbox, "i2", "details", "", T1)
    markSent(inbox, T2)
    setMark(inbox, "q8", { action: "pick", pick: "B" }, T3)
    expect(sentMarks(inbox).map((mark) => mark.id)).toEqual(["j1"])
  })

  test("takeWork:  now requests taken and marked working, their marks kept", () => {
    const inbox = emptyInbox()
    requestNow(inbox, "i2", "details", "", T1)
    expect(hasWork(inbox)).toBe(true)
    expect(takeWork(inbox, T2)).toEqual({ now: [{ id: "i2", action: "details", at: T1 }], sent: null })
    expect(inbox.working).toEqual({ i2: { action: "details", since: T2 } })
    expect(inbox.marks.i2).toBeDefined()
    expect(hasWork(inbox)).toBe(false)
    expect(takeWork(inbox)).toBeNull()
  })

  test("takeWork:  a send is handed over once;  the next send repeats what's left, flagged again", () => {
    const inbox = emptyInbox()
    setMark(inbox, "j1", { action: "approve" }, T1)
    setMark(inbox, "q7", { action: "revisit", note: "why?" }, T1)
    markSent(inbox, T2)
    expect(newSend(inbox)).toBe(true)
    const first = takeWork(inbox)
    expect(first.sent.at).toBe(T2)
    expect(first.sent.marks.map((mark) => [mark.id, mark.again])).toEqual([
      ["j1", false],
      ["q7", false]
    ])
    expect(inbox.handedOver).toBe(T2)
    expect(hasWork(inbox)).toBe(false)
    // j1 applied;  q7 still being talked over when Owen sends a new mark
    clearMarks(inbox, ["j1"])
    setMark(inbox, "c1", { action: "todo" }, T3)
    markSent(inbox, "2026-10-04T15:03:00-04:00")
    expect(takeWork(inbox).sent.marks.map((mark) => [mark.id, mark.again])).toEqual([
      ["q7", true],
      ["c1", false]
    ])
  })

  test("takeWork:  a send with no marks left is taken quietly", () => {
    const inbox = emptyInbox()
    setListening(inbox, "abc", T1)
    markSent(inbox, T2)
    expect(hasWork(inbox)).toBe(true)
    expect(takeWork(inbox)).toBeNull()
    expect(hasWork(inbox)).toBe(false)
  })

  test("clearApplied:  only marks still as applied;  a newer one stays", () => {
    const inbox = emptyInbox()
    setMark(inbox, "j1", { action: "approve" }, T1)
    setMark(inbox, "j2", { action: "approve" }, T1)
    const applied = markList(inbox)
    setMark(inbox, "j2", { action: "todo" }, T2)
    expect(clearApplied(inbox, applied)).toEqual(["j1"])
    expect(Object.keys(inbox.marks)).toEqual(["j2"])
  })
})

describe("the file", () => {
  const dir = mkdtempSync(join(tmpdir(), "inbox-"))
  const file = join(dir, "x.inbox.json")
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  test("beside the plan doc, either name", () => {
    expect(inboxPath("/a/epics/x/x.plan.html")).toBe("/a/epics/x/x.inbox.json")
    expect(inboxPath("/a/epics/x/x.html")).toBe("/a/epics/x/x.inbox.json")
  })

  test("absent:  an empty inbox;  partial:  filled in", () => {
    expect(readInbox(file)).toEqual(emptyInbox())
    writeFileSync(file, JSON.stringify({ marks: { j1: { action: "approve", at: T1 } } }))
    expect(readInbox(file)).toEqual({ ...emptyInbox(), marks: { j1: { action: "approve", at: T1 } } })
    writeFileSync(file, "{ nope")
    expect(() => readInbox(file)).toThrow(InboxError)
    rmSync(file)
  })

  test("written under the lock, no temp left;  deleted once empty", () => {
    updateInbox(file, (inbox) => setMark(inbox, "j1", { action: "approve" }, T1))
    expect(JSON.parse(readFileSync(file, "utf8")).marks.j1.action).toBe("approve")
    expect(existsSync(`${file}.tmp`)).toBe(false)
    expect(existsSync(`${file}.lock`)).toBe(false)
    updateInbox(file, (inbox) => setMark(inbox, "j1", null))
    expect(existsSync(file)).toBe(false)
  })

  test("parallel async writers take turns:  none lost", async () => {
    await Promise.all(
      ["j1", "j2", "j3", "j4", "j5"].map((id) =>
        updateInboxAsync(file, (inbox) => setMark(inbox, id, { action: "approve" }))
      )
    )
    expect(Object.keys(readInbox(file).marks).sort()).toEqual(["j1", "j2", "j3", "j4", "j5"])
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
  expect([...itemIds(html)]).toEqual(["t1", "q2"])
})

test("isoTime:  local time with its offset, to the millisecond", () => {
  expect(isoTime(new Date())).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}[+-]\d\d:\d\d$/)
  expect(Date.parse(isoTime(new Date(1_700_000_000_042)))).toBe(1_700_000_000_042)
})

test("a mark in the same second as the send, after it, is unsent", () => {
  const inbox = emptyInbox()
  markSent(inbox, isoTime(new Date(1_700_000_000_100)))
  setMark(inbox, "j1", { action: "approve" }, isoTime(new Date(1_700_000_000_900)))
  expect(unsentMarks(inbox).map((mark) => mark.id)).toEqual(["j1"])
})
