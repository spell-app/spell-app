import { beforeAll, describe, expect, it } from "vitest"
import { Dynamic, type JSX } from "@solidjs/web"

import { expectAccessible } from "$/ui/test/a11y"
import { PART_NOUNS } from "./ui-parts.types"
import type { ComponentVocabulary } from "$/ui/vocabulary"

import { UIElement, type PartContext, type UIElementClass, type UIHost } from "$/ui/elements"
import { UI } from "$/ui/runtime"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { StubOwner } from "$/ui/test/StubOwner"

import "$/ui/components/ui-parts"
import "$/ui/components/ui-label"
import "$/ui/components/ui-segment"
import "$/ui/components/ui-card"
import "$/ui/components/ui-items"
import "$/ui/components/ui-feed"
import "$/ui/components/ui-comment"
import "$/ui/components/ui-statistic"
import "$/ui/components/ui-step"
import "$/ui/components/ui-message"
import "$/ui/components/ui-list"
import "$/ui/components/ui-icon"

/** Examples whose original fragment fails axe `heading-order` too (see `docs/report.md`). */
const HEADING_DEMOS = ["parts/examples/elements/header.html", "segment/examples/elements/variations.html"]

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-parts/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** The part's root in its shadow root. */
function root(host: Element): HTMLElement {
  return host.shadowRoot!.firstElementChild as HTMLElement
}

/** The part's owner context. */
function context(host: Element): PartContext {
  return (host as UIHost).controller!["context" as never] as PartContext
}

/** `:state(in-*)` names set on `host`. */
function ownerStates(host: Element): string[] {
  return [...(host as UIHost).internals.states].filter((state) => state.startsWith("in-"))
}

/**
 * Test-only owner of `header` with two slots:  `a` in a plain `<div>`, `b` inside a `<ui-segment>` (a barrier).
 * - Re-slotting a part between them must re-resolve it (`slotchange`).
 */
class Split extends UIElement {
  render(): JSX.Element {
    return (
      <div>
        <div>
          <slot name="a" />
        </div>
        <Dynamic component="ui-segment">
          <slot name="b" />
        </Dynamic>
      </div>
    )
  }
}

/** A plain (non-`UIElement`) custom element with an open shadow root holding `html`. */
function defineShell(tag: string, html: string) {
  if (customElements.get(tag)) return
  customElements.define(
    tag,
    class extends HTMLElement {
      constructor() {
        super()
        this.attachShadow({ mode: "open" }).innerHTML = html
      }
    }
  )
}

beforeAll(() => {
  StubOwner.defineFomanticOwners()
  const vocabulary: ComponentVocabulary = {
    tag: "x-split",
    noun: "split",
    attributes: [],
    events: [],
    slots: [],
    parts: [],
    states: [],
    texts: [],
    ownsParts: ["header"]
  }
  Object.defineProperty(Split.prototype, "vocabulary", { value: vocabulary })
  if (!customElements.get("x-split")) (Split as unknown as UIElementClass & typeof UIElement).define("x-split")
  defineShell("x-shell", "<ui-card><slot></slot></ui-card>")
  defineShell("x-panel", "<ui-header>Inside a shadow root</ui-header>")
})

