import { describe, expect, test, vi } from "vite-plus/test"

import { ReviewInbox } from "$/epics/tool/ReviewInbox"

import { ReviewClient } from "./ReviewClient"
import { NOBODY_LISTENING, REVISIT_KEY_PREFIX, type ReviewClientOptions } from "./review.types"

////////////////
// ## Fakes
////////////////

const PAGE = "/epics/sample/sample.plan.html"
const TOKEN = "token-1"
const ITEMS = new Set(["q1", "j2", "o1"])

/**
 * The page server's review routes over a REAL `ReviewInbox`, as `fetch`:  each reply is `forPage()`, as the routes
 * answer.  `token` is the server's;  `hold` keeps the next POST to a route waiting until released.
 */
class FakeServer {
  inbox = new ReviewInbox()
  token = TOKEN
  /** every POST, as `[route, body]` */
  posts: [string, Record<string, unknown>][] = []
  /** the next reply's status for a route, once */
  failures = new Map<string, { status: number; error: string }>()
  /** a POST to this route waits for `release()` */
  private held: { route: string; release?: () => void } | undefined

  readonly fetch = vi.fn(async (input: string, init?: RequestInit): Promise<Response> => {
    const url = input
    if (url === PAGE) return new Response(`<script>window.SPELL_SERVER = {"token":"${this.token}"}</script>`)
    if (url.startsWith("/api/review/inbox")) return json(this.inbox.forPage())
    const route = url.replace("/api/review/", "")
    const body = JSON.parse(init!.body as string) as Record<string, unknown>
    this.posts.push([route, body])
    if (this.held?.route === route) await new Promise<void>((resolve) => (this.held!.release = resolve))
    if ((init!.headers as Record<string, string>)["x-server-token"] !== this.token)
      return json({ error: "bad token" }, 403)
    const failure = this.failures.get(route)
    if (failure) {
      this.failures.delete(route)
      return json({ error: failure.error }, failure.status)
    }
    const id = body.id as string
    if (route === "mark") this.inbox.setMark(id, body.mark)
    if (route === "now") this.inbox.requestNow(id, body.action, (body.note ?? "") as string)
    if (route === "cancel") this.inbox.cancelNow(id)
    if (route === "draft") this.inbox.setDraft(id, body.action, body.note ?? null)
    if (route === "urgency") this.inbox.setUrgency(id, body.calm ?? null)
    if (route === "new") this.inbox.setNew(id, body.entry)
    if (route === "send" && body.now === true) this.inbox.reviewNow()
    else if (route === "send") this.inbox.markSent()
    return json(this.inbox.forPage())
  })

  /** Hold the next POST to `route` until `release()`. */
  hold(route: string) {
    this.held = { route }
  }

  /** Let the held POST through. */
  release() {
    this.held?.release?.()
    this.held = undefined
  }
}

/** A `Storage` on a `Map`. */
class MapStorage implements Storage {
  private readonly values = new Map<string, string>()
  get length() {
    return this.values.size
  }
  clear() {
    this.values.clear()
  }
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.values.delete(key)
  }
  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

/** A client on `server`, started;  `options` override the page's facts. */
async function started(server = new FakeServer(), options: Partial<ReviewClientOptions> = {}) {
  const client = clientOn(server, options)
  await client.start()
  return { client, server }
}

/** A client on `server`, not started. */
function clientOn(server: FakeServer, options: Partial<ReviewClientOptions> = {}) {
  return new ReviewClient({
    page: PAGE,
    server: { token: TOKEN },
    protocol: "http:",
    fetch: server.fetch as unknown as typeof fetch,
    storage: new MapStorage(),
    hasItem: (id) => ITEMS.has(id),
    ...options
  })
}

/** A JSON reply. */
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } })
}

////////////////
// ## Tests
////////////////

