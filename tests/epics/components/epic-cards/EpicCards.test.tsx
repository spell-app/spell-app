import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/ui/components/ui-icon"
import "$/epics/components/epic-cards"

import type { SagaEpic } from "$/epics/components/epic-cards/EpicCards.types"

/** An epic serving the saga:  `phases` its phases' statuses, updated today unless `updated` says otherwise. */
function epic(name: string, phases: string[], extra: Partial<SagaEpic["facts"]> = {}): SagaEpic {
  return {
    name,
    title: name.replace(/^./, (letter) => letter.toUpperCase()),
    href: `../../epics/${name}/${name}.plan.html`,
    summary: `What ${name} does.`,
    facts: { phases, updated: new Date().toISOString().slice(0, 10), ...extra }
  }
}

/** The page server's answer, as `fetch`:  `epics` for the saga. */
function answering(epics: SagaEpic[]) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async () => new Response(JSON.stringify({ saga: "epics", epics })))
}

/** Render a list for saga `epics`, and wait until it has drawn its groups or its note. */
async function render() {
  const host = await ElementFixture.render(`<epic-cards saga="epics"></epic-cards>`)
  await vi.waitFor(() => expect(host.shadowRoot!.querySelector(".group, .note")).toBeTruthy())
  return host
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("<epic-cards>", () => {
  test("asks the page server for the saga's epics;  a card each, grouped by state, by title;  axe", async () => {
    const fetched = answering([
      epic("zeta", ["done", "active"], { active: "P2 · Two" }),
      epic("alpha", ["done", "todo"]),
      epic("idea", [], { future: true }),
      epic("shipped", ["done"]),
      epic("waiting", ["done"], { urgent: ["q1"] })
    ])
    const host = await render()
    expect(fetched.mock.calls[0]![0]).toBe("/api/epics/saga?saga=epics")
    const groups = Array.from(host.shadowRoot!.querySelectorAll(".group"), (group) => [
      group.getAttribute("data-group"),
      Array.from(group.querySelectorAll(".card"), (card) => card.getAttribute("data-epic"))
    ])
    expect(groups).toEqual([
      ["active", ["alpha", "zeta"]],
      ["planning", ["idea"]],
      ["urgent", ["waiting"]],
      ["done", ["shipped"]]
    ])
    const zeta = host.shadowRoot!.querySelector('[data-epic="zeta"]')!
    expect(zeta.querySelector("a")!.getAttribute("href")).toBe("../../epics/zeta/zeta.plan.html")
    expect(zeta.querySelector("a")!.getAttribute("target")).toBe("zeta")
    expect(zeta.querySelector(".summary")!.textContent).toBe("What zeta does.")
    expect(zeta.querySelector(".meta")!.textContent).toBe("in progress · 1/2 phases · P2 · Two")
    await expectAccessible(host)
  })

  test("asks again when an epic page changes;  no epic names the saga:  says so", async () => {
    const fetched = answering([])
    const host = await render()
    expect(host.shadowRoot!.querySelector(".note")!.textContent).toBe(
      "No epic names this saga yet:  epic saga set <epic> epics"
    )
    fetched.mockImplementation(
      async () => new Response(JSON.stringify({ saga: "epics", epics: [epic("one", ["todo"])] }))
    )
    dispatchEvent(new CustomEvent("spell-server:file", { detail: { path: "/epics/one/one.plan.html" } }))
    await vi.waitFor(() => expect(host.shadowRoot!.querySelector('[data-epic="one"]')).toBeTruthy())
    expect(host.shadowRoot!.querySelector(".note")).toBeNull()
    // a file that isn't an epic page's asks nothing
    const asked = fetched.mock.calls.length
    dispatchEvent(new CustomEvent("spell-server:file", { detail: { path: "/guides/x.html" } }))
    await ElementFixture.tick()
    expect(fetched.mock.calls.length).toBe(asked)
  })

  test("no answer:  a note says so, nothing else drawn", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 404 }))
    const host = await render()
    expect(host.shadowRoot!.querySelector(".note")!.textContent).toBe("Couldn't ask the page server for the epics.")
    expect(host.shadowRoot!.querySelector(".group")).toBeNull()
  })

  test("in the side bar's ~320px:  one column, nothing overflows", async () => {
    answering([epic("alpha", ["active"]), epic("beta", ["active"])])
    const host = await ElementFixture.render(`<div style="width: 320px"><epic-cards saga="epics"></epic-cards></div>`)
    const cards = host.querySelector("epic-cards")!
    await vi.waitFor(() => expect(cards.shadowRoot!.querySelectorAll(".card").length).toBe(2))
    expect(cards.scrollWidth).toBeLessThanOrEqual(320)
  })
})
