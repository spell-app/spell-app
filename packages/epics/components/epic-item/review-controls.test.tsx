import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import type { UIHost } from "$/ui/core"
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
  inbox: Inbox = { marks: {}, drafts: {}, sent: null, now: [], working: {}, listening: null }
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
  const host = await ElementFixture.render<UIHost & { open: boolean }>(html)
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

  test("Approve, Make Todo, Revisit, Add Details Now in the line;  Approve marks it, green, and saves", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="q1" title="A question" status="open"><p>Text</p></epic-item>`)
    expect(actions(host)).toEqual(["approve", "todo", "revisit", "details"])
    button(host, "approve").click()
    await settle()
    expect(routes.inbox.marks.q1?.action).toBe("approve")
    expect([button(host, "approve").hasAttribute("data-chosen"), button(host, "approve").dataset.color]).toEqual([
      true,
      "green"
    ])
  })

  test("Add Details Now queued with nobody listening:  a dashed ring, not a spinner;  its tooltip says why", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="j1" title="A call" status="open"></epic-item>`)
    button(host, "details").click()
    await settle()
    const details = button(host, "details")
    expect([details.hasAttribute("data-waiting"), details.hasAttribute("loading")]).toEqual([true, false])
    expect(details.getAttribute("aria-label")).toMatch(/No Claude session/)
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

  test("a note box at the end of its details, saved as a draft when it loses focus;  none once approved", async () => {
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
    expect(host.shadowRoot!.querySelector("[part~='details'] textarea")).toBeNull()
  })

  test("an answered item Claude approved (`review-as`):  Approve stays outlined, no note box", async () => {
    await adoptClient()
    const host = await render(
      `<epic-item id="q2" title="Done" status="decided" answered review-as="approve" open><p>Text</p></epic-item>`
    )
    expect([
      button(host, "approve").hasAttribute("data-chosen"),
      button(host, "approve").hasAttribute("data-sent")
    ]).toEqual([true, true])
    expect(host.shadowRoot!.querySelector("textarea")).toBeNull()
  })
})

describe("<epic-section kind=overview-part> review controls (Q14)", () => {
  test("Make Todo, Revisit, Add Details Now in its title;  no Approve;  a note box at its body's end", async () => {
    await adoptClient()
    const host = await render(
      `<epic-section id="o1" kind="overview-part" title="What changes" open><p>Prose</p></epic-section>`
    )
    expect(actions(host)).toEqual(["todo", "revisit", "details"])
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