describe("ReviewClient.start()", () => {
  test("reviews ONLY with a token, over http, once the inbox answers", async () => {
    const server = new FakeServer()
    expect(await clientOn(server, { server: undefined }).start()).toBe(false)
    expect(await clientOn(server, { protocol: "file:" }).start()).toBe(false)
    const { client } = await started(server)
    expect(client.reviewing).toBe(true)
    server.fetch.mockResolvedValueOnce(json({ error: "not a plan doc" }, 403))
    expect(await clientOn(server).start()).toBe(false)
  })

  test("hands the inbox a backup it lacks, drops the rest, and reopens a draft's box", async () => {
    const server = new FakeServer()
    server.inbox.setDraft("j2", "revisit", "already in the inbox")
    const storage = new MapStorage()
    const backups = { q1: "typed on the old page", j2: "older text", x9: "an item that's gone", o1: "  " }
    storage.setItem(`${REVISIT_KEY_PREFIX}${PAGE}`, JSON.stringify(backups))
    const { client } = await started(server, { storage })
    expect(server.inbox.drafts.q1?.note).toBe("typed on the old page")
    expect(server.inbox.drafts.j2?.note).toBe("already in the inbox")
    expect(storage.getItem(`${REVISIT_KEY_PREFIX}${PAGE}`)).toBeNull()
    expect([client.isBoxOpen("q1"), client.isBoxOpen("j2"), client.isBoxOpen("o1")]).toEqual([true, true, false])
    expect(client.typedOf("q1")).toBe("typed on the old page")
  })
})

describe("ReviewClient.press()", () => {
  test("Approve marks at once, then saves;  a second press clears it", async () => {
    const { client, server } = await started()
    const seen: number[] = []
    client.subscribe(() => seen.push(client.version))
    const saving = client.press("q1", "approve")
    expect(saving).toBeUndefined()
    expect(client.markOf("q1")?.action).toBe("approve")
    await vi.waitFor(() => expect(server.inbox.marks.q1?.action).toBe("approve"))
    client.press("q1", "approve")
    expect(client.markOf("q1")).toBeUndefined()
    await vi.waitFor(() => expect(server.inbox.marks.q1).toBeUndefined())
    await vi.waitFor(() => expect(seen.length).toBe(4))
  })

  test("Revisit asks for the note box;  a revisit carrying a pick, pressed again, leaves the plain pick", async () => {
    const { client, server } = await started()
    expect(client.press("q1", "revisit")).toBe("open-box")
    await client.useNote("q1", "soon", "B, but why?")
    await client.choose("q1", "B")
    expect(server.inbox.marks.q1).toMatchObject({ action: "revisit", when: "soon", note: "B, but why?", pick: "B" })
    client.press("q1", "revisit")
    await vi.waitFor(() => expect(server.inbox.marks.q1).toMatchObject({ action: "pick", pick: "B" }))
  })

  test("a pick names its card set (I8):  kept through a revisit and back;  a revisit asked now keeps it too", async () => {
    const { client, server } = await started()
    await client.choose("j2", "C", 1)
    expect(server.inbox.marks.j2).toMatchObject({ action: "pick", pick: "C", choices: 1 })
    await client.useNote("j2", "soon", "C, but why?")
    expect(server.inbox.marks.j2).toMatchObject({ action: "revisit", note: "C, but why?", pick: "C", choices: 1 })
    client.press("j2", "revisit")
    await vi.waitFor(() => expect(server.inbox.marks.j2).toMatchObject({ action: "pick", pick: "C", choices: 1 }))
    await client.askNow("j2", "revisit", "now?")
    expect(client.markOf("j2")).toMatchObject({ action: "revisit", when: "now", pick: "C", choices: 1 })
    // un-picked:  no pick, no card set
    await client.choose("j2", null)
    expect(server.inbox.marks.j2).toMatchObject({ action: "revisit", when: "soon", note: "now?" })
    expect(server.inbox.marks.j2).not.toHaveProperty("choices")
  })

  test("a todo's plane (`next`) and x (`drop`) mark it as Approve does;  a note in the box goes along", async () => {
    const { client, server } = await started()
    client.press("t1", "next")
    await vi.waitFor(() => expect(server.inbox.marks.t1).toMatchObject({ action: "next" }))
    expect(server.inbox.marks.t1).not.toHaveProperty("note")
    client.press("t1", "next")
    await vi.waitFor(() => expect(server.inbox.marks.t1).toBeUndefined())
    client.openBox("t2")
    client.type("t2", "moot since P3")
    client.press("t2", "drop")
    await vi.waitFor(() => expect(server.inbox.marks.t2).toMatchObject({ action: "drop", note: "moot since P3" }))
    expect([client.isBoxOpen("t2"), client.typedOf("t2"), client.busyButtonOf("t2")]).toEqual([false, "", null])
  })

  test("Do Now with a note in the box asks a revisit NOW with it (the box closes, emptied);  without, details", async () => {
    const { client, server } = await started()
    client.openBox("j2")
    client.type("j2", "look at this now")
    client.press("j2", "details")
    await vi.waitFor(() => expect(server.inbox.now.map(({ id, action }) => [id, action])).toEqual([["j2", "revisit"]]))
    expect(server.inbox.marks.j2).toMatchObject({ action: "revisit", when: "now", note: "look at this now" })
    expect([client.isBoxOpen("j2"), client.typedOf("j2"), client.busyButtonOf("j2")]).toEqual([false, "", "details"])
    client.press("q1", "details")
    await vi.waitFor(() => expect(server.inbox.marks.q1?.action).toBe("details"))
  })

  test("Do Now (no note:  details) spins while asked, waits QUEUED with nobody listening, and says so", async () => {
    const { client, server } = await started()
    const notices: string[] = []
    client.onNotice((message) => notices.push(message))
    server.hold("now")
    client.press("o1", "details")
    expect(client.runningOf("o1")).toEqual({ action: "details", queued: false })
    server.release()
    await vi.waitFor(() => expect(client.runningOf("o1")).toEqual({ action: "details", queued: true }))
    expect(notices).toEqual([NOBODY_LISTENING])
    server.inbox.setListening("session-1")
    await client.refresh()
    expect(client.runningOf("o1")).toEqual({ action: "details", queued: false })
  })

  test("a running request's button (a revisit now is Do Now's) pressed again calls it off;  its note comes back as a draft, its box open", async () => {
    const { client, server } = await started()
    await client.useNote("j2", "now", "look at this now")
    expect([client.runningOf("j2")?.action, client.busyButtonOf("j2")]).toEqual(["revisit", "details"])
    client.press("j2", "details")
    expect(client.runningOf("j2")).toBeNull()
    await vi.waitFor(() => expect(server.inbox.canceled.j2).toBeDefined())
    await vi.waitFor(() => expect(server.inbox.drafts.j2?.note).toBe("look at this now"))
    expect(server.inbox.now).toEqual([])
    expect(client.isBoxOpen("j2")).toBe(true)
    expect(client.typedOf("j2")).toBe("look at this now")
  })

  test("a request called off ON ITS WAY waits for it to land, so nothing stays queued", async () => {
    const { client, server } = await started()
    server.hold("now")
    client.press("q1", "details")
    const canceling = client.cancel("q1")
    server.release()
    expect(await canceling).toBe(true)
    expect(server.posts.map(([route]) => route)).toEqual(["now", "cancel"])
    expect(server.inbox.now).toEqual([])
    expect(client.runningOf("q1")).toBeNull()
  })
})

