import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-segment"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-label"

/** Examples whose original fragment fails axe `heading-order` too (see `docs/report.md`). */
const HEADING_DEMOS = ["parts/examples/elements/header.html", "segment/examples/elements/variations.html"]

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-segment/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one element;  returns it with its root. */
async function render(html: string) {
  const host = await ElementFixture.render<UIHost>(html)
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  return { host, root }
}

describe("<ui-segment> classes", () => {
  it.each([
    ["", "ui segment"],
    ['size="small"', "ui small segment"],
    ['size="medium"', "ui segment"],
    ['color="red" inverted', "ui red inverted segment"],
    ["raised", "ui raised segment"],
    ['raised="no"', "ui segment"],
    ["stacked", "ui stacked segment"],
    ['stacked="tall"', "ui tall stacked segment"],
    ['piled="yes"', "ui piled segment"],
    ["vertical placeholder", "ui placeholder vertical segment"],
    ["circular compact basic clearing", "ui basic circular clearing compact segment"],
    ['padded="very"', "ui very padded segment"],
    ['floated="right"', "ui right floated segment"],
    ['text-align="center"', "ui center aligned segment"],
    ["secondary", "ui secondary segment"],
    ['attached="top"', "ui top attached segment"],
    ["attached seamless", "ui seamless attached segment"],
    ["loading disabled", "ui disabled loading segment"],
    ['fitted="horizontally"', "ui horizontally fitted segment"],
    ['scrolling="long" resizable', "ui resizable long scrolling segment"]
  ])("<ui-segment %s>", async (attributes, classes) => {
    const { root } = await render(`<ui-segment ${attributes}>x</ui-segment>`)
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("segment")
  })
})

describe("<ui-segment> states and owner tokens", () => {
  it("sets :state(piled) and makes the host the stacking context", async () => {
    const { host } = await render(`<ui-segment piled>x</ui-segment>`)
    expect(host.matches(":state(piled)")).toBe(true)
    expect(getComputedStyle(host).zIndex).toBe("0")
    const { host: plain } = await render(`<ui-segment>x</ui-segment>`)
    expect(plain.matches(":state(piled)")).toBe(false)
  })

  it("declares --ui-inverted on its root, default included, and the dark scheme when inverted", async () => {
    const { root: plain } = await render(`<ui-segment>x</ui-segment>`)
    expect(getComputedStyle(plain).getPropertyValue("--ui-inverted").trim()).toBe("0")
    const { host, root } = await render(`<ui-segment inverted color="blue">x</ui-segment>`)
    expect(getComputedStyle(root).getPropertyValue("--ui-inverted").trim()).toBe("1")
    expect(getComputedStyle(root).colorScheme).toBe("dark")
    expect(host.matches(":state(inverted)")).toBe(true)
    host.removeAttribute("inverted")
    await ElementFixture.tick()
    expect(getComputedStyle(root).getPropertyValue("--ui-inverted").trim()).toBe("0")
  })

  it("follows a dark page;  resets to light only inside an inverted one", async () => {
    const page = await ElementFixture.render<HTMLElement>(
      `<div class="ui-dark"><ui-segment>Plain</ui-segment><ui-segment inverted><ui-segment>Nested</ui-segment></ui-segment></div>`
    )
    const [plain, inverted, nested] = [...page.querySelectorAll<UIHost>("ui-segment")].map(
      (host) => host.shadowRoot!.firstElementChild!
    )
    expect(getComputedStyle(plain!).colorScheme).toBe("dark")
    expect(getComputedStyle(plain!).getPropertyValue("--ui-inverted").trim()).toBe("0")
    expect(getComputedStyle(inverted!).colorScheme).toBe("dark")
    expect(getComputedStyle(nested!).colorScheme).toBe("light")
    expect(getComputedStyle(nested!).getPropertyValue("--ui-scheme").trim()).toBe("light")
    const { root: light } = await render(`<ui-segment>x</ui-segment>`)
    expect(getComputedStyle(light).getPropertyValue("--ui-scheme").trim()).not.toBe("dark")
  })

  it("inverts the members of an <ui-segments inverted>, not a segment nested in a member", async () => {
    const group = await ElementFixture.render<HTMLElement>(
      `<ui-segments inverted><ui-segment id="m">A<ui-segment id="n">Nested</ui-segment></ui-segment><ui-segment id="o">B</ui-segment></ui-segments>`
    )
    await ElementFixture.settle(group)
    const rootOf = (id: string) => group.querySelector(`#${id}`)!.shadowRoot!.firstElementChild!
    for (const id of ["m", "o"]) {
      const style = getComputedStyle(rootOf(id))
      expect(style.getPropertyValue("--ui-inverted").trim(), id).toBe("1")
      expect(style.colorScheme, id).toBe("dark")
      expect(luminance(style.backgroundColor), id).toBeLessThan(0.3)
    }
    const nested = getComputedStyle(rootOf("n"))
    expect(nested.getPropertyValue("--ui-inverted").trim()).toBe("0")
    expect(nested.colorScheme).toBe("light")
    expect(luminance(nested.backgroundColor)).toBeGreaterThan(0.7)
  })

  it("is busy while loading, with an announcement;  aria-disabled while disabled", async () => {
    const { host, root } = await render(`<ui-segment loading disabled>x</ui-segment>`)
    expect(host.internals.ariaBusy).toBe("true")
    expect(host.internals.ariaDisabled).toBe("true")
    expect(host.matches(":state(loading)")).toBe(true)
    expect(host.matches(":state(disabled)")).toBe(true)
    expect(root.querySelector("[role=status]")!.textContent).toBe("Loading…")
    host.removeAttribute("loading")
    await ElementFixture.tick()
    expect(host.internals.ariaBusy).toBeNull()
    expect(root.querySelector("[role=status]")).toBeNull()
  })
})

