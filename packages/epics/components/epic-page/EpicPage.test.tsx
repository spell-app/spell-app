import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import type { E } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import { Markup } from "$/epics/markup"
import { AgentsClient, ReviewClient, clockOf, type Inbox } from "$/epics/review"

import "$/ui/components/ui-button"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-section"
import "$/ui/components/ui-label"
import "$/ui/components/ui-message"
import "$/ui/components/ui-code"
import "$/ui/components/ui-breadcrumb"
import "$/epics/components/epic-page"
import "$/epics/components/epic-overview"
import "$/epics/components/epic-section"
import "$/epics/components/epic-phase"
import "$/epics/components/epic-commit"
import "$/epics/components/epic-item"
import "$/epics/components/epic-answer"

/** A page with phases in `statuses`, and `attributes` on the page. */
function page(attributes: string, statuses: string[], extra = ""): string {
  const phases = statuses.map(
    (status, at) => `<epic-phase id="p${at + 1}" title="Phase ${at + 1}" status="${status}"></epic-phase>`
  )
  return (
    `<epic-page epic="demo" title="Demo" ${attributes}>` +
    `<epic-overview id="overview"><p slot="summary">Two sentences.</p></epic-overview>` +
    `<epic-section id="phases" kind="phases">${phases.join("")}</epic-section>${extra}</epic-page>`
  )
}

/** `host`'s step label, as drawn:  its words, colour and link;  `undefined` for none. */
function step(host: Element) {
  const labels = host.shadowRoot!.querySelectorAll('[part~="status"] ui-label')
  const label = labels[labels.length - 1]
  if (!label || label.textContent?.includes("Bedtime")) return undefined
  return {
    words: label.textContent!.trim(),
    color: label.getAttribute("color"),
    href: label.getAttribute("href") ?? undefined,
    tip: label.getAttribute("title") ?? undefined
  }
}

/** Render `html` and let the page's observers settle. */
async function render(html: string): Promise<E.DOMElement> {
  const host = await ElementFixture.render<E.DOMElement>(html)
  await ElementFixture.settle(host)
  await ElementFixture.tick()
  return host
}

