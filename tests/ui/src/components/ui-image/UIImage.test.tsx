import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-image"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-image/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A 2x1 image. */
const SRC =
  "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22100%22%3E%3C/svg%3E"

/** Render one `<ui-image>`;  returns it with its root. */
async function image(html: string) {
  const host = await ElementFixture.render<DOMElement>(html)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=image]")!
  return { host, root }
}

////////////////
// ## Classes
////////////////

describe("<ui-image> classes", () => {
  it.each([
    ["", "ui image"],
    ['size="small"', "ui small image"],
    ['size="medium"', "ui image"],
    ["avatar", "ui avatar image"],
    ['bordered rounded circular="no"', "ui bordered rounded image"],
    ["centered fluid", "ui centered fluid image"],
    ["inline disabled", "ui disabled inline image"],
    ['floated="right"', "ui right floated image"],
    ["spaced", "ui spaced image"],
    ['spaced="left"', "ui left spaced image"],
    ['vertical-align="middle"', "ui middle aligned image"],
    ['size="tiny" circular floated="left" vertical-align="top"', "ui tiny circular left floated top aligned image"]
  ])("<ui-image %s>", async (attributes, classes) => {
    const { root } = await image(`<ui-image src="${SRC}" alt="x" ${attributes}></ui-image>`)
    expect(root.localName).toBe("img")
    expect(root.className).toBe(classes)
  })
})

////////////////
// ## Image
////////////////

describe("<ui-image> image", () => {
  it("passes src, alt, width, height and loading through to the <img>", async () => {
    const { root } = await image(
      `<ui-image src="${SRC}" alt="A field" width="200" height="100" loading="lazy"></ui-image>`
    )
    const img = root as HTMLImageElement
    expect(img).toMatchObject({ src: SRC, alt: "A field", loading: "lazy" })
    expect(img.getAttribute("width")).toBe("200")
    expect(img.getAttribute("height")).toBe("100")
  })

  it('marks `alt=""` decorative, and leaves a missing alt missing', async () => {
    const { root: decorative } = await image(`<ui-image src="${SRC}" alt=""></ui-image>`)
    expect(decorative.getAttribute("alt")).toBe("")
    expect(decorative.matches(":is([alt=''])")).toBe(true)
    const { root: missing } = await image(`<ui-image src="${SRC}"></ui-image>`)
    expect(missing.hasAttribute("alt")).toBe(false)
  })

  it("follows `alt` and `src`", async () => {
    const { host, root } = await image(`<ui-image src="${SRC}" alt="One"></ui-image>`)
    host.setAttribute("alt", "Two")
    host.setAttribute("src", "data:,")
    await ElementFixture.tick()
    expect(root.getAttribute("alt")).toBe("Two")
    expect(root.getAttribute("src")).toBe("data:,")
  })

  it("wraps the <img> in a link with href:  classes on the link, the image named by alt", async () => {
    const { root } = await image(`<ui-image href="#photo" size="small" src="${SRC}" alt="Profile"></ui-image>`)
    expect(root).toMatchObject({ localName: "a", className: "ui small image" })
    expect(root.getAttribute("href")).toBe("#photo")
    const img = root.querySelector("img")!
    expect(img.getAttribute("part")).toBe("img")
    expect(img.hasAttribute("class")).toBe(false)
    expect(img.alt).toBe("Profile")
  })

  it("drops a disabled link's href, with aria-disabled and :state(disabled)", async () => {
    const { host, root } = await image(`<ui-image href="#x" disabled src="${SRC}" alt="X"></ui-image>`)
    expect(root.hasAttribute("href")).toBe(false)
    expect(root.getAttribute("aria-disabled")).toBe("true")
    expect(host.matches(":state(disabled)")).toBe(true)
  })

  it("has no box of its own:  the root is the image box, sized by `size`", async () => {
    const { host, root } = await image(`<ui-image size="small" src="${SRC}" alt="x"></ui-image>`)
    expect(getComputedStyle(host).display).toBe("contents")
    expect(root.getBoundingClientRect().width).toBeCloseTo(150, 0)
  })

  it("hides with the global hidden attribute", async () => {
    const { root } = await image(`<ui-image hidden src="${SRC}" alt="x"></ui-image>`)
    expect(root.getBoundingClientRect().width).toBe(0)
  })
})

