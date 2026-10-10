import { afterEach, describe, expect, test } from "vite-plus/test"

import { E, UI } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/ui/components/ui-section"
import "$/epics/components/epic-section"
import "$/epics/components/epic-phase"

/** Fixture parts the test server serves (the package root is its root). */
const FIXTURES = "/components/epic-section/fixtures"

/** A folding element's host, with its source API. */
type FoldHost = E.DOMElement & { load(): Promise<void> }

/** `host`'s inner `<ui-section>`. */
function inner(host: Element): E.DOMElement {
  return host.shadowRoot!.querySelector("ui-section") as E.DOMElement
}

/** The fold button of `host`'s inner section. */
function toggle(host: Element): HTMLButtonElement {
  return inner(host).shadowRoot!.querySelector('[part~="toggle"]') as HTMLButtonElement
}

/** The title text of `host`, as drawn:  its inner section's header, through every slot. */
function titleText(host: Element): string {
  const header = inner(host).shadowRoot!.querySelector('[part~="header"]')!
  return flatText(header).replace(/\s+/g, " ").trim()
}

/** `node`'s text in the FLAT tree:  a slot's assigned nodes (else its fallback), a host's shadow root. */
function flatText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ""
  if (!(node instanceof Element)) return ""
  if (node instanceof HTMLSlotElement) {
    const assigned = node.assignedNodes()
    return (assigned.length ? assigned : Array.from(node.childNodes)).map(flatText).join("")
  }
  return Array.from((node.shadowRoot ?? node).childNodes, flatText).join("")
}

/** Render `html`, wait for it and its inner sections. */
async function render(html: string): Promise<FoldHost> {
  const root = await ElementFixture.render<FoldHost>(html)
  const host = root.localName === "epic-section" ? root : root.querySelector<FoldHost>("epic-section")!
  await ElementFixture.settle(host.parentElement!)
  for (const fold of [host, ...host.parentElement!.querySelectorAll("epic-section")]) await inner(fold)?.ready
  await ElementFixture.tick()
  return host
}

afterEach(() => {
  UI.sources.forget()
})