describe("<epic-page>", () => {
  test("draws `/epic <name>` over its title, its meta lines and its durable doc's link, and passes axe", async () => {
    const host = await render(
      page(`branch="demo" worktree="/w/demo" started="2026-10-06" updated="2026-10-07"`, ["done"], "").replace(
        "</epic-overview>",
        `</epic-overview><a slot="durable" href="#durable">Durable</a>`
      )
    )
    const shadow = host.shadowRoot!
    expect(shadow.querySelector("h1 button")!.textContent).toBe("/epic demo")
    expect(shadow.querySelector('[part~="subhead"]')!.textContent!.trim()).toBe("Demo")
    const lines = Array.from(shadow.querySelectorAll('[part~="meta"] > li:not([hidden])'), (li) =>
      li.textContent!.replace(/\s+/g, " ").trim()
    )
    expect(lines).toEqual([
      "Plan doc for /epic demo, branch demo",
      "Worktree: /w/demo",
      "Started 10/6/26, updated 10/7/26",
      "Durable doc:"
    ])
    expect(host.querySelector('a[slot="durable"]')!.assignedSlot).not.toBeNull()
    await expectAccessible(host)
  })

  test("the step label follows the phases:  the active one (blue), else the next (grey), else DONE (green);  none without phases", async () => {
    const host = await render(page("", ["done", "active", "todo"]))
    expect(step(host)).toEqual({ words: "P2", color: "blue", href: "#p2", tip: "P2 · Phase 2" })
    host.querySelector("#p2")!.setAttribute("status", "done")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(step(host)).toEqual({ words: "P3", color: "grey", href: "#p3", tip: "Next:  P3 · Phase 3" })
    host.querySelector("#p3")!.setAttribute("status", "done")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(step(host)).toMatchObject({ words: "DONE", color: "green" })
    for (const phase of host.querySelectorAll("epic-phase")) phase.remove()
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(step(host)).toBeUndefined()
  })

  test("a future epic:  FUTURE, meta lines without a branch, and its notice;  bedtime:  its label", async () => {
    const future = await render(page("future", []))
    expect(step(future)).toMatchObject({ words: "FUTURE", color: "grey" })
    expect(future.matches(":state(future)")).toBe(true)
    expect(future.shadowRoot!.querySelector('[part~="meta"] li')!.textContent!.replace(/\s+/g, " ")).toContain(
      "Future epic: /epic future demo, no branch yet"
    )
    expect(future.shadowRoot!.querySelector('[part~="notice"]')).not.toBeNull()
    future.remove()
    const bedtime = await render(page(`bedtime="P3-P6"`, ["active"]))
    const label = bedtime.shadowRoot!.querySelector('[part~="status"] ui-label')!
    expect(label.textContent).toContain("Bedtime P3-P6")
  })

  test("a doc still planning:  the folded `Plan hung?` aside with its prompt to copy;  gone with the first phase", async () => {
    const host = await render(
      page("", []).replace(
        `<p slot="summary">Two sentences.</p>`,
        `<p slot="summary">Two sentences.</p><blockquote slot="prompt"><p>Plan it.<br>Line 2</p><p>Then more.</p></blockquote>`
      )
    )
    const hung = host.shadowRoot!.querySelector<HTMLDetailsElement>('[part~="hung"]')!
    expect({ open: hung.open, title: hung.querySelector("summary")!.textContent }).toEqual({
      open: false,
      title: "Plan hung?"
    })
    expect(hung.querySelector("p")!.textContent).toBe("Close its Claude tab, then run /epic demo and pick “Reuse”.")
    expect(hung.querySelector("ui-code")!.textContent).toBe("Plan it.\nLine 2\n\nThen more.")
    host
      .querySelector("#phases")!
      .insertAdjacentHTML("beforeend", `<epic-phase id="p1" title="One" status="todo"></epic-phase>`)
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector('[part~="hung"]')).toBeNull()
  })

  test("the git toggle shows only with commits, and shows every commit below while pressed", async () => {
    const without = await render(page("", ["done"]))
    expect(without.shadowRoot!.querySelector('[part~="git"]')).toBeNull()
    without.remove()
    const host = await render(
      page(`repo="https://example.com/r"`, []).replace(
        "</epic-section>",
        `<epic-phase id="p1" title="One" status="done" open><epic-commit sha="0123456789abcdef">Did it</epic-commit></epic-phase></epic-section>`
      )
    )
    const commit = host.querySelector("epic-commit")!
    const git = host.shadowRoot!.querySelector<HTMLButtonElement>('[part~="git"]')!
    expect(getComputedStyle(commit).display).toBe("none")
    git.click()
    await ElementFixture.tick()
    expect(git.getAttribute("aria-pressed")).toBe("true")
    expect(getComputedStyle(commit).display).toBe("block")
    git.click()
    await ElementFixture.tick()
  })

  test("its blocks are numbered by place, and top-level titles stick below its header", async () => {
    const host = await render(page("", ["todo"]))
    const header = host.shadowRoot!.querySelector('[part~="header"]')!
    const phases = host.querySelector("#phases")!.shadowRoot!.querySelector("ui-section")!
    expect(Number(phases.getAttribute("offset"))).toBe(Math.round(header.getBoundingClientRect().height))
  })

  test("draws its crumbs, `Docs › Epics › <title>`;  NONE while the doc still holds its old crumbs before it", async () => {
    const host = await render(page("", ["todo"]))
    const crumbs = host.shadowRoot!.querySelector('[part~="crumbs"]')!
    expect(
      Array.from(crumbs.querySelectorAll("ui-breadcrumb-section"), (crumb) => [
        crumb.textContent,
        crumb.getAttribute("href"),
        crumb.hasAttribute("active")
      ])
    ).toEqual([
      ["Docs", "../../pages/index.html", false],
      ["Epics", "../../epics/index.html", false],
      ["Demo", null, true]
    ])
    expect(crumbs.compareDocumentPosition(host.shadowRoot!.querySelector('[part~="header"]')!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )

    const old = await render(
      `<main><ui-breadcrumb class="spell-crumbs"><ui-breadcrumb-section active>Demo</ui-breadcrumb-section></ui-breadcrumb>` +
        `${page("", ["todo"])}</main>`
    )
    expect(old.querySelector("epic-page")!.shadowRoot!.querySelector('[part~="crumbs"]')).toBeNull()
  })

  test("runs EDGE TO EDGE:  out of `<main>`'s inline padding (`--spell-doc-pad-inline`), however wide", async () => {
    for (const width of [900, 320]) {
      const main = await render(
        `<main style="--spell-doc-pad-inline: 16px; padding: 0 16px; width: ${width}px; box-sizing: border-box">` +
          `${page("", ["todo"])}</main>`
      )
      const [outer, inside] = [main, main.querySelector("epic-page")!].map((box) => box.getBoundingClientRect())
      expect([inside.left - outer.left, inside.width, main.scrollWidth]).toEqual([0, width, width])
    }
    // no token (a page without `spell-doc.css`):  no breakout
    const plain = await render(`<main style="padding: 0 16px">${page("", ["todo"])}</main>`)
    expect(getComputedStyle(plain.querySelector("epic-page")!).marginLeft).toBe("0px")
  })

  test("sleeping:  phases, none under way, open follow-ups:  😴 saying what's open;  gone once under way", async () => {
    const items =
      `<epic-section id="decisions" kind="questions">` +
      `<epic-item id="q1" title="One" status="open"></epic-item><epic-item id="q2" title="Two" status="open"></epic-item>` +
      `</epic-section><epic-section id="caveats" kind="caveats"><epic-item id="c1" title="Kept" status="open"></epic-item>` +
      `</epic-section><epic-section id="todos" kind="todos"><epic-item id="t1" title="Later" status="open"></epic-item></epic-section>`
    const host = await render(page("", ["done", "todo"], items))
    const sleeping = () => host.shadowRoot!.querySelector<HTMLElement>('[part~="sleeping"]')
    expect(sleeping()?.title).toBe("Sleeping:  nothing under way, 2 questions, 1 todo to follow up")
    host.querySelector("#p2")!.setAttribute("status", "active")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(sleeping()).toBeNull()
    host.remove()
    const planning = await render(page("", [], items))
    expect(planning.shadowRoot!.querySelector('[part~="sleeping"]')).toBeNull()
  })

  test("the review line:  `/epic review <name>`, copied on click, and it flashes", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    const host = await render(page("", ["todo"]))
    const line = host.shadowRoot!.querySelector<HTMLButtonElement>('[part~="review-line"]')!
    expect(line.textContent!.replace(/\s+/g, " ")).toContain("To review this doc, type /epic review demo")
    line.click()
    await vi.waitFor(() => expect(line.classList.contains("flash")).toBe(true))
    expect(writeText).toHaveBeenCalledWith("/epic review demo")
    expect(line.querySelector(".done")!.textContent).toBe("copied")
    writeText.mockRestore()
  })

  test("the heading:  a click copies `/epic <name>` and says so", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    const host = await render(page("", ["todo"]))
    const heading = host.shadowRoot!.querySelector("h1")!
    heading.querySelector("button")!.click()
    await vi.waitFor(() => expect(heading.querySelector(".done")!.textContent).toBe("copied"))
    expect(writeText).toHaveBeenCalledWith("/epic demo")
    writeText.mockRestore()
  })

  test("`Markup` reads, writes and checks the LIVE elements:  no problems once they're defined and drawn", async () => {
    const doc = await ElementFixture.render(`
      <epic-page epic="demo" title="Demo">
        <epic-overview id="overview"><p slot="summary">Two sentences.</p></epic-overview>
        <epic-section id="decisions" kind="questions">
          <epic-item id="q1" title="Which colour names?" status="open"><p>Which?</p></epic-item>
        </epic-section>
      </epic-page>`)
    await ElementFixture.settle()
    expect(Markup.validate(doc)).toEqual([])
    const item = doc.querySelector("epic-item")!
    Markup.set<"epic-item">(item, { status: "decided", answered: true })
    item.append(Markup.element(document, "epic-answer", { title: "Named palette" }, "<p>Named.</p>"))
    await ElementFixture.settle()
    expect(Markup.read(item)).toEqual({ id: "q1", title: "Which colour names?", status: "decided", answered: true })
    expect(item.querySelector("epic-answer")!.shadowRoot).not.toBeNull()
    expect(Markup.validate(doc)).toEqual([])
  })
})

