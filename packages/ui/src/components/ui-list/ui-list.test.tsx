import { describe, expect, it, onTestFinished } from "vitest"
import { userEvent } from "vitest/browser"

import type { ListSelectDetail } from "$/ui/components/components.types"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-list"
import "$/ui/components/ui-image"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-list/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Three plain items. */
const ITEMS = `<ui-item>One</ui-item><ui-item>Two</ui-item><ui-item>Three</ui-item>`

/** Fomantic's item padding, `@relative3px`, at 16px. */
const ITEM_PADDING = (3 / 14) * 16

/** Render a list;  returns it, its root and its items' hosts. */
async function list(attributes = "", items = ITEMS) {
  const host = await ElementFixture.render<UIHost>(`<ui-list ${attributes}>${items}</ui-list>`)
  await ElementFixture.settle(host)
  return { host, root: rootOf(host), items: itemsOf(host) }
}

/** A list's `[part~=list]` root. */
function rootOf(host: Element): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=list]")!
}

/** The `<ui-item>` children of a list host. */
function itemsOf(host: Element): UIHost[] {
  return [...host.children].filter((child): child is UIHost => child.localName === "ui-item")
}

/** An item's `[part~=item]` root. */
function boxOf(item: Element): HTMLElement {
  return item.shadowRoot!.querySelector<HTMLElement>("[part~=item]")!
}

/** Computed style of an element. */
function style(element: Element, pseudo?: string): CSSStyleDeclaration {
  return getComputedStyle(element, pseudo)
}

/** Record `ui-select` events reaching `host` (including a sub-list's, bubbling through). */
function selections(host: Element): CustomEvent<ListSelectDetail>[] {
  const events: CustomEvent<ListSelectDetail>[] = []
  host.addEventListener("ui-select", (event) => events.push(event as CustomEvent<ListSelectDetail>))
  return events
}

describe("<ui-list> classes and markup", () => {
  it.each([
    ["", "ui list"],
    ['size="large"', "ui large list"],
    ['size="medium"', "ui list"],
    ["bulleted", "ui bulleted list"],
    ['bulleted="yes"', "ui bulleted list"],
    ['bulleted="no"', "ui list"],
    ["ordered suffixed", "ui ordered suffixed list"],
    ["relaxed", "ui relaxed list"],
    ['relaxed="very"', "ui very relaxed list"],
    ['relaxed="no"', "ui list"],
    ["divided relaxed selection", "ui divided selection relaxed list"],
    ["horizontal inverted", "ui horizontal inverted list"],
    ["link animated fitted celled", "ui animated celled fitted link list"],
    ['floated="right"', "ui right floated list"],
    ['vertical-align="middle"', "ui middle aligned list"]
  ])("<ui-list %s>", async (attributes, classes) => {
    const { root } = await list(attributes)
    expect(root.className).toBe(classes)
  })

  it("renders a <ul role=list> around a slot;  its items are role=listitem hosts", async () => {
    const { root, items } = await list()
    expect(root.localName).toBe("ul")
    expect(root.getAttribute("role")).toBe("list")
    expect(root.querySelector("slot")).not.toBeNull()
    for (const item of items) {
      expect(item.internals.role).toBe("listitem")
      expect(item.matches(":state(in-list)")).toBe(true)
      expect(boxOf(item).localName).toBe("div")
      expect(boxOf(item).className).toBe("item")
    }
  })

  it("renders an <ol> when ordered", async () => {
    const { host, root } = await list("ordered")
    expect(root.localName).toBe("ol")
    host.removeAttribute("ordered")
    await ElementFixture.tick()
    expect(rootOf(host).localName).toBe("ul")
  })

  it("renders items as buttons in a selection list;  links with href, buttons with the item's own `link`", async () => {
    const { host, items } = await list(
      "",
      `<ui-item>Plain</ui-item><ui-item href="#a">Link</ui-item><ui-item link>Button</ui-item>`
    )
    expect(items.map((item) => boxOf(item).localName)).toEqual(["div", "a", "button"])
    host.setAttribute("selection", "")
    await ElementFixture.tick()
    expect(items.map((item) => boxOf(item).localName)).toEqual(["button", "a", "button"])
  })

  it("makes link and selection items focusable, plain items not", async () => {
    const { items } = await list("link", `<ui-item href="#a">A</ui-item><ui-item link>B</ui-item><ui-item>C</ui-item>`)
    const [a, b, c] = items.map(boxOf)
    expect(a!.tabIndex).toBe(0)
    expect(b!.tabIndex).toBe(0)
    expect(c!.tabIndex).toBe(-1)
    b!.focus()
    expect(items[1]!.shadowRoot!.activeElement).toBe(b)
  })

  it("marks the selected item:  `active` class and aria-current", async () => {
    const { items } = await list("link", `<ui-item href="#a">A</ui-item><ui-item href="#b" selected>B</ui-item>`)
    const box = boxOf(items[1]!)
    expect(box.className).toBe("active item")
    expect(box.getAttribute("aria-current")).toBe("page")
    expect(style(box).color).not.toBe(style(boxOf(items[0]!)).color)
  })
})

