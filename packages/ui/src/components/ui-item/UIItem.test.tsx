import type { JSX } from "@solidjs/web"
import { describe, expect, it } from "vite-plus/test"

import type { ItemContext, ItemOwner } from "$/ui/components/components.types"
import { UIComponent, type AttributeValues, type UIComponentClass, type DOMElement } from "$/ui/elements"
import type { ComponentVocabulary } from "$/ui/vocabulary"
import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-item"
import "$/ui/components/ui-parts"

/**
 * `<ui-item>` on its own:  unowned (the dropdown's data item), and owned by a stand-in OWNER implementing
 * `ItemOwner` -- the list and menu test their own looks and roles.
 */

/** The stand-in owner's vocabulary:  it owns items and headers. */
const OWNER_VOCABULARY = {
  tag: "x-item-owner",
  noun: "owner",
  attributes: [
    { name: "interactive", kind: "boolean", description: "Items are buttons." },
    { name: "item-role", kind: "string", description: "Role of each item box." },
    { name: "element-role", kind: "string", description: "Role of each item's DOM element." }
  ],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: [],
  ownsParts: ["item", "header"]
} as const satisfies ComponentVocabulary

/** Its sheet:  a look only an item owned by it gets. */
const OWNER_CSS = ":host(:state(in-owner)) > .item { letter-spacing: 3px }"

/** A minimal `ItemOwner`:  its attributes say what the items render. */
class ItemTestOwner extends UIComponent<typeof OWNER_VOCABULARY> implements ItemOwner {
  itemContext(): ItemContext {
    return {
      domElementRole: this.elementRole,
      role: this.itemRole as ItemContext["role"],
      interactive: this.interactive,
      current: "page"
    }
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass}>
        <slot />
      </div>
    )
  }
}
/** The vocabulary getters, typed (`UIComponent`'s doc). */
interface ItemTestOwner extends AttributeValues<typeof OWNER_VOCABULARY> {}
Object.defineProperty(ItemTestOwner.prototype, "vocabulary", { value: OWNER_VOCABULARY })
Object.defineProperty(ItemTestOwner.prototype, "styleSheets", { value: { "x-item-owner": OWNER_CSS } })
;(ItemTestOwner as unknown as UIComponentClass & typeof UIComponent).define(OWNER_VOCABULARY.tag)

/** Render items inside a stand-in owner;  returns the owner and the item DOM elements. */
async function owned(items: string, attributes = "") {
  const owner = await ElementFixture.render<DOMElement>(`<x-item-owner ${attributes}>${items}</x-item-owner>`)
  return { owner, items: [...owner.querySelectorAll<DOMElement>(":scope > ui-item")] }
}

/** An item's box. */
function boxOf(item: Element): HTMLElement {
  return item.shadowRoot!.querySelector<HTMLElement>("[part~=item]")!
}

////////////////
// ## Unowned
////////////////

describe("<ui-item> unowned", () => {
  it("renders only its slot:  a dropdown reads it as data", async () => {
    const item = await ElementFixture.render<DOMElement>(`<ui-item value="a" selected>Apple</ui-item>`)
    expect(item.shadowRoot!.innerHTML).toBe("<slot></slot>")
    expect(item.internals.role).toBeNull()
    expect(item.matches(":state(selected)")).toBe(true)
    expect((item.component as unknown as { focusTarget?: HTMLElement }).focusTarget).toBeUndefined()
  })
})

////////////////
// ## Owned
////////////////

