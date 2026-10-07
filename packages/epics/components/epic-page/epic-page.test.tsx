import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import type { UIHost } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import { Markup } from "$/epics/markup"
import { ReviewClient, type Inbox } from "$/epics/review"

import "$/ui/components/ui-section"
import "$/ui/components/ui-label"
import "$/ui/components/ui-message"
import "$/ui/components/ui-code"
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
async function render(html: string): Promise<UIHost> {
  const host = await ElementFixture.render<UIHost>(html)
  await ElementFixture.settle(host)
  await ElementFixture.tick()
  return host
}

describe("<epic-page>", () => {
  test("draws `Epic: <title>`, its meta lines and its durable doc's link, and passes axe", async () => {
    const host = await render(
      page(`branch="demo" worktree="/w/demo" started="2026-10-06" updated="2026-10-07"`, ["done"], "").replace(
        "</epic-overview>",
        `</epic-overview><a slot="durable" href="#durable">Durable</a>`
      )
    )
    const shadow = host.shadowRoot!
    expect(shadow.querySelector("h1")!.textContent).toBe("Epic: Demo")
    const lines = Array.from(shadow.querySelectorAll('[part~="meta"] > li:not([hidden])'), (li) =>
      li.textContent!.replace(/\s+/g, " ").trim()
    )
    expect(lines).toEqual([
      "Plan doc for /epic demo, branch demo",
      "Worktree: /w/demo",
      "Started 2026-10-06, updated 2026-10-07",
      "Durable doc:"
    ])
    expect(host.querySelector('a[slot="durable"]')!.assignedSlot).not.toBeNull()
    await expectAccessible(host)
  })

  test("the step label follows the phases:  the active one, else the next, else DONE;  none without phases", async () => {
    const host = await render(page("", ["done", "active", "todo"]))
    expect(step(host)).toEqual({ words: "P2", color: "orange", href: "#p2", tip: "P2 · Phase 2" })
    host.querySelector("#p2")!.setAttribute("status", "done")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(step(host)).toEqual({ words: "P3", color: "grey", href: "#p3", tip: "Next:  P3 · Phase 3" })
    host.querySelector("#p3")!.setAttribute("status", "done")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(step(host)?.words).toBe("DONE")
    for (const phase of host.querySelectorAll("epic-phase")) phase.remove()
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(step(host)).toBeUndefined()
  })

  test("a future epic:  FUTURE, meta lines without a branch, and its notice;  bedtime:  its label", async () => {
    const future = await render(page("future", []))
    expect(step(future)?.words).toBe("FUTURE")
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

  test("blue with unsent marks;  a click sends them, then outlined;  nobody listening:  the tooltips say so", async () => {
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
    expect(host.shadowRoot!.querySelector('[part~="review-line"]')!.textContent).toContain("No Claude session")
    host.shadowRoot!.querySelector<HTMLButtonElement>('[part~="send"]')!.click()
    await vi.waitFor(() => expect(routes.posts.map(([route]) => route)).toEqual(["send"]))
    await vi.waitFor(() => expect(headerButtons(host).send?.[0]).toBe("sent"))
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
