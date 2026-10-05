import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { PART_OWNER_TOKENS, type MessageDismissDetail } from "$/ui/components/components.types"
import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-message"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-icon"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-message/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one `<ui-message>`;  returns it with its root. */
async function message(html: string) {
  const host = await ElementFixture.render<UIHost>(html)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=message]")!
  return { host, root }
}

/** Part names of `root`'s children, in order. */
function partsOf(root: Element) {
  return [...root.children].map((child) => `${child.localName}.${child.getAttribute("part")}`)
}

describe("<ui-message> definition", () => {
  it("registers its texts with UI.i18n when DEFINED", async () => {
    await UI.load()
    expect(UI.i18n.t("dismiss")).toBe("Dismiss")
  })
})

describe("<ui-message> classes", () => {
  it.each([
    ["", "ui message"],
    ['size="small"', "ui small message"],
    ['size="medium"', "ui message"],
    ['color="teal"', "ui teal message"],
    ['state="negative"', "ui negative message"],
    ['state="warning" attached="bottom"', "ui warning bottom attached message"],
    ["attached", "ui attached message"],
    ['floating compact="yes" centered inverted', "ui centered compact floating inverted message"],
    ['floating="no"', "ui message"],
    ['text-align="right"', "ui right aligned message"],
    ['icon="envelope"', "ui message icon"]
  ])("<ui-message %s>", async (attributes, classes) => {
    const { root } = await message(`<ui-message ${attributes}>Text</ui-message>`)
    expect(root.localName).toBe("div")
    expect(root.className).toBe(classes)
  })

  it("adds `icon` for a slotted icon too, and drops it when the icon goes", async () => {
    const { host, root } = await message(`<ui-message><ui-icon slot="icon" name="envelope"></ui-icon>Mail</ui-message>`)
    expect(root.className).toBe("ui message icon")
    host.querySelector("ui-icon")!.remove()
    await expect.poll(() => root.className).toBe("ui message")
  })

  it("sets :state(inverted)", async () => {
    const { host } = await message(`<ui-message inverted>x</ui-message>`)
    expect(host.matches(":state(inverted)")).toBe(true)
  })
})

describe("<ui-message> content", () => {
  it("renders in contract order:  icon, content (header, slot), close", async () => {
    const { root } = await message(`<ui-message icon="envelope" header="Mail" dismissible>Body</ui-message>`)
    expect(partsOf(root)).toEqual(["span.icon", "div.content", "button.close"])
    const content = root.querySelector("[part~=content]")!
    expect(content.className).toBe("content")
    expect(partsOf(content)).toEqual(["div.header", "slot.null"])
    expect(content.querySelector(".header")!.textContent).toBe("Mail")
    const icon = root.querySelector("[part~=icon]")!
    expect(icon.className).toBe("icon")
    expect(icon.querySelector("slot")!.name).toBe("icon")
    await expect.poll(() => icon.querySelector("svg")).not.toBeNull()
    // the shorthand glyph sits inside the slot (a grandchild):  it must still be sized, not 0 x 0
    await expect.poll(() => icon.querySelector("svg")!.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it("ALWAYS renders the content block;  no icon box, header or close button unless asked", async () => {
    const { root } = await message(`<ui-message>Body</ui-message>`)
    expect(partsOf(root)).toEqual(["div.content"])
    expect(partsOf(root.firstElementChild!)).toEqual(["slot.null"])
  })

  it("names the close button with its translated text", async () => {
    const { root } = await message(`<ui-message dismissible>x</ui-message>`)
    const close = root.querySelector("button")!
    expect(close.type).toBe("button")
    expect(close.className).toBe("close icon")
    expect(close.getAttribute("aria-label")).toBe("Dismiss")
    await expect.poll(() => close.querySelector("svg")).not.toBeNull()
  })

  it("switches the owner layout token to `icon` with an icon, `block` without", async () => {
    const { root: plain } = await message(`<ui-message>x</ui-message>`)
    expect(getComputedStyle(plain).getPropertyValue(PART_OWNER_TOKENS.messageLayout).trim()).toBe("block")
    const { root: icon } = await message(`<ui-message icon="envelope">x</ui-message>`)
    expect(getComputedStyle(icon).getPropertyValue(PART_OWNER_TOKENS.messageLayout).trim()).toBe("icon")
  })
})

describe("<ui-message> tokens from outside", () => {
  /** The box's top-left radius. */
  function radius(root: Element): string {
    return getComputedStyle(root).borderTopLeftRadius
  }

  /** The root of the first `<ui-message>` in `wrapper`. */
  function rootIn(wrapper: Element): Element {
    return wrapper.querySelector("ui-message")!.shadowRoot!.querySelector("[part~=message]")!
  }

  it("takes a token set on the HOST", async () => {
    const { root } = await message(`<ui-message style="--ui-message-radius: 20px">Hi</ui-message>`)
    expect(radius(root)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-message-radius: 20px"><ui-message>Hi</ui-message></section>`
    )
    expect(radius(rootIn(wrapper))).toBe("20px")
  })

  it("takes a token set through `::part(message)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(message) { --ui-message-radius: 20px }</style><ui-message class="themed">Hi</ui-message></div>`
    )
    expect(radius(rootIn(wrapper))).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-message-radius", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-message-radius")
    })
    const { root } = await message(`<ui-message>Hi</ui-message>`)
    expect(radius(root)).toBe("20px")
  })

  it("`attached` squares its bottom corners, keeping the token's top ones", async () => {
    const { root } = await message(`<ui-message attached style="--ui-message-radius: 20px">Hi</ui-message>`)
    expect(radius(root)).toBe("20px")
    expect(getComputedStyle(root).borderBottomLeftRadius).toBe("0px")
  })

  it("owner tokens:  a header size set on the message or above it reaches a slotted header", async () => {
    const html = `<ui-message style="--ui-message-header-font-size: 30px"><ui-header>H</ui-header></ui-message>`
    const { host } = await message(html)
    const header = host.querySelector("ui-header")!.shadowRoot!.querySelector("[part~=header]")!
    expect(getComputedStyle(header).fontSize).toBe("30px")
    const above = await ElementFixture.render(
      `<section style="--ui-message-header-font-size: 30px"><ui-message><ui-header>H</ui-header></ui-message></section>`
    )
    const inner = above.querySelector("ui-header")!.shadowRoot!.querySelector("[part~=header]")!
    expect(getComputedStyle(inner).fontSize).toBe("30px")
  })

  it("`--ui-message-icon-align` moves an icon message's icon:  centred by default, `start` at the top", async () => {
    const body = `<ui-header>Tip</ui-header><p>One</p><p>Two</p><p>Three</p>`
    const { root } = await message(`<ui-message icon="envelope">${body}</ui-message>`)
    const icon = root.querySelector<HTMLElement>("[part~=icon]")!
    const content = root.querySelector<HTMLElement>("[part~=content]")!
    expect(getComputedStyle(icon).alignSelf).toBe("center")
    const middle = (box: DOMRect) => box.top + box.height / 2
    expect(middle(icon.getBoundingClientRect())).toBeCloseTo(middle(content.getBoundingClientRect()), 0)
    const top = await message(`<ui-message icon="envelope" style="--ui-message-icon-align: start">${body}</ui-message>`)
    const topIcon = top.root.querySelector<HTMLElement>("[part~=icon]")!
    const topContent = top.root.querySelector<HTMLElement>("[part~=content]")!
    expect(getComputedStyle(topIcon).alignSelf).toBe("start")
    expect(topIcon.getBoundingClientRect().top).toBeCloseTo(topContent.getBoundingClientRect().top, 0)
  })
})

