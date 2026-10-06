import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-feed"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-feed/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A square picture. */
const AVATAR = `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22/%3E`

/** An event's content:  a summary with an author and an inline date. */
const CONTENT =
  `<ui-content><ui-summary><ui-author href="#elliot">Elliot</ui-author> added you ` +
  `<ui-date>1 hour ago</ui-date></ui-summary><ui-meta><a href="#likes">4 Likes</a></ui-meta></ui-content>`

/** Three plain events. */
const EVENTS = `<ui-event>${CONTENT}</ui-event><ui-event>${CONTENT}</ui-event><ui-event>${CONTENT}</ui-event>`

/** Render a feed;  returns it, its root and its events. */
async function feed(attributes = "", events = EVENTS) {
  const host = await ElementFixture.render<UIHost>(`<ui-feed ${attributes}>${events}</ui-feed>`)
  await ElementFixture.settle(host)
  return { host, root: rootOf(host), events: eventsOf(host) }
}

/** A feed's or event's root. */
function rootOf(host: Element): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=feed], [part~=event]")!
}

/** The `<ui-event>` children of a feed. */
function eventsOf(host: Element): UIHost[] {
  return [...host.querySelectorAll<UIHost>(":scope > ui-event")]
}

/** An event's label box, or `null`. */
function labelOf(event: Element): HTMLElement | null {
  return event.shadowRoot!.querySelector<HTMLElement>("[part~=label]")
}

/** A part element's root. */
function partRoot(host: Element): HTMLElement {
  return host.shadowRoot!.firstElementChild as HTMLElement
}

/** Computed style. */
function style(element: Element, pseudo?: string): CSSStyleDeclaration {
  return getComputedStyle(element, pseudo)
}

////////////////
// ## Classes and markup
////////////////

describe("<ui-feed> classes and markup", () => {
  it.each([
    ["", "ui feed"],
    ['size="small"', "ui small feed"],
    ['color="blue" connected ordered', "ui blue connected ordered feed"],
    ["divided basic inverted", "ui basic divided inverted feed"],
    ['divided="no" disabled', "ui disabled feed"]
  ])("<ui-feed %s>", async (attributes, classes) => {
    const { root } = await feed(attributes)
    expect(root.className).toBe(classes)
  })

  it.each([
    ["", "event"],
    ['color="red"', "red event ui-red"],
    ["basic disabled", "basic disabled event"]
  ])("<ui-event %s>", async (attributes, classes) => {
    const { events } = await feed("", `<ui-event ${attributes}>${CONTENT}</ui-event>`)
    expect(rootOf(events[0]!).className).toBe(classes)
  })

  it("renders a <ul role=list> of listitem events;  an <ol> when ordered", async () => {
    const { host, root, events } = await feed()
    expect(root.localName).toBe("ul")
    expect(root.getAttribute("role")).toBe("list")
    for (const event of events) {
      expect(event.internals.role).toBe("listitem")
      expect(event.matches(":state(in-feed)")).toBe(true)
    }
    host.setAttribute("ordered", "")
    await ElementFixture.tick()
    expect(rootOf(host).localName).toBe("ol")
    expect(style(rootOf(host)).listStyleType).toBe("none")
  })

  it("gives the content parts FEED context, through the event", async () => {
    const { events } = await feed("", `<ui-event>${CONTENT}</ui-event>`)
    for (const tag of ["ui-content", "ui-summary", "ui-author", "ui-date", "ui-meta"])
      expect(events[0]!.querySelector(tag)!.matches(":state(in-feed)"), tag).toBe(true)
    expect(style(partRoot(events[0]!.querySelector("ui-summary")!)).fontWeight).toBe("700")
    // the date sits inline in the summary
    expect(style(partRoot(events[0]!.querySelector("ui-date")!)).display).toBe("inline-block")
  })

  it("colours a linked author with the link colour, not the browser's default blue", async () => {
    const { events } = await feed("", `<ui-event>${CONTENT}</ui-event>`)
    const author = partRoot(events[0]!.querySelector("ui-author")!)
    expect(author.localName).toBe("a")
    expect(style(author).color).not.toBe("rgb(0, 0, 238)")
    const red = "rgb(255, 0, 0)"
    const { events: tinted } = await feed(`style="--ui-feed-author-color: ${red}"`)
    expect(style(partRoot(tinted[0]!.querySelector("ui-author")!)).color).toBe(red)
  })
})

