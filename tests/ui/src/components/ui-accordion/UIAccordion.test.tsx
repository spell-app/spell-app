import { userEvent } from "vite-plus/test/browser"
import { afterEach, beforeAll, describe, expect, it, onTestFinished, vi } from "vite-plus/test"

import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"
import type { AccordionToggleDetail } from "$/ui/components/components.types"

import "$/ui/components/ui-accordion"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-accordion/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Three title + content pairs. */
const PANELS =
  `<ui-title>One</ui-title><ui-content><p>First</p></ui-content>` +
  `<ui-title>Two</ui-title><ui-content><p>Second</p></ui-content>` +
  `<ui-title>Three</ui-title><ui-content><p>Third</p></ui-content>`

/** Render one `<ui-accordion>`;  returns it, its root, its `<details>` and `<summary>`s. */
async function accordion(attributes = "", panels = PANELS) {
  const host = await ElementFixture.render<DOMElement & { open: string | undefined }>(
    `<ui-accordion ${attributes}>${panels}</ui-accordion>`
  )
  return { host, ...parts(host) }
}

/** Shadow parts of an accordion DOM element. */
function parts(host: Element) {
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=accordion]")!
  const details = [...root.querySelectorAll<HTMLDetailsElement>(":scope > details")]
  const titles = details.map((panel) => panel.querySelector<HTMLElement>("summary")!)
  const contents = details.map((panel) => panel.querySelector<HTMLElement>("[part~=content]")!)
  return { root, details, titles, contents }
}

/** Which panels are open, by index. */
function openPanels(details: HTMLDetailsElement[]) {
  return details.flatMap((panel, index) => (panel.open ? [index] : []))
}

/** Collect `ui-open` / `ui-close` details (type, index, open) from `host`. */
function events(host: Element) {
  const seen: { type: string; index: number; open: boolean; originalEvent?: Event }[] = []
  for (const type of ["ui-open", "ui-close"]) {
    host.addEventListener(type, (event) => {
      const { index, open, originalEvent } = (event as CustomEvent<AccordionToggleDetail>).detail
      seen.push({ type, index, open, originalEvent })
    })
  }
  return seen
}

////////////////
// ## Classes
////////////////

describe("<ui-accordion> classes", () => {
  it.each([
    ["", "ui accordion"],
    ["styled", "ui styled accordion"],
    ["styled fluid inverted", "ui fluid inverted styled accordion"],
    ["basic styled", "ui basic styled accordion"],
    ["compact", "ui compact accordion"],
    ['compact="very" styled', "ui styled very compact accordion"],
    ["tree", "ui tree accordion"],
    ['exclusive="no" collapsible="no" open="1"', "ui accordion"]
  ])("<ui-accordion %s>", async (attributes, classes) => {
    const { root } = await accordion(attributes)
    expect(root.className).toBe(classes)
  })
})

////////////////
// ## Panels
////////////////