describe("<ui-message> owner context", () => {
  it("owns a slotted <ui-header> and <ui-content>:  :state(in-message), the bare noun", async () => {
    const { host } = await message(
      `<ui-message><ui-header>Saved</ui-header><ui-content>Details</ui-content></ui-message>`
    )
    const header = host.querySelector("ui-header")!
    const content = host.querySelector("ui-content")!
    expect(header.matches(":state(in-message)")).toBe(true)
    expect(content.matches(":state(in-message)")).toBe(true)
    expect(header.shadowRoot!.querySelector("[part~=header]")!.className).toBe("header")
  })

  it("styles an owned header from the message:  bigger and bold, unlike a standalone one", async () => {
    const { host } = await message(`<ui-message><ui-header>Saved</ui-header></ui-message>`)
    const owned = host.querySelector("ui-header")!.shadowRoot!.querySelector<HTMLElement>("[part~=header]")!
    const body = Number.parseFloat(getComputedStyle(host.parentElement!).fontSize)
    expect(Number.parseFloat(getComputedStyle(owned).fontSize)).toBeCloseTo(body * 1.14285, 0)
    expect(Number(getComputedStyle(owned).fontWeight)).toBeGreaterThanOrEqual(700)
  })

  it("stops at a component in between:  a header in a segment in a message stays standalone", async () => {
    const { host } = await message(`<ui-message><ui-segment><ui-header>Inner</ui-header></ui-segment></ui-message>`)
    const header = host.querySelector("ui-header")!
    expect(header.matches(":state(in-message)")).toBe(false)
  })

  it("hands the owner over when a header moves out", async () => {
    const { host } = await message(`<ui-message><ui-header>Saved</ui-header></ui-message>`)
    const header = host.querySelector("ui-header")!
    host.after(header)
    await expect.poll(() => header.matches(":state(in-message)")).toBe(false)
  })
})

describe("<ui-message> dismiss", () => {
  it("dispatches a cancelable, composed ui-dismiss, then hides itself (never removes itself)", async () => {
    const { host, root } = await message(`<ui-message dismissible>x</ui-message>`)
    const events: CustomEvent<MessageDismissDetail>[] = []
    document.addEventListener("ui-dismiss", (event) => events.push(event as CustomEvent), { once: true })
    root.querySelector("button")!.click()
    expect(events).toHaveLength(1)
    const [event] = events
    expect(event!.target).toBe(host)
    expect(event!.cancelable).toBe(true)
    expect(event!.composed).toBe(true)
    expect(event!.bubbles).toBe(true)
    expect(event!.detail.originalEvent).toBeInstanceOf(MouseEvent)
    expect(host.hidden).toBe(true)
    expect(host.isConnected).toBe(true)
    expect(root.getBoundingClientRect().height).toBe(0)
  })

  it("stays visible when a handler cancels", async () => {
    const { host, root } = await message(`<ui-message dismissible>x</ui-message>`)
    host.addEventListener("ui-dismiss", (event) => event.preventDefault())
    root.querySelector("button")!.click()
    expect(host.hidden).toBe(false)
    expect(host.hasAttribute("hidden")).toBe(false)
  })
})

describe("<ui-message> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
