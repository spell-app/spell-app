import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"
import { Fixture } from "$/ui/test/Fixture"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { Viewport } from "$/ui/test/Viewport"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-statistic"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-label"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-statistic/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one element;  returns it with its root. */
async function render(html: string) {
  const host = await ElementFixture.render<DOMElement>(html)
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  return { host, root }
}

/** Computed custom property `name` of `element`, trimmed. */
function token(element: Element, name: string): string {
  return getComputedStyle(element).getPropertyValue(name).trim()
}

/** Root font size in px, the unit of the value ladder. */
const BASE = 16

////////////////
// ## Rendering
////////////////

describe("<ui-statistic> classes", () => {
  it.each([
    ["", "ui statistic"],
    ['size="large"', "ui large statistic"],
    ['size="medium"', "ui statistic"],
    ['color="red" inverted', "ui red inverted statistic"],
    ["horizontal", "ui horizontal statistic"],
    ['horizontal="no"', "ui statistic"],
    ['floated="left"', "ui left floated statistic"],
    ["fluid", "ui fluid statistic"],
    ['text value="Three" label="x"', "ui statistic"]
  ])("<ui-statistic %s>", async (attributes, classes) => {
    const { root } = await render(`<ui-statistic ${attributes}></ui-statistic>`)
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("statistic")
  })
})

describe("<ui-statistic> content", () => {
  it("renders the value and label shorthands as the static parts, value first, the slot between", async () => {
    const { root } = await render(`<ui-statistic value="5,550" label="Downloads"></ui-statistic>`)
    const [value, slot, label] = [...root.children] as HTMLElement[]
    expect(value!.className).toBe("value in-statistic")
    expect(value!.getAttribute("part")).toBe("value")
    expect(value!.textContent).toBe("5,550")
    expect(slot!.localName).toBe("slot")
    expect(label!.className).toBe("label in-statistic")
    expect(label!.textContent).toBe("Downloads")
    expect(parseFloat(getComputedStyle(value!).fontSize)).toBeCloseTo(4 * BASE, 0)
    expect(getComputedStyle(label!).textTransform).toBe("uppercase")
  })

  it("makes a text value shorthand smaller and bold", async () => {
    const { root } = await render(`<ui-statistic value="Three" text></ui-statistic>`)
    const value = root.querySelector<HTMLElement>("[part=value]")!
    expect(value.className).toBe("text value in-statistic")
    expect(parseFloat(getComputedStyle(value).fontSize)).toBeCloseTo(2 * BASE, 0)
    expect(getComputedStyle(value).fontWeight).toBe("700")
  })

  it("owns slotted <ui-value> and <ui-label> parts:  :state(in-statistic), the part look", async () => {
    const { host } = await render(
      `<ui-statistic size="large"><ui-label>Views</ui-label><ui-value>40,509</ui-value></ui-statistic>`
    )
    const value = host.querySelector<DOMElement>("ui-value")!
    const label = host.querySelector<DOMElement>("ui-label")!
    expect(value.matches(":state(in-statistic)")).toBe(true)
    expect(label.matches(":state(in-statistic)")).toBe(true)
    const labelRoot = label.shadowRoot!.querySelector<HTMLElement>("[part~=label]")!
    expect(labelRoot.className).toBe("label")
    const valueRoot = value.shadowRoot!.firstElementChild as HTMLElement
    expect(parseFloat(getComputedStyle(valueRoot).fontSize)).toBeCloseTo(5 * BASE, 0)
  })

  it("shows the label shorthand after a slotted value", async () => {
    const { host, root } = await render(`<ui-statistic label="Flights"><ui-value>5</ui-value></ui-statistic>`)
    const value = host.querySelector<DOMElement>("ui-value")!.shadowRoot!.firstElementChild!
    const label = root.querySelector("[part=label]")!
    expect(value.getBoundingClientRect().bottom).toBeLessThanOrEqual(label.getBoundingClientRect().top + 1)
  })

  it("updates the shorthands", async () => {
    const { host, root } = await render(`<ui-statistic value="1"></ui-statistic>`)
    host.setAttribute("value", "2")
    host.setAttribute("label", "Two")
    await ElementFixture.tick()
    expect(root.querySelector("[part=value]")!.textContent).toBe("2")
    expect(root.querySelector("[part=label]")!.textContent).toBe("Two")
    host.removeAttribute("value")
    await ElementFixture.tick()
    expect(root.querySelector("[part=value]")).toBeNull()
  })
})