describe("<ui-accordion> panels", () => {
  it("wraps each title + content pair in a <details> > <summary class=title> + <div class=content>", async () => {
    const { host, details, titles, contents } = await accordion()
    expect(details).toHaveLength(3)
    const [one, first] = [host.querySelector("ui-title")!, host.querySelector("ui-content")!]
    expect(one.assignedSlot!.parentElement).toBe(titles[0])
    expect(first.assignedSlot!.parentElement).toBe(contents[0])
    expect(titles[0]!.className).toBe("title")
    expect(titles[0]!.getAttribute("part")).toBe("title")
    expect(titles[0]!.querySelector("[part~=icon]")!.className).toBe("dropdown icon")
    expect(contents[0]!.className).toBe("content")
    expect(details[0]!.getAttribute("part")).toBe("panel")
    expect(details.every((panel) => panel.name === "panels")).toBe(true)
    expect(openPanels(details)).toEqual([])
    expect(host.matches(":state(open)")).toBe(false)
  })

  it("opens the panels `open` names;  the open title and content are `active`", async () => {
    const { host, details, titles, contents } = await accordion('open="1"')
    expect(openPanels(details)).toEqual([1])
    expect(titles[1]!.className).toBe("active title")
    expect(contents[1]!.className).toBe("active content")
    expect(titles[0]!.className).toBe("title")
    expect(host.matches(":state(open)")).toBe(true)
  })

  it("keeps only the first index open while exclusive;  every index with exclusive=no", async () => {
    const exclusive = await accordion('open="2 0"')
    expect(openPanels(exclusive.details)).toEqual([2])
    const many = await accordion('exclusive="no" open="2 0"')
    expect(openPanels(many.details)).toEqual([0, 2])
    expect(many.details.every((panel) => !panel.name)).toBe(true)
  })

  it("drops the shared name when `exclusive` is set false as a property", async () => {
    const { host, details } = await accordion()
    ;(host as unknown as { exclusive: boolean }).exclusive = false
    await ElementFixture.tick()
    expect(details.every((panel) => !panel.name)).toBe(true)
    expect((host as unknown as { exclusive: boolean }).exclusive).toBe(false)
  })

  it("follows `open` written by the page", async () => {
    const { host, details } = await accordion()
    host.open = "2"
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([2])
    host.removeAttribute("open")
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([])
  })

  it("pairs a title with ANY next element, and a title followed by a title with nothing", async () => {
    const { host, details, contents } = await accordion(
      "",
      `<p>ignored</p><ui-title>A</ui-title><div class="body">Body</div><ui-title>B</ui-title><ui-title>C</ui-title>`
    )
    expect(details).toHaveLength(3)
    expect(host.querySelector(".body")!.assignedSlot!.parentElement).toBe(contents[0])
    expect(contents[1]!.querySelector("slot")).toBeNull()
    expect(host.querySelector("p")!.assignedSlot).toBeNull()
  })

  it("re-pairs when children are added or removed", async () => {
    const { host } = await accordion()
    const title = document.createElement("ui-title")
    title.textContent = "Four"
    const content = document.createElement("ui-content")
    content.textContent = "Fourth"
    host.append(title, content)
    await expect.poll(() => parts(host).details.length).toBe(4)
    expect(content.assignedSlot!.parentElement).toBe(parts(host).contents[3])
    host.querySelector("ui-title")!.remove()
    await expect.poll(() => parts(host).details.length).toBe(3)
  })

  it("leaves the slotted parts plain (no owner state):  the summary and content box are the boxes", async () => {
    const { host, titles } = await accordion("styled")
    const title = host.querySelector<DOMElement>("ui-title")!
    expect(title.matches(":state(in-accordion)")).toBe(false)
    expect(getComputedStyle(titles[0]!).paddingLeft).toBe("16px")
    expect(getComputedStyle(title.shadowRoot!.querySelector(".title")!).paddingLeft).toBe("0px")
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-accordion> tokens from outside", () => {
  /** The first title's top padding. */
  function padding(host: Element): string {
    return getComputedStyle(parts(host).titles[0]!).paddingTop
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await accordion(`style="--ui-accordion-title-padding: 20px 0"`)
    expect(padding(host)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-accordion-title-padding: 20px 0"><ui-accordion>${PANELS}</ui-accordion></section>`
    )
    expect(padding(wrapper.querySelector("ui-accordion")!)).toBe("20px")
  })

  it("takes a token set through `::part(accordion)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(accordion) { --ui-accordion-title-padding: 20px 0 }</style>` +
        `<ui-accordion class="themed">${PANELS}</ui-accordion></div>`
    )
    expect(padding(wrapper.querySelector("ui-accordion")!)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-accordion-title-padding", "20px 0")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-accordion-title-padding")
    })
    const { host } = await accordion()
    expect(padding(host)).toBe("20px")
  })

  it("variations:  `styled` swaps the padding;  the open title's colour follows the title colour", async () => {
    const { host } = await accordion(`styled style="--ui-accordion-title-padding: 20px 0"`)
    expect(padding(host)).not.toBe("20px")
    const red = "rgb(255, 0, 0)"
    const { titles } = await accordion(`open="0" style="--ui-accordion-title-color: ${red}"`)
    expect(getComputedStyle(titles[0]!).color).toBe(red)
  })
})

