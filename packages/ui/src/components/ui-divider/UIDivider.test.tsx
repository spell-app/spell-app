import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-divider"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-divider/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one `<ui-divider>`;  returns it with its root. */
async function divider(html: string) {
  const host = await ElementFixture.render<DOMElement>(html)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=divider]")!
  return { host, root }
}

////////////////
// ## Classes and markup
////////////////

describe("<ui-divider> classes and markup", () => {
  it.each([
    ["", "ui divider"],
    ['size="large"', "ui large divider"],
    ['size="medium"', "ui divider"],
    ['color="red"', "ui red divider"],
    ["horizontal", "ui horizontal divider"],
    ['horizontal="no"', "ui divider"],
    ['vertical="yes"', "ui vertical divider"],
    ["fitted clearing section inverted", "ui clearing fitted inverted section divider"],
    ['horizontal text-align="left"', "ui horizontal left aligned divider"]
  ])("<ui-divider %s>", async (attributes, classes) => {
    const { root } = await divider(`<ui-divider ${attributes}>Or</ui-divider>`)
    expect(root.className).toBe(classes)
  })

  it("is a separator, vertical with aria-orientation, around a slot", async () => {
    const { root } = await divider(`<ui-divider vertical>and</ui-divider>`)
    expect(root.getAttribute("role")).toBe("separator")
    expect(root.getAttribute("aria-orientation")).toBe("vertical")
    expect(root.querySelector("slot")).not.toBeNull()
    const { root: plain } = await divider(`<ui-divider></ui-divider>`)
    expect(plain.hasAttribute("aria-orientation")).toBe(false)
  })

  it("renders the `icon` shorthand's box before the text", async () => {
    const { root } = await divider(`<ui-divider horizontal icon="tag">Description</ui-divider>`)
    const box = root.firstElementChild!
    expect(box.className).toBe("icon")
    expect(box.getAttribute("part")).toBe("icon")
    await expect.poll(() => box.querySelector("svg")).not.toBeNull()
  })

  it("`spacer` is Fomantic's hidden divider:  the spacing without the line;  `hidden` hides it, as any element", async () => {
    const { host, root } = await divider(`<ui-divider spacer></ui-divider>`)
    expect(root.getAttribute("role")).toBe("none")
    expect(root.className).toBe("ui hidden divider")
    expect(getComputedStyle(host).display).toBe("contents")
    expect((host as unknown as { spacer: unknown }).spacer).toBe(true)
    host.hidden = true
    expect((host as unknown as { visible: boolean }).visible).toBe(false)
    await expect.poll(() => getComputedStyle(host).display).toBe("none")
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-divider> tokens from outside", () => {
  /** The inner box's margin top. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=divider]")!).marginTop
  }

  /** The element under test. */
  const MARKUP = `<ui-divider></ui-divider>`

  it("takes a token set on the HOST", async () => {
    const host = await ElementFixture.render(
      MARKUP.replace("<ui-divider", `<ui-divider style="--ui-divider-margin: 20px"`)
    )
    expect(measure(host)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-divider-margin: 20px"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-divider")!)).toBe("20px")
  })

  it("takes a token set through `::part(divider)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(divider) { --ui-divider-margin: 20px }</style>${MARKUP.replace("<ui-divider", '<ui-divider class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-divider")!)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-divider-margin", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-divider-margin")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("20px")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("16px")
  })

  it("variations:  `section` swaps in its own token, whatever the base", async () => {
    const { root } = await divider(`<ui-divider section style="--ui-divider-margin: 20px"></ui-divider>`)
    expect(getComputedStyle(root).marginTop).toBe("32px")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-divider> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
