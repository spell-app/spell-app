import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import type { E } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"

import { ReviewClient, type Inbox } from "$/epics/review"

import "$/ui/components/ui-button"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-section"
import "$/epics/components/epic-item"
import "$/epics/components/epic-section"

////////////////
// ## Fakes
////////////////

const PAGE = "/epics/sample/sample.plan.html"

/**
 * The review routes, as `fetch`, over an inbox kept here:  each reply the whole inbox, as the routes answer.
 * - `posts`:  every POST's route and body
 */
class FakeRoutes {
  inbox: Inbox = { marks: {}, drafts: {}, urgency: {}, sent: null, now: [], working: {}, listening: null }
  posts: [string, Record<string, unknown>][] = []

  readonly fetch = vi.fn(async (input: string, init?: RequestInit): Promise<Response> => {
    const route = input.replace("/api/review/", "").replace(/\?.*/, "")
    if (route !== "inbox") this.answer(route, JSON.parse(init!.body as string) as Record<string, unknown>)
    return new Response(JSON.stringify(this.inbox), { headers: { "content-type": "application/json" } })
  })

  /** Change the inbox as the route would. */
  private answer(route: string, body: Record<string, unknown>) {
    this.posts.push([route, body])
    const id = body.id as string
    const at = new Date().toISOString()
    if (route === "mark") {
      if (body.mark) this.inbox.marks[id] = { ...(body.mark as Inbox["marks"][string]), at }
      else delete this.inbox.marks[id]
    }
    if (route === "urgency") {
      if (body.calm === null) delete this.inbox.urgency[id]
      else this.inbox.urgency[id] = { calm: body.calm as boolean, at }
    }
    if (route === "draft") {
      if (body.note) this.inbox.drafts[id] = { action: "revisit", note: body.note as string, at }
      else delete this.inbox.drafts[id]
    }
    if (route === "now") {
      const action = body.action as "details" | "revisit"
      this.inbox.now.push({ id, action, at })
      this.inbox.marks[id] =
        action === "revisit"
          ? { action, when: "now", note: (body.note as string | undefined) ?? "", at }
          : { action, at }
    }
  }
}

let routes: FakeRoutes

/** A started client on `routes`, adopted as the page's;  `server` none:  not served. */
async function adoptClient({ served = true } = {}) {
  const client = new ReviewClient({
    page: PAGE,
    server: served ? { token: "token" } : undefined,
    protocol: "http:",
    fetch: routes.fetch as unknown as typeof fetch,
    storage: null
  })
  await client.start()
  ReviewClient.adopt(client)
  return client
}

/** Render `html`, settled. */
async function render(html: string) {
  const host = await ElementFixture.render<E.DOMElement & { open: boolean }>(html)
  await ElementFixture.settle()
  return host
}

/** `host`'s review buttons' actions, in order. */
function actions(host: Element): string[] {
  return Array.from(
    host.shadowRoot!.querySelectorAll<HTMLElement>("ui-button[data-action]"),
    (it) => it.dataset.action!
  )
}

/** `host`'s `action` button. */
function button(host: Element, action: string): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>(`ui-button[data-action="${action}"]`)!
}

/** Wait for the client's writes and Solid's updates. */
async function settle() {
  await vi.waitFor(() => expect(routes.fetch).toHaveBeenCalled())
  await new Promise((resolve) => setTimeout(resolve, 20))
  await ElementFixture.tick()
}

beforeEach(() => {
  routes = new FakeRoutes()
})

afterEach(() => {
  ReviewClient.adopt(undefined)
})

////////////////
// ## Tests
////////////////

