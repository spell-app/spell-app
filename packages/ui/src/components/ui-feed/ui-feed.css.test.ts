import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { eventVocabulary } from "./ui-event.vocabulary.en"
import { feedVocabulary } from "./ui-feed.vocabulary.en"

import iconCSS from "$/ui/components/ui-icon/ui-icon.css?inline"
import partsCSS from "$/ui/components/ui-parts/ui-parts.css?inline"
import segmentCSS from "$/ui/components/ui-segment/ui-segment.css?inline"
import feedCSS from "./ui-feed.css?inline"
import feedRaw from "./ui-feed.css?raw"

/**
 * `ui-feed.css` on its own, before any element exists:  the sheet's source rules, and the computed styles of the
 * light-DOM class-grammar examples -- feeds, events (`.ui.feed > .event`), labels and static parts (`in-feed`).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Adopt what a page showing the static examples needs. */
function adopt() {
  Sheets.adopt([...foundationCSS, iconCSS, segmentCSS, feedCSS, partsCSS])
}

/** Render example `name`;  returns its root. */
function example(name: string): HTMLElement {
  adopt()
  return Fixture.render(`<div style="width: 800px">${EXAMPLES[`./examples/${name}.html`]!}</div>`)
}

/** The events of the first feed in the section whose `<h4>` says `title`. */
function eventsIn(root: Element, title: string): HTMLElement[] {
  const section = [...root.querySelectorAll("section")].find(
    (element) => element.querySelector("h4")?.textContent === title
  )
  if (!section) throw new Error(`no section "${title}"`)
  return [...section.querySelector(".ui.feed")!.children] as HTMLElement[]
}

/** Computed style of `element`. */
function style(element: Element, pseudo?: string): CSSStyleDeclaration {
  return getComputedStyle(element, pseudo)
}

describe("ui-feed.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(feedRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(feedRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(feedRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("feed"))).toBe(true)
  })

  it("parses with replaceSync, keeping the event rules and the variation queries", () => {
    for (const css of [feedCSS, feedRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(25)
      expect(selectors.some((selector) => selector.includes(":host(:not(:last-child)) > .event::before"))).toBe(true)
      expect(css).toMatch(/@container style\(--_feed-ordered: ?1\)/)
      expect(css).toMatch(/@container style\(--_feed-connected: ?1\)/)
    }
  })

  it("pairs every event rule:  the element's root and the static class grammar", () => {
    const selectors = Sheets.selectors(feedCSS)
    expect(selectors.filter((selector) => selector.includes(":host > .event")).length).toBeGreaterThan(8)
    expect(selectors.filter((selector) => selector.includes(".ui.feed > .event")).length).toBeGreaterThan(8)
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = feedRaw + colorsCSS
    for (const vocabulary of [feedVocabulary, eventVocabulary])
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
  })
})

describe("ui-feed.css examples", () => {
  it.each(Object.keys(EXAMPLES))("lays out every event in %s", (path) => {
    adopt()
    const root = Fixture.render(`<div style="width: 800px">${EXAMPLES[path]!}</div>`)
    const events = root.querySelectorAll<HTMLElement>(".ui.feed > .event")
    expect(events.length).toBeGreaterThan(0)
    for (const event of events) {
      expect(style(event).display).toBe("flex")
      expect(event.getBoundingClientRect().height).toBeGreaterThan(0)
    }
  })

  it("puts a 2.5em label beside the content;  the summary bold, its date inline", () => {
    const [event] = eventsIn(example("types"), "Feed")
    const label = event!.querySelector(".label")!
    const content = event!.querySelector(".content")!
    expect(label.getBoundingClientRect().width).toBe(40)
    expect(content.getBoundingClientRect().left).toBeGreaterThan(label.getBoundingClientRect().right)
    expect(style(event!.querySelector(".summary")!).fontWeight).toBe("700")
    expect(style(event!.querySelector(".summary .date")!).display).toBe("inline-block")
  })

  it("numbers an ordered feed's labels, connects them, colours them", () => {
    const root = example("variations")
    const [ordered] = eventsIn(root, "Ordered")
    expect(style(ordered!.parentElement!).counterReset).toBe("ordered 0")
    expect(style(ordered!.querySelector(".label")!, "::before").content).toBe("counter(ordered)")
    const [first, , last] = eventsIn(root, "Connected")
    expect(style(first!, "::before").borderLeftWidth).toBe("2px")
    expect(style(last!, "::before").content).toBe("none")
    const [blue] = eventsIn(root, "Ordered, connected, coloured")
    expect(style(blue!.querySelector(".label")!, "::before").backgroundColor).not.toBe(
      style(ordered!.querySelector(".label")!, "::before").backgroundColor
    )
    const [basic] = eventsIn(root, "Basic ordered")
    expect(style(basic!.querySelector(".label")!, "::before").backgroundColor).toBe("rgba(0, 0, 0, 0)")
  })

  it("shows a text label's own text in a circle", () => {
    const [event] = eventsIn(example("content"), "Text label")
    expect(style(event!.querySelector(".label")!, "::before").content).toBe('"J"')
  })

  it("divides, inverts, fades a disabled event", () => {
    const root = example("variations")
    const [first, second] = eventsIn(root, "Divided")
    expect(style(first!).borderTopWidth).toBe("0px")
    expect(style(second!).borderTopWidth).toBe("1px")
    const [inverted] = eventsIn(root, "Inverted")
    expect(style(inverted!.parentElement!).colorScheme).toBe("dark")
    const [disabled] = eventsIn(example("states"), "Disabled event")
    expect(Number(style(disabled!).opacity)).toBeLessThan(1)
  })
})

describe("ui-feed.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, feedCSS])
    const root = Fixture.render(
      `<div style="--ui-feed-event-padding: 10px"><div class="ui feed"><div class="event"><div class="content">x</div></div>` +
        `<div class="event"><div class="content">y</div></div></div></div>`
    )
    // the second event:  a feed pads its events, not its outer edges
    expect(getComputedStyle(root.querySelectorAll(".ui.feed > .event")[1]!).paddingTop).toBe("10px")
  })
})