////////////////
// ## `<ui-images>`
////////////////

describe("<ui-images>", () => {
  it.each([
    ["", "ui images"],
    ['size="tiny"', "ui tiny images"],
    ["avatar circular", "ui avatar circular images"],
    ['floated="left" vertical-align="bottom"', "ui left floated bottom aligned images"]
  ])("<ui-images %s>", async (attributes, classes) => {
    const group = await ElementFixture.render<DOMElement>(`<ui-images ${attributes}></ui-images>`)
    const root = group.shadowRoot!.querySelector("[part~=group]")!
    expect(root.className).toBe(classes)
    expect(root.querySelector("slot")).not.toBeNull()
  })

  it("hands its size to the images in it", async () => {
    const group = await ElementFixture.render<DOMElement>(
      `<ui-images size="tiny"><ui-image src="${SRC}" alt="a"></ui-image><ui-image src="${SRC}" alt="b"></ui-image></ui-images>`
    )
    for (const image of group.querySelectorAll("ui-image")) {
      expect(image.shadowRoot!.querySelector("img")!.getBoundingClientRect().width).toBeCloseTo(80, 0)
    }
  })

  it("sizes a plain <img> slotted into it", async () => {
    const group = await ElementFixture.render<DOMElement>(
      `<ui-images size="tiny"><img src="${SRC}" alt="a"></ui-images>`
    )
    expect(group.querySelector("img")!.getBoundingClientRect().width).toBeCloseTo(80, 0)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-image> tokens from outside", () => {
  /** The inner image's top-left radius. */
  function radius(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=image]")!).borderTopLeftRadius
  }

  /** A rounded image. */
  const ROUNDED = `<ui-image rounded src="${SRC}" alt=""></ui-image>`

  it("takes a token set on the element", async () => {
    const { host } = await image(
      `<ui-image rounded src="${SRC}" alt="" style="--ui-image-rounded-radius: 20px"></ui-image>`
    )
    expect(radius(host)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-image-rounded-radius: 20px"><div>${ROUNDED}</div></section>`
    )
    expect(radius(wrapper.querySelector("ui-image")!)).toBe("20px")
  })

  it("takes a token set through `::part(image)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(image) { --ui-image-rounded-radius: 20px }</style>${ROUNDED.replace("<ui-image", '<ui-image class="themed"')}</div>`
    )
    expect(radius(wrapper.querySelector("ui-image")!)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-image-rounded-radius", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-image-rounded-radius")
    })
    const { host } = await image(ROUNDED)
    expect(radius(host)).toBe("20px")
  })

  it("keeps its defaults when nothing is set", async () => {
    const { host } = await image(ROUNDED)
    const probe = await ElementFixture.render(`<span style="border-top-left-radius: var(--ui-radius)"></span>`)
    expect(radius(host)).toBe(getComputedStyle(probe).borderTopLeftRadius)
  })

  it("variations:  a size reads its own width token", async () => {
    const { root } = await image(
      `<ui-image size="small" src="${SRC}" alt="" style="--ui-image-width-small: 100px"></ui-image>`
    )
    expect(root.getBoundingClientRect().width).toBe(100)
  })

  it("reaches the members of a group, set on the group", async () => {
    const group = await ElementFixture.render<DOMElement>(
      `<ui-images rounded style="--ui-image-rounded-radius: 20px"><ui-image src="${SRC}" alt="a"></ui-image><ui-image src="${SRC}" alt="b"></ui-image></ui-images>`
    )
    for (const member of group.querySelectorAll("ui-image")) expect(radius(member)).toBe("20px")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-image> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
