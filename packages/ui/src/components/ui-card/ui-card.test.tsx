import { describe, expect, it } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/keys"

import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { Viewport } from "$/ui/test/viewport"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-card"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-button"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-card/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A small landscape picture. */
const PHOTO = `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2230%22 height=%2220%22/%3E`

/** Render `html`;  returns the first element. */
async function render(html: string): Promise<UIHost> {
  const host = await ElementFixture.render<UIHost>(html)
  await ElementFixture.settle(host.parentElement!)
  return host
}

/** A card's (or group's) root in its shadow root. */
function rootOf(host: Element): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=card], [part~=group]")!
}

/** The root of a part element (`<ui-header>` ...). */
function partRoot(host: Element): HTMLElement {
  return host.shadowRoot!.firstElementChild as HTMLElement
}

/** A shadow shorthand block by part name. */
function shorthand(host: Element, part: string): HTMLElement | null {
  return host.shadowRoot!.querySelector<HTMLElement>(`[part~=${part}]`)
}

/** Computed style. */
function style(element: Element, pseudo?: string): CSSStyleDeclaration {
  return getComputedStyle(element, pseudo)
}

/** The `<ui-card>` children of a group. */
function cardsOf(group: Element): UIHost[] {
  return [...group.querySelectorAll<UIHost>(":scope > ui-card")]
}

describe("<ui-card> classes and markup", () => {
  it.each([
    ["", "ui card"],
    ['size="small"', "ui small card"],
    ['size="medium"', "ui card"],
    ['color="red"', "ui red card"],
    ["raised", "ui raised card"],
    ['raised="no"', "ui card"],
    ["horizontal fluid", "ui fluid horizontal card"],
    ["link centered basic", "ui basic centered link card"],
    ["inverted disabled loading", "ui disabled inverted loading card"]
  ])("<ui-card %s>", async (attributes, classes) => {
    const host = await render(`<ui-card ${attributes}></ui-card>`)
    expect(rootOf(host).className).toBe(classes)
  })

  it("renders an <article> around its slot;  a link with href", async () => {
    const host = await render(`<ui-card><ui-content>Hi</ui-content></ui-card>`)
    expect(rootOf(host).localName).toBe("article")
    expect(rootOf(host).querySelector("slot")).not.toBeNull()
    host.setAttribute("href", "#profile")
    host.setAttribute("target", "_blank")
    await ElementFixture.tick()
    const link = rootOf(host)
    expect(link.localName).toBe("a")
    expect(link.getAttribute("href")).toBe("#profile")
    expect(link.getAttribute("target")).toBe("_blank")
    expect(link.className).toBe("ui card")
  })

  it("drops a disabled link card's href;  aria-disabled, :state(disabled)", async () => {
    const host = await render(`<ui-card href="#x" disabled header="Off"></ui-card>`)
    expect(rootOf(host).hasAttribute("href")).toBe(false)
    expect(rootOf(host).getAttribute("aria-disabled")).toBe("true")
    expect(host.internals.ariaDisabled).toBe("true")
    expect(host.matches(":state(disabled)")).toBe(true)
    expect(style(rootOf(host)).pointerEvents).toBe("none")
  })

  it("announces loading:  aria-busy, a status, a spinner", async () => {
    const host = await render(`<ui-card loading header="Busy"></ui-card>`)
    expect(host.internals.ariaBusy).toBe("true")
    expect(host.shadowRoot!.querySelector("[role=status]")!.textContent).toBe("Loading…")
    expect(style(rootOf(host), "::after").animationName).toBe("ui-card-spin")
    host.removeAttribute("loading")
    await ElementFixture.tick()
    expect(host.internals.ariaBusy).toBeNull()
    expect(host.shadowRoot!.querySelector("[role=status]")).toBeNull()
  })
})

