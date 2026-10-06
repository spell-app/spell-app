import { describe, expect, it, onTestFinished, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { Viewport } from "$/ui/test/Viewport"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-items"
import "$/ui/components/ui-list"
import "$/ui/components/ui-image"
import "$/ui/components/ui-button"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-items/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A landscape picture, 480 x 320. */
const PHOTO =
  `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22480%22 height=%22320%22` +
  ` viewBox=%220 0 30 20%22/%3E`

/** An item with an image and a content block. */
const ITEM =
  `<ui-item><img src="${PHOTO}" alt=""><ui-content><ui-header href="#a">Cute Dog</ui-header>` +
  `<ui-meta><span>Meta</span></ui-meta><ui-description>Text</ui-description><ui-extra>Extra</ui-extra>` +
  `</ui-content></ui-item>`

/** Render `<ui-items attributes>items</ui-items>` inside a `width`-px wrapper. */
async function view(attributes = "", items = ITEM + ITEM, width = 1000) {
  const wrapper = await ElementFixture.render(
    `<div style="width: ${width}px"><ui-items ${attributes}>${items}</ui-items></div>`
  )
  const host = wrapper.querySelector<UIHost>("ui-items")!
  await ElementFixture.settle(wrapper)
  return { host, root: rootOf(host), items: itemsOf(host) }
}

/** The group's `[part~=items]` root. */
function rootOf(host: Element): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=items]")!
}

/** The `<ui-item>` children. */
function itemsOf(host: Element): UIHost[] {
  return [...host.querySelectorAll<UIHost>(":scope > ui-item")]
}

/** An item's `[part~=item]` box. */
function boxOf(item: Element): HTMLElement {
  return item.shadowRoot!.querySelector<HTMLElement>("[part~=item]")!
}

/** A part element's root. */
function partRoot(host: Element): HTMLElement {
  return host.shadowRoot!.firstElementChild as HTMLElement
}

/** Computed style. */
function style(element: Element): CSSStyleDeclaration {
  return getComputedStyle(element)
}

////////////////
// ## Classes and markup
////////////////

describe("<ui-items> classes and markup", () => {
  it.each([
    ["", "ui items"],
    ['size="small"', "ui small items"],
    ["divided", "ui divided items"],
    ['relaxed="very" divided link', "ui divided link very relaxed items"],
    ["relaxed unstackable inverted", "ui inverted unstackable relaxed items"],
    ['divided="no" disabled', "ui disabled items"]
  ])("<ui-items %s>", async (attributes, classes) => {
    const { root } = await view(attributes)
    expect(root.className).toBe(classes)
  })

  it("renders a list of the generic <ui-item>s, each a listitem box", async () => {
    const { host, root, items } = await view("", `${ITEM}<ui-item href="#b"><ui-content>Link</ui-content></ui-item>`)
    expect(root.localName).toBe("div")
    expect(root.getAttribute("role")).toBe("list")
    expect(host.matches(":state(items)")).toBe(true)
    expect(style(host).display).toBe("block")
    for (const item of items) {
      expect(item.internals.role).toBe("listitem")
      expect(item.matches(":state(in-items)")).toBe(true)
    }
    expect(boxOf(items[0]!).localName).toBe("div")
    expect(boxOf(items[0]!).className).toBe("item")
    expect(style(boxOf(items[0]!)).display).toBe("flex")
    expect(boxOf(items[1]!).localName).toBe("a")
    expect(boxOf(items[1]!).getAttribute("href")).toBe("#b")
  })
})

////////////////
// ## Owns its parts in the Items view
////////////////

