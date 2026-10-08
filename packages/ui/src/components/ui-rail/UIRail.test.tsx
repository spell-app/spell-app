import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-rail"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-rail/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** The segment's border:  a rail is placed against the segment's PADDING box. */
const BORDER = 1

/** A 400px segment at x = 400 holding `<ui-rail attributes>`;  returns the segment and rail roots. */
async function railIn(attributes: string) {
  const holder = await ElementFixture.render(
    `<div style="margin-left: 400px; width: 400px"><ui-segment><ui-rail ${attributes}>Rail</ui-rail>` +
      `<p>Main</p></ui-segment></div>`
  )
  const segment = holder.querySelector<DOMElement>("ui-segment")!.shadowRoot!.firstElementChild!.getBoundingClientRect()
  const host = holder.querySelector<DOMElement>("ui-rail")!
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  return { segment, root, rail: root.getBoundingClientRect() }
}

////////////////
// ## Rendering
////////////////

describe("<ui-rail> classes", () => {
  it.each([
    ["", "ui rail"],
    ['position="left"', "ui left rail"],
    ['position="right" internal', "ui right internal rail"],
    ['position="left" dividing attached', "ui left attached dividing rail"],
    ['position="right" close', "ui right close rail"],
    ['position="left" close="very"', "ui left very close rail"],
    ['position="right" size="large"', "ui large right rail"],
    ['position="up"', "ui rail"]
  ])("<ui-rail %s>", async (attributes, classes) => {
    const host = await ElementFixture.render<DOMElement>(`<ui-rail ${attributes}>x</ui-rail>`)
    const root = host.shadowRoot!.firstElementChild!
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("rail")
  })
})

describe("<ui-rail> placement", () => {
  it("sits outside its segment, 4 x font size away, as tall as the segment", async () => {
    const left = await railIn(`position="left"`)
    expect(left.rail.width).toBeCloseTo(300, 0)
    expect(left.segment.left + BORDER - left.rail.right).toBeCloseTo(32, 0)
    expect(parseFloat(getComputedStyle(left.root).paddingRight)).toBeCloseTo(32, 0)
    expect(left.rail.top).toBeCloseTo(left.segment.top + BORDER, 0)
    expect(left.rail.height).toBeCloseTo(left.segment.height - 2 * BORDER, 0)
    const right = await railIn(`position="right"`)
    expect(right.rail.left - (right.segment.right - BORDER)).toBeCloseTo(32, 0)
  })

  it("sits inside the segment's edge when internal", async () => {
    const left = await railIn(`position="left" internal`)
    expect(left.rail.left - (left.segment.left + BORDER)).toBeCloseTo(32, 0)
    const right = await railIn(`position="right" internal`)
    expect(right.segment.right - BORDER - right.rail.right).toBeCloseTo(32, 0)
  })

  it("moves closer (and widens) with close / very close, flush when attached", async () => {
    const close = await railIn(`position="left" close`)
    // close:  2em apart, split between margin and padding;  very close:  1em
    expect(close.segment.left + BORDER - close.rail.right).toBeCloseTo(16, 0)
    expect(close.rail.width).toBeCloseTo(316, 0)
    const veryClose = await railIn(`position="left" close="very"`)
    expect(veryClose.segment.left + BORDER - veryClose.rail.right).toBeCloseTo(8, 0)
    expect(veryClose.rail.width).toBeCloseTo(308, 0)
    const attached = await railIn(`position="right" attached`)
    expect(attached.rail.left).toBeCloseTo(attached.segment.right - BORDER, 0)
  })

  it("draws a rule between a dividing rail and its segment, further away", async () => {
    const left = await railIn(`position="left" dividing`)
    expect(getComputedStyle(left.root).borderRightStyle).toBe("solid")
    expect(left.segment.left + BORDER - left.rail.right).toBeCloseTo(40, 0)
    expect(left.rail.width).toBeCloseTo(340, 0)
  })

  it("scales its text with size", async () => {
    const { root } = await railIn(`position="left" size="large"`)
    expect(parseFloat(getComputedStyle(root).fontSize)).toBeCloseTo(18, 0)
  })
})

////////////////
// ## Tokens
////////////////

describe("<ui-rail> tokens from outside", () => {
  /** The inner box's width. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=rail]")!).width
  }

  /** The element under test. */
  const MARKUP = `<ui-rail>Rail</ui-rail>`

  it("takes a token set on the DOM element", async () => {
    const host = await ElementFixture.render(MARKUP.replace("<ui-rail", `<ui-rail style="--ui-rail-width: 200px"`))
    expect(measure(host)).toBe("200px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-rail-width: 200px"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-rail")!)).toBe("200px")
  })

  it("takes a token set through `::part(rail)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(rail) { --ui-rail-width: 200px }</style>${MARKUP.replace("<ui-rail", '<ui-rail class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-rail")!)).toBe("200px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-rail-width", "200px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-rail-width")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("200px")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("300px")
  })

  it("variations:  `close` derives from the base width", async () => {
    const host = await ElementFixture.render(`<ui-rail close style="--ui-rail-width: 200px">Rail</ui-rail>`)
    expect(measure(host)).toBe("216px")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-rail> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