describe("<ui-list> items adopt ui-list.css and style by owner", () => {
  it("pads items but not the outer edges", async () => {
    const { items } = await list()
    const [first, middle, last] = items.map(boxOf)
    expect(style(first!).display).toBe("list-item")
    expect(parseFloat(style(first!).paddingTop)).toBe(0)
    expect(parseFloat(style(middle!).paddingTop)).toBeCloseTo(ITEM_PADDING, 1)
    expect(parseFloat(style(last!).paddingBottom)).toBe(0)
  })

  it("follows the list's variations:  relaxed, divided, celled, horizontal", async () => {
    const { host, items } = await list()
    const [first, middle, last] = items.map(boxOf)
    host.setAttribute("relaxed", "")
    await ElementFixture.tick()
    expect(parseFloat(style(middle!).paddingTop)).toBeCloseTo((6 / 14) * 16, 1)
    host.setAttribute("relaxed", "very")
    await ElementFixture.tick()
    expect(parseFloat(style(middle!).paddingTop)).toBeCloseTo((12 / 14) * 16, 1)
    host.setAttribute("divided", "")
    await ElementFixture.tick()
    expect(style(first!).borderTopWidth).toBe("0px")
    expect(style(middle!).borderTopWidth).toBe("1px")
    host.removeAttribute("divided")
    host.setAttribute("celled", "")
    await ElementFixture.tick()
    expect(style(first!).borderTopWidth).toBe("1px")
    expect(style(last!).borderBottomWidth).toBe("1px")
    host.removeAttribute("celled")
    host.setAttribute("horizontal", "")
    await ElementFixture.tick()
    expect(style(middle!).display).toBe("inline-block")
    expect(first!.getBoundingClientRect().top).toBe(last!.getBoundingClientRect().top)
  })

  it("gives selection items a padded, rounded box with a hover background", async () => {
    const { items } = await list("selection")
    const box = boxOf(items[1]!)
    expect(box.localName).toBe("button")
    expect(parseFloat(style(box).paddingLeft)).toBe(8)
    expect(style(box).borderTopLeftRadius).toBe("8px")
    expect(box.getBoundingClientRect().width).toBe(rootOf(items[1]!.parentElement!).getBoundingClientRect().width)
    const before = style(box).backgroundColor
    await userEvent.hover(box)
    await expect.poll(() => style(box).backgroundColor).not.toBe(before)
    await userEvent.unhover(box)
  })

  it("draws the `icon` shorthand as a table cell beside the content", async () => {
    const { items } = await list("", `<ui-item icon="users"><ui-content>Fomantic UI</ui-content></ui-item>`)
    const icon = boxOf(items[0]!).querySelector(".icon")!
    const content = items[0]!.querySelector("ui-content")!.shadowRoot!.querySelector(".content")!
    expect(style(icon).display).toBe("table-cell")
    expect(style(content).display).toBe("table-cell")
    expect(content.getBoundingClientRect().left).toBeGreaterThanOrEqual(icon.getBoundingClientRect().right - 1)
  })

  it("draws the `icon` shorthand's glyph 1em high, its width from its aspect (not the cell's 20px)", async () => {
    const { items } = await list("", `<ui-item icon="location dot">Address</ui-item>`)
    const icon = boxOf(items[0]!).querySelector(".icon")!
    await expect.poll(() => icon.querySelector("svg path")).not.toBeNull()
    const glyph = icon.querySelector("svg")!.getBoundingClientRect()
    expect(glyph.height).toBeCloseTo(16, 0)
    // `location dot` is 384 x 512
    expect(glyph.width).toBeCloseTo(12, 0)
  })

  it("keeps plain text beside the `icon` shorthand", async () => {
    const { items } = await list("", `<ui-item icon="circle question">Inline Text</ui-item>`)
    const icon = boxOf(items[0]!).querySelector(".icon")!
    const range = document.createRange()
    range.selectNodeContents(items[0]!)
    const text = range.getBoundingClientRect()
    expect(text.top).toBeLessThan(icon.getBoundingClientRect().bottom)
    expect(text.left).toBeGreaterThanOrEqual(icon.getBoundingClientRect().right - 1)
  })

  it("puts the `image` shorthand's avatar and the content on one line", async () => {
    const { items } = await list(
      "",
      `<ui-item image="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 2 2%22/%3E">` +
        `<ui-content>Helen</ui-content></ui-item>`
    )
    const image = boxOf(items[0]!).querySelector("img")!
    const content = items[0]!.querySelector("ui-content")!.shadowRoot!.querySelector(".content")!
    expect(image.getBoundingClientRect().width).toBe(32)
    expect(style(content).display).toBe("inline-block")
    expect(content.getBoundingClientRect().left).toBeGreaterThanOrEqual(image.getBoundingClientRect().right - 1)
  })

  it("keeps a slotted <ui-icon> a table cell beside the content", async () => {
    await import("$/ui/components/ui-icon")
    const { items } = await list(
      "",
      `<ui-item><ui-icon name="users"></ui-icon><ui-content>Fomantic UI</ui-content></ui-item>`
    )
    await ElementFixture.settle(items[0]!)
    const icon = items[0]!.querySelector("ui-icon")!.shadowRoot!.querySelector("[part~=icon]")!
    expect(style(icon).display).toBe("table-cell")
  })

  it("gives content parts in items their list context", async () => {
    const { items } = await list(
      "",
      `<ui-item><ui-content><ui-header>Title</ui-header><ui-description>Text</ui-description></ui-content></ui-item>`
    )
    for (const tag of ["ui-content", "ui-header", "ui-description"])
      expect(items[0]!.querySelector(tag)!.matches(":state(in-list)"), tag).toBe(true)
    const header = items[0]!.querySelector("ui-header")!.shadowRoot!.querySelector(".header")!
    expect(header.className).toBe("header")
    expect(style(header).fontWeight).toBe("700")
  })
})

