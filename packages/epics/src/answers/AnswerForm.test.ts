import { parseHTML } from "linkedom"
import { describe, expect, test, vi } from "vite-plus/test"

import { AnswerForm } from "./AnswerForm"
import type { AnswerPart, AskState, PageAnswer, SentAnswer } from "./answers.types"

////////////////
// ## Fakes
////////////////

const PAGE = "/pages/details/pick.html"
const TOKEN = "token-1"

/** The page server's details route, as `fetch`:  the answer it holds, every POST, and the next failure. */
class FakeServer {
  answer: SentAnswer | null = null
  posts: Record<string, unknown>[] = []
  failure: { status: number; error: string } | undefined

  readonly fetch = vi.fn(async (url: string, init?: RequestInit): Promise<Response> => {
    if (url.startsWith("/api/details/answer?")) return json({ answer: this.answer })
    const body = JSON.parse(init!.body as string) as Record<string, unknown>
    this.posts.push(body)
    if (this.failure) return json({ error: this.failure.error }, this.failure.status)
    this.answer = {
      ...(body as unknown as PageAnswer),
      page: body.page as string,
      answered: "2026-10-14T04:00:00.000Z",
      changes: this.answer ? this.answer.changes + 1 : 0
    }
    return json({ ok: true, answer: this.answer })
  })
}

/** `body` as a JSON response. */
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
}

/** A page of elements to hang parts on, in order:  `#a`, `#b`, `#c`. */
const { document } = parseHTML('<main><div id="a"></div><div id="b"></div><div id="c"></div></main>')

/** A question:  its picks under `key`. */
class FakeAsk implements AnswerPart {
  picks: string[] = []
  constructor(
    readonly domElement: Element,
    readonly key: string
  ) {}
  get askState(): AskState {
    return this.picks.length ? "done" : "attention"
  }
  gatherInto(page: PageAnswer) {
    ;(page.answers[this.key] ??= { picked: [] }).picked = [...this.picks]
  }
  showAnswer(answer: SentAnswer) {
    this.picks = [...(answer.answers[this.key]?.picked ?? [])]
  }
}

/** A comment box for `id`. */
class FakeBox implements AnswerPart {
  text = ""
  constructor(
    readonly domElement: Element,
    readonly id: string
  ) {}
  gatherInto(page: PageAnswer) {
    if (this.text.trim()) page.comments[this.id] = this.text.trim()
  }
  showAnswer(answer: SentAnswer) {
    this.text = answer.comments?.[this.id] ?? ""
  }
}

/** A form on `server`, served with a token (`token: false`:  from `file://`). */
function formOn(server: FakeServer, { token = true } = {}) {
  return new AnswerForm({
    page: PAGE,
    server: token ? { token: TOKEN } : undefined,
    protocol: token ? "http:" : "file:",
    fetch: server.fetch as unknown as typeof fetch
  })
}

/** The page's elements by id. */
function at(id: string): Element {
  return document.getElementById(id)!
}

////////////////
// ## Tests
////////////////

describe("AnswerForm", () => {
  test("gathers the page in page order, its keys sorted, whatever order its parts came in", () => {
    const form = formOn(new FakeServer())
    const box = new FakeBox(at("c"), "context")
    const second = new FakeAsk(at("b"), "q2")
    const first = new FakeAsk(at("a"), "q1")
    for (const part of [box, second, first]) form.add(part)
    first.picks = ["B"]
    box.text = " clear "
    expect(form.gather()).toEqual({
      answers: { q1: { picked: ["B"] }, q2: { picked: [] } },
      comments: { context: "clear" },
      notes: ""
    })
    expect(form.asks).toEqual([first, second])
    expect(form.decided).toEqual({ decided: 1, total: 2 })
  })

  test("where it stands:  nothing (grey), something not sent (blue, dashed), sent (green), changed since (blue)", async () => {
    const server = new FakeServer()
    const form = formOn(server)
    const ask = new FakeAsk(at("a"), "q1")
    form.add(ask)
    expect([form.fill, form.stateLine]).toEqual(["rest", { text: "Not sent", color: "grey" }])
    ask.picks = ["A"]
    expect([form.fill, form.stateLine]).toEqual(["pending", { text: "Not sent", color: "blue" }])
    await form.send()
    expect(server.posts).toEqual([{ page: PAGE, answers: { q1: { picked: ["A"] } }, comments: {}, notes: "" }])
    expect(form.fill).toBe("sent")
    expect(form.stateLine.text).toMatch(/^Sent \d+\/\d+\/26 \d\d:\d\d · 1 of 1 decided$/)
    ask.picks = ["B"]
    expect([form.fill, form.stateLine]).toEqual(["pending", { text: "Changes not sent", color: "blue" }])
  })

  test("refuses to send an empty page never sent, or a page off the page server;  a route's error said, editable still", async () => {
    const server = new FakeServer()
    const form = formOn(server)
    form.add(new FakeAsk(at("a"), "q1"))
    await form.send()
    expect(form.error).toBe("Pick an option, or write something (Other, a comment, a note) first.")
    const offline = formOn(server, { token: false })
    const ask = new FakeAsk(at("a"), "q1")
    offline.add(ask)
    ask.picks = ["A"]
    await offline.send()
    expect(offline.error).toMatch(/isn't on the page server/)
    server.failure = { status: 403, error: "not a details page:  /x" }
    ;(form.asks[0] as FakeAsk).picks = ["A"]
    await form.send()
    expect(form.error).toBe("Not a details page:  /x.  Send again, or answer in chat instead.")
    expect(form.isSending).toBe(false)
    expect(server.posts).toHaveLength(1)
  })

  test("reads back the answer sent, into every part:  one that comes later gets it too, and the page counts as sent", async () => {
    const server = new FakeServer()
    server.answer = {
      page: PAGE,
      answered: "2026-10-13T20:00:00.000Z",
      changes: 0,
      answers: { q1: { picked: ["C"] }, q2: { picked: [] } },
      comments: { context: "ok" },
      notes: ""
    }
    const form = formOn(server)
    const ask = new FakeAsk(at("a"), "q1")
    form.add(ask)
    const heard = vi.fn()
    form.subscribe(heard)
    await form.load()
    expect(ask.picks).toEqual(["C"])
    const late = new FakeBox(at("c"), "context")
    form.add(late)
    expect(late.text).toBe("ok")
    expect(form.fill).toBe("sent")
    expect(heard).toHaveBeenCalled()
    // once per form
    await form.load()
    expect(server.fetch).toHaveBeenCalledTimes(1)
  })
})