describe("<ui-item> owned", () => {
  it.each([
    ["", "div", "item"],
    ['href="#a"', "a", "item"],
    ["link", "button", "link item"],
    ["selected", "div", "active item"],
    ['selected="no"', "div", "item"],
    ["active", "div", "active item"],
    ['active="no"', "div", "item"],
    ['color="red" selected', "div", "red active item ui-red"],
    ['position="right"', "div", "right item"],
    ["fitted", "div", "fitted item"],
    ['fitted="vertically"', "div", "vertically fitted item"],
    ["disabled", "div", "disabled item"],
    ['type="header"', "div", "item header"]
  ])("<ui-item %s> => <%s class=%s>", async (attributes, tag, classes) => {
    const { items } = await owned(`<ui-item ${attributes}>X</ui-item>`)
    const box = boxOf(items[0]!)
    expect(box.localName).toBe(tag)
    expect(box.className).toBe(classes)
    expect(items[0]!.matches(":state(in-owner)")).toBe(true)
  })

  it("renders buttons when the owner says items are interactive, with its roles", async () => {
    const { owner, items } = await owned(`<ui-item>X</ui-item><ui-item href="#y">Y</ui-item>`, "interactive")
    expect(boxOf(items[0]!).localName).toBe("button")
    expect(boxOf(items[0]!).getAttribute("type")).toBe("button")
    expect(boxOf(items[1]!).localName).toBe("a")
    owner.setAttribute("item-role", "menuitem")
    owner.setAttribute("element-role", "none")
    await expect.poll(() => boxOf(items[0]!).getAttribute("role")).toBe("menuitem")
    expect(items[0]!.internals.role).toBe("none")
    owner.removeAttribute("interactive")
    await expect.poll(() => boxOf(items[0]!).localName).toBe("div")
  })

  it("says aria-current:  the owner's value on a link, `true` otherwise", async () => {
    const { items } = await owned(`<ui-item href="#a" selected>A</ui-item><ui-item link selected>B</ui-item>`)
    expect(boxOf(items[0]!).getAttribute("aria-current")).toBe("page")
    expect(boxOf(items[1]!).getAttribute("aria-current")).toBe("true")
  })

  it("forwards the DOM element's aria-expanded to a button box only, and follows it", async () => {
    const { items } = await owned(
      `<ui-item link aria-expanded="false">A</ui-item><ui-item href="#b" aria-expanded="true">B</ui-item>`
    )
    expect(boxOf(items[0]!).getAttribute("aria-expanded")).toBe("false")
    expect(boxOf(items[1]!).hasAttribute("aria-expanded")).toBe(false)
    items[0]!.setAttribute("aria-expanded", "true")
    await expect.poll(() => boxOf(items[0]!).getAttribute("aria-expanded")).toBe("true")
  })

  it("disables:  no href, aria-disabled;  a disabled button", async () => {
    const { items } = await owned(`<ui-item href="#a" disabled>A</ui-item><ui-item link disabled>B</ui-item>`)
    expect(boxOf(items[0]!).hasAttribute("href")).toBe(false)
    expect(boxOf(items[0]!).getAttribute("aria-disabled")).toBe("true")
    expect((boxOf(items[1]!) as HTMLButtonElement).disabled).toBe(true)
    expect(items[1]!.matches(":state(disabled)")).toBe(true)
  })

  it("renders a divider, the value as data-value, the image and icon shorthands, the DOM element's aria-label", async () => {
    const { items } = await owned(
      `<ui-item type="divider"></ui-item>` +
        `<ui-item value="7" image="data:," icon="house" aria-label="Home">X</ui-item>`
    )
    const divider = items[0]!.shadowRoot!.firstElementChild!
    expect(divider.className).toBe("divider")
    expect(divider.getAttribute("role")).toBe("separator")
    const box = boxOf(items[1]!)
    expect(box.dataset.value).toBe("7")
    expect(box.getAttribute("aria-label")).toBe("Home")
    const image = box.querySelector<HTMLImageElement>("[part~=image]")!
    expect(image.className).toBe("ui avatar image")
    expect(image.getAttribute("alt")).toBe("")
    await (await UI.load()).icons.get("house")
    await expect.poll(() => box.querySelector("[part~=icon] svg")).not.toBeNull()
    // the shorthand's glyph is the slot's fallback:  sized all the same
    expect(box.querySelector("[part~=icon] svg")!.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(getComputedStyle(box).getPropertyValue("--_ui-item-media").trim()).toBe("1")
  })

  it("adopts its owner's sheet", async () => {
    const { items } = await owned(`<ui-item>X</ui-item>`)
    expect(getComputedStyle(boxOf(items[0]!)).letterSpacing).toBe("3px")
  })

  it("goes back to data (a bare slot) when moved out of its owner", async () => {
    const { items } = await owned(`<ui-item>X</ui-item>`)
    document.body.append(items[0]!)
    await expect.poll(() => items[0]!.shadowRoot!.innerHTML).toBe("<slot></slot>")
    expect(items[0]!.matches(":state(in-owner)")).toBe(false)
    items[0]!.remove()
  })

  it("exposes its box as focusTarget", async () => {
    const { items } = await owned(`<ui-item link>X</ui-item>`)
    const component = items[0]!.component as unknown as { focusTarget?: HTMLElement }
    expect(component.focusTarget).toBe(boxOf(items[0]!))
  })

  it("is transparent to parts:  a header inside it belongs to the owner", async () => {
    const { owner } = await owned(`<ui-item><ui-header>Title</ui-header></ui-item>`)
    const header = owner.querySelector<DOMElement>("ui-header")!
    await expect.poll(() => header.matches(":state(in-owner)")).toBe(true)
  })

  it("keeps elements inside it alive when its box changes tag", async () => {
    const { owner } = await owned(`<ui-item><ui-header>Title</ui-header></ui-item>`)
    const header = owner.querySelector<DOMElement>("ui-header")!
    owner.setAttribute("interactive", "")
    await expect.poll(() => boxOf(owner.querySelector("ui-item")!).localName).toBe("button")
    header.setAttribute("href", "#title")
    await expect.poll(() => header.shadowRoot!.querySelector("[part~=header]")!.localName).toBe("a")
  })

  it("passes axe", async () => {
    const { owner } = await owned(
      `<ui-item href="#a" selected>A</ui-item><ui-item link>B</ui-item><ui-item>C</ui-item>`,
      'element-role="listitem"'
    )
    owner.setAttribute("role", "list")
    await expectAccessible(owner)
  })
})
