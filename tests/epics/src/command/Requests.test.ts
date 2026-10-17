import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { afterAll, describe, expect, test } from "vite-plus/test"

import { type SendRequestProps } from "$/epics/command/command.types"
import { Requests } from "$/epics/command/Requests"
import { Sessions } from "$/epics/command/Sessions"

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
    const sent = send({
      root: ROOT,
      epic: "tooling",
      text: 'the "comment" box covers the text',
      from: "sender11",
      images: 2,
      context: "epic python's epic page, P4",
      home: HOME
    })
    expect(sent.request).toMatchObject({ id: "r1", status: "new", images: ["image-1.png", "image-2.jpg"] })
    expect(sent.request.from).toBe("🚧 python (sender11)")
    expect(sent.receivers.map((it) => it.name)).toEqual(["🚧 tooling"])
    expect(readFileSync(join(sent.folder, "image-1.png"), "utf8")).toBe("red pixel")
    expect(readFileSync(join(sent.folder, "image-2.jpg"), "utf8")).toBe("blue pixel")
    const markdown = readFileSync(join(sent.folder, "request.md"), "utf8")
    expect(markdown).toContain('## Owen\'s words\n\nthe "comment" box covers the text\n')
    expect(markdown).toContain("## Context\n\nepic python's epic page, P4\n")
  })

  test("numbers each request after the highest one there", () => {
    const sent = send({ root: ROOT, epic: "tooling", text: "second", home: HOME })
    expect(sent.request.id).toBe("r2")
    expect(sent.request.images).toEqual([])
  })

  test("keeps only the newest images asked for", () => {
    const sent = send({ root: ROOT, epic: "tooling", text: "one", from: "sender11", images: 1, home: HOME })
    expect(readFileSync(join(sent.folder, "image-1.jpg"), "utf8")).toBe("blue pixel")
  })

  test("refuses an epic with no epic page, and more images than were pasted", () => {
    expect(() => send({ root: ROOT, epic: "nope", text: "x", home: HOME })).toThrow(/no epic 'nope'/)
    expect(() => send({ root: ROOT, epic: "tooling", text: "x", from: "sender11", images: 5, home: HOME })).toThrow(
      /pasted 2/
    )
  })

  test("never names the sender as its own receiver", () => {
    const sent = send({ root: ROOT, epic: "tooling", text: "x", from: "receiver22", home: HOME })
    expect(sent.receivers).toEqual([])
    expect(sent.fromEpic).toBe(true)
  })
})

describe("epicRequests() and fileRequest()", () => {
  test("lists the requests oldest first, and files one with where it went", () => {
    expect(
      requestsIn(ROOT)
        .list("tooling")
        .map((it) => it.id)
    ).toEqual(["r1", "r2", "r3", "r4"])
    const filed = requestsIn(ROOT).file("tooling", "r1", "P7 · Comment Threads")
    expect(filed).toMatchObject({
      status: "filed",
      filed: "P7 · Comment Threads",
      text: 'the "comment" box covers the text'
    })
    expect(requestsIn(ROOT).list("tooling")[0]).toEqual(filed)
  })

  test("an epic with no requests has none;  filing a missing one throws", () => {
    expect(requestsIn(ROOT).list("nope")).toEqual([])
    expect(() => requestsIn(ROOT).file("tooling", "r99", "P1")).toThrow(/no request 'r99'/)
  })
})

describe("requestHTML()", () => {
  test("quotes his words (escaped), then the context, when, and each screenshot", () => {
    const html = Requests.html({
      id: "r3",
      epic: "tooling",
      from: "🚧 python (sender11)",
      at: "2026-10-11T06:10-04:00",
      status: "new",
      text: "the <b> box\n\ncovers it",
      context: "P4",
      images: ["image-1.png"]
    })
    expect(html).toContain("<blockquote><p>the &lt;b&gt; box</p><p>covers it</p></blockquote>")
    expect(html).toContain("<p>Looking at:  P4</p>")
    expect(html).toContain('<a href="requests/r3/request.md">')
    expect(html).toContain('<img src="requests/r3/image-1.png" alt="r3, screenshot 1"')
  })
})

describe("epicHome() and setEpicHome()", () => {
  test("none until set;  only an epic with an epic page", () => {
    expect(requestsIn(ROOT).home()).toBeNull()
    expect(() => requestsIn(ROOT).setHome("nope")).toThrow(/no epic 'nope'/)
    requestsIn(ROOT).setHome("tooling")
    expect(requestsIn(ROOT).home()).toBe("tooling")
  })

  test("epics/home.json5 (epic `epic-workflow` P21):  its old home.json read;  a comment added by hand kept", () => {
    const home = join(ROOT, "epics", "home.json5")
    rmSync(home, { force: true })
    writeFileSync(join(ROOT, "epics", "home.json"), '{ "epic": "tooling", "set": "2026-10-11" }')
    expect(requestsIn(ROOT).home()).toBe("tooling")
    writeFileSync(home, '// Owen:  where tooling requests go\n{ "epic": "tooling", "set": "2026-10-11" }\n')
    requestsIn(ROOT).setHome("tooling")
    expect(readFileSync(home, "utf8")).toContain("// Owen:  where tooling requests go")
    expect(existsSync(join(ROOT, "epics", "home.json"))).toBe(false)
  })
})

describe("nextRequestId()", () => {
  test("r1 for a missing folder", () => {
    expect(Requests.nextId(join(ROOT, "missing"))).toBe("r1")
    expect(existsSync(join(ROOT, "missing"))).toBe(false)
  })
})

/** Write transcript `id` into the fake home, one JSON line per entry. */
function transcript(id: string, entries: object[]): void {
  const folder = join(HOME, "projects", "-repo")
  mkdirSync(folder, { recursive: true })
  writeFileSync(join(folder, `${id}.jsonl`), entries.map((entry) => JSON.stringify(entry)).join("\n") + "\n")
}

/** The requests of the checkout at `root`, its sessions read from the fake home. */
function requestsIn(root: string): Requests {
  return new Requests({ root, sessions: new Sessions({ home: HOME }) })
}

/** `Requests.send()` for the checkout at `root`, as the fake home's sessions see it. */
function send({ root, home, ...props }: SendRequestProps & { root: string; home: string }) {
  return new Requests({ root, sessions: new Sessions({ home }) }).send(props)
}