////////////////
// ## Behaviour
////////////////

describe("<ui-accordion> behaviour", () => {
  it("opens a panel on a title click, closing the open one (exclusive), with ui-open / ui-close first", async () => {
    const { host, details, titles } = await accordion('open="0"')
    const seen = events(host)
    await userEvent.click(titles[1]!)
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([1])
    expect(host.open).toBe("1")
    expect(host.getAttribute("open")).toBe("1")
    expect(seen.map(({ type, index, open }) => [type, index, open])).toEqual([
      ["ui-open", 1, true],
      ["ui-close", 0, false]
    ])
    expect(seen[0]!.originalEvent).toBeInstanceOf(MouseEvent)
  })

  it("closes the open panel on its title click;  not when collapsible=no", async () => {
    const { host, details, titles } = await accordion('open="0"')
    await userEvent.click(titles[0]!)
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([])
    expect(host.open).toBe("")
    const fixed = await accordion('open="0" collapsible="no"')
    await userEvent.click(fixed.titles[0]!)
    await ElementFixture.tick()
    expect(openPanels(fixed.details)).toEqual([0])
  })

  it("keeps several panels open with exclusive=no", async () => {
    const { host, details, titles } = await accordion('exclusive="no" open="0"')
    await userEvent.click(titles[2]!)
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([0, 2])
    expect(host.open).toBe("0 2")
  })

  it("lets ui-open veto an open, and ui-close veto both halves of an exclusive switch", async () => {
    const { host, details, titles } = await accordion('open="0"')
    host.addEventListener("ui-open", (event) => event.preventDefault(), { once: true })
    await userEvent.click(titles[1]!)
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([0])
    host.addEventListener("ui-close", (event) => event.preventDefault(), { once: true })
    await userEvent.click(titles[2]!)
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([0])
    expect(host.open).toBe("0")
  })

  it("lets a handler that re-sets `open` win", async () => {
    const { host, details, titles } = await accordion('open="0"')
    host.addEventListener("ui-open", () => (host.open = "0"), { once: true })
    await userEvent.click(titles[1]!)
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([0])
  })

  it("adopts a change the browser makes itself, announcing it", async () => {
    const { host, details } = await accordion()
    const seen = events(host)
    // what find-in-page does:  open a closed panel natively
    details[2]!.open = true
    await expect.poll(() => host.open).toBe("2")
    expect(seen.map(({ type, index }) => [type, index])).toEqual([["ui-open", 2]])
    expect(parts(host).titles[2]!.className).toBe("active title")
  })

  it("leaves a click on a link inside a title alone", async () => {
    const { host, details } = await accordion(
      "",
      `<ui-title><a href="#more">More</a> about dogs</ui-title><ui-content>Dogs</ui-content>`
    )
    const link = host.querySelector("a")!
    link.addEventListener("click", (event) => event.preventDefault())
    await userEvent.click(link)
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([])
  })

  it("toggle() opens and closes panels as a user would", async () => {
    const { host, details } = await accordion()
    const component = host.component as unknown as { toggle(index: number): boolean }
    expect(component.toggle(1)).toBe(true)
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([1])
    expect(component.toggle(1)).toBe(true)
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([])
  })
})

////////////////
// ## Keyboard
////////////////