describe("<ui-card> shorthands", () => {
  it("renders image, content block (header, meta, description) and extra as static parts, in order", async () => {
    const host = await render(
      `<ui-card image="${PHOTO}" alt="Kristy" header="Kristy" meta="Joined in 2013" description="Art director" extra="22 Friends"><ui-button>Add</ui-button></ui-card>`
    )
    const root = rootOf(host)
    const order = [...root.children].map((child) => child.getAttribute("part") ?? child.localName)
    expect(order).toEqual(["image", "content", "slot", "extra"])
    expect(shorthand(host, "image")!.querySelector("img")!.alt).toBe("Kristy")
    expect(shorthand(host, "content")!.className).toBe("content in-card")
    expect(shorthand(host, "header")!.className).toBe("header in-card")
    expect(shorthand(host, "header")!.textContent).toBe("Kristy")
    expect(shorthand(host, "meta")!.textContent).toBe("Joined in 2013")
    expect(shorthand(host, "description")!.textContent).toBe("Art director")
    expect(shorthand(host, "extra")!.className).toBe("extra in-card")
    // `ui-parts.css` styles the static shorthand parts:  a bold heading-size header, a rule above the extra content
    expect(style(shorthand(host, "header")!).fontWeight).toBe("700")
    expect(style(shorthand(host, "extra")!).borderTopWidth).toBe("1px")
    expect(style(shorthand(host, "content")!).borderTopWidth).toBe("1px")
  })

  it("defaults the image's alt to empty (decorative)", async () => {
    const host = await render(`<ui-card image="${PHOTO}"></ui-card>`)
    expect(shorthand(host, "image")!.querySelector("img")!.getAttribute("alt")).toBe("")
    expect(style(shorthand(host, "image")!).borderTopLeftRadius).not.toBe("0px")
  })

  it("styles a shorthand header like a slotted <ui-header>", async () => {
    const host = await render(
      `<ui-card header="Shorthand"></ui-card><ui-card><ui-content><ui-header>Slotted</ui-header></ui-content></ui-card>`
    )
    const slotted = host.parentElement!.querySelectorAll("ui-card")[1]!.querySelector("ui-header")!
    expect(slotted.matches(":state(in-card)")).toBe(true)
    const [a, b] = [shorthand(host, "header")!, partRoot(slotted)]
    for (const property of ["fontSize", "fontWeight", "color", "fontFamily"] as const)
      expect(style(a)[property], property).toBe(style(b!)[property])
  })

  it("yields each shorthand to a slotted part of its noun, also added later", async () => {
    const host = await render(
      `<ui-card image="${PHOTO}" header="Short" meta="Meta"><ui-content><ui-meta>Slotted meta</ui-meta></ui-content></ui-card>`
    )
    expect(shorthand(host, "header")).not.toBeNull()
    expect(shorthand(host, "meta")).toBeNull()
    const content = host.querySelector("ui-content")!
    content.insertAdjacentHTML("afterbegin", `<ui-header>Slotted</ui-header>`)
    await expect.poll(() => shorthand(host, "header")).toBeNull()
    expect(shorthand(host, "content")).toBeNull()
    host.insertAdjacentHTML("afterbegin", `<img src="${PHOTO}" alt="Photo">`)
    await expect.poll(() => shorthand(host, "image")).toBeNull()
    const image = host.querySelector("img")!
    expect(style(image).display).toBe("block")
    expect(image.getBoundingClientRect().width).toBe(rootOf(host).getBoundingClientRect().width)
  })
})