////////////////
// ## Layout
////////////////

describe("<ui-statistic> owner tokens and layout", () => {
  it("declares its layout, value sizes and --ui-inverted on the root, defaults included", async () => {
    const { root } = await render(`<ui-statistic value="1"></ui-statistic>`)
    expect(token(root, "--_ui-statistic-layout")).toBe("vertical")
    expect(token(root, "--ui-inverted")).toBe("0")
    expect(getComputedStyle(root).display).toBe("inline-flex")
    expect(getComputedStyle(root).flexDirection).toBe("column")
  })

  it("lays a horizontal statistic out in a row, on the horizontal ladder", async () => {
    const { root } = await render(`<ui-statistic horizontal value="2,204" label="Views"></ui-statistic>`)
    expect(token(root, "--_ui-statistic-layout")).toBe("horizontal")
    expect(getComputedStyle(root).flexDirection).toBe("row")
    const value = root.querySelector<HTMLElement>("[part=value]")!
    const label = root.querySelector<HTMLElement>("[part=label]")!
    expect(parseFloat(getComputedStyle(value).fontSize)).toBeCloseTo(3 * BASE, 0)
    // a flex item:  Fomantic's `inline-block` is blockified, the label's start margin is what shows
    expect(getComputedStyle(label).marginLeft).toBe("12px")
  })

  it("inverts:  the dark scheme, --ui-inverted: 1, :state(inverted)", async () => {
    const { host, root } = await render(`<ui-statistic inverted value="1"></ui-statistic>`)
    expect(token(root, "--ui-inverted")).toBe("1")
    expect(getComputedStyle(root).colorScheme).toBe("dark")
    expect(host.matches(":state(inverted)")).toBe(true)
    expect(host.matches(":state(statistic)")).toBe(true)
  })

  it("paints a coloured value in the hue", async () => {
    const { root } = await render(`<ui-statistic color="red" value="27"></ui-statistic>`)
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    const value = root.querySelector<HTMLElement>("[part=value]")!
    expect(getComputedStyle(value).color).toBe(getComputedStyle(red).color)
  })

  it("ignores an ancestor's colour:  only its own or its group's paints the value", async () => {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div class="ui-red"><ui-statistic value="1"></ui-statistic>` +
        `<ui-statistics><ui-statistic value="2"></ui-statistic></ui-statistics>` +
        `<ui-statistics color="blue"><ui-statistic value="3"></ui-statistic></ui-statistics></div>`
    )
    const [alone, member, blue] = [...wrapper.querySelectorAll<DOMElement>("ui-statistic")].map((statistic) =>
      statistic.shadowRoot!.querySelector<HTMLElement>("[part=value]")!
    )
    const ink = Fixture.render(`<span style="color: var(--ui-ink)"></span>`)
    const blueInk = Fixture.render(`<span style="color: var(--ui-blue)"></span>`)
    expect(getComputedStyle(alone!).color).toBe(getComputedStyle(ink).color)
    expect(getComputedStyle(member!).color).toBe(getComputedStyle(ink).color)
    expect(getComputedStyle(blue!).color).toBe(getComputedStyle(blueInk).color)
  })

  it("spaces a statistic after another one, not the first", async () => {
    const holder = await ElementFixture.render(
      `<div><ui-statistic value="1"></ui-statistic><ui-statistic value="2"></ui-statistic></div>`
    )
    const [first, second] = [...holder.querySelectorAll<DOMElement>("ui-statistic")].map(
      (host) => host.shadowRoot!.firstElementChild!
    )
    expect(getComputedStyle(first!).marginLeft).toBe("0px")
    expect(parseFloat(getComputedStyle(second!).marginLeft)).toBeGreaterThan(0)
  })
})

////////////////
// ## Tokens
////////////////

describe("<ui-statistic> tokens from outside", () => {
  /** Two statistics;  the second one's start margin is the horizontal spacing. */
  const PAIR = `<ui-statistic value="1"></ui-statistic><ui-statistic value="2"></ui-statistic>`

  /** The second statistic's start margin under `wrapper`. */
  function spacing(wrapper: Element): string {
    return getComputedStyle(wrapper.querySelectorAll("ui-statistic")[1]!.shadowRoot!.firstElementChild!).marginLeft
  }

  it("takes a token set on the DOM element", async () => {
    const wrapper = await ElementFixture.render(
      `<div><ui-statistic value="1"></ui-statistic><ui-statistic value="2" style="--ui-statistic-horizontal-spacing: 20px"></ui-statistic></div>`
    )
    expect(spacing(wrapper)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-statistic-horizontal-spacing: 20px">${PAIR}</section>`
    )
    expect(spacing(wrapper)).toBe("20px")
  })

  it("takes a token set through `::part(statistic)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(statistic) { --ui-statistic-horizontal-spacing: 20px }</style>` +
        `<ui-statistic value="1"></ui-statistic><ui-statistic class="themed" value="2"></ui-statistic></div>`
    )
    expect(spacing(wrapper)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-statistic-horizontal-spacing", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-statistic-horizontal-spacing")
    })
    const wrapper = await ElementFixture.render(`<div>${PAIR}</div>`)
    expect(spacing(wrapper)).toBe("20px")
  })

  it("reaches the members of a group, set on the group", async () => {
    const group = await render(
      `<ui-statistics style="--ui-statistic-row-spacing: 20px"><ui-statistic value="1"></ui-statistic></ui-statistics>`
    )
    const member = group.host.querySelector("ui-statistic")!.shadowRoot!.firstElementChild!
    expect(getComputedStyle(member).marginBottom).toBe("20px")
  })

  it("owner tokens:  a value size set on the statistic or above it reaches the value;  `horizontal` swaps it", async () => {
    const { root } = await render(`<ui-statistic value="1" style="--ui-statistic-value-size: 30px"></ui-statistic>`)
    expect(getComputedStyle(root.querySelector("[part=value]")!).fontSize).toBe("30px")
    const above = await ElementFixture.render(
      `<section style="--ui-statistic-value-size: 30px"><ui-statistic><ui-value>1</ui-value></ui-statistic></section>`
    )
    const value = above.querySelector("ui-value")!.shadowRoot!.firstElementChild!
    expect(getComputedStyle(value).fontSize).toBe("30px")
    const { root: horizontal } = await render(
      `<ui-statistic horizontal value="1" style="--ui-statistic-value-size: 30px"></ui-statistic>`
    )
    expect(getComputedStyle(horizontal.querySelector("[part=value]")!).fontSize).not.toBe("30px")
  })
})