describe("<ui-accordion> keyboard", () => {
  it("Tab reaches every title;  Enter / Space toggle;  arrows / Home / End move between titles", async () => {
    const { host, details, titles } = await accordion()
    const before = document.createElement("button")
    before.textContent = "before"
    host.before(before)
    before.focus()
    await userEvent.tab()
    expect(host.shadowRoot!.activeElement).toBe(titles[0])
    await userEvent.keyboard("{Enter}")
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([0])
    await userEvent.tab()
    // the open panel's content has no focusable:  Tab goes to the next title
    expect(host.shadowRoot!.activeElement).toBe(titles[1])
    await userEvent.keyboard(" ")
    await ElementFixture.tick()
    expect(openPanels(details)).toEqual([1])
    await userEvent.keyboard("{ArrowDown}")
    expect(host.shadowRoot!.activeElement).toBe(titles[2])
    await userEvent.keyboard("{ArrowDown}")
    expect(host.shadowRoot!.activeElement).toBe(titles[0])
    await userEvent.keyboard("{ArrowUp}")
    expect(host.shadowRoot!.activeElement).toBe(titles[2])
    await userEvent.keyboard("{Home}")
    expect(host.shadowRoot!.activeElement).toBe(titles[0])
    await userEvent.keyboard("{End}")
    expect(host.shadowRoot!.activeElement).toBe(titles[2])
  })
})

////////////////
// ## Nested
////////////////

describe("<ui-accordion> nested", () => {
  const NESTED =
    `<ui-title>Outer</ui-title><ui-content>` +
    `<ui-accordion open="0"><ui-title>Inner</ui-title><ui-content>Inside</ui-content></ui-accordion>` +
    `</ui-content>`

  it("renders a nested accordion without `ui`, taking its parent's styled look", async () => {
    const { host, titles } = await accordion('styled open="0"', NESTED)
    const inner = host.querySelector<DOMElement>("ui-accordion")!
    await expect.poll(() => inner.matches(":state(in-accordion)")).toBe(true)
    const { root, titles: innerTitles } = parts(inner)
    expect(root.className).toBe("accordion")
    expect(getComputedStyle(innerTitles[0]!).fontWeight).toBe("700")
    expect(getComputedStyle(innerTitles[0]!).paddingLeft).toBe(getComputedStyle(titles[0]!).paddingLeft)
    expect(getComputedStyle(root).marginTop).toBe("16px")
    expect(host.matches(":state(in-accordion)")).toBe(false)
  })

  it("keeps each accordion's panels to itself:  the inner one's click doesn't touch the outer", async () => {
    const { host, details } = await accordion('open="0"', NESTED)
    const inner = host.querySelector<DOMElement & { open: string }>("ui-accordion")!
    await userEvent.click(parts(inner).titles[0]!)
    await ElementFixture.tick()
    expect(inner.open).toBe("")
    expect(openPanels(details)).toEqual([0])
  })
})

////////////////
// ## Look
////////////////

describe("<ui-accordion> look", () => {
  it("draws the styled box, rules between titles, and turns the open title's arrow", async () => {
    const { host, root, titles } = await accordion('styled open="1"')
    host.style.width = "800px"
    expect(getComputedStyle(root).width).toBe("600px")
    host.setAttribute("fluid", "")
    await expect.poll(() => getComputedStyle(root).width).toBe("800px")
    host.removeAttribute("fluid")
    expect(getComputedStyle(root).boxShadow).not.toBe("none")
    expect(getComputedStyle(titles[0]!).borderTopStyle).toBe("none")
    expect(getComputedStyle(titles[1]!).borderTopWidth).toBe("1px")
    const arrow = (index: number) => getComputedStyle(titles[index]!.querySelector(".icon")!).transform
    expect(arrow(0)).toBe("none")
    await expect.poll(() => arrow(1)).not.toBe("none")
  })

  it("indents a tree's content", async () => {
    const { contents } = await accordion('tree open="0"')
    // (WebKit snaps lengths to 1/64 px)
    expect(parseFloat(getComputedStyle(contents[0]!).marginLeft)).toBeCloseTo(1.7 * 16, 1)
    expect(getComputedStyle(contents[0]!).paddingTop).toBe("0px")
  })

  it("inverts to the dark scheme", async () => {
    const { root } = await accordion("inverted")
    expect(getComputedStyle(root).colorScheme).toBe("dark")
  })

  it("animates panels when the browser can grow to `auto`", async () => {
    const { host } = await accordion()
    expect(host.matches(":state(animated)")).toBe(CSS.supports("interpolate-size: allow-keywords"))
  })
})