describe("<ui-item> owns its parts in the Items view", () => {
  it("gives its content parts ITEM context -- the item is their owner", async () => {
    const { items } = await view("", ITEM)
    const item = items[0]!
    for (const tag of ["ui-content", "ui-header", "ui-meta", "ui-description", "ui-extra"]) {
      const part = item.querySelector<UIHost>(tag)!
      expect(part.matches(":state(in-item)"), tag).toBe(true)
      const context = (part.controller as unknown as { context: { owner: { get(): { owner: Element } } } }).context
      expect(context.owner.get().owner, tag).toBe(item)
    }
    const header = partRoot(item.querySelector("ui-header")!)
    expect(header.className).toBe("header")
    expect(style(header).fontWeight).toBe("700")
    expect(parseFloat(style(header).fontSize)).toBeCloseTo((18 / 14) * 16, 0)
    // (WebKit snaps lengths to 1/64 px)
    expect(parseFloat(style(partRoot(item.querySelector("ui-description")!)).marginTop)).toBeCloseTo(0.6 * 16, 1)
  })

  it("leaves a list's parts to the list", async () => {
    const list = await ElementFixture.render<UIHost>(
      `<ui-list><ui-item><ui-content><ui-header>H</ui-header></ui-content></ui-item></ui-list>`
    )
    await ElementFixture.settle(list)
    expect(list.querySelector("ui-header")!.matches(":state(in-list)")).toBe(true)
    expect(list.querySelector("ui-header")!.matches(":state(in-item)")).toBe(false)
  })

  it("re-resolves its parts when the item moves between a list and the Items view", async () => {
    const wrapper = await ElementFixture.render(
      `<div><ui-list><ui-item><ui-content><ui-header>Moving</ui-header></ui-content></ui-item></ui-list><ui-items></ui-items></div>`
    )
    await ElementFixture.settle(wrapper)
    const item = wrapper.querySelector("ui-item")!
    const header = item.querySelector("ui-header")!
    expect(header.matches(":state(in-list)")).toBe(true)
    wrapper.querySelector("ui-items")!.append(item)
    await expect.poll(() => header.matches(":state(in-item)")).toBe(true)
    expect(header.matches(":state(in-list)")).toBe(false)
    wrapper.querySelector("ui-list")!.append(item)
    await expect.poll(() => header.matches(":state(in-list)")).toBe(true)
    expect(header.matches(":state(in-item)")).toBe(false)
  })

  it("re-adopts its owner's sheets on a move without an untracked read (dev `STRICT_READ_UNTRACKED`)", async () => {
    const warn = vi.spyOn(console, "warn")
    try {
      const wrapper = await ElementFixture.render(
        `<div><ui-list><ui-item>Moving</ui-item></ui-list><ui-items></ui-items></div>`
      )
      const item = wrapper.querySelector<UIHost>("ui-item")!
      wrapper.querySelector("ui-items")!.append(item)
      await expect.poll(() => item.matches(":state(in-items)")).toBe(true)
      await ElementFixture.settle(wrapper)
      const strict = warn.mock.calls.filter((args) => String(args[0]).includes("STRICT_READ_UNTRACKED"))
      expect(strict).toEqual([])
    } finally {
      warn.mockRestore()
    }
  })
})

////////////////
// ## Images
////////////////

describe("<ui-items> images", () => {
  it("draws a slotted <img> 175px wide, the content beside it", async () => {
    const { items } = await view("", ITEM)
    const image = items[0]!.querySelector("img")!
    const content = partRoot(items[0]!.querySelector("ui-content")!)
    expect(image.getBoundingClientRect().width).toBe(175)
    expect(style(content).paddingLeft).toBe("24px")
    expect(content.getBoundingClientRect().left).toBeGreaterThanOrEqual(image.getBoundingClientRect().right)
    expect(content.getBoundingClientRect().top).toBe(image.getBoundingClientRect().top)
  })

  it("renders the `image` shorthand as a plain `.image`, the content beside it (`--_ui-item-media`)", async () => {
    const { items } = await view("", `<ui-item image="${PHOTO}"><ui-content>Beside</ui-content></ui-item>`)
    const image = boxOf(items[0]!).querySelector<HTMLImageElement>("img[part~=image]")!
    expect(image.className).toBe("image")
    expect(image.alt).toBe("")
    expect(image.getBoundingClientRect().width).toBe(175)
    const content = partRoot(items[0]!.querySelector("ui-content")!)
    expect(style(content).paddingLeft).toBe("24px")
    expect(content.getBoundingClientRect().left).toBeGreaterThanOrEqual(image.getBoundingClientRect().right)
  })

  it("keeps a sized <ui-image> at its own size", async () => {
    const { items } = await view(
      "",
      `<ui-item><ui-image size="tiny" src="${PHOTO}" alt=""></ui-image><ui-content>Tiny</ui-content></ui-item>`
    )
    await ElementFixture.settle(items[0]!)
    const image = items[0]!.querySelector("ui-image")!.shadowRoot!.querySelector("img")!
    expect(image.getBoundingClientRect().width).toBe(80)
    const content = partRoot(items[0]!.querySelector("ui-content")!)
    expect(content.getBoundingClientRect().left).toBeGreaterThanOrEqual(image.getBoundingClientRect().right)
  })

  it("aligns content against the image (`vertical-align`)", async () => {
    const { items } = await view(
      "",
      `<ui-item><img src="${PHOTO}" alt=""><ui-content vertical-align="middle">Middle</ui-content></ui-item>`
    )
    const content = partRoot(items[0]!.querySelector("ui-content")!)
    expect(content.className).toBe("middle aligned content")
    expect(style(content).alignSelf).toBe("center")
  })
})

////////////////
// ## Variations
////////////////