describe("<ui-segments>", () => {
  it.each([
    ["", "ui segments"],
    ["horizontal equal-width", "ui equal width horizontal segments"],
    ["raised", "ui raised segments"],
    ['stacked="tall"', "ui tall stacked segments"],
    ["piled", "ui piled segments"],
    ['inverted="no"', "ui segments"]
  ])("<ui-segments %s>", async (attributes, classes) => {
    const { root } = await render(`<ui-segments ${attributes}><ui-segment>a</ui-segment></ui-segments>`)
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("group")
  })

  it("sets :state(piled)", async () => {
    const { host } = await render(`<ui-segments piled><ui-segment>a</ui-segment></ui-segments>`)
    expect(host.matches(":state(piled)")).toBe(true)
  })

  it("keeps 1em vertical margins by its HOST's position:  the root is always its shadow root's only child", async () => {
    const wrapper = await ElementFixture.render(
      `<div><h4>Heading</h4>` +
        `<ui-segments><ui-segment>a</ui-segment></ui-segments>` +
        `<ui-segments><ui-segment>b</ui-segment></ui-segments></div>`
    )
    const [first, second] = [...wrapper.querySelectorAll("ui-segments")].map((host) =>
      getComputedStyle(host.shadowRoot!.firstElementChild!)
    )
    expect([first!.marginTop, first!.marginBottom]).toEqual(["16px", "16px"])
    expect([second!.marginTop, second!.marginBottom]).toEqual(["16px", "0px"])
  })
})

describe("<ui-segment> tokens from outside", () => {
  /** The segment box's top-left radius, which `--ui-segment-radius` drives. */
  function radius(host: Element): string {
    return getComputedStyle(host.shadowRoot!.firstElementChild!).borderTopLeftRadius
  }

  it("takes a token set on the HOST", async () => {
    const { root } = await render(`<ui-segment style="--ui-segment-radius: 12px">x</ui-segment>`)
    expect(getComputedStyle(root).borderTopLeftRadius).toBe("12px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-segment-radius: 12px"><div><ui-segment>x</ui-segment></div></section>`
    )
    expect(radius(wrapper.querySelector("ui-segment")!)).toBe("12px")
  })

  it("inherits its text alignment unless it sets one (a `right aligned` grid column)", async () => {
    const wrapper = await ElementFixture.render(
      `<div style="text-align: right"><ui-segment>x</ui-segment><ui-segment text-align="center">y</ui-segment></div>`
    )
    const [plain, centered] = [...wrapper.querySelectorAll("ui-segment")].map(
      (host) => getComputedStyle(host.shadowRoot!.firstElementChild!).textAlign
    )
    expect(plain).toBe("right")
    expect(centered).toBe("center")
  })

  it("takes a token set through `::part(segment)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(segment) { --ui-segment-radius: 12px }</style><ui-segment class="themed">x</ui-segment></div>`
    )
    expect(radius(wrapper.querySelector("ui-segment")!)).toBe("12px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-segment-radius", "12px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-segment-radius")
    })
    const { root } = await render(`<ui-segment>x</ui-segment>`)
    expect(getComputedStyle(root).borderTopLeftRadius).toBe("12px")
  })

  it("reaches the members of a group, set on the group:  its outer corners round, the seams stay square", async () => {
    const group = await ElementFixture.render(
      `<ui-segments style="--ui-segment-radius: 12px"><ui-segment>A</ui-segment><ui-segment>B</ui-segment></ui-segments>`
    )
    const [first, last] = [...group.querySelectorAll("ui-segment")].map((host) => host.shadowRoot!.firstElementChild!)
    expect(getComputedStyle(first!).borderTopLeftRadius).toBe("12px")
    expect(getComputedStyle(first!).borderBottomLeftRadius).toBe("0px")
    expect(getComputedStyle(last!).borderBottomLeftRadius).toBe("12px")
  })

  it("owner tokens:  an attached label covers the border width the page set", async () => {
    const { host } = await render(
      `<ui-segment style="--ui-segment-border-width: 3px"><ui-label attached="top">A</ui-label>x</ui-segment>`
    )
    await ElementFixture.settle(host)
    const label = host.querySelector("ui-label")!.shadowRoot!.querySelector("[part~=label]")!
    expect(getComputedStyle(label).top).toBe("-3px")
  })

  it("variations:  `padded` swaps the padding for its own token", async () => {
    const { root: padded } = await render(`<ui-segment padded style="--ui-segment-padding: 5px">x</ui-segment>`)
    expect(getComputedStyle(padded).paddingTop).not.toBe("5px")
    const { root: themed } = await render(`<ui-segment padded style="--ui-segment-padded: 5px">x</ui-segment>`)
    expect(getComputedStyle(themed).paddingTop).toBe("5px")
  })
})

describe("<ui-segment> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    // `heading-order` off only where the ORIGINAL fragment breaks it identically (a page of h1 ... h6 demos)
    const headingOrder = { enabled: !HEADING_DEMOS.some((name) => path.endsWith(name)) }
    await expectAccessible(root, { rules: { "heading-order": headingOrder } })
  })
})

/** Relative luminance (0..1) of any CSS colour, via a canvas pixel. */
function luminance(color: string): number {
  const context = document.createElement("canvas").getContext("2d")!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return (0.2126 * r! + 0.7152 * g! + 0.0722 * b!) / 255
}
