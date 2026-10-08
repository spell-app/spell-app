import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { imageVocabulary } from "./UIImage.en"
import { imagesVocabulary } from "./UIImages.en"

import partsCSS from "$/ui/components/ui-parts/UIParts.css?inline"
import imageCSS from "./UIImage.css?inline"
import imageRaw from "./UIImage.css?raw"

/**
 * `UIImage.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the same class grammar the shadow roots will use), and what a group hands its children.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** A 200x200 placeholder, as the examples use. */
const SQUARE =
  "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 " +
  "viewBox=%220 0 10 10%22%3E%3Crect width=%2210%22 height=%2210%22 fill=%22%2394a3b8%22/%3E%3C/svg%3E"

////////////////
// ## Source
////////////////

describe("UIImage.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(imageRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(imageRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(imageRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("image"))).toBe(true)
  })

  it("parses with replaceSync, keeping the ::slotted group rules and the host-position rules", () => {
    for (const css of [imageCSS, imageRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(40)
      expect(selectors.some((selector) => selector.includes(".ui.images > ::slotted(*)"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(":host(:not(:last-child)) > .ui.floated"))).toBe(true)
    }
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = imageRaw + colorsCSS
    for (const vocabulary of [imageVocabulary, imagesVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })
})

////////////////
// ## Examples
////////////////

describe("UIImage.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every image in %s", (path) => {
    Sheets.adopt([...foundationCSS, imageCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const images = root.querySelectorAll<HTMLElement>(".ui.image")
    expect(images.length).toBeGreaterThan(0)
    for (const image of images) {
      const style = getComputedStyle(image)
      expect(style.position, image.outerHTML.slice(0, 80)).toBe("relative")
      expect(style.boxSizing).toBe("border-box")
      expect(style.maxWidth).toBe("100%")
    }
  })

  it("draws a bare image as a block, a link as an inline box its picture fills", () => {
    Sheets.adopt([...foundationCSS, imageCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    expect(getComputedStyle(root.querySelector("img.ui.image")!).display).toBe("block")
    const link = root.querySelector<HTMLElement>("a.ui.image")!
    expect(getComputedStyle(link).display).toBe("inline-block")
    const inner = link.querySelector("img")!
    expect(getComputedStyle(inner).display).toBe("block")
    expect(inner.getBoundingClientRect().width).toBeCloseTo(link.getBoundingClientRect().width, 0)
  })

  it("hides hidden images and fades disabled ones", () => {
    Sheets.adopt([...foundationCSS, imageCSS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    expect(getComputedStyle(root.querySelector(".ui.hidden.image")!).display).toBe("none")
    expect(parseFloat(getComputedStyle(root.querySelector(".ui.disabled.image")!).opacity)).toBeCloseTo(0.45, 2)
  })

  it("rounds, borders, crops and fills", () => {
    Sheets.adopt([...foundationCSS, imageCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    const avatar = style("img.ui.avatar.image")
    expect(parseFloat(avatar.width)).toBeCloseTo(2 * parseFloat(avatar.fontSize))
    expect(avatar.height).toBe(avatar.width)
    expect(avatar.display).toBe("inline-block")
    expect(parseFloat(avatar.borderTopLeftRadius)).toBeGreaterThan(1000)
    expect(avatar.objectFit).toBe("cover")
    const linked = root.querySelector("a.ui.avatar.image img")!
    expect(getComputedStyle(linked).width).toBe(avatar.width)
    expect(parseFloat(getComputedStyle(linked).borderTopLeftRadius)).toBeGreaterThan(1000)
    expect(style(".ui.bordered.image").borderTopWidth).toBe("1px")
    expect(parseFloat(style(".ui.rounded.image").borderTopLeftRadius)).toBeGreaterThan(0)
    expect(parseFloat(style(".ui.circular.image").borderTopLeftRadius)).toBeGreaterThan(1000)
    const fluid = root.querySelector<HTMLElement>(".ui.fluid.image")!
    expect(fluid.getBoundingClientRect().width).toBeCloseTo(fluid.parentElement!.getBoundingClientRect().width, 0)
    const centered = style(".ui.centered.image")
    expect(centered.display).toBe("block")
    expect(parseFloat(centered.marginLeft)).toBeGreaterThan(0)
    expect(centered.marginLeft).toBe(centered.marginRight)
  })

  it("aligns, spaces and floats against the text", () => {
    Sheets.adopt([...foundationCSS, imageCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    expect(style(".ui.top.aligned.image").verticalAlign).toBe("top")
    expect(style(".ui.top.aligned.image").display).toBe("inline-block")
    expect(style(".ui.bottom.aligned.image").verticalAlign).toBe("bottom")
    const spaced = style('.ui.spaced.image[class="ui mini spaced image"]')
    expect(spaced.display).toBe("inline-block")
    expect(parseFloat(spaced.marginLeft)).toBeGreaterThan(0)
    expect(spaced.marginLeft).toBe(spaced.marginRight)
    expect(style(".ui.left.spaced.image").marginRight).toBe("0px")
    expect(style(".ui.right.spaced.image").marginLeft).toBe("0px")
    const left = style(".ui.left.floated.image")
    expect(left.float).toBe("left")
    expect(parseFloat(left.marginRight)).toBeGreaterThan(0)
    expect(parseFloat(left.marginBottom)).toBeGreaterThan(0)
    const right = style(".ui.right.floated.image")
    expect(right.float).toBe("right")
    expect(parseFloat(right.marginLeft)).toBeGreaterThan(0)
    expect(right.marginRight).toBe("0px")
  })

  it("sizes by Fomantic's width ladder, following --ui-font-size", () => {
    Sheets.adopt([...foundationCSS, imageCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    // the Size wrapper (1200px) clamps to its column:  give it room
    root.style.width = "1300px"
    const width = (size: string) => root.querySelector(`.ui.${size}.image[class="ui ${size} image"]`)!.clientWidth
    const ladder = ["mini", "tiny", "small", "medium", "large", "big", "huge"].map(width)
    expect(ladder).toEqual([35, 80, 150, 300, 450, 600, 800])
    root.style.setProperty("--ui-font-size", "8px")
    expect(width("small")).toBe(75)
  })
})

////////////////
// ## Groups
////////////////

describe("UIImage.css groups", () => {
  it("hands its children size, spacing and looks", () => {
    Sheets.adopt([...foundationCSS, imageCSS])
    const root = Fixture.render(EXAMPLES["./examples/groups.html"]!)
    const [sized, rounded, avatars, centered] = root.querySelectorAll<HTMLElement>(".ui.images")
    expect(getComputedStyle(sized!).display).toBe("flex")
    for (const child of sized!.children) {
      const style = getComputedStyle(child)
      expect(child.clientWidth).toBe(80)
      expect(parseFloat(style.marginBottom)).toBeGreaterThan(0)
      expect(parseFloat(style.marginLeft)).toBeGreaterThan(0)
    }
    const [first, second] = sized!.children
    expect(second!.getBoundingClientRect().top).toBeCloseTo(first!.getBoundingClientRect().top, 0)
    const bordered = getComputedStyle(rounded!.firstElementChild!)
    expect(bordered.borderTopWidth).toBe("1px")
    expect(parseFloat(bordered.borderTopLeftRadius)).toBeGreaterThan(0)
    const avatar = getComputedStyle(avatars!.firstElementChild!)
    expect(parseFloat(avatar.width)).toBeCloseTo(2 * parseFloat(avatar.fontSize))
    expect(parseFloat(avatar.borderTopLeftRadius)).toBeGreaterThan(1000)
    expect(getComputedStyle(centered!).justifyContent).toBe("center")
    expect(centered!.firstElementChild!.clientWidth).toBe(35)
  })
})

////////////////
// ## Groups beside the page's other sheets
////////////////

describe("UIImage.css groups beside the page's other sheets", () => {
  it("an `ui avatar images` group keeps its 2em avatars next to UIParts.css (whose bare `.avatar img` is a part's)", () => {
    Sheets.adopt([...foundationCSS, imageCSS, partsCSS])
    const root = Fixture.render(EXAMPLES["./examples/groups.html"]!)
    const avatar = root.querySelector<HTMLElement>(".ui.avatar.images")!.firstElementChild as HTMLElement
    expect(avatar.clientWidth).toBe(Math.round(2 * parseFloat(getComputedStyle(avatar).fontSize)))
  })
})

////////////////
// ## Tokens
////////////////

describe("UIImage.css tokens", () => {
  it("takes a public token from a wrapper or the image itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, imageCSS])
    const root = Fixture.render(
      `<div style="--ui-image-rounded-radius: 20px"><img class="ui rounded image" src="${SQUARE}" alt=""></div>` +
        `<img class="ui bordered image" src="${SQUARE}" alt="" style="--ui-image-border: 3px solid red">`
    )
    expect(getComputedStyle(root.firstElementChild!).borderTopLeftRadius).toBe("20px")
    expect(getComputedStyle(root.nextElementSibling!).borderTopWidth).toBe("3px")
  })
})

////////////////
// ## In shadow roots
////////////////

describe("UIImage.css in shadow roots", () => {
  it("renders the host as contents and the root as the image box", () => {
    Sheets.adopt(foundationCSS)
    const host = Sheets.host(
      `<img class="ui small rounded image" part="image" src="${SQUARE}" alt="" width="200" height="200">`,
      sheets()
    )
    const inner = Sheets.inner(host)
    expect(getComputedStyle(host).display).toBe("contents")
    expect(getComputedStyle(inner).display).toBe("block")
    expect(inner.clientWidth).toBe(150)
    expect(parseFloat(getComputedStyle(inner).borderTopLeftRadius)).toBeGreaterThan(0)
    host.hidden = true
    expect(getComputedStyle(host).display).toBe("none")
  })

  it("hands a group's size and spacing to slotted images, not to what they wrap", () => {
    Sheets.adopt(foundationCSS)
    const group = Sheets.host(`<div class="ui tiny circular images" part="group"><slot></slot></div>`, sheets())
    const children = [0, 1].map((index) => {
      const child = document.createElement("span")
      const html =
        index === 0
          ? `<img class="ui image" part="image" src="${SQUARE}" alt="">`
          : `<a class="ui image" part="image" href="#x"><img part="img" src="${SQUARE}" alt="X"></a>`
      Sheets.attach(child, html, sheets())
      group.append(child)
      return Sheets.inner(child)
    })
    for (const image of children) {
      const style = getComputedStyle(image)
      expect(image.getBoundingClientRect().width).toBeCloseTo(80, 0)
      expect(parseFloat(style.marginBottom)).toBeGreaterThan(0)
      expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(1000)
    }
    const wrapped = getComputedStyle(children[1]!.querySelector("img")!)
    expect(wrapped.marginBottom).toBe("0px")
    expect(parseFloat(wrapped.borderTopLeftRadius)).toBeGreaterThan(1000)
  })

  it("spaces a floated image below unless its host is the last child", () => {
    Sheets.adopt(foundationCSS)
    const parent = Fixture.render(`<div><span></span><span></span></div>`)
    const [a, b] = [...parent.children].map((host) => {
      Sheets.attach(host, `<img class="ui mini left floated image" src="${SQUARE}" alt="">`, sheets())
      return Sheets.inner(host)
    })
    expect(parseFloat(getComputedStyle(a!).marginBottom)).toBeGreaterThan(0)
    expect(getComputedStyle(b!).marginBottom).toBe("0px")
  })
})

/** The foundation plus `UIImage.css`, as a `<ui-image>` adopts them. */
function sheets(): string[] {
  return [...foundationCSS, imageCSS]
}