////////////////
// ## <ui-event> labels
////////////////

describe("<ui-event> labels", () => {
  it("gives a LONE event (no feed) its defaults:  the label box is 2.5em wide", async () => {
    const event = await ElementFixture.render<UIHost>(`<ui-event image="${AVATAR}">${CONTENT}</ui-event>`)
    await ElementFixture.settle(event)
    expect(event.matches(":state(in-feed)")).toBe(false)
    expect(labelOf(event)!.getBoundingClientRect().width).toBe(40)
  })

  it("an event in an inverted feed keeps the feed's tokens, not its own defaults", async () => {
    const { events } = await feed("inverted", `<ui-event image="${AVATAR}">${CONTENT}</ui-event>`)
    expect(style(rootOf(events[0]!)).getPropertyValue("--_ui-feed-label-width")).toBe("2.5em")
  })

  it("renders no label box without a label", async () => {
    const { events } = await feed("", `<ui-event>${CONTENT}</ui-event>`)
    expect(labelOf(events[0]!)).toBeNull()
    expect(style(partRoot(events[0]!.querySelector("ui-content")!)).marginLeft).toBe("0px")
  })

  it("draws the `image` shorthand round, 2.5em wide, the content beside it", async () => {
    const { events } = await feed("", `<ui-event image="${AVATAR}">${CONTENT}</ui-event>`)
    const label = labelOf(events[0]!)!
    const image = label.querySelector("img")!
    expect(image.alt).toBe("")
    expect(label.getBoundingClientRect().width).toBe(40)
    expect(image.getBoundingClientRect().width).toBe(40)
    expect(style(image).borderTopLeftRadius).not.toBe("0px")
    const content = partRoot(events[0]!.querySelector("ui-content")!)
    expect(parseFloat(style(content).marginLeft)).toBeCloseTo(1.14285 * 16, 1)
    expect(content.getBoundingClientRect().left).toBeGreaterThan(label.getBoundingClientRect().right)
  })

  it("draws the `icon` shorthand as a big centred glyph", async () => {
    const { events } = await feed("", `<ui-event icon="pencil">${CONTENT}</ui-event>`)
    const icon = labelOf(events[0]!)!.querySelector(".icon")!
    await expect.poll(() => icon.querySelector("svg")).not.toBeNull()
    expect(style(icon).fontSize).toBe("24px")
    expect(icon.getBoundingClientRect().width).toBe(40)
  })

  it("puts a `label` text in a circle", async () => {
    const { events } = await feed("", `<ui-event label="J">${CONTENT}</ui-event>`)
    const label = labelOf(events[0]!)!
    expect(label.dataset.text).toBe("J")
    expect(style(label, "::before")).toMatchObject({ content: '"J"', borderTopLeftRadius: "50%", height: "40px" })
  })

  it("shows slotted label content, and puts the content beside it", async () => {
    const { events } = await feed("", `<ui-event><img slot="label" src="${AVATAR}" alt="">${CONTENT}</ui-event>`)
    const label = labelOf(events[0]!)!
    expect(label).not.toBeNull()
    expect(events[0]!.querySelector("img")!.getBoundingClientRect().width).toBe(40)
    const content = partRoot(events[0]!.querySelector("ui-content")!)
    expect(parseFloat(style(content).marginLeft)).toBeCloseTo(1.14285 * 16, 1)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-feed> tokens from outside", () => {
  /** An event with an image label. */
  const PICTURED = `<ui-event image="${AVATAR}">${CONTENT}</ui-event>`

  /** The width of the first event's label box under `host`. */
  function labelWidth(host: Element): number {
    return labelOf(eventsOf(host)[0]!)!.getBoundingClientRect().width
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await feed(`style="--ui-feed-label-width: 50px"`, PICTURED)
    expect(labelWidth(host)).toBe(50)
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-feed-label-width: 50px"><ui-feed>${PICTURED}</ui-feed></section>`
    )
    expect(labelWidth(wrapper.querySelector("ui-feed")!)).toBe(50)
  })

  it("takes a token set through `::part(feed)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(feed) { --ui-feed-label-width: 50px }</style><ui-feed class="themed">${PICTURED}</ui-feed></div>`
    )
    expect(labelWidth(wrapper.querySelector("ui-feed")!)).toBe(50)
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-feed-label-width", "50px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-feed-label-width")
    })
    const { host } = await feed("", PICTURED)
    expect(labelWidth(host)).toBe(50)
  })

  it("owner tokens:  a part look token set on the feed reaches a summary", async () => {
    const red = "rgb(255, 0, 0)"
    const { events } = await feed(`style="--ui-feed-summary-color: ${red}"`)
    expect(style(partRoot(events[0]!.querySelector("ui-summary")!)).color).toBe(red)
  })
})

