import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import { EmojiData } from "$/ui/components/ui-emoji"

import "$/ui/components/ui-root"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-emoji/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one emoji and wait for its glyph;  returns it with its root. */
async function render(html: string) {
  const host = await ElementFixture.render<UIHost>(html)
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  const name = host.getAttribute("name")
  if (name) await EmojiData.get(name)
  await ElementFixture.tick()
  return { host, root }
}

////////////////
// ## In a <ui-root emoji>
////////////////

describe("<ui-emoji> in a <ui-root emoji>", () => {
  /** `<ui-emoji>`'s glyph, once its load has settled. */
  async function glyph(host: Element) {
    await expect.poll(() => host.shadowRoot?.firstElementChild?.textContent).toBeTruthy()
    return host.shadowRoot!.firstElementChild!.textContent
  }

  it("draws from its root's set;  outside a root, the page's", async () => {
    const holder = await ElementFixture.render(
      `<div><ui-root emoji="fomantic" display="immediately"><ui-emoji name="pencil"></ui-emoji></ui-root>` +
        `<ui-emoji name="pencil"></ui-emoji></div>`
    )
    const [inside, outside] = holder.querySelectorAll("ui-emoji")
    expect(await glyph(inside!)).toBe("\u{1F4DD}")
    expect(await glyph(outside!)).toBe("\u270F\uFE0F")
  })

  it("a nested root inherits the set it doesn't set", async () => {
    const holder = await ElementFixture.render(
      `<div><ui-root emoji="fomantic" display="immediately"><ui-root size="small" display="immediately">` +
        `<ui-emoji name="pencil"></ui-emoji></ui-root></ui-root></div>`
    )
    expect(await glyph(holder.querySelector("ui-emoji")!)).toBe("\u{1F4DD}")
  })

  it("redraws when the root's set changes", async () => {
    const holder = await ElementFixture.render(
      `<div><ui-root display="immediately"><ui-emoji name="pencil"></ui-emoji></ui-root></div>`
    )
    const emoji = holder.querySelector("ui-emoji")!
    expect(await glyph(emoji)).toBe("\u270F\uFE0F")
    holder.querySelector("ui-root")!.setAttribute("emoji", "fomantic")
    await expect.poll(() => emoji.shadowRoot!.firstElementChild!.textContent).toBe("\u{1F4DD}")
  })
})

////////////////
// ## Glyph and classes
////////////////

