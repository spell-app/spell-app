import { userEvent } from "vite-plus/test/browser"
import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-menu"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-segment"
import "$/ui/components/ui-dropdown"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-menu/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Three link items, the second selected. */
const LINKS =
  `<ui-item href="#a">A</ui-item>` + `<ui-item href="#b" selected>B</ui-item>` + `<ui-item href="#c">C</ui-item>`

/** Render one `<ui-menu>`;  returns it, its root and its item DOM elements. */
async function menu(attributes = "", items = LINKS) {
  const host = await ElementFixture.render<DOMElement>(`<ui-menu aria-label="Test" ${attributes}>${items}</ui-menu>`)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=menu]")!
  return { host, root, items: [...host.querySelectorAll<DOMElement>("ui-item")] }
}

/** An item DOM element's `[part~=item]` box. */
function boxOf(item: Element): HTMLElement {
  return item.shadowRoot!.querySelector<HTMLElement>("[part~=item]")!
}

/** Computed style of an item's box. */
function styleOf(item: Element) {
  return getComputedStyle(boxOf(item))
}

/** Width of the box `bar()` renders a menu in. */
const WIDTH = 800

/** Three link items of very different widths, the second selected. */
const UNEVEN =
  `<ui-item href="#a">A</ui-item>` +
  `<ui-item href="#b" selected>A much longer item</ui-item>` +
  `<ui-item href="#c">C</ui-item>`

/** Render one `<ui-menu>` in a `WIDTH`-wide box;  returns it, its root and its item DOM elements. */
async function bar(attributes = "", items = LINKS) {
  const box = await ElementFixture.render(
    `<div style="width: ${WIDTH}px"><ui-menu aria-label="Test" ${attributes}>${items}</ui-menu></div>`
  )
  const host = box.querySelector<DOMElement>("ui-menu")!
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=menu]")!
  return { host, root, items: [...host.querySelectorAll<DOMElement>("ui-item")] }
}

/** Width from the first item box's left edge to the last one's right edge. */
function span(items: Element[]): number {
  return boxOf(items.at(-1)!).getBoundingClientRect().right - boxOf(items[0]!).getBoundingClientRect().left
}