////////////////
// ## Send and Review Now (P10)
////////////////

/** The review routes, as `fetch`, over an inbox kept here:  each reply the whole inbox;  `posts` every POST. */
class FakeRoutes {
  inbox: Inbox = { marks: {}, drafts: {}, urgency: {}, sent: null, now: [], working: {}, listening: null }
  posts: [string, Record<string, unknown>][] = []

  readonly fetch = vi.fn(async (input: string, init?: RequestInit): Promise<Response> => {
    const route = input.replace("/api/review/", "").replace(/\?.*/, "")
    if (route !== "inbox") {
      const body = JSON.parse(init!.body as string) as Record<string, unknown>
      this.posts.push([route, body])
      if (route === "send") this.inbox.sent = new Date(Date.now() + 1000).toISOString()
    }
    return new Response(JSON.stringify(this.inbox), { headers: { "content-type": "application/json" } })
  })
}

/** A started client on `routes`, adopted as the page's;  `served` false:  no token, never reviewed. */
async function adoptClient(routes: FakeRoutes, { served = true } = {}) {
  const client = new ReviewClient({
    page: "/epics/demo/demo.plan.html",
    server: served ? { token: "token" } : undefined,
    protocol: "http:",
    fetch: routes.fetch as unknown as typeof fetch,
    storage: null
  })
  await client.start()
  ReviewClient.adopt(client)
  return client
}

