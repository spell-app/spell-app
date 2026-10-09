import { describe, expect, test } from "vite-plus/test"

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