/** `value` (a CSS colour, tokens allowed) as computed on a probe in the document. */
function colorOf(value: string): string {
  const probe = document.createElement("span")
  probe.style.color = value
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

////////////////
// ## Classes
////////////////

describe("<ui-menu> classes", () => {
  it.each([
    ["", "ui menu"],
    ['size="large"', "ui large menu"],
    ['size="medium"', "ui menu"],
    ['color="red"', "ui red menu"],
    ["secondary pointing", "ui pointing secondary menu"],
    ['secondary="no" pointing="yes"', "ui pointing menu"],
    ["tabular", "ui tabular menu"],
    ["text vertical", "ui text vertical menu"],
    ["pagination", "ui pagination menu"],
    ["icon", "ui icon menu"],
    ["labeled", "ui labeled icon menu"],
    ["fluid stackable borderless", "ui borderless fluid stackable menu"],
    ["compact centered wrapping wrapped", "ui centered compact wrapped wrapping menu"],
    ["inverted", "ui inverted menu"],
    ["link", "ui link menu"],
    ["floated", "ui floated menu"],
    ['floated="right"', "ui right floated menu"],
    ['fitted="horizontally"', "ui horizontally fitted menu"],
    ["attached", "ui attached menu"],
    ['attached="top"', "ui top attached menu"],
    ['fixed="bottom"', "ui bottom fixed menu"],
    ['items="3"', "ui three item menu"],
    ['items="equal"', "ui equal width menu"],
    ["interactive", "ui menu"],
    ['appearance="segmented"', "ui segmented menu"],
    ['appearance="tabular"', "ui tabular menu"],
    ['appearance="pointing" secondary', "ui pointing secondary menu"],
    ['alignment="center"', "ui center aligned menu"],
    ['alignment="fluid" equal', "ui equal fluid aligned menu"],
    ["equal", "ui equal menu"]
  ])("<ui-menu %s>", async (attributes, classes) => {
    const { root } = await menu(attributes)
    expect(root.className).toBe(classes)
  })
})

////////////////
// ## Semantics
////////////////

describe("<ui-menu> semantics", () => {
  it("is a <nav> landmark named by the DOM element's aria-label", async () => {
    const { host, root } = await menu()
    expect(root.localName).toBe("nav")
    expect(root.getAttribute("aria-label")).toBe("Test")
    host.removeAttribute("aria-label")
    await expect.poll(() => root.hasAttribute("aria-label")).toBe(false)
  })

  it("renders link items as <a href>, the selected one aria-current=page", async () => {
    const { items } = await menu()
    const [a, b] = items.map(boxOf)
    expect(a).toMatchObject({ localName: "a", className: "item", ariaCurrent: null })
    expect(a!.getAttribute("href")).toBe("#a")
    expect(b!.className).toBe("active item")
    expect(b!.getAttribute("aria-current")).toBe("page")
    expect(items[1]!.matches(":state(selected)")).toBe(true)
    for (const item of items) {
      expect(item.matches(":state(in-menu)")).toBe(true)
      expect(item.internals.role).toBeNull()
    }
  })

  it("accepts `active` as an alias of `selected`", async () => {
    const { items } = await menu("", `<ui-item href="#x" active>X</ui-item><ui-item href="#y" active="no">Y</ui-item>`)
    expect(boxOf(items[0]!).className).toBe("active item")
    expect(boxOf(items[0]!).getAttribute("aria-current")).toBe("page")
    expect(boxOf(items[1]!).className).toBe("item")
  })

  it("renders a plain item as a <div>, a `link` item as a <button>, a header item as a bold <div>", async () => {
    const { items } = await menu(
      "",
      `<ui-item>Plain</ui-item><ui-item link selected>Action</ui-item><ui-item type="header">Head</ui-item>`
    )
    const [plain, action, header] = items.map(boxOf)
    expect(plain!.localName).toBe("div")
    expect(action).toMatchObject({
      localName: "button",
      type: "button",
      className: "link active item",
      ariaCurrent: "true"
    })
    expect(header!.localName).toBe("div")
    expect(header!.className).toBe("item header")
    expect(getComputedStyle(header!).fontWeight).toBe("700")
  })

  it("makes every item a <button> in a `link` or `pagination` menu", async () => {
    for (const attributes of ["link", "pagination"]) {
      const { items } = await menu(attributes, `<ui-item>1</ui-item><ui-item href="#2">2</ui-item>`)
      expect(boxOf(items[0]!).localName).toBe("button")
      expect(boxOf(items[1]!).localName).toBe("a")
    }
  })

  it("renders a disabled link without href, aria-disabled", async () => {
    const { items } = await menu("", `<ui-item href="#x" disabled>X</ui-item><ui-item link disabled>Y</ui-item>`)
    const [link, button] = items.map(boxOf)
    expect(link).toMatchObject({ localName: "a", className: "disabled item", ariaDisabled: "true" })
    expect(link!.hasAttribute("href")).toBe(false)
    expect((button as HTMLButtonElement).disabled).toBe(true)
  })

  it("names an icon-only item with the DOM element's aria-label", async () => {
    const { items } = await menu("icon", `<ui-item href="#g" icon="gamepad" aria-label="Games"></ui-item>`)
    const box = boxOf(items[0]!)
    expect(box.getAttribute("aria-label")).toBe("Games")
    expect(box.querySelector("[part~=icon]")).not.toBeNull()
  })

  it.each([
    ["", "Inbox"],
    ["vertical text", ""]
  ])(
    "<ui-menu %s> draws an item's `icon` shorthand 1em high (the glyph is the icon slot's fallback)",
    async (attributes, text) => {
      const { items } = await menu(attributes, `<ui-item href="#i" icon="inbox" aria-label="Inbox">${text}</ui-item>`)
      const icon = boxOf(items[0]!).querySelector("[part~=icon]")!
      await expect.poll(() => icon.querySelector("svg path")).not.toBeNull()
      const glyph = icon.querySelector("svg")!.getBoundingClientRect()
      expect(glyph.height).toBeCloseTo(16, 0)
      expect(glyph.width).toBeGreaterThan(0)
    }
  )

  it("keeps a top-level menu's 1em vertical margins by its DOM element's position (the root is an only child)", async () => {
    const holder = await ElementFixture.render(
      `<div><h4>Heading</h4><ui-menu aria-label="A">${LINKS}</ui-menu><ui-menu aria-label="B">${LINKS}</ui-menu></div>`
    )
    const [first, second] = [...holder.querySelectorAll<DOMElement>("ui-menu")].map((host) =>
      getComputedStyle(host.shadowRoot!.querySelector("[part~=menu]")!)
    )
    expect([first!.marginTop, first!.marginBottom]).toEqual(["16px", "16px"])
    expect([second!.marginTop, second!.marginBottom]).toEqual(["16px", "0px"])
  })

  it("renders a nested <ui-menu> as a sub-menu:  no `ui`, its position, its items owned", async () => {
    const { host } = await menu(
      "",
      `<ui-item href="#a">A</ui-item><ui-menu position="right"><ui-item href="#b">B</ui-item></ui-menu>`
    )
    const sub = host.querySelector<DOMElement>("ui-menu")!
    const root = sub.shadowRoot!.querySelector<HTMLElement>("[part~=menu]")!
    expect(root.localName).toBe("div")
    expect(root.className).toBe("right menu")
    expect(sub.matches(":state(in-menu)")).toBe(true)
    const item = sub.querySelector<DOMElement>("ui-item")!
    expect(item.matches(":state(in-menu)")).toBe(true)
    expect(boxOf(item).localName).toBe("a")
    // a right sub-menu floats to the end:  its item sits right of the first
    expect(boxOf(item).getBoundingClientRect().left).toBeGreaterThan(
      boxOf(host.querySelector("ui-item")!).getBoundingClientRect().right + 50
    )
  })

  it("owns a <ui-header> inside an item (a vertical menu's sub header)", async () => {
    const { host } = await menu("vertical", `<ui-item><ui-header>Products</ui-header></ui-item>`)
    const header = host.querySelector<DOMElement>("ui-header")!
    await expect.poll(() => header.matches(":state(in-menu)")).toBe(true)
    const box = header.shadowRoot!.querySelector<HTMLElement>("[part~=header]")!
    expect(box.className).toBe("header")
    expect(getComputedStyle(box).marginBottom).toBe("8px")
  })

  it("leaves a dropdown's items to the dropdown (a barrier)", async () => {
    const { host } = await menu(
      "",
      `<ui-item><ui-dropdown text="Lang" aria-label="Lang"><ui-item value="en">English</ui-item></ui-dropdown></ui-item>`
    )
    const option = host.querySelector("ui-dropdown ui-item") as DOMElement
    expect(option.matches(":state(in-menu)")).toBe(false)
    expect(option.shadowRoot!.querySelector("[part~=item]")).toBeNull()
  })
})

////////////////
// ## Owner tokens reach the items
////////////////

describe("<ui-menu> owner tokens reach the items", () => {
  it("adopts UIMenu.css into each item", async () => {
    const { items } = await menu()
    expect(items[0]!.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThan(1)
    expect(styleOf(items[0]!).display).toBe("flex")
    expect(styleOf(items[1]!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
  })

  it("stacks items in a vertical menu, with a top divider", async () => {
    const { items } = await menu("vertical")
    expect(styleOf(items[0]!).display).toBe("block")
    expect(getComputedStyle(boxOf(items[1]!), "::before").height).toBe("1px")
    expect(getComputedStyle(boxOf(items[0]!), "::before").display).toBe("none")
  })

  it("underlines the active item of a secondary pointing menu", async () => {
    const { items } = await menu("secondary pointing")
    expect(styleOf(items[1]!).borderBottomWidth).toBe("2px")
    expect(styleOf(items[1]!).fontWeight).toBe("700")
    expect(getComputedStyle(boxOf(items[1]!), "::after").display).toBe("none")
  })

  it("points at the content from the active item of a pointing menu", async () => {
    const { items } = await menu("pointing")
    expect(getComputedStyle(boxOf(items[1]!), "::after").display).toBe("block")
    expect(getComputedStyle(boxOf(items[0]!), "::after").display).toBe("none")
  })

  it("draws tabs in a tabular menu", async () => {
    const { items } = await menu("tabular")
    const active = styleOf(items[1]!)
    expect(active.borderTopWidth).toBe("1px")
    expect(active.marginBottom).toBe("-1px")
    expect(styleOf(items[0]!).borderTopWidth).toBe("2px")
  })

  it("paints the active item in the menu's colour, or its own", async () => {
    const { items } = await menu('color="red"')
    const red = styleOf(items[1]!).color
    const { items: plain } = await menu()
    expect(red).not.toBe(styleOf(plain[1]!).color)
    const { items: own } = await menu("", `<ui-item href="#x" color="red" selected>X</ui-item>`)
    expect(boxOf(own[0]!).className).toBe("red active item ui-red")
    expect(styleOf(own[0]!).color).toBe(red)
  })

  it("inverts:  the dark scheme reaches the items", async () => {
    const { root, items } = await menu("inverted")
    expect(getComputedStyle(root).colorScheme).toBe("dark")
    expect(styleOf(items[0]!).colorScheme).toBe("dark")
  })

  it("follows a dark page;  resets to light only inside something inverted", async () => {
    const page = await ElementFixture.render<HTMLElement>(
      `<div class="ui-dark"><ui-menu aria-label="A" secondary>${LINKS}</ui-menu>` +
        `<ui-segment inverted><ui-menu aria-label="B">${LINKS}</ui-menu></ui-segment></div>`
    )
    const [plain, nested] = [...page.querySelectorAll<DOMElement>("ui-menu")].map((host) =>
      host.shadowRoot!.querySelector<HTMLElement>("[part~=menu]")!
    )
    expect(getComputedStyle(plain!).colorScheme).toBe("dark")
    expect(styleOf(page.querySelector("ui-item")!).colorScheme).toBe("dark")
    expect(getComputedStyle(nested!).colorScheme).toBe("light")
  })

  it("divides the width evenly with `items`", async () => {
    const { root, items } = await menu('items="3"')
    const width = root.getBoundingClientRect().width
    expect(boxOf(items[0]!).getBoundingClientRect().width).toBeCloseTo(width / 3, -1)
  })

  it("follows an owner attribute change:  `link` turns plain items into buttons and back", async () => {
    const { host, items } = await menu("", `<ui-item>X</ui-item>`)
    expect(boxOf(items[0]!).localName).toBe("div")
    host.setAttribute("link", "")
    await expect.poll(() => boxOf(items[0]!).localName).toBe("button")
    host.removeAttribute("link")
    await expect.poll(() => boxOf(items[0]!).localName).toBe("div")
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-menu> tokens from outside", () => {
  /** An item's top padding. */
  function padding(item: Element): string {
    return styleOf(item).paddingTop
  }

  it("takes a token set on the DOM element, reaching its items", async () => {
    const { items } = await menu(`style="--ui-menu-item-padding: 20px"`)
    expect(padding(items[1]!)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-menu-item-padding: 20px"><ui-menu aria-label="Test">${LINKS}</ui-menu></section>`
    )
    expect(padding(wrapper.querySelector("ui-item")!)).toBe("20px")
  })

  it("takes a token set through `::part(menu)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(menu) { --ui-menu-item-padding: 20px }</style>` +
        `<ui-menu class="themed" aria-label="Test">${LINKS}</ui-menu></div>`
    )
    expect(padding(wrapper.querySelector("ui-item")!)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-menu-item-padding", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-menu-item-padding")
    })
    const { items } = await menu()
    expect(padding(items[1]!)).toBe("20px")
  })

  it("variations:  `secondary` swaps the padding, winning over the base token;  corners derive from the radius", async () => {
    const secondary = await menu(`secondary style="--ui-menu-item-padding: 20px"`)
    expect(padding(secondary.items[1]!)).not.toBe("20px")
    const { root, items } = await menu(`style="--ui-menu-radius: 10px"`)
    expect(getComputedStyle(root).borderTopLeftRadius).toBe("10px")
    expect(styleOf(items[0]!).borderTopLeftRadius).toBe("10px")
    expect(styleOf(items[0]!).borderTopRightRadius).toBe("0px")
  })

  it("the bar's own tokens:  margin, min height, font family;  items' case, tracking and min height", async () => {
    const holder = await ElementFixture.render(
      `<div style="letter-spacing: 3px"><h4>Heading</h4>` +
        `<ui-menu aria-label="A" style="--ui-menu-margin: 5px; --ui-menu-min-height: 0px; ` +
        `--ui-menu-font-family: monospace; --ui-menu-item-transform: uppercase; --ui-menu-item-min-height: 40px">` +
        `${LINKS}</ui-menu><p>After</p></div>`
    )
    const host = holder.querySelector("ui-menu")!
    const root = getComputedStyle(host.shadowRoot!.querySelector("[part~=menu]")!)
    expect([root.marginTop, root.marginBottom, root.minHeight]).toEqual(["5px", "5px", "0px"])
    expect(root.fontFamily).toBe("monospace")
    const item = styleOf(host.querySelector("ui-item")!)
    expect([item.textTransform, item.minHeight]).toEqual(["uppercase", "40px"])
    // no `--ui-menu-item-letter-spacing`:  the item inherits the page's, as before
    expect(item.letterSpacing).toBe("3px")
    host.setAttribute("style", "--ui-menu-item-letter-spacing: 1px")
    await expect.poll(() => styleOf(host.querySelector("ui-item")!).letterSpacing).toBe("1px")
  })

  it("a header item's own box and type:  padding, family, weight, tracking", async () => {
    const { items } = await menu(
      `vertical style="--ui-menu-header-padding: 0px 12px 6px; --ui-menu-header-font-family: monospace; ` +
        `--ui-menu-header-weight: 500; --ui-menu-header-letter-spacing: 1px"`,
      `<ui-item type="header">Group</ui-item>${LINKS}`
    )
    const header = styleOf(items[0]!)
    expect(header).toMatchObject({
      paddingTop: "0px",
      paddingLeft: "12px",
      paddingBottom: "6px",
      fontFamily: "monospace",
      fontWeight: "500",
      letterSpacing: "1px"
    })
    const plain = await menu("vertical", `<ui-item type="header">Group</ui-item>${LINKS}`)
    expect(styleOf(plain.items[0]!).paddingTop).toBe(styleOf(plain.items[1]!).paddingTop)
    expect(Number(styleOf(plain.items[0]!).fontWeight)).toBeGreaterThanOrEqual(600)
  })
})

////////////////
// ## Variation tokens
////////////////

// epic `design-system`, I5 / I21 / I35
describe("<ui-menu> variation tokens", () => {
  /** Three link items with icons, the second selected. */
  const ICONS =
    `<ui-item href="#a" icon="home">A</ui-item>` +
    `<ui-item href="#b" icon="home" selected>B</ui-item>` +
    `<ui-item href="#c" icon="home">C</ui-item>`

  /** Three button items (no `href`, in a `link` menu), the second selected. */
  const BUTTONS = `<ui-item value="a">A</ui-item><ui-item value="b" selected>B</ui-item><ui-item value="c">C</ui-item>`

  /** An item's icon box. */
  function iconOf(item: Element) {
    return getComputedStyle(boxOf(item).querySelector("[part~=icon]")!)
  }

  it("vertical:  its own tokens put the icon first and reach the item display and active corners", async () => {
    const { items } = await menu(
      `vertical style="--ui-menu-vertical-item-display: flex; --ui-menu-vertical-icon-float: none; ` +
        `--ui-menu-vertical-icon-margin: 0 12px 0 0; --ui-menu-vertical-active-radius: 9px"`,
      ICONS
    )
    expect(styleOf(items[1]!).display).toBe("flex")
    expect([iconOf(items[1]!).float, iconOf(items[1]!).marginRight]).toEqual(["none", "12px"])
    expect(styleOf(items[1]!).borderTopRightRadius).toBe("9px")
    const plain = await menu("vertical", ICONS)
    expect([iconOf(plain.items[1]!).float, styleOf(plain.items[1]!).display]).toEqual(["right", "block"])
  })

  it("vertical:  a generic token (a theme's `:root` base look) never reaches what it swaps", async () => {
    const { items } = await menu(`vertical style="--ui-menu-icon-float: none"`, ICONS)
    expect(iconOf(items[1]!).float).toBe("right")
  })

  it("secondary:  its own tokens reach padding, margin, corners, colour and fills", async () => {
    const { items } = await menu(
      `secondary vertical style="--ui-menu-secondary-item-padding: 0px 12px; ` +
        `--ui-menu-secondary-vertical-item-margin: 0px 0px 4px; --ui-menu-secondary-item-radius: 12px; ` +
        `--ui-menu-secondary-item-color: rgb(1, 2, 3); --ui-menu-secondary-active-background: rgb(4, 5, 6); ` +
        `--ui-menu-secondary-active-color: rgb(7, 8, 9)"`
    )
    const [first, active, last] = items.map(styleOf)
    expect([first!.paddingTop, first!.paddingLeft, first!.marginBottom]).toEqual(["0px", "12px", "4px"])
    expect(first!.color).toBe("rgb(1, 2, 3)")
    for (const style of [first!, active!, last!])
      expect([style.borderTopLeftRadius, style.borderBottomRightRadius]).toEqual(["12px", "12px"])
    expect([active!.backgroundColor, active!.color]).toEqual(["rgb(4, 5, 6)", "rgb(7, 8, 9)"])
    // a lone selected item takes the same corners (it was the menu's `last` corners)
    const lone = await menu(
      `secondary style="--ui-menu-secondary-item-radius: 12px"`,
      `<ui-item href="#a" selected>A</ui-item>`
    )
    expect(styleOf(lone.items[0]!).borderTopRightRadius).toBe("12px")
  })

  it("secondary:  a theme's generic item padding doesn't leak in;  unset, the active text is the secondary hue's", async () => {
    const { items } = await menu(`secondary style="--ui-menu-item-padding: 20px; --ui-menu-active-color: rgb(7, 8, 9)"`)
    expect(styleOf(items[1]!).paddingTop).not.toBe("20px")
    expect(styleOf(items[1]!).color).toBe(colorOf("var(--ui-secondary-text)"))
  })

  it("text:  its own tokens reach padding, colour and margin;  `--ui-menu-gap` spaces the items, none trailing", async () => {
    const { root, items } = await bar(
      `text style="--ui-menu-text-item-padding: 0px; --ui-menu-text-item-color: rgb(1, 2, 3); ` +
        `--ui-menu-text-margin: 0px; --ui-menu-gap: 26px"`
    )
    const style = getComputedStyle(root)
    expect([style.marginTop, style.marginLeft, style.marginRight]).toEqual(["0px", "0px", "0px"])
    expect([styleOf(items[0]!).paddingLeft, styleOf(items[0]!).color]).toEqual(["0px", "rgb(1, 2, 3)"])
    const [a, b] = [boxOf(items[0]!), boxOf(items[1]!)].map((box) => box.getBoundingClientRect())
    expect(b!.left - a!.right).toBeCloseTo(26, 0)
    expect(getComputedStyle(root, "::after").display).toBe("none")
    expect(boxOf(items[0]!).getBoundingClientRect().left).toBeCloseTo(root.getBoundingClientRect().left, 0)
  })

  it("secondary:  hangs out by its items' side margin, unless `--ui-menu-secondary-inline-margin` (design-system I45)", async () => {
    const hung = await bar("vertical secondary")
    expect(parseFloat(getComputedStyle(hung.root).marginLeft)).toBeLessThan(0)
    const flush = await bar(`vertical secondary style="--ui-menu-secondary-inline-margin: 0px"`)
    const style = getComputedStyle(flush.root)
    expect([style.marginLeft, style.marginRight]).toEqual(["0px", "0px"])
  })

  it("text:  the current item is normal weight, unless `--ui-menu-text-active-weight` (design-system I44)", async () => {
    const plain = await menu(`text style="--ui-menu-item-weight: 500"`)
    expect(styleOf(plain.items[1]!).fontWeight).toBe("400")
    const set = await menu(`text style="--ui-menu-item-weight: 500; --ui-menu-text-active-weight: 500"`)
    expect(styleOf(set.items[1]!).fontWeight).toBe("500")
  })

  it("a `link` item (a `<button>`) fills a vertical menu's width (design-system I33)", async () => {
    const { root, items } = await bar("vertical fluid link", BUTTONS)
    const box = boxOf(items[0]!)
    expect(box.localName).toBe("button")
    expect(box.getBoundingClientRect().width).toBeCloseTo(root.clientWidth, 0)
    const secondary = await bar("vertical secondary fluid link", BUTTONS)
    expect(boxOf(secondary.items[2]!).getBoundingClientRect().width).toBeCloseTo(secondary.root.clientWidth, 0)
  })
})

////////////////
// ## `<ui-menu interactive>` (menubar)
////////////////

describe("<ui-menu interactive> (menubar)", () => {
  /** A menubar of four buttons, `Edit` selected, `Help` disabled. */
  const BAR =
    `<ui-item link value="file">File</ui-item><ui-item link value="edit" selected>Edit</ui-item>` +
    `<ui-item link value="view">View</ui-item><ui-item type="header">Group</ui-item>` +
    `<ui-item link value="help" disabled>Help</ui-item>`

  it("renders role=menubar with menuitems;  item DOM elements are role=none", async () => {
    const { root, items } = await menu("interactive", BAR)
    expect(root).toMatchObject({ localName: "div", role: "menubar", ariaOrientation: null, ariaLabel: "Test" })
    expect(boxOf(items[0]!).getAttribute("role")).toBe("menuitem")
    expect(items[0]!.internals.role).toBe("none")
    expect(boxOf(items[3]!).hasAttribute("role")).toBe(false)
    expect(boxOf(items[4]!).getAttribute("aria-disabled")).toBe("true")
    const { root: vertical } = await menu("interactive vertical", BAR)
    expect(vertical.getAttribute("aria-orientation")).toBe("vertical")
  })

  /** The focused item DOM element, and whether its box has focus. */
  function focused(items: DOMElement[]) {
    const host = document.activeElement as DOMElement
    const index = items.indexOf(host)
    return { index, box: index >= 0 && host.shadowRoot!.activeElement === boxOf(host) }
  }

  it("is ONE tab stop -- the selected item -- and arrows / Home / End move between items", async () => {
    const { items } = await menu("interactive", BAR)
    await expect
      .poll(() => items.map((item) => boxOf(item).getAttribute("tabindex")))
      .toEqual(["-1", "0", "-1", null, "-1"])
    for (const item of items) expect(item.hasAttribute("tabindex")).toBe(false)
    const before = document.createElement("button")
    before.textContent = "before"
    items[0]!.closest("ui-menu")!.before(before)
    before.focus()
    await userEvent.tab()
    expect(focused(items)).toEqual({ index: 1, box: true })
    await userEvent.keyboard("{ArrowRight}")
    expect(focused(items).index).toBe(2)
    // the header isn't a stop, nor the disabled item:  wraps to the first
    await userEvent.keyboard("{ArrowRight}")
    expect(focused(items).index).toBe(0)
    await userEvent.keyboard("{End}")
    expect(focused(items).index).toBe(2)
    await userEvent.keyboard("{Home}")
    expect(focused(items).index).toBe(0)
    await userEvent.keyboard("{ArrowLeft}")
    expect(focused(items).index).toBe(2)
    await userEvent.tab()
    expect(focused(items).index).toBe(-1)
  })

  it("moves with ArrowDown / ArrowUp when vertical", async () => {
    const { items } = await menu("interactive vertical", BAR)
    await expect.poll(() => boxOf(items[1]!).getAttribute("tabindex")).toBe("0")
    boxOf(items[1]!).focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(focused(items).index).toBe(2)
    await userEvent.keyboard("{ArrowUp}")
    expect(focused(items).index).toBe(1)
  })

  it("drops the tabindexes when it stops being interactive", async () => {
    const { host, root, items } = await menu("interactive", BAR)
    await expect.poll(() => boxOf(items[1]!).getAttribute("tabindex")).toBe("0")
    host.removeAttribute("interactive")
    await expect.poll(() => boxOf(items[0]!).hasAttribute("role")).toBe(false)
    const nav = host.shadowRoot!.querySelector("[part~=menu]")!
    expect(nav.localName).toBe("nav")
    expect(root.isConnected).toBe(false)
    for (const item of items) expect(boxOf(item).hasAttribute("tabindex")).toBe(false)
    expect(items[0]!.internals.role).toBeNull()
  })
})

////////////////
// ## `ui-select`
////////////////

describe("<ui-menu> ui-select", () => {
  /** Collect `ui-select` details from `host`. */
  function selections(host: Element) {
    const details: { value: string; item: Element; originalEvent?: Event }[] = []
    host.addEventListener("ui-select", (event) => details.push((event as CustomEvent).detail))
    return details
  }

  it("fires on a link or button item, with its value (else its text) and the item", async () => {
    const { host, items } = await menu(
      "",
      `<ui-item href="#a">Alpha</ui-item><ui-item link value="b">Beta</ui-item><ui-item>Plain</ui-item>`
    )
    const details = selections(host)
    boxOf(items[0]!).addEventListener("click", (event) => event.preventDefault())
    await userEvent.click(boxOf(items[0]!))
    await userEvent.click(boxOf(items[1]!))
    await userEvent.click(boxOf(items[2]!))
    expect(details.map(({ value, item }) => [value, item])).toEqual([
      ["Alpha", items[0]],
      ["b", items[1]]
    ])
    expect(details[0]!.originalEvent).toBeInstanceOf(MouseEvent)
  })

  it("fires on Enter / Space on a menubar item, once from a sub-menu, never from a disabled item", async () => {
    const { host, items } = await menu(
      "interactive",
      `<ui-item link value="a">A</ui-item><ui-item link value="x" disabled>X</ui-item>` +
        `<ui-menu position="right"><ui-item link value="s">S</ui-item></ui-menu>`
    )
    const details = selections(host)
    await expect.poll(() => boxOf(items[0]!).getAttribute("tabindex")).toBe("0")
    boxOf(items[0]!).focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.keyboard(" ")
    boxOf(items[1]!).click()
    await userEvent.click(boxOf(items[2]!))
    expect(details.map(({ value }) => value)).toEqual(["a", "a", "s"])
  })
})

////////////////
// ## Appearance, alignment, equal
////////////////

describe("<ui-menu> appearance, alignment, equal", () => {
  it("takes the look as one word:  the boolean words stay aliases with the same classes", async () => {
    for (const [attributes, alias] of [
      ['appearance="tabular"', "tabular"],
      ['appearance="pointing"', "pointing"],
      ['appearance="secondary"', "secondary"],
      ['appearance="text"', "text"]
    ]) {
      const { root } = await menu(attributes!)
      const { root: aliased } = await menu(alias!)
      expect(root.className).toBe(aliased.className)
    }
  })

  it("segmented:  a bordered group hugging its items, the selected one filled with the primary colour", async () => {
    const { root, items } = await bar('appearance="segmented"')
    const box = styleOf(items[1]!)
    expect(getComputedStyle(root).borderTopStyle).toBe("solid")
    expect(root.clientWidth).toBeCloseTo(span(items), -0.5)
    expect(box.backgroundColor).toBe(colorOf("var(--ui-primary)"))
    expect(box.color).toBe(colorOf("var(--ui-primary-on)"))
    expect(styleOf(items[0]!).backgroundColor).not.toBe(box.backgroundColor)
  })

  it("segmented:  `color` fills the selected item and picks its on-colour", async () => {
    const { items } = await bar('appearance="segmented" color="teal"')
    expect(styleOf(items[1]!).backgroundColor).toBe(colorOf("var(--ui-teal)"))
    expect(styleOf(items[1]!).color).toBe(colorOf("var(--ui-teal-on)"))
  })

  it("segmented:  joined by default (square middle corners, hairlines, no shadow)", async () => {
    const { items } = await bar('appearance="segmented"')
    expect(styleOf(items[0]!).borderTopRightRadius).toBe("0px")
    expect(styleOf(items[1]!).boxShadow).toBe("none")
  })

  it("segmented:  its tokens draw a pill track with a raised thumb (design-system I6 / I14)", async () => {
    const { root, items } = await bar(
      `appearance="segmented" style="--ui-menu-segmented-background: rgb(1, 2, 3); ` +
        `--ui-menu-segmented-border: 1px solid rgb(4, 5, 6); --ui-menu-segmented-radius: 999px; ` +
        `--ui-menu-segmented-padding: 2px; --ui-menu-segmented-gap: 2px; --ui-menu-segmented-divider: transparent; ` +
        `--ui-menu-segmented-item-color: rgb(7, 8, 9); --ui-menu-segmented-item-radius: 999px; ` +
        `--ui-menu-segmented-active-background: rgb(255, 255, 255); ` +
        `--ui-menu-segmented-active-color: rgb(10, 11, 12); ` +
        `--ui-menu-segmented-active-shadow: rgb(0, 0, 0) 0px 1px 2px 0px"`
    )
    const track = getComputedStyle(root)
    expect([track.backgroundColor, track.borderTopColor, track.paddingTop]).toEqual([
      "rgb(1, 2, 3)",
      "rgb(4, 5, 6)",
      "2px"
    ])
    expect(track.borderTopLeftRadius).toBe("999px")
    const edges = root.getBoundingClientRect()
    const [a, b, c] = items.map((item) => boxOf(item).getBoundingClientRect())
    expect(a!.left - edges.left).toBeCloseTo(3, 0)
    expect(b!.left - a!.right).toBeCloseTo(2, 0)
    expect(edges.right - c!.right).toBeCloseTo(3, 0)
    const thumb = styleOf(items[1]!)
    expect([thumb.backgroundColor, thumb.color, thumb.boxShadow]).toEqual([
      "rgb(255, 255, 255)",
      "rgb(10, 11, 12)",
      "rgb(0, 0, 0) 0px 1px 2px 0px"
    ])
    expect(thumb.borderTopLeftRadius).toBe("999px")
    expect([styleOf(items[0]!).color, styleOf(items[0]!).borderTopRightRadius]).toEqual(["rgb(7, 8, 9)", "999px"])
    expect(getComputedStyle(boxOf(items[0]!), "::before").backgroundColor).toBe("rgba(0, 0, 0, 0)")
  })

  it("segmented:  moves `selected` to the chosen item itself;  a canceled ui-select keeps the old choice", async () => {
    const { host, items } = await menu(
      'appearance="segmented" link',
      `<ui-item value="a">A</ui-item><ui-item value="b" selected>B</ui-item><ui-item value="c">C</ui-item>`
    )
    const chosen = () => items.map((item) => item.matches(":state(selected)"))
    await userEvent.click(boxOf(items[2]!))
    await expect.poll(chosen).toEqual([false, false, true])
    host.addEventListener("ui-select", (event) => event.preventDefault(), { once: true })
    await userEvent.click(boxOf(items[0]!))
    await ElementFixture.settle()
    expect(chosen()).toEqual([false, false, true])
    const plain = await menu("link", `<ui-item value="a">A</ui-item><ui-item value="b" selected>B</ui-item>`)
    await userEvent.click(boxOf(plain.items[0]!))
    await ElementFixture.settle()
    expect(plain.items.map((item) => item.matches(":state(selected)"))).toEqual([false, true])
  })

  it("alignment packs the items at an end of a full-width bar", async () => {
    for (const [alignment, side] of [
      ["left", "left"],
      ["center", "center"],
      ["right", "right"]
    ] as const) {
      const { root, items } = await bar(`alignment="${alignment}"`)
      const bounds = root.getBoundingClientRect()
      expect(bounds.width).toBe(WIDTH)
      const first = boxOf(items[0]!).getBoundingClientRect()
      const last = boxOf(items.at(-1)!).getBoundingClientRect()
      const before = first.left - bounds.left
      const after = bounds.right - last.right
      if (side === "left") expect(before).toBeLessThan(2)
      if (side === "right") expect(after).toBeLessThan(2)
      if (side === "center") expect(Math.abs(before - after)).toBeLessThan(2)
    }
  })

  it('alignment="fluid" fills the bar;  a segmented group moves as a whole', async () => {
    const fluid = await bar('alignment="fluid"')
    expect(span(fluid.items)).toBeCloseTo(fluid.root.clientWidth, -0.5)
    const centered = await bar('appearance="segmented" alignment="center"')
    const bounds = centered.root.getBoundingClientRect()
    const parent = centered.root.getRootNode() as ShadowRoot
    const outer = parent.host.parentElement!.getBoundingClientRect()
    expect(bounds.width).toBeLessThan(WIDTH / 2)
    expect(Math.abs(bounds.left - outer.left - (outer.right - bounds.right))).toBeLessThan(2)
  })

  it("equal, packed:  every item as wide as the widest, the bar hugging them", async () => {
    const { root, items } = await bar("equal", UNEVEN)
    const widths = items.map((item) => boxOf(item).getBoundingClientRect().width)
    const natural = await bar("", UNEVEN)
    const widest = Math.max(...natural.items.map((item) => boxOf(item).getBoundingClientRect().width))
    for (const width of widths) expect(width).toBeCloseTo(widest, -0.5)
    expect(root.getBoundingClientRect().width).toBeLessThan(WIDTH)
  })

  it('equal + alignment="fluid":  an equal share of the bar each', async () => {
    const { root, items } = await bar('equal alignment="fluid"', UNEVEN)
    const share = root.clientWidth / items.length
    for (const item of items) expect(boxOf(item).getBoundingClientRect().width).toBeCloseTo(share, -0.5)
  })

  it('`items="3"` / `items="equal"` keep their count-based fill', async () => {
    const { root, items } = await bar('items="equal"', UNEVEN)
    expect(root.className).toBe("ui equal width menu")
    expect(getComputedStyle(root).display).toBe("flex")
    expect(span(items)).toBeCloseTo(root.clientWidth, -0.5)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-menu> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