describe("parts standalone", () => {
  it.each(PART_NOUNS.map((noun) => [noun]))("<ui-%s> renders `.<noun>` around a slot, unowned", async (noun) => {
    const host = await ElementFixture.render(`<ui-${noun}>Text</ui-${noun}>`)
    const part = root(host)
    const expected = noun === "header" ? "ui header" : noun
    expect(part.className).toBe(expected)
    expect(part.getAttribute("part")).toBe(noun)
    expect(part.querySelector("slot")).not.toBeNull()
    expect(ownerStates(host)).toEqual([])
    expect(host.classList.length).toBe(0)
    // `ui-parts.css` names every part root, for parts nested in parts
    expect(getComputedStyle(part).getPropertyValue("--_ui-part").trim()).toBe(noun)
  })

  it.each([
    ["<ui-content image scrolling>", "image scrolling content"],
    ['<ui-content image="no">', "content"],
    ["<ui-extra text>", "text extra"],
    ['<ui-value text="yes">', "text value"]
  ])("%s => %s", async (open, classes) => {
    const tag = open.slice(1, open.search(/[ >]/))
    const host = await ElementFixture.render(`${open}x</${tag}>`)
    expect(root(host).className).toBe(classes)
  })

  it("renders the semantic roots:  <a>, <time>, <span>, <img>", async () => {
    const title = await ElementFixture.render(`<ui-title href="#t">T</ui-title>`)
    expect(root(title).localName).toBe("a")
    expect(root(title).getAttribute("href")).toBe("#t")
    const author = await ElementFixture.render(`<ui-author href="#m" target="_blank">Matt</ui-author>`)
    expect(root(author).localName).toBe("a")
    expect(root(author).getAttribute("target")).toBe("_blank")
    const plainAuthor = await ElementFixture.render(`<ui-author>Matt</ui-author>`)
    expect(root(plainAuthor).localName).toBe("span")
    const date = await ElementFixture.render(`<ui-date datetime="2026-09-29">Today</ui-date>`)
    expect(root(date).localName).toBe("time")
    expect(root(date).getAttribute("datetime")).toBe("2026-09-29")
    const detail = await ElementFixture.render(`<ui-detail>2</ui-detail>`)
    expect(root(detail).localName).toBe("span")
    const linkDetail = await ElementFixture.render(`<ui-detail href="#all">214</ui-detail>`)
    expect(root(linkDetail).localName).toBe("a")
    expect(root(linkDetail).getAttribute("href")).toBe("#all")
    const avatar = await ElementFixture.render(
      `<ui-avatar src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></ui-avatar>`
    )
    const image = root(avatar).querySelector("img")!
    expect(root(avatar).localName).toBe("span")
    expect(image.getAttribute("alt")).toBe("")
    expect(image.getAttribute("part")).toBe("image")
    expect(root(avatar).querySelector("slot")).toBeNull()
  })
})

