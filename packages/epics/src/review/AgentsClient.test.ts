import { describe, expect, test, vi } from "vite-plus/test"

import { AgentsClient } from "./AgentsClient"
import { ServerWriteError, ageOf, agentsOf, sentence, type ServerLinkOptions } from "./review.types"

////////////////
// ## Fakes
////////////////

const PAGE = "/epics/sample/sample.plan.html"
const TOKEN = "token-1"

/**
 * The page server's agents routes over a list kept here, as `fetch`:  each reply is `{ agents }`, as the routes
 * answer.  `token` is the server's;  `hold()` keeps the next redirect waiting until `release()`.
 */
class FakeServer {
  agents: Record<string, unknown>[] = [
    { name: "sample-aaa", task: "Port the parser", status: "active", started: "2026-10-07T10:00:00.000Z" },
    { name: "sample-bbb", task: "Wait for aaa", status: "blocked on sample-aaa", started: "2026-10-07T11:00:00.000Z" }
  ]
  token = TOKEN
  /** every POST, as `[url, body]` */
  posts: [string, Record<string, unknown>][] = []
  /** the next redirect's failure, once */
  failure: { status: number; error: string } | undefined
  /** a held redirect's release */
  private held: { release?: () => void } | undefined

  readonly fetch = vi.fn(async (url: string, init?: RequestInit): Promise<Response> => {
    if (url === PAGE) return new Response(`<script>window.SPELL_SERVER = {"token":"${this.token}"}</script>`)
    if (url.startsWith("/api/agents?")) return json({ agents: this.agents })
    const body = JSON.parse(init!.body as string) as Record<string, unknown>
    this.posts.push([url, body])
    if (this.held) await new Promise<void>((resolve) => (this.held!.release = resolve))
    if ((init!.headers as Record<string, string>)["x-server-token"] !== this.token) {
      return json({ error: "bad token" }, 403)
    }
    if (this.failure) {
      const { status, error } = this.failure
      this.failure = undefined
      return json({ error }, status)
    }
    const agent = this.agents.find((it) => it.name === body.name)!
    agent.redirects = [...((agent.redirects as unknown[]) ?? []), { note: body.note, at: "2026-10-07T12:00:00.000Z" }]
    return json({ agents: this.agents })
  })

  /** Hold the next redirect until `release()`. */
  hold() {
    this.held = {}
  }

  /** Let the held redirect through. */
  release() {
    this.held?.release?.()
    this.held = undefined
  }
}

/** A client on `server`;  `options` override the page's facts. */
function clientOn(server: FakeServer, options: Partial<ServerLinkOptions> = {}) {
  return new AgentsClient({
    page: PAGE,
    server: { token: TOKEN, file: PAGE },
    protocol: "http:",
    fetch: server.fetch as unknown as typeof fetch,
    ...options
  })
}

/** A JSON reply. */
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } })
}

/** A `window` enough for `watch()`:  events, timers, a visible document. */
function fakeWindow() {
  const target = new EventTarget()
  const document = Object.assign(new EventTarget(), { visibilityState: "visible" })
  return Object.assign(target, {
    document,
    setInterval: (fn: () => void, ms: number) => setInterval(fn, ms),
    clearInterval: (id: number) => clearInterval(id)
  }) as unknown as Window
}

////////////////
// ## Tests
////////////////

describe("AgentsClient.start()", () => {
  test("listed ONLY on a plan doc served with a token, over http, once the list answers", async () => {
    const server = new FakeServer()
    expect(await clientOn(server, { server: undefined }).start()).toBe(false)
    expect(await clientOn(server, { protocol: "file:" }).start()).toBe(false)
    expect(await clientOn(server, { page: "/guides/x.html" }).start()).toBe(false)
    server.fetch.mockResolvedValueOnce(json({ error: "not a plan doc" }, 403))
    expect(await clientOn(server).start()).toBe(false)
    const client = clientOn(server)
    const changes = vi.fn()
    client.subscribe(changes)
    expect(await client.start()).toBe(true)
    expect(client.listed).toBe(true)
    expect(client.agents.map((agent) => [agent.name, agent.status, agent.redirects])).toEqual([
      ["sample-aaa", "active", []],
      ["sample-bbb", "blocked on sample-aaa", []]
    ])
    expect(changes).toHaveBeenCalledTimes(1)
  })
})