describe("<ui-list> a slotted image beside content", () => {
  /** A 40px square picture. */
  const PICTURE =
    "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3C/svg%3E"

  it("a slotted <ui-image> and the <ui-content> after it share a row (a raw <img> can't be a cell:  use `image`)", async () => {
    const { items } = await list(
      "",
      `<ui-item><ui-image src="${PICTURE}" alt="" width="40" height="40"></ui-image><ui-content>Title</ui-content></ui-item>`
    )
    const picture = items[0]!.querySelector("ui-image")!.shadowRoot!.querySelector("img")!
    // wait for the load:  until then Firefox lays the image out 0px wide (its percentage `max-width`), Chromium at 40px
    await picture.decode()
    const image = picture.getBoundingClientRect()
    const content = items[0]!.querySelector("ui-content")!.shadowRoot!.firstElementChild!.getBoundingClientRect()
    expect(content.top).toBeLessThan(image.bottom)
    expect(content.left).toBeGreaterThanOrEqual(image.right - 1)
  })
})

describe("<ui-list> markers", () => {
  it("bullets bulleted items", async () => {
    const { items } = await list("bulleted")
    expect(style(boxOf(items[0]!), "::before").content).toBe('"•"')
  })

  it("numbers ordered items with counters on the root and each item, suffixed with a dot", async () => {
    const { host, root, items } = await list("ordered")
    expect(style(root).counterReset).toBe("ordered 0")
    const marker = style(boxOf(items[0]!), "::before")
    expect(marker.content).toBe('counters(ordered, ".") " "')
    expect(marker.counterIncrement).toBe("ordered 1")
    host.setAttribute("suffixed", "")
    await ElementFixture.tick()
    expect(style(boxOf(items[0]!), "::before").content).toBe('counters(ordered, ".") "."')
  })

  it("shows an item's `value` instead of its number", async () => {
    const { items } = await list("ordered", `<ui-item value="*">A</ui-item><ui-item>B</ui-item>`)
    expect(boxOf(items[0]!).dataset.value).toBe("*")
    expect(style(boxOf(items[0]!), "::before").content).toBe('"*"')
    expect(style(boxOf(items[1]!), "::before").content).toBe('counters(ordered, ".") " "')
  })
})