describe("<ui-items> variations", () => {
  it("spaces items 1em apart, but not the outer edges", async () => {
    const { items } = await view("", ITEM + ITEM + ITEM)
    const [first, middle, last] = items.map(boxOf)
    expect(style(first!).marginTop).toBe("0px")
    expect(style(middle!).marginTop).toBe("16px")
    expect(style(last!).marginBottom).toBe("0px")
  })

  it("relaxes and divides", async () => {
    const { host, items } = await view("relaxed", ITEM + ITEM + ITEM)
    const [first, middle] = items.map(boxOf)
    expect(style(middle!).marginTop).toBe("24px")
    host.setAttribute("relaxed", "very")
    await ElementFixture.tick()
    expect(style(middle!).marginTop).toBe("32px")
    host.removeAttribute("relaxed")
    host.setAttribute("divided", "")
    await ElementFixture.tick()
    expect(style(first!).borderTopWidth).toBe("0px")
    expect(style(middle!)).toMatchObject({ borderTopWidth: "1px", marginTop: "0px", paddingTop: "16px" })
  })

  it("links:  a pointer and the header in the link colour while an item is hovered", async () => {
    const plain = `<ui-item><ui-content><ui-header>Hover</ui-header></ui-content></ui-item>`
    const { items } = await view("link", plain + plain)
    const header = partRoot(items[0]!.querySelector("ui-header")!)
    const before = style(header).color
    expect(style(boxOf(items[0]!)).cursor).toBe("auto")
    await userEvent.hover(boxOf(items[0]!))
    await expect.poll(() => style(header).color).not.toBe(before)
    expect(style(boxOf(items[0]!)).cursor).toBe("pointer")
    await userEvent.unhover(boxOf(items[0]!))
  })

  it("inverts:  the dark scheme for the items and their parts", async () => {
    const { host, items } = await view("inverted", ITEM)
    expect(style(rootOf(host)).colorScheme).toBe("dark")
    const header = partRoot(items[0]!.querySelector("ui-header")!)
    expect(style(header).getPropertyValue("--ui-inverted").trim()).toBe("1")
  })

  it("fades a disabled item", async () => {
    const { items } = await view("", `<ui-item disabled><ui-content>Off</ui-content></ui-item>${ITEM}`)
    expect(Number(style(boxOf(items[0]!)).opacity)).toBeLessThan(1)
    expect(style(boxOf(items[0]!)).pointerEvents).toBe("none")
    expect(style(boxOf(items[1]!)).opacity).toBe("1")
  })

  it("scales with `size`", async () => {
    const { root } = await view('size="large"', ITEM)
    expect(style(root).fontSize).toBe("18px")
  })
})

////////////////
// ## Responsive (container queries)
////////////////

