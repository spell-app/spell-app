import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import type { E } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import { ReviewClient, type Inbox } from "$/epics/review"

import "$/ui/components/ui-button"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-section"
import "$/epics/components/epic-item"
import "$/epics/components/epic-choices"
import "$/epics/components/epic-section"
import "$/epics/components/epic-phase"
import "$/epics/components/epic-summary"

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
    if (route === "new") {
      const key = (body.id as string | undefined) ?? `new${Object.keys(this.inbox.marks).length + 1}`
      if (body.entry) this.inbox.marks[key] = { ...(body.entry as object), action: "new", at } as Inbox["marks"][string]
      else delete this.inbox.marks[key]
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

/**
 * `host`'s shadow root, and the shadow roots of the `<epic-review>` / `<epic-new-item>` it draws:
 * where its review controls are.
 */
function rootsOf(host: Element): ParentNode[] {
  const root = host.shadowRoot!
  const inner = Array.from(root.querySelectorAll("epic-review, epic-new-item"), (it) => it.shadowRoot)
  return [root, ...inner.filter((it) => it !== null)]
}

/** Every match of `selector` in `roots`;  ` >>> ` steps into the shadow root of what's matched before it. */
function queryAll(roots: ParentNode[], selector: string): Element[] {
  const [first, ...rest] = selector.split(" >>> ")
  const found = roots.flatMap((root) => Array.from(root.querySelectorAll(first!)))
  return rest.length
    ? queryAll(
        found.flatMap((it) => it.shadowRoot ?? []),
        rest.join(" >>> ")
      )
    : found
}

/**
 * Queries over `host`'s review controls (`rootsOf()`), its own shadow root first:
 * `[part~='note-box'] >>> textarea` is the textarea in its note box's shadow root.
 */
function deep(host: Element) {
  return {
    querySelector: <T extends Element = HTMLElement>(selector: string) =>
      (queryAll(rootsOf(host), selector)[0] ?? null) as T | null,
    querySelectorAll: <T extends Element = HTMLElement>(selector: string) => queryAll(rootsOf(host), selector) as T[]
  }
}

/** Render `html`, settled. */
async function render(html: string) {
  const host = await ElementFixture.render<E.DOMElement & { open: boolean }>(html)
  await ElementFixture.settle()
  return host
}

/** `host`'s review buttons' actions, in order. */
function actions(host: Element): string[] {
  return Array.from(deep(host).querySelectorAll<HTMLElement>("ui-button[data-action]"), (it) => it.dataset.action!)
}

/** `host`'s `action` button. */
function button(host: Element, action: string): HTMLElement {
  return deep(host).querySelector<HTMLElement>(`ui-button[data-action="${action}"]`)!
}

/** `host`'s note box buttons' `how`, in order. */
function noteButtons(host: Element): string[] {
  return Array.from(deep(host).querySelectorAll<HTMLElement>("[part~='note-box'] >>> button"), (it) => it.dataset.how!)
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
    expect(deep(host).querySelector("textarea")).toBeNull()
  })

  test("Approve, Revisit, Make Todo in a group, then Do Now apart (Q20);  Approve marks it, dashed green, and saves", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="q1" title="A question" status="open"><p>Text</p></epic-item>`)
    expect(actions(host)).toEqual(["approve", "revisit", "todo", "details"])
    expect(
      Array.from(deep(host).querySelectorAll("ui-buttons > ui-button"), (it) => (it as HTMLElement).dataset.action)
    ).toEqual(["approve", "revisit", "todo"])
    // the wand, as the page header's Review Now (Owen, 2026-10-09:  the plane is a todo's "next phase" now)
    expect([button(host, "details").getAttribute("icon"), button(host, "details").dataset.color]).toEqual([
      "wand magic sparkles",
      "blue"
    ])
    expect(actions(host).map((action) => button(host, action).dataset.fill)).toEqual(["none", "none", "none", "none"])
    button(host, "approve").click()
    await settle()
    expect(routes.inbox.marks.q1?.action).toBe("approve")
    expect([button(host, "approve").dataset.fill, button(host, "approve").dataset.color]).toEqual(["dashed", "green"])
  })

  test("a todo:  the plane (next phase), Revisit, the x (drop), one group;  no Approve, Make Todo or Do Now", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="t4" title="A todo" status="open"><p>Text</p></epic-item>`)
    expect(actions(host)).toEqual(["next", "revisit", "drop"])
    expect(
      Array.from(deep(host).querySelectorAll<HTMLElement>("ui-buttons > ui-button"), (it) => it.dataset.action)
    ).toEqual(["next", "revisit", "drop"])
    expect(
      actions(host).map((action) => [
        button(host, action).getAttribute("icon"),
        button(host, action).dataset.color,
        button(host, action).title
      ])
    ).toEqual([
      ["paper plane", "green", "Do it in the next phase"],
      ["history", "blue", "Revisit:  I'm adding a note for you"],
      ["xmark", "grey", "Drop it"]
    ])
    // the plane marks it, dashed green, and so does its chip;  again, cleared
    button(host, "next").click()
    await settle()
    expect(routes.inbox.marks.t4?.action).toBe("next")
    const chip = deep(host).querySelector<HTMLElement>("[part~='id']")!
    expect([button(host, "next").dataset.fill, chip.dataset.color, chip.dataset.fill]).toEqual([
      "dashed",
      "green",
      "dashed"
    ])
    // the x:  the latest mark wins, grey
    button(host, "drop").click()
    await settle()
    expect(routes.inbox.marks.t4?.action).toBe("drop")
    expect([button(host, "next").dataset.fill, button(host, "drop").dataset.fill, chip.dataset.color]).toEqual([
      "none",
      "dashed",
      "grey"
    ])
    button(host, "drop").click()
    await settle()
    expect(routes.inbox.marks.t4).toBeUndefined()
    // other kinds keep theirs
    const call = await render(`<epic-item id="j4" title="A call" status="open"></epic-item>`)
    expect(actions(call)).toEqual(["approve", "revisit", "todo", "details"])
  })

  test("a todo's note box:  the plane, Revisit Later, the x;  the plane takes the note along, as does the line's x", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="t5" title="A todo" status="open" open><p>Text</p></epic-item>`)
    const how = () =>
      Array.from(deep(host).querySelectorAll<HTMLElement>("[part~='note-box'] >>> button"), (it) => [
        it.dataset.how,
        it.dataset.color
      ])
    expect(how()).toEqual([
      ["next", "green"],
      ["soon", "blue"],
      ["drop", "grey"]
    ])
    const note = deep(host).querySelector<HTMLTextAreaElement>("[part~='details'] [part~='note-box'] >>> textarea")!
    note.value = "after the merge"
    note.dispatchEvent(new InputEvent("input", { bubbles: true }))
    deep(host).querySelector<HTMLButtonElement>('button[data-how="next"]')!.click()
    await settle()
    expect(routes.inbox.marks.t5).toMatchObject({ action: "next", note: "after the merge" })
    expect(deep(host).querySelector("[part~='said'] >>> [part~='base']")!.textContent).toContain(
      "next phase · not sent yet"
    )
    // the line's x, with words in the box:  they go along
    const other = await render(`<epic-item id="t6" title="Another" status="open" open><p>Text</p></epic-item>`)
    const box = deep(other).querySelector<HTMLTextAreaElement>("[part~='details'] [part~='note-box'] >>> textarea")!
    box.value = "moot since P3"
    box.dispatchEvent(new InputEvent("input", { bubbles: true }))
    button(other, "drop").click()
    await settle()
    expect(routes.inbox.marks.t6).toMatchObject({ action: "drop", note: "moot since P3" })
  })

  test("the fill:  a mark dashed until sent, then outlined;  Claude on it, its icon turns;  handled, they CLEAR", async () => {
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
    expect(deep(host).querySelector("[part~='base']")!.classList.contains("progress")).toBe(true)
    // a Do Now Claude did (`inbox done`):  its mark gone, every button a grey outline again;  the chip says the rest
    const done = await render(`<epic-item id="j4" title="Done" status="open" review-as="now"></epic-item>`)
    expect(actions(done).map((action) => button(done, action).dataset.fill)).toEqual(["none", "none", "none", "none"])
  })

  test("the id chip matches the chosen button:  its colour and fill;  no mark, its state's;  light and dark", async () => {
    const before = new Date(Date.now() - 60_000).toISOString()
    routes.inbox.marks.v2 = { action: "approve", at: new Date().toISOString() }
    routes.inbox.marks.j8 = { action: "revisit", when: "soon", note: "why?", at: before }
    routes.inbox.marks.q9 = { action: "pick", pick: "B", at: before }
    routes.inbox.sent = new Date(Date.now() - 30_000).toISOString()
    await adoptClient()
    const look = async (html: string) => {
      const box = await render(html)
      const host = box.localName === "epic-item" ? box : box.querySelector("epic-item")!
      const chip = deep(host).querySelector<HTMLElement>("[part~='id']")!
      const button = deep(host).querySelector<HTMLElement>("ui-button:is([data-fill='dashed'], [data-fill='outline'])")
      const style = getComputedStyle(chip)
      return { box, chip, button, fill: chip.dataset.fill, color: chip.dataset.color, border: style.borderTopStyle }
    }
    const approved = await look(`<epic-item id="v2" title="Picked" status="open" state="open"></epic-item>`)
    expect([approved.fill, approved.color, approved.border]).toEqual(["dashed", "green", "dashed"])
    expect([approved.button?.dataset.fill, approved.button?.dataset.color]).toEqual(["dashed", "green"])
    expect(approved.chip.title).toMatch(/you chose Approve · not sent yet/)
    const revisited = await look(`<epic-item id="j8" title="Talk" status="open" state="attention"></epic-item>`)
    expect([revisited.fill, revisited.color, revisited.border]).toEqual(["outline", "blue", "solid"])
    const picked = await look(`<epic-item id="q9" title="Which?" status="open" state="attention"></epic-item>`)
    expect([picked.fill, picked.color, picked.chip.title]).toEqual([
      "outline",
      "green",
      expect.stringMatching(/you chose pick B · sent/)
    ])
    // no mark, or one Claude handled (`review-as`, its buttons cleared):  the state's colour, solid -- the result
    const plain = await look(
      `<epic-item id="q10" title="Seen" status="decided" state="recent" review-as="approve"></epic-item>`
    )
    expect([plain.fill, plain.color, plain.border, plain.button]).toEqual([undefined, undefined, "none", null])
    for (const scheme of ["color-scheme: light", "color-scheme: dark; background: #1b1c1d; color: CanvasText"]) {
      const { box } = await look(`<div style="${scheme}; padding: 4px">
        <epic-item id="v2" title="Picked" status="open" state="open"></epic-item>
        <epic-item id="j8" title="Talk" status="open" state="attention"></epic-item>
      </div>`)
      await expectAccessible(box)
    }
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

  test("Do Now takes the note in the box along:  a revisit NOW with it;  the note box keeps Revisit Later and the x", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="q5" title="A question" status="open" open><p>Text</p></epic-item>`)
    expect(
      Array.from(deep(host).querySelectorAll<HTMLElement>("[part~='note-box'] >>> button"), (it) => it.dataset.how)
    ).toEqual(["soon", "skip"])
    const note = deep(host).querySelector<HTMLTextAreaElement>("[part~='details'] [part~='note-box'] >>> textarea")!
    note.value = "do it this way"
    note.dispatchEvent(new InputEvent("input", { bubbles: true }))
    button(host, "details").click()
    await settle()
    expect(routes.posts.at(-1)).toEqual(["now", { page: PAGE, id: "q5", action: "revisit", note: "do it this way" }])
    expect([button(host, "details").dataset.fill, button(host, "revisit").dataset.fill]).toEqual(["dashed", "none"])
  })

  test("the note box's x, Skip This (Owen, 2026-10-09):  in place of Make Todo;  a skip mark, the chip dashed grey", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="j9" title="A call" status="open" open><p>Text</p></epic-item>`)
    const x = deep(host).querySelector<HTMLButtonElement>("[part~='note-box'] >>> button[data-how='skip']")!
    expect([x.dataset.color, x.title, x.getAttribute("aria-label")]).toEqual([
      "grey",
      "Skip this",
      "Skip this:  nothing to do, marked reviewed once Claude applies it;  a note here says why"
    ])
    expect(x.querySelector("ui-icon")!.getAttribute("name")).toBe("xmark")
    // the line keeps its Make Todo
    expect(actions(host)).toEqual(["approve", "revisit", "todo", "details"])
    const note = deep(host).querySelector<HTMLTextAreaElement>("[part~='details'] [part~='note-box'] >>> textarea")!
    note.value = "covered by P3"
    note.dispatchEvent(new InputEvent("input", { bubbles: true }))
    x.click()
    await settle()
    expect(routes.inbox.marks.j9).toMatchObject({ action: "skip", note: "covered by P3" })
    expect(deep(host).querySelector("[part~='said'] >>> [part~='base']")!.textContent).toContain("skip · not sent yet")
    const chip = deep(host).querySelector<HTMLElement>("[part~='id']")!
    expect([chip.dataset.color, chip.dataset.fill]).toEqual(["grey", "dashed"])
    expect(chip.title).toMatch(/you chose Skip this · not sent yet/)
    // none of the line's buttons wears it
    expect(actions(host).map((action) => button(host, action).dataset.fill)).toEqual(["none", "none", "none", "none"])
  })

  test("Revisit on an item without details:  a box under its line;  Later makes the note a mark, shown with Edit", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="j2" title="A bare call" status="open"></epic-item>`)
    button(host, "revisit").click()
    await settle()
    const note = deep(host).querySelector<HTMLTextAreaElement>(".under-line [part~='note-box'] >>> textarea")!
    note.value = "why not reuse it?"
    note.dispatchEvent(new InputEvent("input", { bubbles: true }))
    deep(host).querySelector<HTMLButtonElement>('button[data-how="soon"]')!.click()
    await settle()
    expect(routes.inbox.marks.j2).toMatchObject({ action: "revisit", when: "soon", note: "why not reuse it?" })
    const said = deep(host).querySelector("[part~='said'] >>> [part~='base']")!
    expect(said.textContent).toContain("revisit soon · not sent yet")
    expect(said.textContent).toContain("why not reuse it?")
    expect(deep(host).querySelector(".under-line [part~='note-box'] >>> textarea")).toBeNull()
  })

  test("an item without details:  its box lines up where details start;  its chevron shows, and folds the box away", async () => {
    await adoptClient()
    const host =
      await render(`<div style="width: 360px"><epic-item id="t7" title="A bare todo" status="open"></epic-item>
      <epic-item id="t8" title="With text" status="open" open><p>Text</p></epic-item></div>`)
    const [bare, full] = Array.from(host.querySelectorAll("epic-item"))
    const toggle = () => deep(bare!).querySelector<HTMLButtonElement>("[part~='toggle']")
    expect(toggle()).toBeNull()
    button(bare!, "revisit").click()
    await settle()
    const box = deep(bare!).querySelector<HTMLElement>(".under-line [part~='note-box']")!
    const docked = deep(full!).querySelector<HTMLElement>("[part~='details'] [part~='note-box']")!
    // the same left edge as an item's details:  under the id chip, not the item's edge
    expect(Math.round(box.getBoundingClientRect().left)).toBe(Math.round(docked.getBoundingClientRect().left))
    expect(box.getBoundingClientRect().left - bare!.getBoundingClientRect().left).toBeGreaterThan(20)
    expect(toggle()?.getAttribute("aria-expanded")).toBe("true")
    toggle()!.click()
    await settle()
    expect(deep(bare!).querySelector(".under-line [part~='note-box']")).toBeNull()
    expect(toggle()).toBeNull()
  })

  test("a note box LAST in its details, saved as a draft when it loses focus;  still there once approved", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="q1" title="A question" status="open" open><p>Text</p></epic-item>`)
    const note = deep(host).querySelector<HTMLTextAreaElement>("[part~='details'] [part~='note-box'] >>> textarea")!
    note.value = "half a thought"
    note.dispatchEvent(new InputEvent("input", { bubbles: true }))
    note.dispatchEvent(new FocusEvent("focusout", { bubbles: true }))
    note.dispatchEvent(new FocusEvent("blur"))
    await settle()
    await vi.waitFor(() => expect(routes.inbox.drafts.q1?.note).toBe("half a thought"))
    button(host, "approve").click()
    await settle()
    const details = deep(host).querySelector("[part~='details']")!
    expect(details.lastElementChild!.matches("[part~='note-box']")).toBe(true)
    expect(getComputedStyle(details.lastElementChild!).position).toBe("sticky")
  })

  test("Owen's input, once handled, CLEARS (Owen, 2026-10-08):  every button grey, the chip carries the result", async () => {
    await adoptClient()
    // J9:  approved, closed;  J10:  revisited and answered, still open
    const approved = await render(
      `<epic-item id="j9" title="Done" status="done" state="recent" review-as="approve" open><p>Text</p></epic-item>`
    )
    const answered = await render(
      `<epic-item id="j10" title="Talked over" status="open" state="open" review-as="revisit"></epic-item>`
    )
    for (const host of [approved, answered]) {
      expect(actions(host).map((action) => button(host, action).dataset.fill)).toEqual(["none", "none", "none", "none"])
      for (const action of actions(host)) expect(button(host, action).getAttribute("aria-label")).not.toMatch(/done/)
    }
    const look = (host: Element) => {
      const chip = deep(host).querySelector<HTMLElement>("[part~='id']")!
      const box = deep(host).querySelector("[part~='base']")!
      return [chip.dataset.fill, box.classList.contains("recent"), box.classList.contains("open")]
    }
    expect([look(approved), look(answered)]).toEqual([
      [undefined, true, false],
      [undefined, false, true]
    ])
    // every button and the note box stay:  a new mark can follow
    expect(deep(approved).querySelector("[part~='details'] [part~='note-box'] >>> textarea")).not.toBeNull()
  })

  test("answered, the work still due (Owen, 2026-10-10):  the chip OUTLINED -- green queued, blue Claude on it;  done, solid", async () => {
    await adoptClient()
    const queued = await render(
      `<epic-item id="t4" title="Tidy" status="open" state="open" queued="2026-10-10" work="P9 · Build" review-as="next"></epic-item>`
    )
    const onIt = await render(`<epic-item id="j6" title="A call" status="open" state="progress"></epic-item>`)
    const doneTodo = await render(
      `<epic-item id="t5" title="Tidied" status="done" state="recent" queued="2026-10-10"></epic-item>`
    )
    await settle()
    const look = (host: Element) => {
      const chip = host.shadowRoot!.querySelector<HTMLElement>("[part~='id']")!
      return [chip.dataset.color, chip.dataset.fill, getComputedStyle(chip).backgroundColor === "rgba(0, 0, 0, 0)"]
    }
    expect([look(queued), look(onIt), look(doneTodo)]).toEqual([
      ["green", "outline", true],
      ["blue", "outline", true],
      [undefined, undefined, false]
    ])
    // its tooltip still says where it stands and what's to do
    expect(queued.shadowRoot!.querySelector<HTMLElement>("[part~='id']")!.title).toMatch(/to do:  P9 · Build/)
  })

  test("a pick Claude took off the inbox, the doc's `chosen` not here yet:  the chip stays green, outlined", async () => {
    routes.inbox.marks.j7 = { action: "pick", pick: "B", at: new Date(Date.now() - 60_000).toISOString() }
    routes.inbox.sent = new Date().toISOString()
    const client = await adoptClient()
    const host = await render(`<epic-item id="j7" title="A call" status="open" state="attention"></epic-item>`)
    await settle()
    delete routes.inbox.marks.j7
    await client.refresh()
    await settle()
    const chip = host.shadowRoot!.querySelector<HTMLElement>("[part~='id']")!
    expect([chip.dataset.color, chip.dataset.fill]).toEqual(["green", "outline"])
  })

  test("a marked note shows ABOVE the note box, last in the details;  Claude's status cards between them (P13)", async () => {
    routes.inbox.marks.q3 = { action: "revisit", when: "soon", note: "why B?", at: new Date().toISOString() }
    await adoptClient()
    const host = await render(`<epic-item id="q3" title="A question" status="open" open><p>Text</p></epic-item>`)
    await settle()
    const parts = Array.from(
      deep(host).querySelector("[part~='details']")!.children,
      (it) => it.getAttribute("part") ?? `slot:${it.getAttribute("name")}`
    )
    expect(parts.slice(-3)).toEqual(["said", "slot:status", "note-box"])
  })

  test("the review label goes:  each review button's tooltip says it (`Approve · reviewed 10/7/26`)", async () => {
    await adoptClient()
    const host = await render(
      `<epic-item id="j5" title="A call" status="done" reviewed="2026-10-07"><p>Text</p></epic-item>`
    )
    expect(deep(host).querySelector("[part~='review']")).toBeNull()
    expect(button(host, "approve").getAttribute("title")).toBe("Approve · reviewed 10/7/26")
    expect(button(host, "todo").getAttribute("title")).toBe("Make Todo · reviewed 10/7/26")
  })

  test("an open judgement call's id chip:  urgent (red) <-> not urgent (blue), through the inbox", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="j6" title="A call" status="open" state="attention"></epic-item>`)
    const chip = () => deep(host).querySelector<HTMLElement>("[part~='id']")!
    const box = () => deep(host).querySelector("[part~='base']")!
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
    for (const host of [question, reviewed]) expect(deep(host).querySelector("[part~='id']")!.localName).toBe("a")
  })

  test("an action CHOSEN folds the item (Owen, 2026-10-10):  Approve, Do Now, the x, a note box button, a pick", async () => {
    await adoptClient()
    const item = (html: string) => render(`<epic-item status="open" open ${html}><p>Text</p></epic-item>`)
    const approved = await item(`id="q1" title="A question"`)
    button(approved, "approve").click()
    const asked = await item(`id="j2" title="A call"`)
    button(asked, "details").click()
    const dropped = await item(`id="t1" title="A todo"`)
    button(dropped, "drop").click()
    const noted = await item(`id="j3" title="Another call"`)
    deep(noted).querySelector<HTMLButtonElement>("[part~='note-box'] >>> button[data-how='skip']")!.click()
    await settle()
    expect([approved.open, asked.open, dropped.open, noted.open]).toEqual([false, false, false, false])
    // a pick on its option cards (`<epic-option>`'s Choose pill)
    const question = await render(`<epic-item id="q2" title="Which?" status="open" open><epic-choices>
      <epic-option letter="A" title="One"><ul><li>short</li></ul></epic-option>
      <epic-option letter="B" title="Two"><ul><li>free</li></ul></epic-option></epic-choices></epic-item>`)
    const option = question.querySelector("epic-option")!
    option.shadowRoot!.querySelector<HTMLButtonElement>("[part~='choose']")!.click()
    await settle()
    expect([routes.inbox.marks.q2?.pick, question.open]).toEqual(["A", false])
  })

  test("NOT folded by Revisit (the box opens), typing, a mark cleared, or a request called off", async () => {
    await adoptClient()
    const host = await render(`<epic-item id="q1" title="A question" status="open" open><p>Text</p></epic-item>`)
    button(host, "revisit").click()
    const note = deep(host).querySelector<HTMLTextAreaElement>("[part~='details'] [part~='note-box'] >>> textarea")!
    note.value = "half a thought"
    note.dispatchEvent(new InputEvent("input", { bubbles: true }))
    await settle()
    expect(host.open).toBe(true)
    // a mark pressed again clears it:  nothing chosen, it stays open
    button(host, "todo").click()
    await settle()
    host.open = true
    await ElementFixture.tick()
    button(host, "todo").click()
    await settle()
    expect([routes.inbox.marks.q1, host.open]).toEqual([undefined, true])
    // Do Now pressed again while it runs:  called off
    button(host, "details").click()
    await settle()
    host.open = true
    await ElementFixture.tick()
    button(host, "details").click()
    await settle()
    expect(host.open).toBe(true)
  })

  test("folding keeps its STUCK line where it is on screen;  the details fold away below it", async () => {
    await adoptClient()
    const host = await render(`<div><epic-item id="j4" title="A long call" status="open" open>
      <p style="height: 3000px">Long text</p></epic-item><div style="height: 4000px"></div></div>`)
    const item = host.querySelector("epic-item")!
    const line = () => item.shadowRoot!.querySelector<HTMLElement>("[part~='line']")!
    window.scrollTo({ top: item.getBoundingClientRect().top + window.scrollY + 1500, behavior: "instant" })
    await ElementFixture.tick()
    const stuckAt = line().getBoundingClientRect().top
    // stuck:  the item's top is far above the window
    expect(item.getBoundingClientRect().top).toBeLessThan(stuckAt - 1000)
    button(item, "approve").click()
    await settle()
    expect((item as Element & { open: boolean }).open).toBe(false)
    expect(Math.abs(line().getBoundingClientRect().top - stuckAt)).toBeLessThan(2)
    window.scrollTo({ top: 0, behavior: "instant" })
  })
})