describe("<ui-list> nested", () => {
  const NESTED =
    `<ui-item>One</ui-item>` +
    `<ui-item>Two<ui-list><ui-item>Two A</ui-item><ui-item>Two B</ui-item></ui-list></ui-item>` +
    `<ui-item>Three</ui-item>`

  it("renders the sub-list form:  `list`, no `ui`, no variations of its own", async () => {
    const { items } = await list("divided", NESTED)
    const sub = items[1]!.querySelector<UIHost>("ui-list")!
    await ElementFixture.settle(sub)
    expect(sub.matches(":state(in-list)")).toBe(true)
    expect(rootOf(sub).className).toBe("list")
    expect(parseFloat(style(rootOf(sub)).paddingTop)).toBe(12)
    const [a, b] = itemsOf(sub).map(boxOf)
    // child items:  tighter, never divided
    expect(parseFloat(style(b!).paddingTop)).toBeCloseTo((2 / 14) * 16, 1)
    expect(style(b!).borderTopWidth).toBe("0px")
    expect(style(a!).display).toBe("list-item")
  })

  it("inherits the outer list's ordering and interactivity", async () => {
    const { host, items } = await list("ordered selection", NESTED)
    const sub = items[1]!.querySelector<UIHost>("ui-list")!
    await ElementFixture.settle(sub)
    expect(rootOf(sub).localName).toBe("ol")
    expect(style(rootOf(sub)).counterReset).toBe("ordered 0")
    expect(boxOf(itemsOf(sub)[0]!).localName).toBe("button")
    expect(parseFloat(style(boxOf(itemsOf(sub)[0]!), "::before").marginLeft)).toBe(-32)
    // switching the outer root (`<ol>` => `<ul>`) must not dispose the slotted items' reactive roots
    host.removeAttribute("ordered")
    await expect.poll(() => rootOf(sub).localName).toBe("ul")
    expect(rootOf(host).localName).toBe("ul")
    host.removeAttribute("selection")
    await expect.poll(() => boxOf(itemsOf(sub)[0]!).localName).toBe("div")
    expect(boxOf(items[0]!).localName).toBe("div")
  })

  it("renders the full list again when moved out of a list", async () => {
    const { items } = await list("", NESTED)
    const sub = items[1]!.querySelector<UIHost>("ui-list")!
    await ElementFixture.settle(sub)
    sub.setAttribute("bulleted", "")
    document.body.append(sub)
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(rootOf(sub).className).toBe("ui bulleted list")
    sub.remove()
  })
})

