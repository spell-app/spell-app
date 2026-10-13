import { describe, expect, it } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/brand/components/brand-checklist"

////////////////
// ## Fixtures
////////////////

/** A checklist's DOM element, as tests use it. */
type ListHost = HTMLElement & { step: number | undefined; checkable: boolean; internals: ElementInternals }

/** A check's DOM element, as tests use it. */
type DOMCheckElement = HTMLElement & { selected: boolean; checked: boolean; state: string; internals: ElementInternals }

/** The build card's four steps. */
const STEPS = `
  <brand-check>Planning structure</brand-check>
  <brand-check>Creating screens</brand-check>
  <brand-check>Adding functionality</brand-check>
  <brand-check>Finalizing your app</brand-check>`

/** The phone's habits. */
const HABITS = `
  <brand-check checked>Drink water</brand-check>
  <brand-check>Read</brand-check>
  <brand-check>Move body</brand-check>`

////////////////
// ## Helpers
////////////////

/** Render a list;  returns it and its checks. */
async function render(html: string) {
  const host = await ElementFixture.render<ListHost>(html)
  await ElementFixture.settle()
  return { host, checks: [...host.querySelectorAll<DOMCheckElement>("brand-check")] }
}

/** The `[part~=check]` line of a check. */
function line(check: Element): HTMLElement {
  return check.shadowRoot!.querySelector<HTMLElement>("[part~=check]")!
}

/** The `[part~=marker]` of a check. */
function marker(check: Element): HTMLElement {
  return check.shadowRoot!.querySelector<HTMLElement>("[part~=marker]")!
}

/** Each check's state word. */
function states(checks: Element[]): string[] {
  return checks.map((check) => ["done", "active", "pending"].find((word) => line(check).classList.contains(word))!)
}

/** The list's live region text. */
function status(host: Element): string {
  return host.shadowRoot!.querySelector("[part~=status]")!.textContent ?? ""
}

/** `ui-change` details `target` hears from now on. */
function changes(target: Element): { selected: boolean; checked: boolean }[] {
  const details: { selected: boolean; checked: boolean }[] = []
  target.addEventListener("ui-change", (event) => details.push((event as CustomEvent).detail))
  return details
}

////////////////
// ## Progress
////////////////