/** `host`'s Send and Review Now buttons, as drawn:  `[state, tooltip]` each;  `null` when not drawn. */
function headerButtons(host: Element) {
  const read = (part: string) => {
    const button = host.shadowRoot!.querySelector<HTMLButtonElement>(`[part~="${part}"]`)
    return button ? [button.dataset.state, button.title] : null
  }
  return { send: read("send"), now: read("review-now") }
}

/** What the tooltips add while nobody listens. */
const NOBODY = ".  No Claude session is reviewing this doc:  this waits for the next /epic review"

describe("<epic-page> Send and Review Now", () => {
  afterEach(() => {
    ReviewClient.adopt(undefined)
  })

  test("drawn ONLY while the page is reviewed (served with a token, its inbox answering)", async () => {
    await adoptClient(new FakeRoutes(), { served: false })
    const host = await render(page("", ["todo"]))
    expect(headerButtons(host)).toEqual({ send: null, now: null })
  })

  test("dashed blue with unsent marks;  a click sends them, then outlined;  nobody listening:  the tooltips say so, the review line in orange", async () => {
    const routes = new FakeRoutes()
    const at = new Date().toISOString()
    routes.inbox.marks = { q1: { action: "approve", at }, q2: { action: "revisit", when: "soon", note: "hm", at } }
    const client = await adoptClient(routes)
    const host = await render(page("", ["todo"]))
    await vi.waitFor(() => expect(headerButtons(host).send).not.toBeNull())
    expect(headerButtons(host)).toEqual({
      send: ["unsent", `Send 2 marks to Claude${NOBODY}`],
      now: ["ready", `Review Now:  Claude works through 2 marks at once, answers in their items${NOBODY}`]
    })
    const send = host.shadowRoot!.querySelector<HTMLButtonElement>('[part~="send"]')!
    // the fill rule (Q20):  pressed marks not sent, dashed;  sent, outlined
    expect(getComputedStyle(send).borderTopStyle).toBe("dashed")
    const line = host.shadowRoot!.querySelector<HTMLElement>('[part~="review-line"]')!
    expect(line.textContent).toContain("No Claude session")
    expect(getComputedStyle(line).backgroundColor).not.toMatch(/^rgba\(0, 0, 0, 0\)$|^transparent$/)
    send.click()
    await vi.waitFor(() => expect(routes.posts.map(([route]) => route)).toEqual(["send"]))
    await vi.waitFor(() => expect(headerButtons(host).send?.[0]).toBe("sent"))
    expect(getComputedStyle(send).borderTopStyle).toBe("solid")
    routes.inbox.listening = { session: "s1", since: at, seen: at }
    await client.refresh()
    await ElementFixture.tick()
    expect(headerButtons(host).send).toEqual(["sent", "Sent:  waiting for Claude"])
    host.shadowRoot!.querySelector<HTMLButtonElement>('[part~="review-now"]')!.click()
    await vi.waitFor(() =>
      expect(routes.posts.at(-1)).toEqual(["send", { page: "/epics/demo/demo.plan.html", now: true }])
    )
    await expectAccessible(host)
  })

  test("no marks:  both grey, saying there's nothing to send or work through", async () => {
    await adoptClient(new FakeRoutes())
    const host = await render(page("", ["todo"]))
    await vi.waitFor(() => expect(headerButtons(host).send).not.toBeNull())
    expect(headerButtons(host)).toEqual({
      send: ["idle", "Nothing to send:  mark an item first (its buttons)"],
      now: ["idle", "Review Now:  nothing to work through yet"]
    })
  })
})