describe("ReviewClient writes", () => {
  test("a stale token is refreshed from the page as served now, and the write tried again", async () => {
    const { client, server } = await started()
    server.token = "token-2"
    expect(await client.save("q1", { action: "todo" })).toBe(true)
    expect(server.inbox.marks.q1?.action).toBe("todo")
  })

  test("a refused write says why and re-reads the inbox, undoing what was shown", async () => {
    const { client, server } = await started()
    const notices: string[] = []
    client.onNotice((message) => notices.push(message))
    server.failures.set("mark", { status: 400, error: "no item q1 in that doc" })
    expect(await client.save("q1", { action: "approve" })).toBe(false)
    expect(notices).toEqual(["No item q1 in that doc."])
    expect(client.markOf("q1")).toBeUndefined()
  })

  test("a draft saved drops its backup;  a used note takes the draft and the backup with it", async () => {
    const storage = new MapStorage()
    const { client, server } = await started(new FakeServer(), { storage })
    client.type("q1", "half a thought")
    expect(client.readBackups()).toEqual({ q1: "half a thought" })
    expect(await client.saveDraft("q1", "half a thought")).toBe(true)
    expect(client.readBackups()).toEqual({})
    expect(server.inbox.drafts.q1?.note).toBe("half a thought")
    client.type("q1", "a whole thought")
    await client.useNote("q1", "todo", "a whole thought")
    expect(server.inbox.marks.q1).toMatchObject({ action: "todo", note: "a whole thought" })
    expect(server.inbox.drafts.q1).toBeUndefined()
    expect([client.typedOf("q1"), client.readBackups()]).toEqual(["", {}])
  })

  test("send() hands every unsent mark over;  with nothing new it says so", async () => {
    const { client, server } = await started()
    const notices: string[] = []
    client.onNotice((message) => notices.push(message))
    await client.save("q1", { action: "approve" })
    expect(client.unsentCount).toBe(1)
    expect(await client.send()).toBe(true)
    expect(server.inbox.sent).not.toBeNull()
    expect(client.unsentCount).toBe(0)
    expect(await client.send()).toBe(false)
    expect(notices).toEqual([`Saved.  ${NOBODY_LISTENING}`, "Sent already:  waiting for Claude"])
  })
})

