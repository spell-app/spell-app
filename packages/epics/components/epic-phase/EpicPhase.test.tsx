import { describe, expect, test, vi } from "vite-plus/test"

import type { E } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/ui/components/ui-section"
import "$/epics/components/epic-section"
import "$/epics/components/epic-phase"

/** `host`'s inner `<ui-section>`. */
function inner(host: Element): E.DOMElement {
  return host.shadowRoot!.querySelector("ui-section") as E.DOMElement
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

/** Render `html`, wait for it and every inner section. */
async function render<T extends Element = E.DOMElement>(html: string, selector?: string): Promise<T> {
  const root = await ElementFixture.render<E.DOMElement>(html)
  await ElementFixture.settle(root.parentElement!)
  for (const host of root.parentElement!.querySelectorAll("epic-section, epic-phase")) await inner(host)?.ready
  await ElementFixture.tick()
  return (selector ? root.parentElement!.querySelector(selector) : root) as T
}

describe("<epic-phase>", () => {
  test("its title line:  status icon in its colour, `P5 · <title>`, the estimate as a badge;  folded", async () => {
    const host = await render(
      `<epic-phase id="p5" title="Drawing Elements" status="active" estimate="4-6h"></epic-phase>`
    )
    const section = inner(host)
    const header = section.shadowRoot!.querySelector('[part~="header"]')!
    expect(flatText(header).replace(/\s+/g, " ").trim()).toBe("P5 · Drawing Elements")
    expect(section.getAttribute("badge")).toBe("4-6h")
    const status = host.shadowRoot!.querySelector('[part~="status"]')!
    expect({ classes: status.className, label: status.getAttribute("aria-label") }).toEqual({
      classes: "icon active",
      label: "Under way"
    })
    expect(host.matches(":state(open)")).toBe(false)
    expect(getComputedStyle(host).borderBottomWidth).toBe("1px")
  })

  test("open, it shows its fields through its slot;  nested in a section, its children get the stack", async () => {
    const host = await render<E.DOMElement>(
      `<epic-section id="phases" kind="phases" open><epic-phase id="p1" title="One" status="done" open>` +
        `<epic-field name="symptom">Broken.</epic-field></epic-phase></epic-section>`,
      "epic-phase"
    )
    const field = host.querySelector("epic-field")!
    expect(field.assignedSlot).not.toBeNull()
    // the titles measure themselves (`ResizeObserver`):  a frame or two
    for (let frame = 0; frame < 3; frame++) await new Promise(requestAnimationFrame)
    await ElementFixture.tick()
    const body = host.shadowRoot!.querySelector<HTMLElement>('[part~="body"]')!
    const stack = parseFloat(body.style.getPropertyValue("--epic-stack"))
    expect(stack).toBeGreaterThan(0)
    await expectAccessible(host)
  })
})

describe("<epic-phase> plan changes (epic `epic-workflow` P6)", () => {
  /** A phase of `status`, its plan changed twice:  `changes="2"`, and (`lines`) the two lines loaded. */
  function changed(status: string, { lines = true } = {}) {
    const body = lines
      ? `<epic-field name="symptom">Broken.</epic-field>` +
        `<epic-updated slot="changes" at="2026-10-07 10:00" phase="1"><p>Split it.</p></epic-updated>` +
        `<epic-updated slot="changes" at="2026-10-08 11:00" phase="1"><p>Joined again.</p></epic-updated>`
      : ""
    return `<epic-phase id="p2" title="Two" status="${status}" changes="2" open>${body}</epic-phase>`
  }

  test("its lines in a Plan changes box atop its body:  open while it isn't done, folding by its heading", async () => {
    const host = await render(changed("todo"))
    const box = host.shadowRoot!.querySelector('[part~="changes"]')!
    expect(box.textContent!.replace(/\s+/g, " ").trim()).toBe("Plan changes2")
    for (const line of host.querySelectorAll("epic-updated")) expect(line.assignedSlot?.name).toBe("changes")
    // a pen in the box's heading and in the title's mark:  one glyph node each (a node shows in one place);
    // the icon pack loads first
    await vi.waitFor(() =>
      expect([box.querySelector(".icon svg"), host.shadowRoot!.querySelector('[part~="changed"] svg')]).not.toContain(
        null
      )
    )
    // atop its body:  before the slot of its fields
    const body = host.shadowRoot!.querySelector('[part~="body"]')!
    expect(box.compareDocumentPosition(body.querySelector("slot:not([name])")!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    const heading = box.querySelector("button")!
    expect(heading.getAttribute("aria-expanded")).toBe("true")
    heading.click()
    await ElementFixture.tick()
    expect(heading.getAttribute("aria-expanded")).toBe("false")
    expect(box.querySelector(".changes-body")!.getAttribute("hidden")).toBe("until-found")
    await expectAccessible(host)
  })

  test("its title says its plan changed while it isn't done, folded too (`changes`, its lines not loaded)", async () => {
    const host = await render(changed("active", { lines: false }))
    const mark = host.shadowRoot!.querySelector('[part~="changed"]')!
    expect(mark.textContent).toBe("2")
    await vi.waitFor(() => expect(mark.querySelector("svg")).not.toBeNull())
    expect(mark.getAttribute("title")).toContain("2 × Updated")
    expect(host.shadowRoot!.querySelector('[part~="changes"]')).toBeNull()
    host.setAttribute("status", "done")
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector('[part~="changed"]')).toBeNull()
  })

  test("a done phase:  no mark;  its box folded to start (history);  collapse-all folds an open one", async () => {
    const done = await render(changed("done"))
    expect(done.shadowRoot!.querySelector('[part~="changed"]')).toBeNull()
    expect(done.shadowRoot!.querySelector('[part~="changes"] button')!.getAttribute("aria-expanded")).toBe("false")
    const todo = await render<E.DOMElement & { component: { collapseAll(): number } }>(changed("todo"))
    todo.component.collapseAll()
    await ElementFixture.tick()
    expect(todo.shadowRoot!.querySelector('[part~="changes"] button')!.getAttribute("aria-expanded")).toBe("false")
  })
})

describe("<epic-field>", () => {
  test("its icon and label before its prose;  Files and Verify hidden until the Phases toggles show them", async () => {
    const section = await render<E.DOMElement>(
      `<epic-section id="phases" kind="phases" open><epic-phase id="p1" title="One" status="todo" open>` +
        `<epic-field name="goal"><p>Win.</p></epic-field><epic-field name="files">a.ts</epic-field>` +
        `</epic-phase></epic-section>`
    )
    const goal = section.querySelector('epic-field[name="goal"]')!
    const files = section.querySelector('epic-field[name="files"]')!
    expect(goal.shadowRoot!.querySelector('[part~="label"]')!.textContent).toBe("Goal:")
    expect(goal.shadowRoot!.querySelector('[part~="icon"]')).not.toBeNull()
    expect(getComputedStyle(files).display).toBe("none")
    section.shadowRoot!.querySelector<HTMLButtonElement>("button.toggle")!.click()
    await ElementFixture.tick()
    expect(getComputedStyle(files).display).toBe("block")
    section.shadowRoot!.querySelector<HTMLButtonElement>("button.toggle")!.click()
    await ElementFixture.tick()
    await expectAccessible(goal)
  })

  test("a labelled block in prose (`label`, P14):  `Where:` before its prose, no icon", async () => {
    const field = await render(`<epic-field label="Where"><p>The inbox file.</p></epic-field>`)
    expect(field.shadowRoot!.querySelector('[part~="label"]')!.textContent).toBe("Where:")
    expect(field.shadowRoot!.querySelector('[part~="icon"]')).toBeNull()
    expect(field.querySelector("p")!.assignedSlot).not.toBeNull()
    await expectAccessible(field)
  })

  test("To review:  each link marked with its item's state, which colours its chip", async () => {
    const field = await render(
      `<div><epic-field name="to-review"><a href="#j9">J9</a>, <a href="#q9">Q9</a>, <a href="#i9">I9</a></epic-field>` +
        `<p id="j9" state="attention"></p><p id="q9" status="decided"></p><p id="i9" status="canceled"></p></div>`,
      "epic-field"
    )
    const states = Array.from(field.querySelectorAll("a"), (link) => link.getAttribute("data-spell-state"))
    // without a `state`:  decided green for good, canceled grey (no longer relevant)
    expect(states).toEqual(["attention", "recent", "old"])
  })
})

describe("<epic-updated>", () => {
  test("fenced:  its icon, `Updated`, its time to the minute (`10/6/26 14:30`) and the phase, then its prose", async () => {
    const host = await render(`<epic-updated at="2026-10-06T14:30:12" phase="3"><p>Changed.</p></epic-updated>`)
    const label = host.shadowRoot!.querySelector('[part~="label"]')!
    expect(label.textContent!.replace(/\s+/g, " ").trim()).toBe("Updated 10/6/26 14:30during P3")
    expect(getComputedStyle(host.shadowRoot!.querySelector('[part~="base"]')!).borderTopStyle).toBe("dashed")
    expect(host.querySelector("p")!.assignedSlot).not.toBeNull()
    await expectAccessible(host)
  })
})