////////////////
// ## Agents running (epic `skillz` P3)
////////////////

/** The agents routes, as `fetch`, over a list kept here:  each reply `{ agents }`;  `posts` every redirect. */
class FakeAgents {
  agents: Record<string, unknown>[] = [
    {
      name: "demo-aaa",
      task: "Port the parser",
      status: "active",
      started: new Date(Date.now() - 125 * 60_000).toISOString()
    },
    {
      name: "demo-bbb",
      task: "Wait for aaa",
      status: "blocked on demo-aaa",
      started: new Date().toISOString(),
      redirects: [{ note: "Hold on", at: "2026-10-07T10:42:00.000Z", told: "2026-10-07T10:43:00.000Z" }]
    }
  ]
  posts: Record<string, unknown>[] = []
  /** the next redirect's error, once */
  failure = ""

  readonly fetch = vi.fn(async (input: string, init?: RequestInit): Promise<Response> => {
    if (input.startsWith("/api/agents?")) return reply({ agents: this.agents })
    const body = JSON.parse(init!.body as string) as Record<string, unknown>
    this.posts.push(body)
    if (this.failure) {
      const error = this.failure
      this.failure = ""
      return reply({ error }, 400)
    }
    const agent = this.agents.find((it) => it.name === body.name)!
    agent.redirects = [...((agent.redirects as unknown[]) ?? []), { note: body.note, at: new Date().toISOString() }]
    return reply({ agents: this.agents })
  })
}

/** A JSON reply. */
function reply(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } })
}

/** A started agents client on `routes`, adopted as the page's;  `served` false:  no token, never listed. */
async function adoptAgents(routes: FakeAgents, { served = true } = {}) {
  const client = new AgentsClient({
    page: "/epics/demo/demo.plan.html",
    server: served ? { token: "token" } : undefined,
    protocol: "http:",
    fetch: routes.fetch as unknown as typeof fetch
  })
  await client.start()
  AgentsClient.adopt(client)
  return client
}

