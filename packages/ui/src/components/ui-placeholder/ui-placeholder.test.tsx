import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { PLACEHOLDER_HOST_STATE } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-placeholder"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-placeholder/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** The root of `host`'s shadow. */
function rootOf(host: Element): HTMLElement {
  return host.shadowRoot!.firstElementChild as HTMLElement
}

////////////////
// ## Classes
////////////////

describe("<ui-placeholder> classes", () => {
  it.each([
    ["", "ui placeholder"],
    ["fluid", "ui fluid placeholder"],
    ['fluid="no" inverted', "ui inverted placeholder"]
  ])("<ui-placeholder %s>", async (attributes, classes) => {
    const host = await ElementFixture.render<UIHost>(`<ui-placeholder ${attributes}></ui-placeholder>`)
    const root = rootOf(host)
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("placeholder")
    expect(root.querySelector("slot")).not.toBeNull()
  })

  it.each([
    ["ui-placeholder-header", "", "header", true],
    ["ui-placeholder-header", "image", "image header", true],
    ["ui-placeholder-paragraph", "", "paragraph", true],
    ["ui-placeholder-line", "", "line", false],
    ["ui-placeholder-line", 'length="very long"', "very long line", false],
    ["ui-placeholder-line", 'length="medium"', "medium line", false],
    ["ui-placeholder-image", "", "image", false],
    ["ui-placeholder-image", "square", "square image", false],
    ["ui-placeholder-image", "rectangular", "rectangular image", false]
  ])("<%s %s> => %s", async (tag, attributes, classes, slotted) => {
    const placeholder = await ElementFixture.render<UIHost>(
      `<ui-placeholder><${tag} ${attributes}></${tag}></ui-placeholder>`
    )
    const root = rootOf(placeholder.querySelector(tag)!)
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe(classes.split(" ").at(-1))
    expect(!!root.querySelector("slot")).toBe(slotted)
  })
})

////////////////
// ## Host contract
////////////////

describe("<ui-placeholder> host contract", () => {
  it("always carries :state(placeholder), and is aria-hidden", async () => {
    const host = await ElementFixture.render<UIHost>(`<ui-placeholder></ui-placeholder>`)
    expect(host.matches(`:state(${PLACEHOLDER_HOST_STATE})`)).toBe(true)
    expect(host.internals.ariaHidden).toBe("true")
  })

  it("spaces consecutive placeholders, not the first", async () => {
    const box = await ElementFixture.render<HTMLElement>(
      `<div><ui-placeholder><ui-placeholder-line></ui-placeholder-line></ui-placeholder>` +
        `<ui-placeholder><ui-placeholder-line></ui-placeholder-line></ui-placeholder></div>`
    )
    const [first, second] = [...box.querySelectorAll("ui-placeholder")].map(rootOf)
    expect(getComputedStyle(first!).marginTop).toBe("0px")
    expect(Number.parseFloat(getComputedStyle(second!).marginTop)).toBeGreaterThan(0)
  })
})

////////////////
// ## Shapes by position
////////////////

describe("<ui-placeholder> shapes by position", () => {
  it("draws a line as a bar, header bars taller than paragraph bars", async () => {
    const placeholder = await ElementFixture.render<UIHost>(
      `<ui-placeholder>` +
        `<ui-placeholder-header><ui-placeholder-line></ui-placeholder-line></ui-placeholder-header>` +
        `<ui-placeholder-paragraph><ui-placeholder-line></ui-placeholder-line></ui-placeholder-paragraph>` +
        `</ui-placeholder>`
    )
    const [inHeader, inParagraph] = [...placeholder.querySelectorAll("ui-placeholder-line")].map(rootOf)
    const header = inHeader!.getBoundingClientRect().height
    const paragraph = inParagraph!.getBoundingClientRect().height
    expect(paragraph).toBeGreaterThan(0)
    expect(header).toBeGreaterThan(paragraph)
  })

  it("outdents lines by their HOST position, and a set length wins", async () => {
    const placeholder = await ElementFixture.render<UIHost>(
      `<ui-placeholder fluid><ui-placeholder-paragraph>` +
        `<ui-placeholder-line></ui-placeholder-line><ui-placeholder-line></ui-placeholder-line>` +
        `<ui-placeholder-line length="full"></ui-placeholder-line>` +
        `</ui-placeholder-paragraph></ui-placeholder>`
    )
    const widths = [...placeholder.querySelectorAll("ui-placeholder-line")].map(
      (line) => rootOf(line).getBoundingClientRect().width
    )
    const block = rootOf(placeholder.querySelector("ui-placeholder-paragraph")!).getBoundingClientRect().width
    expect(widths[0]).not.toBe(widths[1])
    expect(widths[2]).toBeCloseTo(block, 0)
  })

  it("makes a square image as tall as it is wide", async () => {
    const placeholder = await ElementFixture.render<UIHost>(
      `<ui-placeholder style="width: 200px"><ui-placeholder-image square></ui-placeholder-image></ui-placeholder>`
    )
    const box = rootOf(placeholder.querySelector("ui-placeholder-image")!).getBoundingClientRect()
    expect(box.width).toBeGreaterThan(0)
    expect(box.height).toBeCloseTo(box.width, 0)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-placeholder> tokens from outside", () => {
  /** The inner box's max width. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=placeholder]")!).maxWidth
  }

  /** The element under test. */
  const MARKUP = `<ui-placeholder><ui-placeholder-line></ui-placeholder-line></ui-placeholder>`

  it("takes a token set on the HOST", async () => {
    const host = await ElementFixture.render(
      MARKUP.replace("<ui-placeholder", `<ui-placeholder style="--ui-placeholder-max-width: 200px"`)
    )
    expect(measure(host)).toBe("200px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-placeholder-max-width: 200px"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-placeholder")!)).toBe("200px")
  })

  it("takes a token set through `::part(placeholder)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(placeholder) { --ui-placeholder-max-width: 200px }</style>${MARKUP.replace("<ui-placeholder", '<ui-placeholder class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-placeholder")!)).toBe("200px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-placeholder-max-width", "200px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-placeholder-max-width")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("200px")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("480px")
  })

  it("reaches every shape, set on the placeholder;  a shape takes one on its own part", async () => {
    const host = await ElementFixture.render(
      `<ui-placeholder style="--ui-placeholder-radius: 7px"><ui-placeholder-line></ui-placeholder-line>` +
        `<ui-placeholder-line class="own"></ui-placeholder-line></ui-placeholder>` +
        `<style>.own::part(line) { --ui-placeholder-radius: 3px }</style>`
    )
    const [plain, own] = [...host.querySelectorAll("ui-placeholder-line")].map((line) => rootOf(line))
    expect(getComputedStyle(plain!).borderTopLeftRadius).toBe("7px")
    expect(getComputedStyle(own!).borderTopLeftRadius).toBe("3px")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-placeholder> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