describe("<ui-card> content parts", () => {
  it("gives its parts card context", async () => {
    const host = await render(
      `<ui-card><ui-content><ui-header>H</ui-header><ui-meta>M</ui-meta><ui-description>D</ui-description>` +
        `</ui-content><ui-extra>E</ui-extra></ui-card>`
    )
    for (const tag of ["ui-content", "ui-header", "ui-meta", "ui-description", "ui-extra"])
      expect(host.querySelector(tag)!.matches(":state(in-card)"), tag).toBe(true)
    // the first content block has no rule above it;  the extra content does
    expect(style(partRoot(host.querySelector("ui-content")!)).borderTopWidth).toBe("0px")
    expect(style(partRoot(host.querySelector("ui-extra")!)).borderTopWidth).toBe("1px")
    expect(style(partRoot(host.querySelector("ui-content")!)).paddingTop).toBe("16px")
  })

  it("draws the rule above a slotted content that follows a shorthand block", async () => {
    const host = await render(`<ui-card header="A"><ui-content>B</ui-content></ui-card>`)
    expect(style(shorthand(host, "content")!).borderTopWidth).toBe("0px")
    expect(style(partRoot(host.querySelector("ui-content")!)).borderTopWidth).toBe("1px")
    const imaged = await render(`<ui-card image="${PHOTO}"><ui-content>B</ui-content></ui-card>`)
    expect(style(partRoot(imaged.querySelector("ui-content")!)).borderTopWidth).toBe("1px")
    // ... but not in a horizontal card, whose contents have none
    const horizontal = await render(`<ui-card horizontal header="A"><ui-content>B</ui-content></ui-card>`)
    expect(style(partRoot(horizontal.querySelector("ui-content")!)).borderTopWidth).toBe("0px")
  })

  it("aligns and floats content (`text-align`, `floated`)", async () => {
    const host = await render(
      `<ui-card><ui-content text-align="center">Centred</ui-content><ui-content floated="right">R</ui-content></ui-card>`
    )
    const [centred, floated] = host.querySelectorAll("ui-content")
    expect(partRoot(centred!).className).toBe("center aligned content")
    expect(style(partRoot(centred!)).textAlign).toBe("center")
    expect(partRoot(floated!).className).toBe("right floated content")
    // the float is moot in the card's flex column (the ui-card.css tests prove the rule on static markup):  Chromium and
    // Firefox still compute `right`, WebKit computes `none` for a flex item
    expect(["right", "none"]).toContain(style(partRoot(floated!)).float)
  })

  it("keeps a header inside a nested segment standalone (a barrier)", async () => {
    await import("$/ui/components/ui-segment")
    const host = await render(`<ui-card><ui-segment><ui-header>Alone</ui-header></ui-segment></ui-card>`)
    await ElementFixture.settle(host)
    expect(host.querySelector("ui-header")!.matches(":state(in-card)")).toBe(false)
  })
})

