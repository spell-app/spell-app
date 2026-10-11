import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"

/** A fake `~/.claude`, and a fake checkout holding epic `tooling`. */
const HOME = mkdtempSync(join(tmpdir(), "claude-home-"))
const ROOT = mkdtempSync(join(tmpdir(), "checkout-"))
afterAll(() => {
  rmSync(HOME, { recursive: true, force: true })
  rmSync(ROOT, { recursive: true, force: true })
})

mkdirSync(join(ROOT, "epics", "tooling"), { recursive: true })
writeFileSync(join(ROOT, "epics", "tooling", "tooling.plan.html"), "<html></html>")

/** Two tiny "images":  their bytes are all a test reads. */
const RED = Buffer.from("red pixel").toString("base64")
const BLUE = Buffer.from("blue pixel").toString("base64")

// the sender:  Owen pasted RED, then BLUE;  a tool read a picture, and a subagent saw one, which don't count
transcript("sender11", [
  { type: "custom-title", customTitle: "🚧 python" },
  {
    type: "user",
    message: { content: [{ type: "image", source: { type: "base64", media_type: "image/png", data: RED } }] }
  },
  {
    type: "user",
    message: {
      content: [{ type: "tool_result", content: [{ type: "image", source: { type: "base64", data: "eA==" } }] }]
    }
  },
  {
    type: "user",
    isSidechain: true,
    message: { content: [{ type: "image", source: { type: "base64", media_type: "image/png", data: "eA==" } }] }
  },
  {
    type: "user",
    message: {
      content: [
        { type: "text", text: "comment threads are too tall" },
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: BLUE } }
      ]
    }
  }
])
// the receiver:  running, titled for the epic
transcript("receiver22", [{ type: "custom-title", customTitle: "🚧 tooling" }])
mkdirSync(join(HOME, "sessions"), { recursive: true })
writeFileSync(
  join(HOME, "sessions", `${process.pid}.json`),
  JSON.stringify({ pid: process.pid, sessionId: "receiver22", name: "🚧 tooling", status: "idle" })
)

describe("sendRequest()", () => {
  test("writes Owen's words, the sender and the newest images, and names the epic's running session", () => {
    const sent = CLI.sendRequest({
      root: ROOT,
      epic: "tooling",
      text: 'the "comment" box covers the text',
      from: "sender11",
      images: 2,
      context: "epic python's plan doc, P4",
      home: HOME
    })
    expect(sent.request).toMatchObject({ id: "r1", status: "new", images: ["image-1.png", "image-2.jpg"] })
    expect(sent.request.from).toBe("🚧 python (sender11)")
    expect(sent.receivers.map((it) => it.name)).toEqual(["🚧 tooling"])
    expect(readFileSync(join(sent.folder, "image-1.png"), "utf8")).toBe("red pixel")
    expect(readFileSync(join(sent.folder, "image-2.jpg"), "utf8")).toBe("blue pixel")
    const markdown = readFileSync(join(sent.folder, "request.md"), "utf8")
    expect(markdown).toContain('## Owen\'s words\n\nthe "comment" box covers the text\n')
    expect(markdown).toContain("## Context\n\nepic python's plan doc, P4\n")
  })

  test("numbers each request after the highest one there", () => {
    const sent = CLI.sendRequest({ root: ROOT, epic: "tooling", text: "second", home: HOME })
    expect(sent.request.id).toBe("r2")
    expect(sent.request.images).toEqual([])
  })

  test("keeps only the newest images asked for", () => {
    const sent = CLI.sendRequest({ root: ROOT, epic: "tooling", text: "one", from: "sender11", images: 1, home: HOME })
    expect(readFileSync(join(sent.folder, "image-1.jpg"), "utf8")).toBe("blue pixel")
  })

  test("refuses an epic with no plan doc, and more images than were pasted", () => {
    expect(() => CLI.sendRequest({ root: ROOT, epic: "nope", text: "x", home: HOME })).toThrow(/no epic 'nope'/)
    expect(() =>
      CLI.sendRequest({ root: ROOT, epic: "tooling", text: "x", from: "sender11", images: 5, home: HOME })
    ).toThrow(/pasted 2/)
  })

  test("never names the sender as its own receiver", () => {
    const sent = CLI.sendRequest({ root: ROOT, epic: "tooling", text: "x", from: "receiver22", home: HOME })
    expect(sent.receivers).toEqual([])
    expect(sent.fromEpic).toBe(true)
  })
})

describe("epicRequests() and fileRequest()", () => {
  test("lists the requests oldest first, and files one with where it went", () => {
    expect(CLI.epicRequests(ROOT, "tooling").map((it) => it.id)).toEqual(["r1", "r2", "r3", "r4"])
    const filed = CLI.fileRequest(ROOT, "tooling", "r1", "P7 · Comment Threads")
    expect(filed).toMatchObject({
      status: "filed",
      filed: "P7 · Comment Threads",
      text: 'the "comment" box covers the text'
    })
    expect(CLI.epicRequests(ROOT, "tooling")[0]).toEqual(filed)
  })

  test("an epic with no requests has none;  filing a missing one throws", () => {
    expect(CLI.epicRequests(ROOT, "nope")).toEqual([])
    expect(() => CLI.fileRequest(ROOT, "tooling", "r99", "P1")).toThrow(/no request 'r99'/)
  })
})

describe("epicHome() and setEpicHome()", () => {
  test("none until set;  only an epic with a plan doc", () => {
    expect(CLI.epicHome(ROOT)).toBeNull()
    expect(() => CLI.setEpicHome(ROOT, "nope")).toThrow(/no epic 'nope'/)
    CLI.setEpicHome(ROOT, "tooling")
    expect(CLI.epicHome(ROOT)).toBe("tooling")
  })
})

describe("nextRequestId()", () => {
  test("r1 for a missing folder", () => {
    expect(CLI.nextRequestId(join(ROOT, "missing"))).toBe("r1")
    expect(existsSync(join(ROOT, "missing"))).toBe(false)
  })
})

/** Write transcript `id` into the fake home, one JSON line per entry. */
function transcript(id: string, entries: object[]): void {
  const folder = join(HOME, "projects", "-repo")
  mkdirSync(folder, { recursive: true })
  writeFileSync(join(folder, `${id}.jsonl`), entries.map((entry) => JSON.stringify(entry)).join("\n") + "\n")
}