////////////////
// ## Groups
////////////////

describe("<ui-statistics>", () => {
  it.each([
    ["", "ui statistics"],
    ['size="small" color="blue"', "ui small blue statistics"],
    ["horizontal inverted", "ui horizontal inverted statistics"],
    ['widths="3"', "ui three statistics"],
    ['widths="four"', "ui four statistics"],
    ["stackable", "ui stackable statistics"]
  ])("<ui-statistics %s>", async (attributes, classes) => {
    const { root, host } = await render(
      `<ui-statistics ${attributes}><ui-statistic value="1"></ui-statistic></ui-statistics>`
    )
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("group")
    expect(host.matches(":state(statistics)")).toBe(true)
    expect(getComputedStyle(host).display).toBe("block")
  })

  it("hands its size, colour and inversion to members without their own", async () => {
    const { host } = await render(
      `<ui-statistics size="large" color="red" inverted>` +
        `<ui-statistic value="1"></ui-statistic><ui-statistic size="mini" value="2"></ui-statistic></ui-statistics>`
    )
    const [plain, mini] = [...host.querySelectorAll<DOMElement>("ui-statistic")].map(
      (statistic) => statistic.shadowRoot!.firstElementChild as HTMLElement
    )
    const value = (root: HTMLElement) => root.querySelector<HTMLElement>("[part=value]")!
    expect(parseFloat(getComputedStyle(value(plain!)).fontSize)).toBeCloseTo(5 * BASE, 0)
    expect(parseFloat(getComputedStyle(value(mini!)).fontSize)).toBeCloseTo(1.5 * BASE, 0)
    expect(token(plain!, "--ui-inverted")).toBe("1")
    expect(getComputedStyle(plain!).colorScheme).toBe("dark")
    const red = Fixture.render(`<span style="color-scheme: dark; color: var(--ui-red)"></span>`)
    expect(getComputedStyle(value(plain!)).color).toBe(getComputedStyle(red).color)
  })

  it("lays members out:  group margins, not the standalone ones;  horizontal groups stack rows", async () => {
    const { host } = await render(
      `<ui-statistics horizontal><ui-statistic value="1" label="a"></ui-statistic>` +
        `<ui-statistic value="2" label="b"></ui-statistic></ui-statistics>`
    )
    const [first, second] = [...host.querySelectorAll<DOMElement>("ui-statistic")].map(
      (statistic) => statistic.shadowRoot!.firstElementChild as HTMLElement
    )
    expect(token(first!, "--_ui-statistic-layout")).toBe("horizontal")
    expect(getComputedStyle(first!).flexDirection).toBe("row")
    expect(getComputedStyle(second!).marginLeft).toBe("0px")
    expect(second!.getBoundingClientRect().top).toBeGreaterThan(first!.getBoundingClientRect().bottom - 1)
  })

  it("divides the row evenly with widths", async () => {
    const holder = await ElementFixture.render(
      `<div style="width: 900px"><ui-statistics widths="3">` +
        `<ui-statistic value="1"></ui-statistic><ui-statistic value="2"></ui-statistic>` +
        `<ui-statistic value="3"></ui-statistic></ui-statistics></div>`
    )
    const roots = [...holder.querySelectorAll<DOMElement>("ui-statistic")].map(
      (statistic) => statistic.shadowRoot!.firstElementChild as HTMLElement
    )
    for (const root of roots) expect(root.getBoundingClientRect().width).toBeCloseTo(300, -1)
    expect(roots[1]!.getBoundingClientRect().top).toBe(roots[0]!.getBoundingClientRect().top)
  })

  it("stacks a stackable group narrower than 768px, by the GROUP's width", async () => {
    const markup = (width: number) =>
      `<div style="width: ${width}px"><ui-statistics stackable widths="3">` +
      `<ui-statistic value="1"></ui-statistic><ui-statistic value="2"></ui-statistic></ui-statistics></div>`
    const narrow = await ElementFixture.render(markup(400))
    const [a, b] = [...narrow.querySelectorAll<DOMElement>("ui-statistic")].map(
      (statistic) => statistic.shadowRoot!.firstElementChild as HTMLElement
    )
    expect(a!.getBoundingClientRect().width).toBeCloseTo(400, 0)
    expect(b!.getBoundingClientRect().top).toBeGreaterThanOrEqual(a!.getBoundingClientRect().bottom - 1)
    const wide = await ElementFixture.render(markup(900))
    const [c, d] = [...wide.querySelectorAll<DOMElement>("ui-statistic")].map(
      (statistic) => statistic.shadowRoot!.firstElementChild as HTMLElement
    )
    expect(d!.getBoundingClientRect().top).toBe(c!.getBoundingClientRect().top)
  })

  it('`stack-with="page"` stacks by the SCREEN;  the token too, and the attribute beats it', async () => {
    const group = (attributes = "") =>
      `<ui-statistics stackable widths="3" ${attributes}><ui-statistic value="1"></ui-statistic>` +
      `<ui-statistic value="2"></ui-statistic></ui-statistics>`
    const wrapper = await ElementFixture.render(
      `<div style="width: 500px">${group('stack-with="page"')}<div style="--ui-stack-with: page">${group()}` +
        `${group('stack-with="container"')}</div></div>`
    )
    const groups = [...wrapper.querySelectorAll("ui-statistics")]
    expect(groups[0]!.shadowRoot!.firstElementChild!.className).toBe("ui stackable three stack-with-page statistics")
    /** Whether `host`'s statistics stack. */
    const stacked = (host: Element) => token(host.shadowRoot!.firstElementChild!, "--_statistics-stacked") === "1"
    await Viewport.resize(1200)
    await expect.poll(() => groups.map(stacked)).toEqual([false, false, true])
    await Viewport.resize(500)
    await expect.poll(() => groups.map(stacked)).toEqual([true, true, true])
  })
})