describe("AgentsClient.redirect()", () => {
  test("posts the note with the token;  the reply, the list after, is shown", async () => {
    const server = new FakeServer()
    const client = clientOn(server)
    await client.start()
    await client.redirect("sample-aaa", "Use the new parser")
    expect(server.posts).toEqual([
      ["/api/agents/redirect", { page: PAGE, name: "sample-aaa", note: "Use the new parser" }]
    ])
    expect(client.agents[0]!.redirects).toEqual([
      { note: "Use the new parser", at: "2026-10-07T12:00:00.000Z", told: "" }
    ])
    expect(client.version).toBe(2)
  })

  test("a stale token is refreshed from the page as served now, and the redirect tried again", async () => {
    const server = new FakeServer()
    const client = clientOn(server)
    await client.start()
    server.token = "token-2"
    await client.redirect("sample-bbb", "Go ahead")
    expect(server.posts.map(([, body]) => body.note)).toEqual(["Go ahead", "Go ahead"])
    expect(client.agents[1]!.redirects.map((it) => it.note)).toEqual(["Go ahead"])
  })

  test("a refused redirect throws a `ServerWriteError` saying why, the list as it was", async () => {
    const server = new FakeServer()
    const client = clientOn(server)
    await client.start()
    server.failure = { status: 400, error: "AgentList:  no agent `sample-ccc` is running" }
    const refused = await client.redirect("sample-ccc", "Hi").catch((error: unknown) => error)
    expect(refused).toBeInstanceOf(ServerWriteError)
    expect((refused as Error).message).toBe("AgentList:  no agent `sample-ccc` is running")
    expect(client.agents).toHaveLength(2)
    server.fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"))
    await expect(client.redirect("sample-aaa", "Hi")).rejects.toThrow(
      "couldn't reach the page server (Failed to fetch)"
    )
  })

  test("a poll while a redirect is on its way is skipped:  its answer is newer", async () => {
    const server = new FakeServer()
    const client = clientOn(server)
    await client.start()
    server.hold()
    const redirecting = client.redirect("sample-aaa", "Wait")
    expect(await client.refresh()).toBe(false)
    server.release()
    await redirecting
    expect(await client.refresh()).toBe(true)
    expect(client.agents[0]!.redirects).toHaveLength(1)
  })
})

describe("AgentsClient.watch()", () => {
  test("re-reads the list when the page server says `agents.json` beside the doc changed", async () => {
    const server = new FakeServer()
    const client = clientOn(server)
    await client.start()
    const window = fakeWindow()
    const stop = client.watch(window)
    server.agents = []
    window.dispatchEvent(new CustomEvent("spell-server:file", { detail: { path: "/epics/sample/other.json" } }))
    window.dispatchEvent(new CustomEvent("spell-server:file", { detail: { path: "/epics/sample/agents.json" } }))
    await vi.waitFor(() => expect(client.agents).toEqual([]))
    stop()
  })
})

describe("helpers", () => {
  test("`agentsOf()` keeps every field, defaulted;  drops entries without a name", () => {
    expect(agentsOf(null)).toEqual([])
    expect(
      agentsOf({ agents: [{ task: "no name" }, { name: "x", redirects: [{ note: "n", at: "a", told: "t" }] }] })
    ).toEqual([{ name: "x", task: "", status: "active", started: "", redirects: [{ note: "n", at: "a", told: "t" }] }])
  })

  test('`ageOf()`:  `<1m`, minutes, hours and minutes, days and hours;  `""` for none', () => {
    const start = "2026-10-07T10:00:00.000Z"
    const at = (minutes: number) => Date.parse(start) + minutes * 60_000
    expect([0.5, 3, 60, 125, 24 * 60, 28 * 60].map((minutes) => ageOf(start, at(minutes)))).toEqual([
      "<1m",
      "3m",
      "1h",
      "2h 5m",
      "1d",
      "1d 4h"
    ])
    expect(ageOf("", at(3))).toBe("")
  })

  test("`sentence()`:  a capital first, a full stop last unless it has one", () => {
    expect([sentence("an empty note"), sentence("reload the page!"), sentence("")]).toEqual([
      "An empty note.",
      "Reload the page!",
      ""
    ])
  })
})