describe("<brand-checklist> progress", () => {
  it("renders a list of listitems, every check pending without a `step`", async () => {
    const { host, checks } = await render(`<brand-checklist>${STEPS}</brand-checklist>`)
    const list = host.shadowRoot!.querySelector("[part~=list]")!
    expect(list.getAttribute("role")).toBe("list")
    expect(list.classList.contains("checklist")).toBe(true)
    expect(checks.map((check) => check.internals.role)).toEqual(["listitem", "listitem", "listitem", "listitem"])
    expect(states(checks)).toEqual(["pending", "pending", "pending", "pending"])
    expect(checks.every((check) => check.matches(":state(in-checklist)"))).toBe(true)
    await expectAccessible(host)
  })

  it("`step` marks checks before it done, it active, the rest pending;  at the end, all done", async () => {
    const { host, checks } = await render(`<brand-checklist step="2">${STEPS}</brand-checklist>`)
    expect(states(checks)).toEqual(["done", "done", "active", "pending"])
    expect(checks.map((check) => check.internals.ariaCurrent)).toEqual([null, null, "step", null])
    expect(checks[2]!.matches(":state(active)")).toBe(true)
    host.step = 4
    await ElementFixture.settle()
    expect(states(checks)).toEqual(["done", "done", "done", "done"])
    expect(host.getAttribute("step")).toBe("4")
    host.setAttribute("step", "0")
    await ElementFixture.settle()
    expect(states(checks)).toEqual(["active", "pending", "pending", "pending"])
    await expectAccessible(host)
  })

  it("draws the brand's marks:  done filled with a check, active soft, pending a ring with subtle text", async () => {
    const tokens =
      "--spell-accent: rgb(1, 2, 3); --spell-accent-soft-hover: rgb(4, 5, 6); --spell-text-subtle: rgb(7, 8, 9)"
    const { checks } = await render(`<brand-checklist step="1" style="${tokens}">${STEPS}</brand-checklist>`)
    const [done, active, pending] = checks.map(marker)
    expect(getComputedStyle(done!).backgroundColor).toBe("rgb(1, 2, 3)")
    expect(getComputedStyle(done!.querySelector("svg")!).visibility).toBe("visible")
    expect(getComputedStyle(active!).backgroundColor).toBe("rgb(4, 5, 6)")
    expect(getComputedStyle(pending!).boxShadow).toContain("1.5px")
    expect(getComputedStyle(pending!.querySelector("svg")!).visibility).toBe("hidden")
    expect(getComputedStyle(line(checks[2]!)).color).toBe("rgb(7, 8, 9)")
    expect(done!.getBoundingClientRect().width).toBe(20)
    expect(getComputedStyle(line(checks[0]!)).fontSize).toBe("14px")
  })

  it("pulses the active mark, unless the user prefers reduced motion", async () => {
    const { checks } = await render(`<brand-checklist step="1">${STEPS}</brand-checklist>`)
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
    expect(getComputedStyle(marker(checks[1]!)).animationName).toBe(reduced ? "none" : "brand-check-pulse")
    expect(getComputedStyle(marker(checks[0]!)).animationName).toBe("none")
  })

  it("says what each mark means to a screen reader:  done, in progress", async () => {
    const { checks } = await render(`<brand-checklist step="1">${STEPS}</brand-checklist>`)
    const hidden = checks.map((check) => check.shadowRoot!.querySelector(".ui-visually-hidden-force")?.textContent)
    expect(hidden).toEqual([" done", " in progress", undefined, undefined])
  })

  it("announces progress politely:  each step done, then all done;  never on first render or going back", async () => {
    const { host } = await render(`<brand-checklist step="0">${STEPS}</brand-checklist>`)
    expect(host.shadowRoot!.querySelector("[part~=status]")!.getAttribute("role")).toBe("status")
    expect(status(host)).toBe("")
    host.step = 1
    await ElementFixture.settle()
    expect(status(host)).toBe("Planning structure done")
    host.step = 3
    await ElementFixture.settle()
    expect(status(host)).toBe("Adding functionality done")
    host.step = 4
    await ElementFixture.settle()
    expect(status(host)).toBe("All done")
    host.step = 0
    await ElementFixture.settle()
    expect(status(host)).toBe("All done")
  })

  it("follows checks added and removed", async () => {
    const { host, checks } = await render(`<brand-checklist step="1">${STEPS}</brand-checklist>`)
    const extra = document.createElement("brand-check")
    extra.textContent = "Testing"
    host.prepend(extra)
    await ElementFixture.settle()
    expect(states([extra, ...checks])).toEqual(["done", "active", "pending", "pending", "pending"])
    checks[0]!.remove()
    await ElementFixture.settle()
    expect(states([extra, ...checks.slice(1)])).toEqual(["done", "active", "pending", "pending"])
    expect(checks[0]!.internals.role).toBe(null)
  })

  it("names the list from its `aria-label`", async () => {
    const { host } = await render(`<brand-checklist aria-label="Build progress">${STEPS}</brand-checklist>`)
    expect(host.shadowRoot!.querySelector("[part~=list]")!.getAttribute("aria-label")).toBe("Build progress")
  })
})

////////////////
// ## Checkable
////////////////