////////////////
// ## Variations
////////////////

describe("<ui-feed> variations", () => {
  it("numbers events when ordered:  a label box each, counters on the feed", async () => {
    const { root, events } = await feed("ordered")
    expect(style(root).counterReset).toBe("ordered 0")
    for (const event of events) expect(labelOf(event)).not.toBeNull()
    const circle = style(labelOf(events[0]!)!, "::before")
    expect(circle.content).toBe("counter(ordered)")
    expect(circle.counterIncrement).toBe("ordered 1")
  })

  it("keeps a text label's own text in an ordered feed", async () => {
    const { events } = await feed("ordered", `<ui-event label="A">${CONTENT}</ui-event>`)
    expect(style(labelOf(events[0]!)!, "::before").content).toBe('"A"')
  })

  it("connects each label to the next with a line, coloured by the feed or the event", async () => {
    const { host, events } = await feed("connected", EVENTS.replaceAll("<ui-event>", `<ui-event icon="pencil">`))
    const [first, , last] = events.map(rootOf)
    expect(style(first!, "::before").borderLeftWidth).toBe("2px")
    expect(style(first!, "::before").position).toBe("absolute")
    expect(style(last!, "::before").content).toBe("none")
    const grey = style(first!, "::before").borderLeftColor
    host.setAttribute("color", "red")
    await ElementFixture.tick()
    expect(style(rootOf(eventsOf(host)[0]!), "::before").borderLeftColor).not.toBe(grey)
  })

  it("colours the number circles of an ordered feed;  basic outlines them", async () => {
    const { host, events } = await feed("ordered")
    const grey = style(labelOf(events[0]!)!, "::before").backgroundColor
    host.setAttribute("color", "blue")
    await ElementFixture.tick()
    const blue = style(labelOf(events[0]!)!, "::before").backgroundColor
    expect(blue).not.toBe(grey)
    host.setAttribute("basic", "")
    await ElementFixture.tick()
    expect(style(labelOf(events[0]!)!, "::before").backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(style(labelOf(events[0]!)!, "::before").color).toBe(blue)
  })

  it("divides events with a rule", async () => {
    const { events } = await feed("divided")
    expect(style(rootOf(events[0]!)).borderTopWidth).toBe("0px")
    expect(style(rootOf(events[1]!)).borderTopWidth).toBe("1px")
  })

  it("pads events but not the outer edges", async () => {
    const { events } = await feed()
    const [first, middle, last] = events.map(rootOf)
    expect(style(first!).paddingTop).toBe("0px")
    expect(parseFloat(style(middle!).paddingTop)).toBeCloseTo((3 / 14) * 16, 1)
    expect(style(last!).paddingBottom).toBe("0px")
  })

  it("inverts:  the dark scheme and a dark surface behind each event", async () => {
    const { root, events } = await feed("inverted")
    expect(style(root).colorScheme).toBe("dark")
    expect(style(rootOf(events[0]!)).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    const summary = partRoot(events[0]!.querySelector("ui-summary")!)
    expect(style(summary).getPropertyValue("--ui-inverted").trim()).toBe("1")
  })

  it("scales with `size`;  fades a disabled event", async () => {
    const { root, events } = await feed('size="large"', `<ui-event disabled>${CONTENT}</ui-event>`)
    expect(style(root).fontSize).toBe("18px")
    expect(Number(style(rootOf(events[0]!)).opacity)).toBeLessThan(1)
    expect(events[0]!.matches(":state(disabled)")).toBe(true)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-feed> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.settle(root)
    await expectAccessible(root)
  })
})