describe("<epic-section kind=overview-part> review controls (Q14)", () => {
  test("Revisit, Make Todo, Do Now in its title;  no Approve;  a note box at its body's end", async () => {
    await adoptClient()
    const host = await render(
      `<epic-section id="o1" kind="overview-part" title="What changes" open><p>Prose</p></epic-section>`
    )
    expect(actions(host)).toEqual(["revisit", "todo", "details"])
    expect(deep(host).querySelector("[part~='note-box'] >>> textarea")).not.toBeNull()
    expect(noteButtons(host)).toEqual(["soon", "skip"])
    button(host, "todo").click()
    await settle()
    expect(routes.inbox.marks.o1?.action).toBe("todo")
    // the box's x:  skip this, nothing to do
    deep(host).querySelector<HTMLButtonElement>("[part~='note-box'] >>> button[data-how='skip']")!.click()
    await settle()
    expect(routes.inbox.marks.o1?.action).toBe("skip")
  })

  test("other kinds of section draw no review controls", async () => {
    await adoptClient()
    const host = await render(`<epic-section id="todos" kind="todos" open></epic-section>`)
    expect(actions(host)).toEqual([])
  })
})

// epic `airplane` P2:  notes on the phases and the summary
describe("<epic-phase> and <epic-summary> review controls", () => {
  test("a phase:  Revisit, Make Todo, Do Now in its title;  a note box at its body's end;  Make Todo marks it", async () => {
    await adoptClient()
    const host = await render(`<epic-phase id="p2" title="Plan-Doc Notes" status="todo" open></epic-phase>`)
    expect(actions(host)).toEqual(["revisit", "todo", "details"])
    expect(deep(host).querySelector("[part~='note-box'] >>> textarea")).not.toBeNull()
    expect(noteButtons(host)).toEqual(["soon", "skip"])
    button(host, "todo").click()
    await settle()
    expect(routes.inbox.marks.p2?.action).toBe("todo")
    expect(button(host, "todo").dataset.fill).toBe("dashed")
  })

  test("the summary:  keyed `summary`;  its buttons and note box under the lede;  nothing unless reviewed", async () => {
    await adoptClient({ served: false })
    const quiet = await render(`<epic-summary>Two sentences.</epic-summary>`)
    expect(actions(quiet)).toEqual([])
    ReviewClient.adopt(undefined)
    await adoptClient()
    const host = await render(`<epic-summary>Two sentences.</epic-summary>`)
    expect(actions(host)).toEqual(["revisit", "todo", "details"])
    expect(deep(host).querySelector("[part~='note-box'] >>> textarea")!.getAttribute("aria-label")).toBe(
      "the summary:  your note"
    )
    expect(noteButtons(host)).toEqual(["soon", "skip"])
    button(host, "details").click()
    await settle()
    expect(routes.posts.at(-1)).toEqual(["now", { page: PAGE, id: "summary", action: "details" }])
    await expectAccessible(host)
  })
})

