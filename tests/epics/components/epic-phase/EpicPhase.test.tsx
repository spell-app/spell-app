import { describe, expect, test, vi } from "vite-plus/test"

import type { E } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/ui/components/ui-section"
import "$/epics/components/epic-section"
import "$/epics/components/epic-phase"
import "$/epics/components/epic-update"

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
    // `P5`:  its PLACE among the phases, never its id (stable, from its name:  epic `epic-workflow` P15)
    const before = ["One", "Two", "Three", "Four"]
      .map((title) => `<epic-phase id="p-${title.toLowerCase()}" title="${title}" status="done"></epic-phase>`)
      .join("")
    const host = await render(
      `<epic-section id="phases" kind="phases">${before}` +
        `<epic-phase id="p-drawing-elements" title="Drawing Elements" status="active" estimate="4-6h"></epic-phase>` +
        `</epic-section>`,
      "#p-drawing-elements"
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

describe("<epic-phase> plan changes (Owen, 2026-10-11:  no Plan changes surround)", () => {
  /** A phase of `status`, its plan changed twice:  `changes="2"`, and (`lines`) the two updates loaded. */
  function changed(status: string, { lines = true } = {}) {
    const body = lines
      ? `<epic-field name="symptom">Broken.</epic-field><epic-field name="goal">Fixed.</epic-field>` +
        `<epic-update at="2026-10-07 10:00" summary="Split it" phase="1"><p>Split it.</p></epic-update>` +
        `<epic-update at="2026-10-08 11:00" summary="Joined again" phase="1"><p>Joined again.</p></epic-update>`
      : ""
    return `<epic-phase id="p2" title="Two" status="${status}" changes="2" open>${body}</epic-phase>`
  }

  test("its updates are plain children, each its own block after Goal:  no box around them", async () => {
    const host = await render(changed("todo"))
    expect(host.shadowRoot!.querySelector('[part~="changes"], .changes')).toBeNull()
    const updates = Array.from(host.querySelectorAll("epic-update"))
    for (const update of updates) expect(update.assignedSlot?.name).toBe("")
    await ElementFixture.tick()
    expect(updates.map((update) => update.shadowRoot!.querySelector('[part~="title"]')!.textContent)).toEqual([
      "Update: Split it",
      "Update: Joined again"
    ])
    await expectAccessible(host)
  })

  test("its title says its plan changed while it isn't done, folded too (`changes`, its updates not loaded)", async () => {
    const host = await render(changed("active", { lines: false }))
    const mark = host.shadowRoot!.querySelector('[part~="changed"]')!
    expect(mark.textContent).toBe("2")
    await vi.waitFor(() => expect(mark.querySelector("svg")).not.toBeNull())
    expect(mark.getAttribute("title")).toContain("2 × Update")
    host.setAttribute("status", "done")
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector('[part~="changed"]')).toBeNull()
  })

  test('an older doc\'s lines (`slot="changes"`) still show, unboxed, at the end of its body', async () => {
    const host = await render(
      `<epic-phase id="p2" title="Two" status="todo" open><epic-field name="goal">Fixed.</epic-field>` +
        `<epic-updated slot="changes" at="2026-10-07 10:00" phase="1"><p>Split it.</p></epic-updated></epic-phase>`
    )
    const line = host.querySelector("epic-updated")!
    expect(line.assignedSlot?.name).toBe("changes")
    const body = host.shadowRoot!.querySelector('[part~="body"]')!
    expect(body.querySelector("slot:not([name])")!.compareDocumentPosition(line.assignedSlot!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
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

describe("<epic-updated> (retired:  migrated to <epic-update>)", () => {
  test("an older doc's, fenced:  its icon, `Updated`, its time to the minute (`10/6/26 14:30`) and the phase, then its prose", async () => {
    const host = await render(`<epic-updated at="2026-10-06T14:30:12" phase="3"><p>Changed.</p></epic-updated>`)
    const label = host.shadowRoot!.querySelector('[part~="label"]')!
    expect(label.textContent!.replace(/\s+/g, " ").trim()).toBe("Updated 10/6/26 14:30during P3")
    expect(getComputedStyle(host.shadowRoot!.querySelector('[part~="base"]')!).borderTopStyle).toBe("dashed")
    expect(host.querySelector("p")!.assignedSlot).not.toBeNull()
    await expectAccessible(host)
  })
})

// epic `epic-workflow` P25:  the page's own buttons in the title row, where the docs runtime puts the bullhorn too
describe("<epic-phase> actions slot", () => {
  // P25:  the page's own buttons at the title's end, before its fold
  test('`slot="actions"`:  at the title\'s end, before the chevron;  a click never folds it', async () => {
    const host = await render(
      `<epic-phase id="p-one" title="One" status="active"><button slot="actions" aria-label="Copy">C</button></epic-phase>`
    )
    const button = host.querySelector<HTMLElement>("button[slot=actions]")!
    expect(host.shadowRoot!.querySelector('[part~="tools"]')!.contains(button.assignedSlot)).toBe(true)
    const chevron = inner(host).shadowRoot!.querySelector('[part~="fold-icon"]')!
    const header = inner(host).shadowRoot!.querySelector('[part~="header"]')!
    const [b, fold, words] = [button, chevron, header].map((each) => each.getBoundingClientRect())
    expect([words.right <= b.left + 0.5, b.right <= fold.left + 0.5]).toEqual([true, true])
    button.click()
    await ElementFixture.tick()
    expect(host.matches(":state(open)")).toBe(false)
  })
})

/** Where `element`'s first line of text starts, from the viewport top:  its first character's box. */
function firstLineTop(element: Element): number {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, (node) =>
    node.textContent!.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
  )
  const text = walker.nextNode()!
  const range = document.createRange()
  range.setStart(text, text.textContent!.search(/\S/))
  range.setEnd(text, text.textContent!.search(/\S/) + 1)
  return range.getBoundingClientRect().top
}

// epic `epic-workflow` P25, J183 (Owen, 2026-10-18:  "ellipsis when collapsed, wrap when expanded")
describe("<epic-phase> title, folded and open", () => {
  test("folded:  ONE line cut with …, the pen never cut, its full title the tooltip;  open:  it wraps", async () => {
    const host = await render(
      `<div style="width: 320px"><epic-section id="phases" kind="phases" open>` +
        `<epic-phase id="p-long" title="A long title that cannot fit on one line of the narrow side bar, so folded it is cut and open it wraps" status="active" changes="2"><button slot="actions" aria-label="Copy">C</button></epic-phase>` +
        `</epic-section></div>`,
      "#p-long"
    )
    const header = host.shadowRoot!.querySelector<HTMLElement>(".header")!
    const words = host.shadowRoot!.querySelector<HTMLElement>(".words")!
    const pen = host.shadowRoot!.querySelector<HTMLElement>('[part~="changed"]')!
    const button = host.querySelector<HTMLElement>("button[slot=actions]")!
    const lineHeight = parseFloat(getComputedStyle(words).lineHeight)
    const folded = { top: firstLineTop(words), button: button.getBoundingClientRect() }
    expect(header.getBoundingClientRect().height).toBeLessThan(lineHeight * 1.5)
    expect(words.scrollWidth).toBeGreaterThan(words.clientWidth)
    expect(header.title).toBe(
      "P1 · A long title that cannot fit on one line of the narrow side bar, so folded it is cut and open it wraps"
    )
    // the pen:  whole, inside the title's box, after the cut words
    const [penBox, headerBox, wordsBox] = [pen, header, words].map((each) => each.getBoundingClientRect())
    expect([penBox.width > 0, penBox.right <= headerBox.right + 0.5, penBox.left >= wordsBox.right - 0.5]).toEqual([
      true,
      true,
      true
    ])
    inner(host).shadowRoot!.querySelector<HTMLElement>('[part~="toggle"]')!.click()
    await ElementFixture.tick()
    expect(host.matches(":state(open)")).toBe(true)
    expect(header.getBoundingClientRect().height).toBeGreaterThan(lineHeight * 1.5)
    expect(header.hasAttribute("title")).toBe(false)
    expect(firstLineTop(words)).toBeCloseTo(folded.top, 0)
    // collapse-all shows only while open (as before P25), so the slot's button keeps its height, not its x
    expect(button.getBoundingClientRect().top).toBeCloseTo(folded.button.top, 0)
  })
})