describe("<ui-header> standalone", () => {
  it.each([
    ["", "ui header"],
    ['size="large"', "ui large header"],
    ['size="medium"', "ui header"],
    ['color="red" dividing', "ui red dividing header"],
    ['dividing="no"', "ui header"],
    ['sub="yes"', "ui sub header"],
    ["icon block", "ui block icon header"],
    ['attached="top"', "ui top attached header"],
    ["attached", "ui attached header"],
    ['floated="right"', "ui right floated header"],
    ['text-align="center"', "ui center aligned header"],
    ['text-align="justified"', "ui justified header"],
    ["fitted disabled inverted", "ui disabled fitted inverted header"],
    ['size="huge" color="teal" inverted', "ui huge teal inverted header"]
  ])("<ui-header %s>", async (attributes, classes) => {
    const host = await ElementFixture.render(`<ui-header ${attributes}>H</ui-header>`)
    expect(root(host).className).toBe(classes)
  })

  it.each([1, 2, 3, 4, 5, 6])("level=%i renders <h%i>, a heading", async (level) => {
    const host = await ElementFixture.render(`<ui-header level="${level}">H</ui-header>`)
    expect(root(host).localName).toBe(`h${level}`)
    expect(root(host).className).toBe("ui header")
  })

  it("renders <div> without a level, <a role=heading aria-level> for a linked page header", async () => {
    const plain = await ElementFixture.render(`<ui-header>H</ui-header>`)
    expect(root(plain).localName).toBe("div")
    expect(root(plain).hasAttribute("role")).toBe(false)
    const link = await ElementFixture.render(`<ui-header level="2" href="#h">H</ui-header>`)
    expect(root(link).localName).toBe("a")
    expect(root(link).getAttribute("role")).toBe("heading")
    expect(root(link).getAttribute("aria-level")).toBe("2")
  })

  it("keeps elements slotted into it live when `href` swaps its root tag", async () => {
    // loaded first:  the header renders its slot synchronously, BEFORE the label connects (the old owner bug's
    // trigger, `@spell-app/solid-element` fix 11)
    await UI.load()
    const host = await ElementFixture.render(`<ui-header>Dogs <ui-label>214</ui-label></ui-header>`)
    const label = host.querySelector<UIHost>("ui-label")!
    host.setAttribute("href", "#dogs")
    await ElementFixture.settle(host)
    expect(root(host).localName).toBe("a")
    label.setAttribute("href", "#count")
    await ElementFixture.settle(host)
    expect(root(label).localName).toBe("a")
    host.removeAttribute("href")
    await ElementFixture.settle(host)
    label.setAttribute("color", "red")
    await ElementFixture.settle(host)
    expect(root(label).className).toBe("ui red label")
  })

  it("follows `level` changes", async () => {
    const host = await ElementFixture.render(`<ui-header level="1">H</ui-header>`)
    ;(host as unknown as { level: number }).level = 3
    await ElementFixture.tick()
    expect(root(host).localName).toBe("h3")
    expect(host.getAttribute("level")).toBe("3")
  })

  it("sizes a leveled `sub` header as a sub header, not by its level (Fomantic's `h2.ui.sub.header`)", async () => {
    const holder = await ElementFixture.render(
      `<div><ui-header level="2" sub>Price</ui-header><ui-header sub>Price</ui-header></div>`
    )
    const [leveled, plain] = [...holder.querySelectorAll("ui-header")]
    expect(root(leveled!).localName).toBe("h2")
    expect(getComputedStyle(root(leveled!)).fontSize).toBe(getComputedStyle(root(plain!)).fontSize)
  })
})