/** `host`'s agent rows, as drawn:  `[name, status, colour, age, task, redirects]` each. */
function agentRows(host: Element) {
  return Array.from(host.shadowRoot!.querySelectorAll<HTMLElement>(".agent"), (row) => [
    row.querySelector(".agent-name")!.textContent,
    row.querySelector("ui-label")!.textContent!.trim(),
    row.querySelector("ui-label")!.getAttribute("color"),
    row.querySelector(".agent-age")!.textContent,
    row.querySelector(".agent-task")!.textContent,
    Array.from(row.querySelectorAll(".agent-redirects > li"), (li) => li.textContent!.replace(/\s+/g, " ").trim())
  ])
}

/** Agent `name`'s row, its note box and its Send button. */
function noteBox(host: Element, name: string) {
  const row = host.shadowRoot!.querySelector(`.agent[data-name="${name}"]`)!
  return { row, note: row.querySelector("textarea")!, send: row.querySelector<HTMLElement>("ui-button")! }
}

/** Type `text` into `note`, as a person would. */
function type(note: HTMLTextAreaElement, text: string) {
  note.value = text
  note.dispatchEvent(new InputEvent("input", { bubbles: true }))
}

/** Render a page with the panel, once it shows. */
async function renderWithAgents(): Promise<E.DOMElement> {
  const host = await render(page("", ["active"]))
  await vi.waitFor(() => expect(host.shadowRoot!.querySelector(".agents")).not.toBeNull())
  return host
}