describe("<brand-checklist checkable>", () => {
  it("makes every check a checkbox;  `checked` in markup ticks it", async () => {
    const { host, checks } = await render(`<brand-checklist checkable font="serif">${HABITS}</brand-checklist>`)
    const buttons = checks.map(line)
    expect(
      buttons.map((button) => [button.localName, button.getAttribute("role"), button.getAttribute("aria-checked")])
    ).toEqual([
      ["button", "checkbox", "true"],
      ["button", "checkbox", "false"],
      ["button", "checkbox", "false"]
    ])
    expect(
      checks.map(({ selected, checked, internals }) => ({ selected, checked, current: internals.ariaCurrent }))
    ).toEqual([
      { selected: true, checked: true, current: null },
      { selected: false, checked: false, current: null },
      { selected: false, checked: false, current: null }
    ])
    expect(checks[0]!.hasAttribute("selected")).toBe(true)
    await expectAccessible(host)
  })

  it("ticked:  filled, the text subtle and struck through;  serif 15px, 19px marks", async () => {
    const tokens = "--spell-text-subtle: rgb(7, 8, 9); --spell-text-body: rgb(1, 1, 1)"
    const { checks } = await render(
      `<brand-checklist checkable font="serif" style="${tokens}">${HABITS}</brand-checklist>`
    )
    const [ticked, unticked] = checks.map(line)
    expect(getComputedStyle(ticked!).color).toBe("rgb(7, 8, 9)")
    expect(getComputedStyle(ticked!.querySelector(".label")!).textDecorationLine).toBe("line-through")
    expect(getComputedStyle(unticked!).color).toBe("rgb(1, 1, 1)")
    expect(getComputedStyle(unticked!.querySelector(".label")!).textDecorationLine).toBe("none")
    expect(getComputedStyle(ticked!).fontSize).toBe("15px")
    expect(marker(checks[0]!).getBoundingClientRect().width).toBe(19)
  })

  it("a click ticks and unticks:  `ui-change` { selected, checked } first, then `selected` reflects", async () => {
    const { host, checks } = await render(`<brand-checklist checkable>${HABITS}</brand-checklist>`)
    const heard = changes(host)
    await userEvent.click(line(checks[1]!))
    await ElementFixture.settle()
    expect(heard).toEqual([expect.objectContaining({ selected: true, checked: true })])
    expect(checks[1]!.selected).toBe(true)
    expect(checks[1]!.hasAttribute("selected")).toBe(true)
    expect(line(checks[1]!).getAttribute("aria-checked")).toBe("true")
    expect(checks[1]!.matches(":state(done)")).toBe(true)
    await userEvent.click(line(checks[0]!))
    await ElementFixture.settle()
    expect(heard[1]).toEqual(expect.objectContaining({ selected: false, checked: false }))
    expect(checks[0]!.checked).toBe(false)
    expect(checks[0]!.hasAttribute("selected")).toBe(false)
  })

  it("Space and Enter tick the focused check;  Tab moves between them", async () => {
    const { checks } = await render(`<brand-checklist checkable>${HABITS}</brand-checklist>`)
    line(checks[1]!).focus()
    await userEvent.keyboard(" ")
    await ElementFixture.settle()
    expect(checks[1]!.selected).toBe(true)
    await userEvent.keyboard("{Enter}")
    await ElementFixture.settle()
    expect(checks[1]!.selected).toBe(false)
    await userEvent.tab()
    expect(checks[2]!.shadowRoot!.activeElement).toBe(line(checks[2]!))
  })

  it("a handler that re-sets `selected` during `ui-change` wins", async () => {
    const { host, checks } = await render(`<brand-checklist checkable>${HABITS}</brand-checklist>`)
    host.addEventListener("ui-change", (event) => ((event.target as DOMCheckElement).selected = false))
    await userEvent.click(line(checks[2]!))
    await ElementFixture.settle()
    expect(checks[2]!.selected).toBe(false)
  })

  it("ignores `step` and announces nothing", async () => {
    const { host, checks } = await render(`<brand-checklist checkable step="2">${HABITS}</brand-checklist>`)
    expect(states(checks)).toEqual(["done", "pending", "pending"])
    host.step = 3
    await ElementFixture.settle()
    expect(status(host)).toBe("")
  })
})

////////////////
// ## A check alone
////////////////