describe("owner context", () => {
  it("resolves an owner through another part:  card > content > header", async () => {
    const card = await ElementFixture.render(
      `<ui-card><ui-content><ui-header>Elliot</ui-header></ui-content></ui-card>`
    )
    const content = card.querySelector("ui-content")!
    const header = card.querySelector("ui-header")!
    expect(ownerStates(content)).toEqual(["in-card"])
    expect(ownerStates(header)).toEqual(["in-card"])
    expect(context(header).owner.get()).toMatchObject({ owner: card, ownerNoun: "card", depth: 1 })
    // owned:  a bare `.header`, never the `in-card` class
    expect(root(header).className).toBe("header")
    expect(header.classList.contains("in-card")).toBe(false)
  })

  it("resolves the NEAREST of nested owners", async () => {
    const modal = await ElementFixture.render(
      `<stub-modal><ui-header>M</ui-header><ui-card><ui-content><ui-header>C</ui-header></ui-content></ui-card></stub-modal>`
    )
    const [modalHeader, cardHeader] = modal.querySelectorAll("ui-header")
    expect(ownerStates(modalHeader!)).toEqual(["in-modal"])
    expect(ownerStates(cardHeader!)).toEqual(["in-card"])
  })

  it("resolves a header in a header in a header to the middle one (sub headers)", async () => {
    const outer = await ElementFixture.render(
      `<ui-header>A<ui-header>B<ui-header>C</ui-header></ui-header></ui-header>`
    )
    const [middle, inner] = outer.querySelectorAll("ui-header")
    expect(root(outer).className).toBe("ui header")
    expect(ownerStates(middle!)).toEqual(["in-header"])
    expect(context(middle!).owner.get()!.owner).toBe(outer)
    expect(context(inner!).owner.get()!.owner).toBe(middle)
    expect(root(middle!).className).toBe("header")
  })

  it("stops at a non-part component:  card > segment > header stays standalone", async () => {
    const card = await ElementFixture.render(`<ui-card><ui-segment><ui-header>H</ui-header></ui-segment></ui-card>`)
    const header = card.querySelector("ui-header")!
    expect(ownerStates(header)).toEqual([])
    expect(root(header).className).toBe("ui header")
  })

  it("resolves across a slot into another shadow root, and out of a shadow root", async () => {
    const shell = await ElementFixture.render(`<x-shell><ui-meta>Slotted through a shell</ui-meta></x-shell>`)
    expect(ownerStates(shell.querySelector("ui-meta")!)).toEqual(["in-card"])
    const card = await ElementFixture.render(`<ui-card><x-panel></x-panel></ui-card>`)
    const inner = card.querySelector("x-panel")!.shadowRoot!.querySelector("ui-header")!
    await ElementFixture.settle(inner)
    expect(ownerStates(inner)).toEqual(["in-card"])
  })

  it("re-resolves on slotchange, when a part moves between slots", async () => {
    const split = await ElementFixture.render(`<x-split><ui-header slot="a">H</ui-header></x-split>`)
    const header = split.querySelector("ui-header")!
    expect(ownerStates(header)).toEqual(["in-split"])
    header.slot = "b"
    await expect.poll(() => ownerStates(header)).toEqual([])
    await ElementFixture.tick()
    expect(root(header).className).toBe("ui header")
    header.slot = "a"
    await expect.poll(() => ownerStates(header)).toEqual(["in-split"])
  })

  it("re-resolves on reparenting", async () => {
    const holder = await ElementFixture.render(`<div><ui-card><ui-header>H</ui-header></ui-card><p></p></div>`)
    const header = holder.querySelector("ui-header")!
    expect(ownerStates(header)).toEqual(["in-card"])
    holder.querySelector("p")!.append(header)
    await ElementFixture.settle(holder)
    expect(ownerStates(header)).toEqual([])
    expect(root(header).className).toBe("ui header")
  })

  it("re-resolves after a real detach:  keepAlive keeps the controller, `onConnect` refreshes its owner", async () => {
    const holder = await ElementFixture.render(`<div><ui-header>H</ui-header><ui-card></ui-card></div>`)
    const header = holder.querySelector<UIHost>("ui-header")!
    const controller = header.controller
    expect(ownerStates(header)).toEqual([])
    header.remove()
    await ElementFixture.tick()
    holder.querySelector("ui-card")!.append(header)
    await ElementFixture.settle(holder)
    expect(header.controller).toBe(controller)
    expect(ownerStates(header)).toEqual(["in-card"])
    expect(root(header).className).toBe("header")
  })

  it("makes a <ui-label> in a statistic its `.label` part, with `ui-parts.css`", async () => {
    const statistic = await ElementFixture.render(
      `<ui-statistic><ui-value>5,550</ui-value><ui-label>Downloads</ui-label></ui-statistic>`
    )
    const label = statistic.querySelector("ui-label")!
    expect(ownerStates(statistic.querySelector("ui-value")!)).toEqual(["in-statistic"])
    expect(ownerStates(label)).toEqual(["in-statistic"])
    expect(root(label).localName).toBe("div")
    expect(root(label).className).toBe("label")
    expect(getComputedStyle(root(label)).display).toBe("block")
    const standalone = await ElementFixture.render(`<ui-label>Plain</ui-label>`)
    expect(root(standalone).className).toBe("ui label")
  })

  it("gives <ui-detail> its label, and <ui-content> / sub headers their header", async () => {
    const label = await ElementFixture.render(`<ui-label>Dogs<ui-detail>214</ui-detail></ui-label>`)
    expect(ownerStates(label.querySelector("ui-detail")!)).toEqual(["in-label"])
    const header = await ElementFixture.render(
      `<ui-header icon><ui-content>Account<ui-header sub>Manage</ui-header></ui-content></ui-header>`
    )
    const content = header.querySelector("ui-content")!
    expect(ownerStates(content)).toEqual(["in-header"])
    // an icon header's content is a block (`@container style(--_ui-header-layout: icon)`)
    expect(getComputedStyle(root(content)).display).toBe("block")
    expect(ownerStates(header.querySelector("ui-header")!)).toEqual(["in-header"])
  })

  it("puts a date in a feed summary inline, by the summary's `--_ui-part`", async () => {
    const feed = await ElementFixture.render(
      `<ui-feed><ui-event><ui-content><ui-date>3 days ago</ui-date><ui-summary>Added <ui-date>4 hours ago</ui-date></ui-summary></ui-content></ui-event></ui-feed>`
    )
    const [alone, inline] = feed.querySelectorAll("ui-date")
    // NOTE: `ui-parts.css` gives an in-feed `<time>` outside a summary no `display` (see `docs/report.md`)
    expect(getComputedStyle(root(alone!)).display).toBe("inline")
    expect(getComputedStyle(root(inline!)).display).toBe("inline-block")
    expect(getComputedStyle(root(inline!)).marginLeft).not.toBe(getComputedStyle(root(alone!)).marginLeft)
  })
})