describe("<epic-page> Agents running", () => {
  afterEach(() => {
    AgentsClient.adopt(undefined)
  })

  test("a row per running agent, right before the blocks:  name, status, age, task, redirects;  passes axe", async () => {
    await adoptAgents(new FakeAgents())
    const host = await renderWithAgents()
    const panel = host.shadowRoot!.querySelector(".agents")!
    expect(panel.getAttribute("aria-label")).toBe("Agents running")
    expect(panel.querySelector(".agents-title")!.textContent).toBe("Agents running2")
    expect(panel.parentElement!.nextElementSibling!.localName).toBe("slot")
    expect(agentRows(host)).toEqual([
      ["demo-aaa", "active", "blue", "2h 5m", "Port the parser", []],
      [
        "demo-bbb",
        "blocked on demo-aaa",
        "orange",
        "<1m",
        "Wait for aaa",
        [`You · ${clockOf("2026-10-07T10:42:00.000Z")} · told ${clockOf("2026-10-07T10:43:00.000Z")}Hold on`]
      ]
    ])
    expect(noteBox(host, "demo-aaa").note.placeholder).toBe("Redirect demo-aaa ...")
    // the rail and counts read the light DOM:  the panel isn't there
    expect(host.querySelector(".agents")).toBeNull()
    await expectAccessible(host)
  })

  test("a poll updates each row in place:  what's typed in a box, and its focus, stay", async () => {
    const routes = new FakeAgents()
    const client = await adoptAgents(routes)
    const host = await renderWithAgents()
    const { note } = noteBox(host, "demo-aaa")
    note.focus()
    type(note, "Half typed")
    routes.agents[0]!.status = "blocked on demo-ccc"
    routes.agents.push({ name: "demo-ccc", task: "New one", status: "active", started: new Date().toISOString() })
    await client.refresh()
    await ElementFixture.tick()
    expect(agentRows(host).map((row) => row.slice(0, 3))).toEqual([
      ["demo-aaa", "blocked on demo-ccc", "orange"],
      ["demo-bbb", "blocked on demo-aaa", "orange"],
      ["demo-ccc", "active", "blue"]
    ])
    expect(noteBox(host, "demo-aaa").note).toBe(note)
    expect(note.value).toBe("Half typed")
    expect(host.shadowRoot!.activeElement).toBe(note)
    expect(host.shadowRoot!.querySelector(".agents-count")!.textContent).toBe("3")
  })

  test("Send (and Cmd + Enter) redirects the agent:  the note posted, the box emptied, the redirect waiting", async () => {
    const routes = new FakeAgents()
    await adoptAgents(routes)
    const host = await renderWithAgents()
    const { note, send } = noteBox(host, "demo-aaa")
    expect(send.hasAttribute("disabled")).toBe(true)
    type(note, "  Use the new parser  ")
    await ElementFixture.tick()
    expect(send.hasAttribute("disabled")).toBe(false)
    send.click()
    await vi.waitFor(() => expect(note.value).toBe(""))
    expect(routes.posts).toEqual([{ page: "/epics/demo/demo.plan.html", name: "demo-aaa", note: "Use the new parser" }])
    const sent = (routes.agents[0]!.redirects as { at: string }[])[0]!.at
    await vi.waitFor(() =>
      expect(agentRows(host)[0]![5]).toEqual([`You · ${clockOf(sent)} · waiting for the sessionUse the new parser`])
    )
    type(note, "And the old tests")
    note.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }))
    await vi.waitFor(() => expect(routes.posts).toHaveLength(2))
    await vi.waitFor(() => expect(note.value).toBe(""))
  })

  test("a refused redirect says why under the box, as a sentence;  what was typed stays", async () => {
    const routes = new FakeAgents()
    await adoptAgents(routes)
    const host = await renderWithAgents()
    const { row, note, send } = noteBox(host, "demo-bbb")
    routes.failure = "AgentList:  no agent `demo-bbb` is running"
    type(note, "Go on")
    await ElementFixture.tick()
    send.click()
    await vi.waitFor(() =>
      expect(row.querySelector(".agent-error")?.textContent).toBe("AgentList:  no agent `demo-bbb` is running.")
    )
    expect(note.value).toBe("Go on")
  })

  test("keeps the reader's place:  read below it, the page scrolls by what the panel grew or shrank", async () => {
    const routes = new FakeAgents()
    const client = await adoptAgents(routes)
    const host = await render(page("", ["active"], `<div id="tall" style="height: 3000px"></div>`))
    await vi.waitFor(() => expect(host.shadowRoot!.querySelector(".agents")).not.toBeNull())
    const tall = host.querySelector("#tall")!
    window.scrollTo({ top: tall.getBoundingClientRect().top + window.scrollY + 400, behavior: "instant" })
    const was = tall.getBoundingClientRect().top
    // within a pixel:  scrolling goes by whole pixels, the panel's height doesn't
    const kept = () => Math.abs(tall.getBoundingClientRect().top - was)
    const panelHeight = host.shadowRoot!.querySelector(".agents-box")!.getBoundingClientRect().height
    routes.agents.push({ name: "demo-ccc", task: "One more", status: "active", started: new Date().toISOString() })
    await client.refresh()
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector(".agents-box")!.getBoundingClientRect().height).toBeGreaterThan(panelHeight)
    expect(kept()).toBeLessThan(1.5)
    routes.agents = []
    await client.refresh()
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector(".agents")).toBeNull()
    expect(kept()).toBeLessThan(1.5)
    window.scrollTo({ top: 0, behavior: "instant" })
  })

  test("hidden with no agent running, or the page not served with a token;  gone when the last one finishes", async () => {
    const empty = new FakeAgents()
    empty.agents = []
    await adoptAgents(empty)
    const none = await render(page("", ["active"]))
    expect(none.shadowRoot!.querySelector(".agents")).toBeNull()
    none.remove()
    await adoptAgents(new FakeAgents(), { served: false })
    const unserved = await render(page("", ["active"]))
    expect(unserved.shadowRoot!.querySelector(".agents")).toBeNull()
    unserved.remove()
    const routes = new FakeAgents()
    const client = await adoptAgents(routes)
    const host = await renderWithAgents()
    routes.agents = []
    await client.refresh()
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector(".agents")).toBeNull()
  })
})