describe("<ui-card> variations", () => {
  it("draws a coloured bottom line from the colour remap", async () => {
    const plain = await render(`<ui-card header="Plain"></ui-card>`)
    const red = await render(`<ui-card color="red" header="Red"></ui-card>`)
    expect(style(rootOf(red)).boxShadow).not.toBe(style(rootOf(plain)).boxShadow)
    expect(style(rootOf(plain)).boxShadow).toContain("rgba(0, 0, 0, 0) 0px 2px 0px 0px")
  })

  it("inverts:  the dark scheme and `--ui-inverted` for its parts", async () => {
    const host = await render(`<ui-card inverted><ui-content><ui-header>H</ui-header></ui-content></ui-card>`)
    expect(style(rootOf(host)).colorScheme).toBe("dark")
    const header = partRoot(host.querySelector("ui-header")!)
    expect(style(header).getPropertyValue("--ui-inverted").trim()).toBe("1")
    const plain = await render(`<ui-card><ui-content><ui-header>H</ui-header></ui-content></ui-card>`)
    expect(
      style(partRoot(plain.querySelector("ui-header")!))
        .getPropertyValue("--ui-inverted")
        .trim()
    ).toBe("0")
    expect(style(header).color).not.toBe(style(partRoot(plain.querySelector("ui-header")!)).color)
  })

  it("lays out a horizontal card:  image beside the content, `--_ui-card-layout`", async () => {
    const host = await render(
      `<ui-card horizontal><img src="${PHOTO}" alt="Photo"><ui-content><ui-header>Side</ui-header></ui-content></ui-card>`
    )
    const image = host.querySelector("img")!
    const content = partRoot(host.querySelector("ui-content")!)
    expect(style(rootOf(host)).flexDirection).toBe("row")
    expect(image.getBoundingClientRect().width).toBe(150)
    expect(content.getBoundingClientRect().left).toBeGreaterThanOrEqual(image.getBoundingClientRect().right - 1)
    expect(style(content).getPropertyValue("--_ui-card-layout").trim()).toBe("horizontal")
    expect(style(content).borderTopWidth).toBe("0px")
  })

  it("is fluid and centered", async () => {
    const wrapper = await ElementFixture.render(
      `<div style="width: 600px"><ui-card fluid></ui-card><ui-card centered></ui-card></div>`
    )
    const [fluid, centered] = [...wrapper.querySelectorAll("ui-card")].map(rootOf)
    expect(fluid!.getBoundingClientRect().width).toBe(600)
    expect(centered!.getBoundingClientRect().width).toBe(290)
    expect(centered!.getBoundingClientRect().left - wrapper.getBoundingClientRect().left).toBe(155)
  })

  it("rises on hover when `link`, or as a link card", async () => {
    const host = await render(`<ui-card link header="Hover me"></ui-card>`)
    expect(style(rootOf(host)).transform).toBe("none")
    await userEvent.hover(rootOf(host))
    await expect.poll(() => style(rootOf(host)).transform).toBe("matrix(1, 0, 0, 1, 0, -3)")
    await userEvent.unhover(rootOf(host))
  })

  it("a link card's hover ring takes `--ui-card-hover-border-color`", async () => {
    const red = "rgb(255, 0, 0)"
    const host = await render(`<ui-card link header="Hover me" style="--ui-card-hover-border-color: ${red}"></ui-card>`)
    expect(style(rootOf(host)).boxShadow).not.toContain(`${red} 0px 0px 0px 1px`)
    await userEvent.hover(rootOf(host))
    await expect.poll(() => style(rootOf(host)).boxShadow).toContain(`${red} 0px 0px 0px 1px`)
    await userEvent.unhover(rootOf(host))
  })

  it("`--ui-card-shadow: none` drops the drop shadow only:  the ring stays", async () => {
    const red = "rgb(255, 0, 0)"
    const ring = `${red} 0px 0px 0px 1px`
    const onHost = await render(
      `<ui-card header="Flat" style="--ui-card-shadow: none; --ui-card-border-color: ${red}"></ui-card>`
    )
    expect(style(rootOf(onHost)).boxShadow).toContain(ring)
    expect(style(rootOf(onHost)).boxShadow).not.toContain("3px")
    const above = await ElementFixture.render(
      `<div style="--ui-card-shadow: none; --ui-card-border-color: ${red}"><ui-card header="Flat"></ui-card></div>`
    )
    expect(style(rootOf(above.querySelector("ui-card")!)).boxShadow).toContain(ring)
    const noRing = await render(`<ui-card header="Bare" style="--ui-card-border-shadow: none"></ui-card>`)
    expect(style(rootOf(noRing)).boxShadow).toContain("3px")
  })

  it("`dashed`:  a dashed outline in the border colour instead of the ring, no drop shadow", async () => {
    const red = "rgb(255, 0, 0)"
    const host = await render(`<ui-card dashed header="Placeholder" style="--ui-card-border-color: ${red}"></ui-card>`)
    expect(rootOf(host).className).toBe("ui dashed card")
    const root = style(rootOf(host))
    expect([root.outlineStyle, root.outlineColor, root.outlineWidth]).toEqual(["dashed", red, "1px"])
    expect(root.boxShadow).not.toContain(red)
    expect(root.boxShadow).not.toContain("3px")
    const plain = await render(`<ui-card header="Plain"></ui-card>`)
    expect(style(rootOf(plain)).outlineStyle).toBe("none")
    const raised = await render(`<ui-card dashed raised header="Raised"></ui-card>`)
    expect(style(rootOf(raised)).boxShadow).not.toBe(root.boxShadow)
  })

  it("takes its public tokens from the host, an ancestor or `::part(card)`", async () => {
    const onHost = await render(`<ui-card style="--ui-card-radius: 20px" header="Host"></ui-card>`)
    expect(style(rootOf(onHost)).borderTopLeftRadius).toBe("20px")
    const wrapper = await ElementFixture.render(
      `<div style="--ui-cards-spacing: 3em"><ui-cards><ui-card header="A"></ui-card></ui-cards></div>`
    )
    const group = wrapper.querySelector("ui-cards")!
    expect(style(rootOf(group)).marginLeft).toBe("-24px")
    const themed = await ElementFixture.render(
      `<div><style>.themed::part(card) { --ui-card-width: 200px }</style><ui-card class="themed"></ui-card></div>`
    )
    expect(rootOf(themed.querySelector("ui-card")!).getBoundingClientRect().width).toBe(200)
  })

  it("owner tokens:  a part look token set on the card, above it or on the part reaches the header", async () => {
    const red = "rgb(255, 0, 0)"
    const card = `<ui-card><ui-content><ui-header>Title</ui-header></ui-content></ui-card>`
    const onCard = await render(card.replace("<ui-card>", `<ui-card style="--ui-card-header-color: ${red}">`))
    expect(style(partRoot(onCard.querySelector("ui-header")!)).color).toBe(red)
    const above = await ElementFixture.render(`<section style="--ui-card-header-color: ${red}">${card}</section>`)
    expect(style(partRoot(above.querySelector("ui-header")!)).color).toBe(red)
    const onPart = await render(card.replace("<ui-header>", `<ui-header style="--ui-card-header-color: ${red}">`))
    expect(style(partRoot(onPart.querySelector("ui-header")!)).color).toBe(red)
    const plain = await render(card)
    expect(style(partRoot(plain.querySelector("ui-header")!)).color).not.toBe(red)
  })

  it("scales with `size`, never twice for its content", async () => {
    const host = await render(`<ui-card size="large"><ui-content><ui-header>Large</ui-header></ui-content></ui-card>`)
    expect(style(rootOf(host)).fontSize).toBe("18px")
    const slot = rootOf(host).querySelector("slot")!
    expect(style(slot).getPropertyValue("--ui-scale").trim()).toBe("")
  })
})

