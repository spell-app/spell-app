import { afterEach, describe, expect, test } from "vite-plus/test"

import { UI, type UIHost } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import { EpicSectionFallback } from "./epic-section.fallback"

import "$/ui/components/ui-section"
import "$/epics/components/epic-section"

/** Fixture parts the test server serves (the package root is its root). */
const FIXTURES = "/components/epic-section/fixtures"

/** A folding element's host, with its source API. */
type FoldHost = UIHost & { load(): Promise<void> }

/** `host`'s inner `<ui-section>`. */
function inner(host: Element): UIHost {
  return host.shadowRoot!.querySelector("ui-section") as UIHost
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
  test("draws its numbered title and its kind's tooltip;  starts FOLDED, with a grey rule and no gap below", async () => {
    const host = await render(
      `<div><epic-section id="phases" kind="phases"></epic-section>` +
        `<epic-section id="decisions" kind="questions"><p>An item</p></epic-section></div>`
    )
    const questions = host.parentElement!.querySelector<FoldHost>("#decisions")!
    expect(titleText(host)).toBe("1. Phases")
    expect(titleText(questions)).toBe("2. Questions")
    expect(inner(questions).getAttribute("info")).toMatch(/^Open questions first/)
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

  test("loads its `source` part into its LIGHT children the first time it opens, and fires `ui-load`", async () => {
    const host = await render(`<epic-section id="log" kind="log" source="${FIXTURES}/part.htm"></epic-section>`)
    const loads: string[] = []
    host.addEventListener("ui-load", (event) => loads.push((event as CustomEvent<{ source: string }>).detail.source))
    expect(host.querySelector("p.body")).toBeNull()
    toggle(host).click()
    await host.load()
    await ElementFixture.tick()
    expect(host.querySelector(":scope > p.body")!.textContent).toBe("A body, from its part file.")
    expect(loads).toEqual([`${FIXTURES}/part.htm`])
    expect(host.matches(":state(loaded)")).toBe(true)
    expect(inner(host).hasAttribute("collapsed")).toBe(false)
  })

  test("a part that can't load says so, in place of the body", async () => {
    const host = await render(`<epic-section id="log" kind="log" source="${FIXTURES}/missing.htm"></epic-section>`)
    host.addEventListener("ui-error", () => undefined)
    toggle(host).click()
    await host.load().catch(() => undefined)
    await ElementFixture.tick()
    await ElementFixture.tick()
    const note = host.shadowRoot!.querySelector('[part~="note"]')
    expect(note?.textContent).toBe(`Couldn't load ${FIXTURES}/missing.htm.`)
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

  test("a render that throws shows the native fallback:  a plain heading over its children", async () => {
    // drawn on a stand-in host:  `ElementFixture.breakRender()` needs a class-emitting attribute, which none has
    const host = document.createElement("div")
    host.setAttribute("kind", "overview-part")
    host.setAttribute("title", "Plain")
    host.innerHTML = "<p>Kept</p>"
    document.body.append(host)
    const root = host.attachShadow({ mode: "open" })
    EpicSectionFallback.render(host, root)
    expect(root.querySelector("h3")!.textContent).toBe("Plain")
    expect(host.querySelector("p")!.assignedSlot).not.toBeNull()
    host.remove()
  })

  test("a link into it (`#hash` on an id in its `part-ids`) opens it and loads its part", async () => {
    const host = await render(
      `<epic-section id="o3" kind="overview-part" title="Linked" source="${FIXTURES}/part.htm" part-ids="deep"></epic-section>`
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