describe("owner tokens", () => {
  it("resolves `--ui-inverted` from the NEAREST segment", async () => {
    const outerInverted = await ElementFixture.render(
      `<ui-segment inverted><ui-segment><ui-header>H</ui-header></ui-segment></ui-segment>`
    )
    const plainHeader = outerInverted.querySelector("ui-header")!
    expect(getComputedStyle(root(plainHeader)).getPropertyValue("--ui-inverted").trim()).toBe("0")
    const innerInverted = await ElementFixture.render(
      `<ui-segment><ui-segment inverted><ui-header>H</ui-header></ui-segment></ui-segment>`
    )
    const invertedHeader = innerInverted.querySelector("ui-header")!
    expect(getComputedStyle(root(invertedHeader)).getPropertyValue("--ui-inverted").trim()).toBe("1")
    expect(getComputedStyle(root(invertedHeader)).colorScheme).toBe("dark")
  })

  it("a standalone header takes its public tokens from the host or an ancestor", async () => {
    const red = "rgb(255, 0, 0)"
    const onHost = await ElementFixture.render(`<ui-header style="--ui-header-color: ${red}">H</ui-header>`)
    expect(getComputedStyle(root(onHost)).color).toBe(red)
    const wrapper = await ElementFixture.render(
      `<div style="--ui-header-font-weight: 300"><ui-header>H</ui-header></div>`
    )
    expect(getComputedStyle(root(wrapper.querySelector("ui-header")!)).fontWeight).toBe("300")
  })

  it("a sub header reads its owner header's alias, so the owner's public token reaches it", async () => {
    const red = "rgb(255, 0, 0)"
    const owner = await ElementFixture.render(
      `<ui-header style="--ui-header-sub-color: ${red}"><ui-content>Account<ui-header>Manage</ui-header></ui-content></ui-header>`
    )
    const sub = owner.querySelector("ui-content ui-header")!
    expect(getComputedStyle(root(sub)).color).toBe(red)
  })

  it("an owner look token reaches the part through the owner's alias", async () => {
    // `ui-parts.css` reads `var(--_ui-statistic-value-size, ...)`;  a `large` statistic's size (80px) only arrives
    // through the owner's alias, which its size variation writes
    const owner = await ElementFixture.render(`<ui-statistic size="large"><ui-value>5</ui-value></ui-statistic>`)
    expect(getComputedStyle(root(owner.querySelector("ui-value")!)).fontSize).toBe("80px")
  })
})

describe("parts accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    // `heading-order` off only where the ORIGINAL fragment breaks it identically (a page of h1 ... h6 demos)
    const headingOrder = { enabled: !HEADING_DEMOS.some((name) => path.endsWith(name)) }
    await expectAccessible(root, { rules: { "heading-order": headingOrder } })
  })
})