describe("<ui-emoji> glyph and classes", () => {
  it.each([
    ["", "ui emoji"],
    ['size="small"', "ui small emoji"],
    ['size="medium"', "ui emoji"],
    ['size="big" link', "ui big link emoji"],
    ["disabled loading", "ui disabled loading emoji"]
  ])("<ui-emoji name=smile %s>", async (attributes, classes) => {
    const { root } = await render(`<ui-emoji name="grinning_face_with_smiling_eyes" ${attributes}></ui-emoji>`)
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("emoji")
    expect(root.localName).toBe("span")
  })

  it("draws the native emoji as plain text by default:  assistive tech reads its Unicode name", async () => {
    const { root } = await render(`<ui-emoji name=":grinning_face_with_smiling_eyes:"></ui-emoji>`)
    expect(root.textContent).toBe("\u{1F604}")
    expect(root.hasAttribute("role")).toBe(false)
    expect(root.hasAttribute("aria-hidden")).toBe(false)
  })

  it("is a named image with label, decorative with a bare label", async () => {
    const { root } = await render(`<ui-emoji name="thumbs_up" label="Approved"></ui-emoji>`)
    expect(root.getAttribute("role")).toBe("img")
    expect(root.getAttribute("aria-label")).toBe("Approved")
    const decorative = await render(`<ui-emoji name="sparkles" label></ui-emoji>`)
    expect(decorative.root.getAttribute("aria-hidden")).toBe("true")
    expect(decorative.root.hasAttribute("role")).toBe(false)
  })

  it("renders an empty box, with no role, for an unknown name", async () => {
    const { root } = await render(`<ui-emoji name="no_such_emoji" label="Nothing"></ui-emoji>`)
    expect(root.textContent).toBe("")
    expect(root.hasAttribute("role")).toBe(false)
  })

  it("takes a CLDR name without underscores, from the attribute or the property", async () => {
    const { host, root } = await render(`<ui-emoji name="thumbs up"></ui-emoji>`)
    expect(root.textContent).toBe("\u{1F44D}")
    ;(host as unknown as { name: string }).name = "grinningFaceWithSmilingEyes"
    await EmojiData.get("grinningFaceWithSmilingEyes")
    await ElementFixture.tick()
    expect(root.textContent).toBe("\u{1F604}")
  })

  it("follows name changes, the latest request winning", async () => {
    const { host, root } = await render(`<ui-emoji name="grinning_face_with_smiling_eyes"></ui-emoji>`)
    host.setAttribute("name", "face_savoring_food")
    host.setAttribute("name", "rocket")
    await EmojiData.get("rocket")
    await EmojiData.get("face_savoring_food")
    await ElementFixture.tick()
    expect(root.textContent).toBe("\u{1F680}")
  })

  it("sizes on Fomantic's ladder against the text, and dims / spins", async () => {
    const holder = await ElementFixture.render(
      `<p style="font-size: 20px"><ui-emoji name="grinning_face_with_smiling_eyes"></ui-emoji><ui-emoji name="grinning_face_with_smiling_eyes" size="small"></ui-emoji>` +
        `<ui-emoji name="grinning_face_with_smiling_eyes" size="large"></ui-emoji><ui-emoji name="grinning_face_with_smiling_eyes" size="big" disabled loading></ui-emoji></p>`
    )
    const roots = [...holder.querySelectorAll<UIHost>("ui-emoji")].map(
      (host) => host.shadowRoot!.firstElementChild as HTMLElement
    )
    expect(roots.map((root) => parseFloat(getComputedStyle(root).fontSize))).toEqual([20, 30, 120, 150])
    expect(parseFloat(getComputedStyle(roots[3]!).opacity)).toBeCloseTo(0.45, 2)
    expect(getComputedStyle(roots[3]!).animationName).toBe("ui-emoji-spin")
    expect(holder.querySelectorAll("ui-emoji")[3]!.matches(":state(loading):state(disabled)")).toBe(true)
  })

  it("isn't scaled twice inside a sized component", async () => {
    const holder = await ElementFixture.render(
      `<div class="ui-large" style="--ui-scale: 2; font-size: 16px"><ui-emoji name="grinning_face_with_smiling_eyes"></ui-emoji></div>`
    )
    const root = holder.querySelector<UIHost>("ui-emoji")!.shadowRoot!.firstElementChild!
    expect(parseFloat(getComputedStyle(root).fontSize)).toBe(16)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-emoji> tokens from outside", () => {
  /** The inner box's opacity. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=emoji]")!).opacity
  }

  /** The element under test. */
  const MARKUP = `<ui-emoji name="grinning_face_with_smiling_eyes"></ui-emoji>`

  it("takes a token set on the HOST", async () => {
    const host = await ElementFixture.render(MARKUP.replace("<ui-emoji", `<ui-emoji style="--ui-emoji-opacity: 0.5"`))
    expect(measure(host)).toBe("0.5")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-emoji-opacity: 0.5"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-emoji")!)).toBe("0.5")
  })

  it("takes a token set through `::part(emoji)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(emoji) { --ui-emoji-opacity: 0.5 }</style>${MARKUP.replace("<ui-emoji", '<ui-emoji class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-emoji")!)).toBe("0.5")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-emoji-opacity", "0.5")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-emoji-opacity")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("0.5")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("1")
  })

  it("variations:  a size reads its ratio token", async () => {
    const host = await ElementFixture.render(
      `<div style="font-size: 16px"><ui-emoji name="grinning_face_with_smiling_eyes" size="large" style="--ui-emoji-size-large: 4"></ui-emoji></div>`
    )
    const root = host.querySelector("ui-emoji")!.shadowRoot!.querySelector("[part~=emoji]")!
    expect(getComputedStyle(root).fontSize).toBe("64px")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-emoji> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await Promise.all([...root.querySelectorAll("ui-emoji")].map((host) => EmojiData.get(host.getAttribute("name")!)))
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})
