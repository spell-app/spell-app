import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { ChoicesForm } from "./ChoicesForm"
import { CHOICES_SAVE_MS, type ChoiceRowPart } from "./answers.types"

////////////////
// ## Fakes
////////////////

const PAGE = "/epics/big/details/names.html"

/** The page server's choices routes, as `fetch`:  the draft and answer it holds, every POST as `[what, body]`. */
class FakeServer {
  draft: Record<string, unknown> | null = null
  answer: Record<string, unknown> | null = null
  posts: [string, Record<string, unknown>][] = []

  readonly fetch = vi.fn(async (url: string, init?: RequestInit): Promise<Response> => {
    const what = /\/api\/choices\/(draft|answer)/.exec(url)![1] as "draft" | "answer"
    if (!init?.method) return json({ [what]: this[what] })
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    this.posts.push([what, body])
    if (what === "draft") this.draft = { ...body, saved: "2026-10-14T04:01:00.000Z" }
    else this.answer = { ...body, answered: "2026-10-14T04:02:00.000Z", changes: this.answer ? 1 : 0 }
    return json({ ok: true, [what]: this[what] })
  })
}

/** `body` as a JSON response. */
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
}

/** A row:  its box holds `value`, the recommendation until typed over. */
class FakeRow implements ChoiceRowPart {
  readonly domElement = {} as Element
  typed: string | undefined
  constructor(
    readonly rowName: string,
    readonly recommended: string
  ) {}
  get value() {
    return this.typed ?? this.recommended
  }
  get isChanged() {
    return this.value.trim() !== this.recommended
  }
  showValue(value: string) {
    this.typed = value
  }
}

/** A form on `server` for `page`. */
function formOn(server: FakeServer, page = PAGE) {
  return new ChoicesForm({
    page,
    server: { token: "t" },
    protocol: "http:",
    fetch: server.fetch as unknown as typeof fetch
  })
}

afterEach(() => {
  vi.useRealTimers()
})

////////////////
// ## Tests
////////////////

describe("ChoicesForm", () => {
  test("sends only the boxes that differ from the recommendation, and the feedback;  the draft 5s after typing stops", async () => {
    vi.useFakeTimers()
    const server = new FakeServer()
    const form = formOn(server)
    const kept = new FakeRow("a", "isOpen")
    const changed = new FakeRow("b", "isDark")
    form.add(kept)
    form.add(changed)
    changed.typed = "dark"
    form.setFeedback(" mostly ")
    expect(form.counts).toEqual({ rows: 2, changed: 1 })
    expect(form.savedText).toBe("not saved yet")
    await vi.advanceTimersByTimeAsync(CHOICES_SAVE_MS - 1)
    expect(server.posts).toEqual([])
    await vi.advanceTimersByTimeAsync(1)
    expect(server.posts).toEqual([["draft", { page: PAGE, values: { b: "dark" }, feedback: "mostly" }]])
    expect(form.savedText).toMatch(/^saved \d\d:\d\d$/)
    // nothing new:  no second save
    await form.save()
    expect(server.posts).toHaveLength(1)
  })

  test("Do it:  sends, says what went;  a change after makes it stale", async () => {
    const server = new FakeServer()
    const form = formOn(server)
    const row = new FakeRow("a", "isOpen")
    form.add(row)
    form.add(new FakeRow("b", "x"))
    row.typed = "open"
    await form.send()
    expect(server.posts.at(-1)).toEqual(["answer", { page: PAGE, values: { a: "open" }, feedback: "" }])
    expect(form.sentText).toMatch(/^Sent to Claude at \d\d:\d\d:  1 changed, 1 as recommended\./)
    form.changed()
    expect(form.isStale).toBe(true)
    expect(form.sentText).toMatch(/changed since:  press Do it again/)
  })

  test("brings back the draft (else the answer) into the boxes, a row registering later too;  the template asks nothing", async () => {
    const server = new FakeServer()
    server.draft = { values: { a: "open" }, feedback: "hi", saved: "2026-10-14T04:01:00.000Z" }
    server.answer = { values: { a: "old" }, feedback: "", answered: "2026-10-14T03:00:00.000Z" }
    const form = formOn(server)
    const row = new FakeRow("a", "isOpen")
    form.add(row)
    await form.restore()
    expect([row.value, form.feedback, form.sent?.answered]).toEqual(["open", "hi", "2026-10-14T03:00:00.000Z"])
    const late = new FakeRow("a", "isOpen")
    form.add(late)
    expect(late.value).toBe("open")
    const template = formOn(server, "/templates/syntax-choices.html")
    server.fetch.mockClear()
    await template.restore()
    expect([template.savedText, server.fetch.mock.calls.length]).toEqual(["a template:  nothing here is saved", 0])
  })

  test("a row's file for VS Code:  the served checkout, a worktree's from its page's address;  `#` off the server", () => {
    const root = "/Users/owen/spell"
    expect(ChoicesForm.fileUrl("packages/a b/A.ts", 7, { root, pathname: "/pages/details/x.html" })).toBe(
      "vscode://file/Users/owen/spell/packages/a%20b/A.ts:7"
    )
    expect(ChoicesForm.fileUrl("A.ts", 2, { root, pathname: "/worktrees/seo/pages/details/x.html" })).toBe(
      "vscode://file/Users/owen/spell/.claude/worktrees/seo/A.ts:2"
    )
    expect(ChoicesForm.fileUrl("A.ts", 2, { pathname: "/x.html" })).toBe("#")
  })
})