// epic `airplane` P2:  new todos and questions from the page
describe("ReviewClient new items", () => {
  test("saveNew:  keyed by the server, listed by kind in the order added;  counted for Send;  says where it waits", async () => {
    const { client, server } = await started()
    const notices: string[] = []
    client.onNotice((message) => notices.push(message))
    expect(await client.saveNew({ kind: "todo", title: "pack", note: "chargers", near: "q1" })).toBe(true)
    expect(await client.saveNew({ kind: "question", title: "aisle?" })).toBe(true)
    expect(await client.saveNew({ kind: "todo", title: "check in" })).toBe(true)
    expect(server.posts[0]).toEqual([
      "new",
      { page: PAGE, entry: { kind: "todo", title: "pack", note: "chargers", near: "q1" } }
    ])
    expect(client.newItems("todo").map((item) => [item.id, item.title])).toEqual([
      ["new1", "pack"],
      ["new3", "check in"]
    ])
    expect(client.newItems().map((item) => item.id)).toEqual(["new1", "new2", "new3"])
    expect(client.unsentCount).toBe(3)
    expect(notices[0]).toBe(`Saved:  a new todo.  ${NOBODY_LISTENING}`)
  })

  test("saveNew with a key changes it, shown at once;  removeNew drops it at once;  a refused one says why", async () => {
    const { client, server } = await started()
    await client.saveNew({ kind: "todo", title: "pack" })
    const write = client.saveNew({ kind: "question", title: "pack what?" }, "new1")
    expect(client.newItems("question").map((item) => item.title)).toEqual(["pack what?"])
    await write
    expect(server.inbox.marks.new1).toMatchObject({ action: "new", kind: "question", title: "pack what?" })
    const removed = client.removeNew("new1")
    expect(client.newItems()).toEqual([])
    await removed
    expect(server.inbox.isEmpty).toBe(true)
    server.failures.set("new", { status: 400, error: "a new item needs a title" })
    const notices: string[] = []
    client.onNotice((message) => notices.push(message))
    expect(await client.saveNew({ kind: "todo", title: "" })).toBe(false)
    expect(notices).toEqual(["A new item needs a title."])
  })
})

describe("ReviewClient.toggleCalm() (an id chip, Owen 2026-10-07)", () => {
  test("urgent <-> not urgent, shown at once;  back to what the doc says, the inbox forgets it;  counted for Send", async () => {
    const { client, server } = await started()
    const write = client.toggleCalm("j2", false)
    expect(client.calmOf("j2")).toBe(true)
    await write
    expect(server.inbox.urgency.j2?.calm).toBe(true)
    expect(client.unsentCount).toBe(1)
    await client.toggleCalm("j2", false)
    expect(server.posts.at(-1)).toEqual(["urgency", { page: PAGE, id: "j2", calm: null }])
    expect([client.calmOf("j2"), client.unsentCount]).toEqual([undefined, 0])
    // a calm doc's call made urgent, then sent
    await client.toggleCalm("j2", true)
    expect(client.calmOf("j2")).toBe(false)
    expect(await client.send()).toBe(true)
    expect(client.unsentCount).toBe(0)
  })
})