// epic `airplane` P2:  new todos and questions from the page
describe("<epic-section kind=todos | questions> new items", () => {
  /** `host`'s waiting cards:  `[title, fill]` each. */
  function cards(host: Element) {
    return Array.from(deep(host).querySelectorAll<HTMLElement>("[part~='new-list'] li"), (card) => [
      card.querySelector(".title")!.textContent,
      card.dataset.fill
    ])
  }

  test("its button opens the form at its end, on its own kind;  Add saves it, and it waits there, dashed", async () => {
    await adoptClient()
    const host = await render(`<epic-section id="decisions" kind="questions" open></epic-section>`)
    const open = deep(host).querySelector<HTMLButtonElement>("[part~='new-item'] >>> [part~='button']")!
    expect(open.textContent).toBe("New question")
    open.click()
    await ElementFixture.tick()
    const form = deep(host).querySelector<HTMLFormElement>("[part~='new-item'] >>> [part~='form']")!
    expect(form.querySelector("[aria-pressed='true']")!.textContent).toBe("Question")
    form.querySelector<HTMLInputElement>("[data-field='title']")!.value = "window or aisle?"
    form.querySelector<HTMLTextAreaElement>("[data-field='note']")!.value = "  long flight "
    form.querySelector<HTMLInputElement>("[data-field='near']")!.value = "P2"
    form.requestSubmit()
    await settle()
    expect(routes.posts.at(-1)).toEqual([
      "new",
      { page: PAGE, entry: { kind: "question", title: "window or aisle?", note: "long flight", near: "p2" } }
    ])
    await vi.waitFor(() => expect(cards(host)).toEqual([["window or aisle?", "dashed"]]))
    expect(deep(host).querySelector("[part~='new-item'] >>> [part~='form']")).toBeNull()
    expect(deep(host).querySelector("[part~='new-list'] a")!.getAttribute("href")).toBe("#p2")
    await expectAccessible(host)
  })

  test("no title:  nothing saved, the title takes the focus;  Escape cancels", async () => {
    await adoptClient()
    const host = await render(`<epic-section id="todos" kind="todos" open></epic-section>`)
    deep(host).querySelector<HTMLButtonElement>("[part~='new-item'] >>> [part~='button']")!.click()
    await ElementFixture.tick()
    const form = deep(host).querySelector<HTMLFormElement>("[part~='new-item'] >>> [part~='form']")!
    form.requestSubmit()
    await ElementFixture.tick()
    expect(routes.posts).toEqual([])
    const newItem = host.shadowRoot!.querySelector("[part~='new-item']")!
    expect(newItem.shadowRoot!.activeElement?.getAttribute("data-field")).toBe("title")
    form.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }))
    await ElementFixture.tick()
    expect(deep(host).querySelector("[part~='new-item'] >>> [part~='form']")).toBeNull()
  })

  test("a waiting item:  Edit opens the form on it and saves under its key;  Remove drops it;  only its kind listed", async () => {
    const at = new Date().toISOString()
    routes.inbox.marks = {
      new1: { action: "new", kind: "todo", title: "pack", at },
      new2: { action: "new", kind: "question", title: "aisle?", at }
    }
    await adoptClient()
    const host = await render(`<epic-section id="todos" kind="todos" open></epic-section>`)
    expect(cards(host)).toEqual([["pack", "dashed"]])
    deep(host).querySelector<HTMLButtonElement>("[part~='new-list'] button[title='Edit']")!.click()
    await ElementFixture.tick()
    const form = deep(host).querySelector<HTMLFormElement>("[part~='new-item'] >>> [part~='form']")!
    const title = form.querySelector<HTMLInputElement>("[data-field='title']")!
    expect(title.value).toBe("pack")
    title.value = "pack chargers"
    form.requestSubmit()
    await settle()
    expect(routes.posts.at(-1)).toEqual([
      "new",
      { page: PAGE, id: "new1", entry: { kind: "todo", title: "pack chargers" } }
    ])
    await vi.waitFor(() => expect(cards(host)).toEqual([["pack chargers", "dashed"]]))
    deep(host).querySelector<HTMLButtonElement>("[part~='new-list'] button[title='Remove']")!.click()
    await settle()
    expect(routes.posts.at(-1)).toEqual(["new", { page: PAGE, id: "new1", entry: null }])
    expect(cards(host)).toEqual([])
  })
})