describe("<ui-statistics equal>", () => {
  it("one row, an equal share of it each, from the statistics themselves", async () => {
    const box = await ElementFixture.render(
      `<div style="width: 900px"><ui-statistics equal>` +
        `<ui-statistic value="1" label="One"></ui-statistic>` +
        `<ui-statistic value="31,200,000" label="Views"></ui-statistic>` +
        `<ui-statistic value="2" label="Two"></ui-statistic>` +
        `</ui-statistics></div>`
    )
    const group = box.querySelector<DOMElement>("ui-statistics")!
    const root = group.shadowRoot!.firstElementChild as HTMLElement
    expect(root.className).toBe("ui equal statistics")
    const boxes = [...group.querySelectorAll<DOMElement>("ui-statistic")].map((statistic) =>
      (statistic.shadowRoot!.firstElementChild as HTMLElement).getBoundingClientRect()
    )
    const share = root.clientWidth / boxes.length
    for (const bounds of boxes) expect(bounds.width).toBeCloseTo(share, -0.5)
    expect(new Set(boxes.map((bounds) => Math.round(bounds.top))).size).toBe(1)
  })
})

////////////////
// ## Margins
////////////////

describe("<ui-statistic> outer margins", () => {
  it("re-decides a standalone statistic's margins by its DOM element's position (the root is always an only child)", async () => {
    const holder = await ElementFixture.render(
      `<div><div><h4>Heading</h4><ui-statistic value="1"></ui-statistic><ui-statistic value="2"></ui-statistic></div>` +
        `<div><ui-statistic value="3"></ui-statistic><p>After</p></div></div>`
    )
    const [first, second, lone] = [...holder.querySelectorAll<DOMElement>("ui-statistic")].map((host) =>
      getComputedStyle(host.shadowRoot!.firstElementChild!)
    )
    expect([first!.marginTop, first!.marginBottom]).toEqual(["16px", "16px"])
    // after another statistic:  beside it, as Fomantic's `.ui.statistic + .ui.statistic`
    expect([second!.marginTop, second!.marginBottom, second!.marginLeft]).toEqual(["0px", "0px", "24px"])
    expect([lone!.marginTop, lone!.marginBottom]).toEqual(["0px", "16px"])
  })

  it("puts a group's top margin on its DOM element, so it collapses with the heading's;  none when horizontal", async () => {
    const holder = await ElementFixture.render(
      `<div style="width: 900px"><h4 style="margin: 0 0 10px">Heading</h4>` +
        `<ui-statistics><ui-statistic value="1"></ui-statistic></ui-statistics>` +
        `<ui-statistics horizontal><ui-statistic value="2"></ui-statistic></ui-statistics></div>`
    )
    const [group, horizontal] = [...holder.querySelectorAll<DOMElement>("ui-statistics")]
    expect(group!.matches(":state(spaced)")).toBe(true)
    expect(getComputedStyle(group!).marginTop).toBe("16px")
    expect(getComputedStyle(group!.shadowRoot!.firstElementChild!).marginTop).toBe("0px")
    expect(group!.getBoundingClientRect().top - holder.querySelector("h4")!.getBoundingClientRect().bottom).toBeCloseTo(
      16,
      0
    )
    expect(horizontal!.matches(":state(spaced)")).toBe(false)
    expect(getComputedStyle(horizontal!).marginTop).toBe("0px")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-statistic> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