////////////////
// ## Source
////////////////

describe("<ui-accordion> source", () => {
  /** Fixture bodies the test server serves. */
  const DIR = "/test/fixtures/sources/bodies"

  /** An accordion DOM element with its source API. */
  type SourceAccordion = DOMElement & { open: string | undefined; load(): Promise<void>; reload(): Promise<void> }

  /** One title, no content:  a plan doc's item line. */
  const ITEM = `<ui-title>Q2 <span>A question</span></ui-title>`

  beforeAll(async () => {
    await UI.load()
  })

  afterEach(() => {
    UI.sources.forget()
    vi.restoreAllMocks()
  })

  /** Count the fetches of `file` from now on. */
  function fetches(file: string) {
    const spy = vi.spyOn(globalThis, "fetch")
    return () => spy.mock.calls.filter(([url]) => typeof url === "string" && url.endsWith(file)).length
  }

  /** Render a source accordion. */
  async function sourced(attributes: string, panels = ITEM) {
    const host = await ElementFixture.render<SourceAccordion>(`<ui-accordion ${attributes}>${panels}</ui-accordion>`)
    return { host, ...parts(host) }
  }

  it("fetches nothing while closed;  opening the panel loads the body into a new <ui-content>", async () => {
    const count = fetches("body.html")
    const { host, titles } = await sourced(`source="${DIR}/body.html"`)
    await ElementFixture.tick()
    expect(count()).toBe(0)
    titles[0]!.click()
    await host.load()
    await ElementFixture.settle(host)
    expect(count()).toBe(1)
    const content = host.querySelector(":scope > ui-title + ui-content")!
    expect(content.querySelector("p.body")).not.toBeNull()
    expect(host.matches(":state(loaded)")).toBe(true)
    const after = parts(host)
    expect(openPanels(after.details)).toEqual([0])
    expect(after.contents[0]!.querySelector("slot")!.assignedElements()).toEqual([content])
  })

  it("replaces a <ui-content> placeholder's children, keeping the element", async () => {
    const { host } = await sourced(
      `source="${DIR}/body.html" open="0"`,
      `${ITEM}<ui-content class="kept"><p>Loading the details…</p></ui-content>`
    )
    await host.load()
    await ElementFixture.tick()
    const content = host.querySelector("ui-content.kept")!
    expect(content.textContent).not.toContain("Loading the details")
    expect(content.querySelector("p.body")).not.toBeNull()
    expect(host.querySelectorAll("ui-content")).toHaveLength(1)
  })

  it("starts open:  loads at once;  `reload()` fetches again and replaces the body", async () => {
    const count = fetches("body.html")
    const { host } = await sourced(`source="${DIR}/body.html" open="0"`)
    await host.load()
    expect(count()).toBe(1)
    await host.reload()
    expect(count()).toBe(2)
    expect(host.querySelectorAll("p.body")).toHaveLength(1)
  })

  it("a missing file:  ui-error, :state(error) and an error line in the panel", async () => {
    const errors: string[] = []
    const { host, titles } = await sourced(`source="${DIR}/missing.html"`)
    host.addEventListener("ui-error", (event) => errors.push((event as CustomEvent).detail.kind))
    titles[0]!.click()
    await host.load().catch(() => undefined)
    await ElementFixture.settle(host)
    expect(errors).toEqual(["load"])
    expect(host.matches(":state(error)")).toBe(true)
    const { details, contents } = parts(host)
    expect(openPanels(details)).toEqual([0])
    expect(contents[0]!.querySelector("[part~=error]")!.textContent).toBe(`Couldn't load ${DIR}/missing.html.`)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-accordion> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
