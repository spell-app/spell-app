import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, it } from "vite-plus/test"

import { AirplaneInbox } from "./AirplaneInbox.ts"

describe("AirplaneInbox.gather()", () => {
  const root = mkdtempSync(join(tmpdir(), "airplane-inbox-"))
  const flight = "2026-10-10T08:00:00.000Z"
  mkdirSync(join(root, "epics", "demo", "details"), { recursive: true })
  mkdirSync(join(root, "epics", "quiet"))
  writeFileSync(
    join(root, "epics", "demo", "demo.inbox.json"),
    JSON.stringify({
      version: 1,
      marks: {
        q1: { action: "approve", at: "2026-10-10T09:00:00.000Z" },
        i2: { action: "revisit", when: "soon", note: "why?", at: "2026-10-10T11:00:00.000Z" }
      },
      drafts: { t3: { action: "todo", note: "half a tho", at: "2026-10-10T11:30:00.000Z" } },
      now: [{ id: "q4", action: "details", at: "2026-10-10T10:00:00.000Z" }],
      sent: "2026-10-10T10:30:00.000Z"
    })
  )
  // an empty inbox:  nothing to say about that epic
  writeFileSync(join(root, "epics", "quiet", "quiet.inbox.json"), JSON.stringify({ version: 1, marks: {} }))
  // one details page answered on the plane, one before it
  for (const [slug, when] of [
    ["onboard", "2026-10-10T12:00:00Z"],
    ["before", "2026-10-09T12:00:00Z"]
  ] as const) {
    const page = join(root, "epics", "demo", "details", `${slug}.html`)
    writeFileSync(page, "<!doctype html>\n")
    writeFileSync(page.replace(/\.html$/, ".answer.json"), JSON.stringify({ answers: {} }))
    utimesSync(page.replace(/\.html$/, ".answer.json"), new Date(when), new Date(when))
  }

  // a guide with a note on its whole page, not yet answered
  mkdirSync(join(root, "guides"))
  writeFileSync(
    join(root, "guides", "guide.html"),
    `<main><spell-notes for="page"><spell-note id="n1" status="new" at="2026-10-10 10:00"><p>Is this still true?</p></spell-note></spell-notes></main>\n`
  )

  afterAll(() => rmSync(root, { recursive: true, force: true }))

  it("takes the page notes not yet answered", () => {
    expect(AirplaneInbox.gather(root).notes).toMatchObject([
      { page: "guides/guide.html", id: "n1", text: "Is this still true?" }
    ])
  })

  it("takes every mark, sent or not, with the drafts and the requests for now", () => {
    const [epic, ...others] = AirplaneInbox.gather(root, { since: flight }).epics
    expect(others).toEqual([])
    expect(epic!.marks.map(({ id, sent }) => `${id} ${sent ? "sent" : "not sent"}`)).toEqual(["q1 sent", "i2 not sent"])
    expect(epic!.drafts).toMatchObject([{ id: "t3", note: "half a tho" }])
    expect(epic!.now).toMatchObject([{ id: "q4", action: "details" }])
  })

  it("lists details pages answered since the flight began;  none without a `since`", () => {
    expect(AirplaneInbox.gather(root, { since: flight }).details.map((page) => page.page)).toEqual([
      "epics/demo/details/onboard.html"
    ])
    expect(AirplaneInbox.gather(root).details).toEqual([])
  })

  it("says it in a line per place", () => {
    expect(AirplaneInbox.gather(root, { since: flight }).lines).toEqual([
      "epic demo:  2 marks (1 not sent), 1 draft, 1 for now",
      expect.stringMatching(/^note guides\/guide\.html n1 \(.*\):  Is this still true\?$/),
      expect.stringMatching(/^details epics\/demo\/details\/onboard\.html:  answered /)
    ])
  })
})