describe("<ui-items> responsive (container queries)", () => {
  it("stacks items in a narrow group:  the image above the content", async () => {
    const { items } = await view("", ITEM, 500)
    const box = boxOf(items[0]!)
    expect(style(box).flexDirection).toBe("column")
    const image = items[0]!.querySelector("img")!
    const content = partRoot(items[0]!.querySelector("ui-content")!)
    expect(content.getBoundingClientRect().top).toBeGreaterThanOrEqual(image.getBoundingClientRect().bottom)
    expect(style(content).paddingLeft).toBe("0px")
    expect(style(content).paddingTop).toBe("24px")
  })

  it('`stack-with="page"` stacks by the SCREEN;  the token too, and the attribute beats it', async () => {
    const wrapper = await ElementFixture.render(
      `<div style="width: 500px"><ui-items stack-with="page">${ITEM}</ui-items>` +
        `<div style="--ui-stack-with: page"><ui-items>${ITEM}</ui-items>` +
        `<ui-items stack-with="container">${ITEM}</ui-items></div></div>`
    )
    await ElementFixture.settle(wrapper)
    const groups = [...wrapper.querySelectorAll("ui-items")]
    expect(rootOf(groups[0]!).className).toBe("ui items stack-with-page")
    /** `group`'s first item's flex direction:  `column` when stacked. */
    const direction = (group: Element) => style(boxOf(itemsOf(group)[0]!)).flexDirection
    await Viewport.resize(1200)
    await expect.poll(() => groups.map(direction)).toEqual(["row", "row", "column"])
    await Viewport.resize(500)
    await expect.poll(() => groups.map(direction)).toEqual(["column", "column", "column"])
  })

  it("keeps a 125px image beside the content when `unstackable`", async () => {
    const { items } = await view("unstackable", ITEM, 500)
    const image = items[0]!.querySelector("img")!
    expect(style(boxOf(items[0]!)).flexDirection).toBe("row")
    expect(image.getBoundingClientRect().width).toBe(125)
  })

  it("a stacked item's sized <ui-image> takes its natural width, as static markup does (Fomantic's mobile `width: auto`)", async () => {
    const sized = `<ui-item><ui-image size="tiny" src="${PHOTO}" alt=""></ui-image><ui-content>Text</ui-content></ui-item>`
    expect(await widthAt(1000)).toBe(80)
    expect(await widthAt(500)).toBeGreaterThan(80)

    /** The sized image's width in a group `width` px wide. */
    async function widthAt(width: number) {
      const { items } = await view("", sized, width)
      return items[0]!.querySelector("ui-image")!.shadowRoot!.querySelector("img")!.getBoundingClientRect().width
    }
  })

  it("caps a stacked item's sized <ui-image> at 250px tall, keeping its shape (Fomantic's mobile `max-height`)", async () => {
    const sized = `<ui-item><ui-image size="tiny" src="${PHOTO}" alt=""></ui-image><ui-content>Text</ui-content></ui-item>`
    const { items } = await view("", sized, 500)
    const box = items[0]!.querySelector("ui-image")!.shadowRoot!.querySelector("img")!.getBoundingClientRect()
    expect(box.height).toBe(250)
    expect(box.width).toBe(375)
  })

  it("narrows the image and the distance in a tablet-wide group", async () => {
    const { items } = await view("", ITEM, 800)
    expect(items[0]!.querySelector("img")!.getBoundingClientRect().width).toBe(150)
    expect(style(partRoot(items[0]!.querySelector("ui-content")!)).paddingLeft).toBe("16px")
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-items> tokens from outside", () => {
  /** The second item's top margin. */
  function spacing(host: Element): string {
    return style(boxOf(itemsOf(host)[1]!)).marginTop
  }

  it("takes a token set on the HOST, reaching its items", async () => {
    const { host } = await view(`style="--ui-items-item-spacing: 2em"`, ITEM + ITEM + ITEM)
    expect(spacing(host)).toBe("32px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-items-item-spacing: 2em"><div style="width: 1000px"><ui-items>${ITEM + ITEM}</ui-items></div></section>`
    )
    await ElementFixture.settle(wrapper)
    expect(spacing(wrapper.querySelector("ui-items")!)).toBe("32px")
  })

  it("takes a token set through `::part(items)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div style="width: 1000px"><style>.themed::part(items) { --ui-items-item-spacing: 2em }</style>` +
        `<ui-items class="themed">${ITEM + ITEM}</ui-items></div>`
    )
    await ElementFixture.settle(wrapper)
    expect(spacing(wrapper.querySelector("ui-items")!)).toBe("32px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-items-image-width", "100px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-items-image-width")
    })
    const { items } = await view("", ITEM)
    expect(items[0]!.querySelector("img")!.getBoundingClientRect().width).toBe(100)
  })

  it("variations:  `relaxed` swaps the spacing, winning over the base token", async () => {
    const { host } = await view(`relaxed style="--ui-items-item-spacing: 2em"`, ITEM + ITEM + ITEM)
    expect(spacing(host)).toBe("24px")
  })

  it("owner tokens:  the content distance set on the group reaches its content parts;  a tablet-wide group swaps it", async () => {
    const { items } = await view(`style="--ui-items-content-distance: 40px"`, ITEM)
    expect(style(partRoot(items[0]!.querySelector("ui-content")!)).paddingLeft).toBe("40px")
    const tablet = await view(`style="--ui-items-content-distance: 40px"`, ITEM, 800)
    expect(style(partRoot(tablet.items[0]!.querySelector("ui-content")!)).paddingLeft).toBe("16px")
  })
})

////////////////
// ## Keyboard
////////////////

describe("<ui-items> keyboard", () => {
  it("makes an item with `href` one Tab stop;  plain items are none", async () => {
    const wrapper = await ElementFixture.render(
      `<div><button>Before</button><ui-items><ui-item href="#camp"><ui-content><ui-header>Camp</ui-header>` +
        `</ui-content></ui-item><ui-item><ui-content>Plain</ui-content></ui-item></ui-items><button>After</button></div>`
    )
    await ElementFixture.settle(wrapper)
    const [before, after] = wrapper.querySelectorAll("button")
    const [link] = itemsOf(wrapper.querySelector("ui-items")!)
    before!.focus()
    await Keys.tab()
    expect(link!.shadowRoot!.activeElement).toBe(boxOf(link!))
    await Keys.tab()
    expect(document.activeElement).toBe(after)
  })
})

////////////////
// ## Outer margin
////////////////

describe("<ui-items> outer margin", () => {
  it("collapses with the heading above like static markup (the host, a size container, carries the margin)", async () => {
    const wrapper = await ElementFixture.render(
      `<div style="width: 1000px"><h4 style="margin: 0 0 10px">Heading</h4><ui-items>${ITEM}</ui-items></div>`
    )
    await ElementFixture.settle(wrapper)
    const heading = wrapper.querySelector("h4")!.getBoundingClientRect()
    const host = wrapper.querySelector("ui-items")!.getBoundingClientRect()
    // max(10px, 1.5em of 16px), not their sum
    expect(host.top - heading.bottom).toBeCloseTo(24, 0)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-items> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.settle(root)
    await expectAccessible(root)
  })
})