describe("<ui-cards>", () => {
  const THREE = `<ui-card header="A"></ui-card><ui-card header="B"></ui-card><ui-card header="C"></ui-card>`

  it("renders a list of listitem cards with :state(in-cards)", async () => {
    const group = await render(`<ui-cards>${THREE}</ui-cards>`)
    const root = rootOf(group)
    expect(root.className).toBe("ui cards")
    expect(root.getAttribute("role")).toBe("list")
    expect(group.matches(":state(cards)")).toBe(true)
    expect(style(group).display).toBe("block")
    for (const card of cardsOf(group)) {
      expect(card.internals.role).toBe("listitem")
      expect(card.matches(":state(in-cards)")).toBe(true)
    }
    const standalone = await render(`<ui-card header="Alone"></ui-card>`)
    expect(standalone.internals.role).toBeNull()
  })

  it("lays cards out in a wrapping row with Fomantic's spacing", async () => {
    const wrapper = await ElementFixture.render(`<div style="width: 1000px"><ui-cards>${THREE}</ui-cards></div>`)
    const cards = cardsOf(wrapper.querySelector("ui-cards")!).map(rootOf)
    const [a, b] = cards.map((card) => card.getBoundingClientRect())
    expect(a!.width).toBe(290)
    expect(a!.top).toBe(b!.top)
    expect(b!.left - a!.right).toBe(16)
    expect(style(cards[0]!).marginTop).toBe("14px")
  })

  it("hands its variations to its cards;  a card's own value wins", async () => {
    const group = await render(
      `<ui-cards raised color="blue" size="small"><ui-card></ui-card><ui-card color="red"></ui-card></ui-cards>`
    )
    const [first, second] = cardsOf(group).map(rootOf)
    expect(first!.className).toBe("ui small blue raised card")
    expect(second!.className).toBe("ui small red raised card")
    group.setAttribute("inverted", "")
    group.removeAttribute("raised")
    await ElementFixture.tick()
    expect(rootOf(cardsOf(group)[0]!).className).toBe("ui small blue inverted card")
    expect(style(rootOf(cardsOf(group)[0]!)).colorScheme).toBe("dark")
  })

  it("sizes cards by `columns`", async () => {
    const wrapper = await ElementFixture.render(
      `<div style="width: 1000px"><ui-cards columns="3">${THREE}</ui-cards></div>`
    )
    const group = wrapper.querySelector("ui-cards")!
    expect(rootOf(group).className).toBe("ui three cards")
    const widths = cardsOf(group).map((card) => rootOf(card).getBoundingClientRect())
    // (1000 + 2 * 16) / 3 - 2 * 16:  the group's negative margins take up the outer spacing
    for (const box of widths) expect(box.width).toBeCloseTo((1000 + 32) / 3 - 32, 0)
    expect(widths[0]!.top).toBe(widths[2]!.top)
  })

  it("doubles and stacks by its OWN width (container queries)", async () => {
    const four = `${THREE}<ui-card header="D"></ui-card>`
    const wrapper = await ElementFixture.render(
      `<div style="width: 1200px"><div style="width: 600px"><ui-cards columns="4" doubling>${four}</ui-cards></div>` +
        `<div style="width: 600px"><ui-cards columns="4" stackable>${four}</ui-cards></div></div>`
    )
    const [doubling, stackable] = [...wrapper.querySelectorAll("ui-cards")]
    const doubled = cardsOf(doubling!).map((card) => rootOf(card).getBoundingClientRect())
    // two to a row
    expect(doubled[0]!.top).toBe(doubled[1]!.top)
    expect(doubled[2]!.top).toBeGreaterThan(doubled[1]!.top)
    const stacked = cardsOf(stackable!).map((card) => rootOf(card).getBoundingClientRect())
    expect(stacked[1]!.top).toBeGreaterThan(stacked[0]!.top)
    expect(stacked[0]!.width).toBeCloseTo(600, 0)
  })

  it('`stack-with="page"` doubles and stacks by the SCREEN;  the token too, and the attribute beats it', async () => {
    const four = `${THREE}<ui-card header="D"></ui-card>`
    const wrapper = await ElementFixture.render(
      `<div style="width: 600px"><ui-cards columns="4" stackable stack-with="page">${four}</ui-cards>` +
        `<div style="--ui-stack-with: page"><ui-cards columns="4" stackable>${four}</ui-cards>` +
        `<ui-cards columns="4" stackable stack-with="container">${four}</ui-cards></div></div>`
    )
    const [own, token, container] = [...wrapper.querySelectorAll("ui-cards")]
    expect(rootOf(own!).className).toBe("ui stackable four cards stack-with-page")
    /** Whether the first two cards of `group` sit in one row. */
    const oneRow = (group: Element) => {
      const [a, b] = cardsOf(group).map((card) => rootOf(card).getBoundingClientRect())
      return a!.top === b!.top
    }
    await Viewport.resize(1200)
    await expect.poll(() => [oneRow(own!), oneRow(token!), oneRow(container!)]).toEqual([true, true, false])
    await Viewport.resize(500)
    await expect.poll(() => [oneRow(own!), oneRow(token!)]).toEqual([false, false])
  })

  it("centres its rows", async () => {
    const wrapper = await ElementFixture.render(
      `<div style="width: 1000px"><ui-cards centered><ui-card></ui-card></ui-cards></div>`
    )
    const card = rootOf(cardsOf(wrapper.querySelector("ui-cards")!)[0]!).getBoundingClientRect()
    expect(card.left - wrapper.getBoundingClientRect().left).toBeCloseTo((1000 - 290) / 2, 0)
  })

  it("lets a card leave its group:  no role, no group classes", async () => {
    const group = await render(`<ui-cards raised><ui-card header="Moving"></ui-card></ui-cards>`)
    const card = cardsOf(group)[0]!
    group.after(card)
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(card.matches(":state(in-cards)")).toBe(false)
    expect(card.internals.role).toBeNull()
    expect(rootOf(card).className).toBe("ui card")
  })
})

describe("<ui-card> keyboard", () => {
  it("is one Tab stop as a link card, followed with Enter", async () => {
    const wrapper = await ElementFixture.render(
      `<div><button>Before</button><ui-card href="#kristy" header="Kristy" description="Art director"></ui-card><ui-card header="Plain"></ui-card><button>After</button></div>`
    )
    const [before, after] = wrapper.querySelectorAll("button")
    const card = wrapper.querySelector("ui-card")!
    before!.focus()
    await Keys.tab()
    expect(card.shadowRoot!.activeElement).toBe(rootOf(card))
    expect(style(rootOf(card)).outlineStyle).toBe("solid")
    let followed = ""
    rootOf(card).addEventListener("click", (event) => {
      followed = (event.currentTarget as HTMLAnchorElement).hash
      event.preventDefault()
    })
    await userEvent.keyboard("{Enter}")
    expect(followed).toBe("#kristy")
    // a plain card is no stop
    await Keys.tab()
    expect(document.activeElement).toBe(after)
  })
})

describe("<ui-card> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.settle(root)
    await expectAccessible(root)
  })
})