describe("<epic-section>", () => {
  test("a REPORT:  titled its own, UNNUMBERED, on the section band;  the sections after it keep their numbers", async () => {
    const host = await render(
      `<div><epic-section id="overnight" kind="report" title="Overnight · 2026-10-04"><p>The night.</p></epic-section>` +
        `<epic-section id="phases" kind="phases"></epic-section></div>`
    )
    const phases = host.parentElement!.querySelector<FoldHost>("#phases")!
    expect([titleText(host), titleText(phases)]).toEqual(["Overnight · 2026-10-04", "1. Phases"])
    expect((host as unknown as { contentsEntry: unknown }).contentsEntry).toEqual({ label: "Overnight · 2026-10-04" })
    expect(getComputedStyle(host).getPropertyValue("--_epic-fold-band")).toBe(
      getComputedStyle(phases).getPropertyValue("--_epic-fold-band")
    )
    await expectAccessible(host)
  })

  test("draws its numbered title, no tooltip;  starts FOLDED, with a grey rule and no gap below", async () => {
    const host = await render(
      `<div><epic-section id="phases" kind="phases"></epic-section>` +
        `<epic-section id="decisions" kind="questions"><p>An item</p></epic-section></div>`
    )
    const questions = host.parentElement!.querySelector<FoldHost>("#decisions")!
    expect(titleText(host)).toBe("1. Phases")
    expect(titleText(questions)).toBe("2. Questions")
    expect(inner(questions).hasAttribute("info")).toBe(false)
    expect(host.matches(":state(open)")).toBe(false)
    expect(inner(host).hasAttribute("collapsed")).toBe(true)
    const style = getComputedStyle(host)
    expect({ rule: style.borderBottomWidth, gap: style.marginBottom }).toEqual({ rule: "1px", gap: "0px" })
  })

  test("a click on its title goes through the host's cancelable `ui-open`;  open, a gap below and no rule", async () => {
    const host = await render(`<epic-section id="decisions" kind="questions"><p>An item</p></epic-section>`)
    const opens: boolean[] = []
    let veto = true
    host.addEventListener("ui-open", (event) => {
      opens.push(event.cancelable)
      if (veto) event.preventDefault()
    })
    toggle(host).click()
    await ElementFixture.tick()
    expect(host.matches(":state(open)")).toBe(false)
    veto = false
    toggle(host).click()
    await ElementFixture.tick()
    expect(opens).toEqual([true, true])
    expect(host.matches(":state(open)")).toBe(true)
    expect(inner(host).hasAttribute("collapsed")).toBe(false)
    const style = getComputedStyle(host)
    expect({ rule: style.borderBottomStyle, gap: style.marginBottom }).toEqual({ rule: "none", gap: "28px" })
    await expectAccessible(host)
  })

  test("shows its prose through its slots:  an Overview sub-section's title, markup and all", async () => {
    const host = await render(
      `<epic-section id="o2" kind="overview-part" open><span slot="title">The <code>x</code> API</span><p>Hello</p></epic-section>`
    )
    expect(titleText(host)).toBe("1.1 The x API")
    expect(host.querySelector("p")!.assignedSlot).not.toBeNull()
  })

  test("an Overview sub-section's status cards from Claude (P13) go to its `status` slot, after its prose", async () => {
    const host = await render(
      `<epic-section id="o2" kind="overview-part" title="Why" open>` +
        `<epic-status slot="status" state="done" at="2026-10-08 14:20"><p>Said more</p></epic-status><p>Prose</p>` +
        `</epic-section>`
    )
    const [prose, card] = [host.querySelector(":scope > p")!, host.querySelector("epic-status")!]
    expect(card.assignedSlot!.name).toBe("status")
    expect(
      prose.assignedSlot!.compareDocumentPosition(card.assignedSlot!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  test("loads its `source` part into its LIGHT children the first time it opens, and fires `ui-load`", async () => {
    const host = await render(`<epic-section id="log" kind="log" source="${FIXTURES}/part.html"></epic-section>`)
    const loads: string[] = []
    host.addEventListener("ui-load", (event) => loads.push((event as CustomEvent<{ source: string }>).detail.source))
    expect(host.querySelector("p.body")).toBeNull()
    toggle(host).click()
    await host.load()
    await ElementFixture.tick()
    expect(host.querySelector(":scope > p.body")!.textContent).toBe("A body, from its part file.")
    expect(loads).toEqual([`${FIXTURES}/part.html`])
    expect(host.matches(":state(loaded)")).toBe(true)
    expect(inner(host).hasAttribute("collapsed")).toBe(false)
  })

  test("a part that can't load says so, in place of the body", async () => {
    const host = await render(`<epic-section id="log" kind="log" source="${FIXTURES}/missing.html"></epic-section>`)
    host.addEventListener("ui-error", () => undefined)
    toggle(host).click()
    await host.load().catch(() => undefined)
    await ElementFixture.tick()
    await ElementFixture.tick()
    const note = host.shadowRoot!.querySelector('[part~="note"]')
    expect(note?.textContent).toBe(`Couldn't load ${FIXTURES}/missing.html.`)
    expect(host.matches(":state(error)")).toBe(true)
  })

  test("an item section with no items says None yet;  the Phases toggles show the fields they name", async () => {
    const host = await render(
      `<div><epic-section id="caveats" kind="caveats" open></epic-section>` +
        `<epic-section id="phases" kind="phases" open></epic-section></div>`
    )
    expect(host.shadowRoot!.querySelector('[part~="empty"]')?.textContent).toBe("None yet")
    const phases = host.parentElement!.querySelector<FoldHost>("#phases")!
    const base = phases.shadowRoot!.querySelector<HTMLElement>('[part~="base"]')!
    const [files] = phases.shadowRoot!.querySelectorAll<HTMLButtonElement>("button.toggle")
    expect(base.style.getPropertyValue("--epic-files-display")).toBe("")
    files!.click()
    await ElementFixture.tick()
    expect(base.style.getPropertyValue("--epic-files-display")).toBe("block")
    expect(files!.getAttribute("aria-pressed")).toBe("true")
    files!.click()
    await ElementFixture.tick()
  })

  test("a link into it (`#hash` on an id in its `part-ids`) opens it and loads its part", async () => {
    const host = await render(
      `<epic-section id="o3" kind="overview-part" title="Linked" source="${FIXTURES}/part.html" part-ids="deep"></epic-section>`
    )
    location.hash = "#deep"
    await new Promise((resolve) => window.addEventListener("hashchange", resolve, { once: true }))
    await host.load()
    await ElementFixture.tick()
    expect(host.matches(":state(open)")).toBe(true)
    expect(host.querySelector("#deep")).not.toBeNull()
    history.replaceState(null, "", location.pathname + location.search)
  })
})

////////////////
// ## Counts, the state filter, Plan changes (P10)
////////////////

/** Questions in `states` (`status:state`), ids `q1`, `q2` ... */
function questions(states: string[]): string {
  const items = states.map((pair, at) => {
    const [status, state] = pair.split(":")
    return `<epic-item id="q${at + 1}" title="Q ${at + 1}" status="${status}"${state ? ` state="${state}"` : ""}></epic-item>`
  })
  return `<epic-section id="decisions" kind="questions" open>${items.join("")}</epic-section>`
}

/** `host`'s state chips, as drawn:  `state` => pressed. */
function chips(host: Element): Record<string, boolean> {
  const buttons = host.shadowRoot!.querySelectorAll<HTMLButtonElement>('[part~="filter"] button')
  return Object.fromEntries(
    Array.from(buttons, (button) => [button.dataset.state!, button.getAttribute("aria-pressed") === "true"])
  )
}

/** The ids of `host`'s items that show. */
function shownIds(host: Element): string[] {
  return Array.from(host.querySelectorAll("epic-item"))
    .filter((item) => getComputedStyle(item).display !== "none")
    .map((item) => item.id)
}

describe("<epic-section> counts and state filter", () => {
  afterEach(() => {
    localStorage.removeItem(`spell-item-state:${location.pathname}`)
  })

  // an item section shows no badge:  its chips say the numbers (Owen, 2026-10-10);  the count still follows, for the toolbar
  test("its count is `open/all`, follows an item's status as it changes, and items coming;  no badge on its title", async () => {
    const host = await render(questions(["open", "decided", "done", "open"]))
    const count = () =>
      (host as FoldHost & { contentsEntry?: { count?: { open: number; total: number } } }).contentsEntry?.count
    expect(inner(host).getAttribute("badge")).toBeNull()
    expect(count()).toMatchObject({ open: 2, total: 4 })
    host.querySelector("#q1")!.setAttribute("status", "decided")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(count()).toMatchObject({ open: 1, total: 4 })
    host.insertAdjacentHTML("beforeend", `<epic-item id="q5" title="Q 5" status="open"></epic-item>`)
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(count()).toMatchObject({ open: 2, total: 5 })
    expect(inner(host).getAttribute("badge")).toBeNull()
  })

  test("its host's `contentsEntry` (the page's rail):  label, kind icon and count, read as they are NOW", async () => {
    const host = await render(questions(["open:attention", "decided", "done"]))
    const entry = () => (host as FoldHost & { contentsEntry?: unknown }).contentsEntry
    // `attention`:  what needs Owen, the red count on the rail (Q20)
    expect(entry()).toEqual({
      label: "1. Questions",
      icon: "file circle question",
      count: { open: 1, total: 3, attention: 1 }
    })
    // right after a change, before any memo or observer has caught up:  what the live update reads
    host.querySelector("#q1")!.setAttribute("status", "decided")
    host.querySelector("#q1")!.setAttribute("state", "recent")
    expect(entry()).toMatchObject({ count: { open: 0, total: 3, attention: 0 } })
    // `replied` (orange:  Claude answered with options, Owen's turn to pick) needs him too (Owen, 2026-10-09)
    host.querySelector("#q2")!.setAttribute("state", "replied")
    expect(entry()).toMatchObject({ count: { attention: 1 } })
    const part = await render(`<epic-section id="o2" kind="overview-part" title="Why"><p>Prose.</p></epic-section>`)
    expect((part as FoldHost & { contentsEntry?: unknown }).contentsEntry).toEqual({ label: "1.1 Why" })
  })

  test("phases count too (open:  not done);  the log and an empty section have no badge", async () => {
    const host = await render(
      `<div><epic-section id="phases" kind="phases">` +
        `<epic-phase id="p1" title="One" status="done"></epic-phase>` +
        `<epic-phase id="p2" title="Two" status="active"></epic-phase></epic-section>` +
        `<epic-section id="caveats" kind="caveats"></epic-section>` +
        `<epic-section id="log" kind="log"></epic-section></div>`
    )
    const sections = host.parentElement!.querySelectorAll("epic-section")
    expect(Array.from(sections, (section) => inner(section).getAttribute("badge"))).toEqual(["1/2", null, null])
    expect(host.shadowRoot!.querySelector('[part~="filter"]')).toBeNull()
  })

  test("a chip per state its items are in, with how many, all solid;  no filter icon;  passes axe", async () => {
    const host = await render(questions(["open:attention", "open:open", "decided:old", "open"]))
    expect(chips(host)).toEqual({ attention: true, open: true, old: true })
    const counts = Array.from(host.shadowRoot!.querySelectorAll('[part~="filter"] button'), (chip) => chip.textContent)
    expect(counts).toEqual(["1", "2", "1"])
    expect(host.shadowRoot!.querySelector('[part~="filter"] svg')).toBeNull()
    const open = host.shadowRoot!.querySelector<HTMLButtonElement>('[data-state="open"]')!
    expect(open.title).toBe("2 open, still undecided:  show only these")
    expect(getComputedStyle(open).backgroundColor).not.toMatch(/^rgba\(0, 0, 0, 0\)$|^transparent$/)
    await expectAccessible(host)
  })

  test("Owen's rule:  all on, a click shows only that;  a hidden one shows too;  a shown one hides;  the last one, all again", async () => {
    const host = await render(questions(["open:attention", "open:open", "decided:recent", "open:open"]))
    const click = async (state: string) => {
      host.shadowRoot!.querySelector<HTMLButtonElement>(`[data-state="${state}"]`)!.click()
      await ElementFixture.tick()
    }
    await click("open")
    expect(chips(host)).toEqual({ attention: false, open: true, recent: false })
    expect(shownIds(host)).toEqual(["q2", "q4"])
    expect(host.shadowRoot!.querySelector('[part~="hidden-note"]')!.textContent).toBe("2 hidden · show all")
    // hidden, outlined:  no fill
    const red = host.shadowRoot!.querySelector<HTMLButtonElement>('[data-state="attention"]')!
    expect(getComputedStyle(red).backgroundColor).toMatch(/^rgba\(0, 0, 0, 0\)$|^transparent$/)
    expect(red.title).toBe("1 needs attention:  show these too")
    await click("attention")
    expect(chips(host)).toEqual({ attention: true, open: true, recent: false })
    await click("open")
    expect(shownIds(host)).toEqual(["q1"])
    await click("attention")
    expect(chips(host)).toEqual({ attention: true, open: true, recent: true })
    expect(shownIds(host)).toEqual(["q1", "q2", "q3", "q4"])
    // everything showing is remembered as no choice:  a state that comes later shows too
    expect(JSON.parse(localStorage.getItem(`spell-item-state:${location.pathname}`)!)).toEqual({})
  })

  test("remembered per page;  a choice its states have left hides the list, and says so", async () => {
    const host = await render(questions(["open:attention", "open:open"]))
    host.shadowRoot!.querySelector<HTMLButtonElement>('[data-state="attention"]')!.click()
    await ElementFixture.tick()
    expect(JSON.parse(localStorage.getItem(`spell-item-state:${location.pathname}`)!)).toEqual({
      decisions: ["attention"]
    })
    host.remove()
    const again = await render(questions(["open:attention", "open:open"]))
    expect(shownIds(again)).toEqual(["q1"])
    // the red one answered:  nothing left to show, and the line says how to get it back
    again.querySelector("#q1")!.setAttribute("state", "recent")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(shownIds(again)).toEqual([])
    const note = again.shadowRoot!.querySelector<HTMLButtonElement>('[part~="hidden-note"]')!
    expect(note.textContent).toBe("2 hidden · show all")
    note.click()
    await ElementFixture.tick()
    expect(shownIds(again)).toEqual(["q1", "q2"])
  })

  test("`replied` (orange, Owen's turn to pick):  its own chip", async () => {
    const host = await render(questions(["open:replied", "open:open", "open:attention"]))
    expect(chips(host)).toEqual({ attention: true, replied: true, open: true })
    expect(host.shadowRoot!.querySelector('[data-state="replied"]')!.getAttribute("data-color")).toBe("orange")
  })

  test("collapse-all, beside the chevron while open:  its items and the Plan changes box fold, it stays open", async () => {
    const host = await render(
      `<epic-section id="phases" kind="phases" open>` +
        `<epic-updated slot="changes" at="2026-10-07 10:00" phase="1" of="2">Split it.</epic-updated>` +
        `<epic-phase id="p1" title="One" status="active" open><p>Do it.</p></epic-phase></epic-section>`
    )
    await ElementFixture.settle(host)
    host.shadowRoot!.querySelector<HTMLButtonElement>('[part~="changes"] button')!.click()
    await ElementFixture.tick()
    const button = host.shadowRoot!.querySelector<HTMLButtonElement>('[part~="tools"] [part~="collapse-all"]')!
    // last in the title's tools:  beside the chevron
    expect(button.parentElement!.lastElementChild).toBe(button)
    button.click()
    await ElementFixture.tick()
    const phase = host.querySelector("epic-phase")!
    expect([host.matches(":state(open)"), phase.matches(":state(open)")]).toEqual([true, false])
    expect(host.shadowRoot!.querySelector('[part~="changes"] button')!.getAttribute("aria-expanded")).toBe("false")
    // folded:  no collapse-all
    ;(host as FoldHost & { open: boolean }).open = false
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector('[part~="collapse-all"]')).toBeNull()
  })

  test("the Phases section draws its Plan changes box from the `changes` slot;  none without", async () => {
    const host = await render(
      `<epic-section id="phases" kind="phases" open>` +
        `<epic-updated slot="changes" at="2026-10-07 10:00" phase="1" of="2">Split it.</epic-updated>` +
        `<epic-phase id="p1" title="One" status="active"></epic-phase>` +
        `<epic-phase id="p2" title="Two" status="todo"></epic-phase></epic-section>`
    )
    const box = host.shadowRoot!.querySelector('[part~="changes"]')!
    expect(box.textContent).toContain("Plan changes")
    expect(host.querySelector("epic-updated")!.assignedSlot?.name).toBe("changes")
    host.querySelector("epic-updated")!.remove()
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector('[part~="changes"]')).toBeNull()
  })
})