describe("<ui-list> tokens from outside", () => {
  /** The middle item's top padding. */
  function padding(host: Element): string {
    return style(boxOf(itemsOf(host)[1]!)).paddingTop
  }

  it("takes a token set on the HOST, reaching its items", async () => {
    const { host } = await list(`style="--ui-list-item-padding-block: 10px"`)
    expect(padding(host)).toBe("10px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-list-item-padding-block: 10px"><div><ui-list>${ITEMS}</ui-list></div></section>`
    )
    await ElementFixture.settle(wrapper)
    expect(padding(wrapper.querySelector("ui-list")!)).toBe("10px")
  })

  it("takes a token set through `::part(list)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(list) { --ui-list-item-padding-block: 10px }</style>` +
        `<ui-list class="themed">${ITEMS}</ui-list></div>`
    )
    await ElementFixture.settle(wrapper)
    expect(padding(wrapper.querySelector("ui-list")!)).toBe("10px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-list-item-padding-block", "10px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-list-item-padding-block")
    })
    const { host } = await list()
    expect(padding(host)).toBe("10px")
  })

  it("variations:  `relaxed` swaps the padding, winning over the base token;  first-item padding derives", async () => {
    const { host } = await list(`relaxed style="--ui-list-item-padding-block: 10px"`)
    expect(padding(host)).not.toBe("10px")
    const { items } = await list(`style="--ui-list-item-padding-left: 10px"`)
    expect(style(boxOf(items[0]!)).paddingLeft).toBe("10px")
  })

  it("reaches a sub-list's items through the child tokens", async () => {
    const { items } = await list(
      `style="--ui-list-child-item-padding-block: 10px"`,
      `<ui-item>One<ui-list><ui-item>A</ui-item><ui-item>B</ui-item></ui-list></ui-item>`
    )
    const sub = items[0]!.querySelector<UIHost>("ui-list")!
    await ElementFixture.settle(sub)
    expect(style(boxOf(itemsOf(sub)[1]!)).paddingTop).toBe("10px")
  })

  it("owner tokens:  a part look token set on the list or above reaches its content parts", async () => {
    const red = "rgb(255, 0, 0)"
    const content = `<ui-item><ui-content><ui-header>Title</ui-header></ui-content></ui-item>`
    const { items } = await list(`style="--ui-list-header-color: ${red}"`, content)
    const header = (holder: Element) => holder.querySelector("ui-header")!.shadowRoot!.querySelector(".header")!
    expect(style(header(items[0]!)).color).toBe(red)
    const above = await ElementFixture.render(
      `<div style="--ui-list-header-color: ${red}"><ui-list>${content}</ui-list></div>`
    )
    await ElementFixture.settle(above)
    expect(style(header(above)).color).toBe(red)
    const inverted = await list(`inverted style="--ui-list-header-color: ${red}"`, content)
    expect(style(header(inverted.items[0]!)).color).not.toBe(red)
  })
})

describe("<ui-list> ui-select", () => {
  it("fires with the item's value on click", async () => {
    const { host, items } = await list(
      "selection",
      `<ui-item value="a">Apples</ui-item><ui-item>  Pears </ui-item><ui-item disabled value="c">Oranges</ui-item>`
    )
    const events = selections(host)
    await userEvent.click(boxOf(items[0]!))
    await userEvent.click(boxOf(items[1]!))
    boxOf(items[2]!).click()
    expect(events).toHaveLength(2)
    expect(events[0]!.detail.value).toBe("a")
    expect(events[0]!.detail.item).toBe(items[0])
    expect(events[0]!.detail.originalEvent?.type).toBe("click")
    expect(events[0]!.bubbles && events[0]!.composed).toBe(true)
    // no value:  the text, trimmed
    expect(events[1]!.detail.value).toBe("Pears")
  })

  it("fires from the keyboard:  Enter and Space on the focused item", async () => {
    const { host, items } = await list(
      "selection",
      `<ui-item value="a">Apples</ui-item><ui-item value="b">Pears</ui-item>`
    )
    const events = selections(host)
    boxOf(items[1]!).focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.keyboard(" ")
    expect(events.map((event) => event.detail.value)).toEqual(["b", "b"])
  })

  it("fires for link items, not for plain items or links inside content", async () => {
    const { host, items } = await list(
      "",
      `<ui-item href="#one" value="one">One</ui-item><ui-item>Two <a href="#inner">inner</a></ui-item><ui-item link>Three</ui-item>`
    )
    const events = selections(host)
    await userEvent.click(boxOf(items[0]!))
    await userEvent.click(boxOf(items[1]!))
    await userEvent.click(items[1]!.querySelector("a")!)
    await userEvent.click(boxOf(items[2]!))
    expect(events.map((event) => event.detail.value)).toEqual(["one", "Three"])
  })

  it("leaves a sub-list's items to the sub-list", async () => {
    const { host, items } = await list(
      "selection",
      `<ui-item value="outer">Outer<ui-list><ui-item value="inner">Inner</ui-item></ui-list></ui-item>`
    )
    const sub = items[0]!.querySelector<UIHost>("ui-list")!
    await ElementFixture.settle(sub)
    const events = selections(host)
    await userEvent.click(boxOf(itemsOf(sub)[0]!))
    expect(events).toHaveLength(1)
    expect(events[0]!.target).toBe(sub)
    expect(events[0]!.detail.value).toBe("inner")
  })
})

describe("<ui-list> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.settle(root)
    await expectAccessible(root)
  })
})