describe("<brand-check> alone", () => {
  it("shows its own `state`;  `selected` / `checked` mean done;  no listitem role outside a list", async () => {
    const host = await ElementFixture.render<HTMLElement>(`
      <div>
        <brand-check state="active">Active</brand-check>
        <brand-check state="done">Done</brand-check>
        <brand-check>Pending</brand-check>
        <brand-check selected>Selected</brand-check>
      </div>`)
    await ElementFixture.settle()
    const checks = [...host.querySelectorAll<DOMCheckElement>("brand-check")]
    expect(states(checks)).toEqual(["active", "done", "pending", "done"])
    expect(checks.map((check) => check.internals.role)).toEqual([null, null, null, null])
    expect(checks[0]!.internals.ariaCurrent).toBe("step")
    checks[2]!.state = "done"
    await ElementFixture.settle()
    expect(states([checks[2]!])).toEqual(["done"])
    await expectAccessible(host)
  })

  it("`checkable` on its own is a checkbox;  the `checked` property and attribute are `selected`'s alias", async () => {
    const check = await ElementFixture.render<DOMCheckElement>(`<brand-check checkable>Read</brand-check>`)
    await ElementFixture.settle()
    const heard = changes(check)
    expect(line(check).getAttribute("role")).toBe("checkbox")
    check.checked = true
    await ElementFixture.settle()
    expect(check.selected).toBe(true)
    expect(line(check).getAttribute("aria-checked")).toBe("true")
    check.removeAttribute("selected")
    await ElementFixture.settle()
    expect(check.checked).toBe(false)
    check.setAttribute("checked", "")
    await ElementFixture.settle()
    expect(check.selected).toBe(true)
    check.removeAttribute("checked")
    await ElementFixture.settle()
    expect(check.selected).toBe(false)
    expect(heard).toEqual([])
    await userEvent.click(line(check))
    await ElementFixture.settle()
    expect(heard).toEqual([expect.objectContaining({ selected: true })])
    await expectAccessible(check)
  })

  it("`font` on a check beats its list's;  tokens size it", async () => {
    const { checks } = await render(`
      <brand-checklist font="serif" style="--brand-checklist-marker-size: 16px; --brand-checklist-font-size: 13px">
        <brand-check>One</brand-check>
        <brand-check font="sans">Two</brand-check>
      </brand-checklist>`)
    expect(marker(checks[0]!).getBoundingClientRect().width).toBe(16)
    expect(getComputedStyle(line(checks[0]!)).fontSize).toBe("13px")
    const families = checks.map((check) => getComputedStyle(line(check)).fontFamily)
    expect(families[0]).not.toBe(families[1])
  })

  it("a serif list's checks draw the serif defaults (`check serif`):  15px, 19px marks, 10px apart", async () => {
    const { host, checks } = await render(`<brand-checklist font="serif">${STEPS}</brand-checklist>`)
    expect(line(checks[0]!).classList.contains("serif")).toBe(true)
    expect(getComputedStyle(line(checks[0]!)).fontSize).toBe("15px")
    expect(marker(checks[0]!).getBoundingClientRect().width).toBe(19)
    expect(getComputedStyle(host.shadowRoot!.querySelector("[part~=list]")!).rowGap).toBe("10px")
    host.setAttribute("font", "sans")
    await ElementFixture.settle()
    expect(line(checks[0]!).classList.contains("serif")).toBe(false)
    expect(getComputedStyle(line(checks[0]!)).fontSize).toBe("14px")
    expect(getComputedStyle(host.shadowRoot!.querySelector("[part~=list]")!).rowGap).toBe("12px")
  })

  it("`--brand-checklist-spacing` beats both faces' spacing", async () => {
    const { host } = await render(
      `<brand-checklist font="serif" style="--brand-checklist-spacing: 3px">${STEPS}</brand-checklist>`
    )
    expect(getComputedStyle(host.shadowRoot!.querySelector("[part~=list]")!).rowGap).toBe("3px")
  })

  it("centres the mark on the text;  `--brand-checklist-align: start` on its FIRST line", async () => {
    const TWO_LINES = `<brand-check state="done"><b style="display: block">A Spell account</b>
      <small style="display: block">Sign up in seconds.</small></brand-check>`
    const middle = (rect: DOMRect) => rect.top + rect.height / 2
    const centred = await render(`<brand-checklist>${TWO_LINES}</brand-checklist>`)
    const label = (check: Element) => check.shadowRoot!.querySelector("[part~=label]")!.getBoundingClientRect()
    const check = centred.checks[0]!
    expect(middle(marker(check).getBoundingClientRect())).toBeCloseTo(middle(label(check)), 0)
    const top = await render(`<brand-checklist style="--brand-checklist-align: start">${TWO_LINES}</brand-checklist>`)
    const first = top.checks[0]!
    const lineHeight = parseFloat(getComputedStyle(line(first)).fontSize) * 1.3
    expect(middle(marker(first).getBoundingClientRect())).toBeCloseTo(label(first).top + lineHeight / 2, 0)
  })

  it("the light-DOM text is the label, slotted", async () => {
    const { checks } = await render(`<brand-checklist>${STEPS}</brand-checklist>`)
    const slot = checks[0]!.shadowRoot!.querySelector<HTMLSlotElement>("[part~=label] slot")!
    expect(slot.assignedNodes().map((node) => node.textContent)).toEqual(["Planning structure"])
  })
})

////////////////
// ## A broken check
////////////////

describe("<brand-check> broken", () => {
  it("a check whose render throws still shows its text, through a bare <slot>", async () => {
    const check = await ElementFixture.render<DOMCheckElement>(`<brand-check state="active">Read</brand-check>`)
    await ElementFixture.settle()
    breakOnUpdate(check)
    check.state = "done"
    await ElementFixture.settle()
    await ElementFixture.tick()
    expect(check.matches(":state(errored)")).toBe(true)
    const slot = check.shadowRoot!.querySelector("slot")!
    expect(slot.assignedNodes().map((node) => node.textContent)).toEqual(["Read"])
  })
})

/** Make `check`'s next class update throw, as a bug in an update would. */
function breakOnUpdate(check: Element) {
  const component = (check as unknown as { component: object }).component
  Object.defineProperty(component, "extraClass", {
    get: () => {
      throw new Error("forced render failure")
    }
  })
}