describe("<epic-item> review controls", () => {
  test("draw NOTHING unless the page is served with a token and its inbox answers", async () => {
    await adoptClient({ served: false })
    const host = await render(`<epic-item id="q1" title="A question" status="open"><p>Text</p></epic-item>`)
    expect(actions(host)).toEqual([])
    expect(host.shadowRoot!.querySelector("textarea")).toBeNull()
  })

  test("Approve, Revisit, Make Todo in a group, then Do Now apart (Q20);  Approve marks it, dashed green, and saves", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="q1" title="A question" status="open"><p>Text</p></epic-item>`)
    expect(actions(host)).toEqual(["approve", "revisit", "todo", "details"])
    expect(
      Array.from(
        host.shadowRoot!.querySelectorAll("ui-buttons > ui-button"),
        (it) => (it as HTMLElement).dataset.action
      )
    ).toEqual(["approve", "revisit", "todo"])
    expect([button(host, "details").getAttribute("icon"), button(host, "details").dataset.color]).toEqual([
      "paper plane",
      "blue"
    ])
    expect(actions(host).map((action) => button(host, action).dataset.fill)).toEqual(["none", "none", "none", "none"])
    button(host, "approve").click()
    await settle()
    expect(routes.inbox.marks.q1?.action).toBe("approve")
    expect([button(host, "approve").dataset.fill, button(host, "approve").dataset.color]).toEqual(["dashed", "green"])
  })

  test("the fill:  a mark dashed until sent, then outlined;  Claude on it, its icon turns;  done (`review-as`) solid", async () => {
    const before = new Date(Date.now() - 60_000).toISOString()
    routes.inbox.marks.j3 = { action: "revisit", when: "soon", note: "why?", at: before }
    routes.inbox.sent = new Date().toISOString()
    routes.inbox.working.j3 = { action: "revisit", since: new Date().toISOString() }
    await adoptClient()
    const host = await render(`<epic-item id="j3" title="A call" status="open" state="attention"></epic-item>`)
    await settle()
    const revisit = button(host, "revisit")
    expect([revisit.dataset.fill, revisit.dataset.color, revisit.hasAttribute("data-busy")]).toEqual([
      "outline",
      "blue",
      true
    ])
    // Claude's agent at work:  the chip is blue at once, before the script rewrites `state`
    expect(host.shadowRoot!.querySelector("[part~='base']")!.classList.contains("progress")).toBe(true)
    const done = await render(`<epic-item id="j4" title="Done" status="open" review-as="now"></epic-item>`)
    expect([button(done, "details").dataset.fill, button(done, "approve").dataset.fill]).toEqual(["solid", "none"])
  })

  test("Do Now queued with nobody listening:  dashed, its icon still;  its tooltip says why", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="j1" title="A call" status="open"></epic-item>`)
    button(host, "details").click()
    await settle()
    const doNow = button(host, "details")
    expect([doNow.dataset.fill, doNow.hasAttribute("data-busy"), doNow.hasAttribute("loading")]).toEqual([
      "dashed",
      false,
      false
    ])
    expect(doNow.getAttribute("aria-label")).toMatch(/No Claude session/)
  })

  test("Do Now takes the note in the box along:  a revisit NOW with it;  the note box keeps Revisit Later and Make Todo", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="q5" title="A question" status="open" open><p>Text</p></epic-item>`)
    expect(
      Array.from(host.shadowRoot!.querySelectorAll<HTMLElement>("[part~='note-box'] button"), (it) => it.dataset.how)
    ).toEqual(["soon", "todo"])
    const note = host.shadowRoot!.querySelector<HTMLTextAreaElement>("[part~='details'] textarea")!
    note.value = "do it this way"
    note.dispatchEvent(new InputEvent("input", { bubbles: true }))
    button(host, "details").click()
    await settle()
    expect(routes.posts.at(-1)).toEqual(["now", { page: PAGE, id: "q5", action: "revisit", note: "do it this way" }])
    expect([button(host, "details").dataset.fill, button(host, "revisit").dataset.fill]).toEqual(["dashed", "none"])
  })

  test("Revisit on an item without details:  a box under its line;  Later makes the note a mark, shown with Edit", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="j2" title="A bare call" status="open"></epic-item>`)
    button(host, "revisit").click()
    await settle()
    const note = host.shadowRoot!.querySelector<HTMLTextAreaElement>(".under-line textarea")!
    note.value = "why not reuse it?"
    note.dispatchEvent(new InputEvent("input", { bubbles: true }))
    host.shadowRoot!.querySelector<HTMLButtonElement>('button[data-how="soon"]')!.click()
    await settle()
    expect(routes.inbox.marks.j2).toMatchObject({ action: "revisit", when: "soon", note: "why not reuse it?" })
    const said = host.shadowRoot!.querySelector("[part~='said']")!
    expect(said.textContent).toContain("revisit soon · not sent yet")
    expect(said.textContent).toContain("why not reuse it?")
    expect(host.shadowRoot!.querySelector(".under-line textarea")).toBeNull()
  })

  test("a note box LAST in its details, saved as a draft when it loses focus;  still there once approved", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="q1" title="A question" status="open" open><p>Text</p></epic-item>`)
    const note = host.shadowRoot!.querySelector<HTMLTextAreaElement>("[part~='details'] textarea")!
    note.value = "half a thought"
    note.dispatchEvent(new InputEvent("input", { bubbles: true }))
    note.dispatchEvent(new FocusEvent("focusout", { bubbles: true }))
    note.dispatchEvent(new FocusEvent("blur"))
    await settle()
    await vi.waitFor(() => expect(routes.inbox.drafts.q1?.note).toBe("half a thought"))
    button(host, "approve").click()
    await settle()
    const details = host.shadowRoot!.querySelector("[part~='details']")!
    expect(details.lastElementChild!.matches("[part~='note-box']")).toBe(true)
    expect(getComputedStyle(details.lastElementChild!).position).toBe("sticky")
  })

  test("an answered item Claude approved (`review-as`):  Approve solid, done;  every button and the note box stay", async () => {
    await adoptClient()
    const host = await render(
      `<epic-item id="q2" title="Done" status="decided" answered review-as="approve" open><p>Text</p></epic-item>`
    )
    expect(actions(host).map((action) => button(host, action).dataset.fill)).toEqual(["solid", "none", "none", "none"])
    expect(host.shadowRoot!.querySelector("[part~='details'] textarea")).not.toBeNull()
  })

  test("a marked note shows ABOVE the note box, last in the details;  Claude's status cards between them (P13)", async () => {
    routes.inbox.marks.q3 = { action: "revisit", when: "soon", note: "why B?", at: new Date().toISOString() }
    await adoptClient()
    const host = await render(`<epic-item id="q3" title="A question" status="open" open><p>Text</p></epic-item>`)
    await settle()
    const parts = Array.from(
      host.shadowRoot!.querySelector("[part~='details']")!.children,
      (it) => it.getAttribute("part") ?? `slot:${it.getAttribute("name")}`
    )
    expect(parts.slice(-3)).toEqual(["said", "slot:status", "note-box"])
  })

  test("the review label goes:  each review button's tooltip says it (`Approve · reviewed 10/7/26`)", async () => {
    await adoptClient()
    const host = await render(
      `<epic-item id="j5" title="A call" status="done" reviewed="2026-10-07"><p>Text</p></epic-item>`
    )
    expect(host.shadowRoot!.querySelector("[part~='review']")).toBeNull()
    expect(button(host, "approve").getAttribute("title")).toBe("Approve · reviewed 10/7/26")
    expect(button(host, "todo").getAttribute("title")).toBe("Make Todo · reviewed 10/7/26")
  })

  test("an open judgement call's id chip:  urgent (red) <-> not urgent (blue), through the inbox", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="j6" title="A call" status="open" state="attention"></epic-item>`)
    const chip = () => host.shadowRoot!.querySelector<HTMLElement>("[part~='id']")!
    const box = () => host.shadowRoot!.querySelector("[part~='base']")!
    expect(chip().localName).toBe("button")
    expect(chip().title).toMatch(/click:  not urgent$/)
    chip().click()
    await settle()
    expect(routes.inbox.urgency.j6?.calm).toBe(true)
    expect([box().classList.contains("open"), box().classList.contains("attention")]).toEqual([true, false])
    expect(chip().hasAttribute("data-unsent")).toBe(true)
    expect(host.open).toBeFalsy()
    chip().click()
    await settle()
    expect(routes.posts.at(-1)).toEqual(["urgency", { page: PAGE, id: "j6", calm: null }])
    expect(box().classList.contains("attention")).toBe(true)
  })

  test("a question's chip, or a reviewed call's, stays a link", async () => {
    await adoptClient()
    const question = await render(`<epic-item id="q4" title="Which?" status="open"></epic-item>`)
    const reviewed = await render(`<epic-item id="j7" title="Seen" status="open" reviewed="2026-10-07"></epic-item>`)
    for (const host of [question, reviewed]) expect(host.shadowRoot!.querySelector("[part~='id']")!.localName).toBe("a")
  })
})

describe("<epic-section kind=overview-part> review controls (Q14)", () => {
  test("Revisit, Make Todo, Do Now in its title;  no Approve;  a note box at its body's end", async () => {
    await adoptClient()
    const host = await render(
      `<epic-section id="o1" kind="overview-part" title="What changes" open><p>Prose</p></epic-section>`
    )
    expect(actions(host)).toEqual(["revisit", "todo", "details"])
    expect(host.shadowRoot!.querySelector("[part~='note-box'] textarea")).not.toBeNull()
    button(host, "todo").click()
    await settle()
    expect(routes.inbox.marks.o1?.action).toBe("todo")
  })

  test("other kinds of section draw no review controls", async () => {
    await adoptClient()
    const host = await render(`<epic-section id="todos" kind="todos" open></epic-section>`)
    expect(actions(host)).toEqual([])
  })
})
