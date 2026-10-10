import { describe, expect, test, vi } from "vite-plus/test"

import { A11y } from "$/ui/test/A11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { UI } from "$/ui/core"
import type { DOMElement, UIComponent } from "$/ui/elements"
import type { UISearch } from "$/ui/components/ui-search/UISearch"

import "$/ui/index"

/**
 * The shared states every element takes, though its vocabulary may not name them (`UIComponent`, "Shared states";
 * `SharedVocabulary`):  `disabled`, `loading`, `visible` (the platform's `hidden` turned round), `animation`, and the platform's `inert`.
 * - A family with no `disabled` of its own (`<ui-menu>`) is unusable the base class's way;
 *   one with its own keeps it (`elementSetup.disabled`).
 */

/** Render `html` and wait for it;  returns its first element. */
async function render(html: string): Promise<DOMElement & Record<string, any>> {
  const host = await ElementFixture.render<DOMElement & Record<string, any>>(html)
  await ElementFixture.settle(host.parentElement!)
  return host
}

/** The boxes at the top of `host`'s shadow root. */
function boxesOf(host: Element): HTMLElement[] {
  return [...host.shadowRoot!.children] as HTMLElement[]
}

/** The element that really has focus, through shadow roots. */
function focused(): Element | undefined {
  return UI.focus.activeElementDeep()
}

/** A menu of two links, with a button after it. */
const MENU = `
  <div>
    <ui-menu>
      <ui-item href="#a">A</ui-item>
      <ui-item href="#b">B</ui-item>
    </ui-menu>
    <button>After</button>
  </div>`

////////////////
// ## disabled
////////////////

describe("disabled, the base class's way (`elementSetup.disabled` = unusable)", () => {
  test("every element takes it:  :state(disabled), aria-disabled, its content inert, clicks swallowed", async () => {
    const menu = await render(`<ui-menu disabled><ui-item href="#a">A</ui-item></ui-menu>`)
    expect(menu.disabled).toBe(true)
    expect(menu.matches(":state(disabled)")).toBe(true)
    expect(menu.matches(":state(dimmed)")).toBe(true)
    expect(menu.internals.ariaDisabled).toBe("true")
    expect(menu.component!.isDisabled).toBe(true)
    expect(boxesOf(menu).every((box) => box.inert)).toBe(true)
    const clicked = vi.fn()
    menu.addEventListener("click", clicked)
    menu.click()
    expect(clicked).not.toHaveBeenCalled()
  })

  test("the content is dimmed, and comes back when re-enabled", async () => {
    const menu = await render(`<ui-menu disabled><ui-item href="#a">A</ui-item></ui-menu>`)
    expect(getComputedStyle(boxesOf(menu)[0]!).opacity).toBe("0.45")
    menu.disabled = false
    await ElementFixture.settle(menu)
    expect(menu.hasAttribute("disabled")).toBe(false)
    expect(menu.matches(":state(disabled)")).toBe(false)
    expect(menu.internals.ariaDisabled).toBe(null)
    expect(boxesOf(menu).some((box) => box.inert)).toBe(false)
    expect(getComputedStyle(boxesOf(menu)[0]!).opacity).toBe("1")
  })

  test("everything inside is inert:  a slotted link can't take focus", async () => {
    const menu = await render(`<ui-menu disabled><ui-item href="#a">A</ui-item></ui-menu>`)
    const item = menu.querySelector("ui-item")!
    item.shadowRoot!.querySelector<HTMLElement>("a")!.focus()
    expect(focused()).toBeUndefined()
  })

  test("focus inside moves on to the next focusable element", async () => {
    const wrapper = await render(MENU)
    const menu = wrapper.querySelector("ui-menu") as DOMElement & Record<string, any>
    const link = menu.querySelector("ui-item")!.shadowRoot!.querySelector<HTMLElement>("a")!
    link.focus()
    expect(focused()).toBe(link)
    menu.disabled = true
    await ElementFixture.settle(wrapper)
    expect(focused()).toBe(wrapper.querySelector("button"))
  })

  test("a disabled card's buttons can't be used either (Q26)", async () => {
    const card = await render(`<ui-card disabled><ui-button>Buy</ui-button></ui-card>`)
    expect(card.internals.ariaDisabled).toBe("true")
    expect(boxesOf(card).every((box) => box.inert)).toBe(true)
    const button = card.querySelector("ui-button")!.shadowRoot!.querySelector("button")!
    button.focus()
    expect(focused()).toBeUndefined()
  })

  test("is accessible:  disabled, and loading", async () => {
    await A11y.check(await render(MENU.replace("<ui-menu>", "<ui-menu disabled>")))
    await A11y.check(await render(MENU.replace("<ui-menu>", "<ui-menu loading>")))
    await A11y.check(await render(`<ui-card disabled><ui-button>Buy</ui-button></ui-card>`))
  })
})

describe("disabled, a family's own (`elementSetup.disabled` = its own)", () => {
  test("only a look:  :state(disabled), but usable, no aria-disabled, nothing inert", async () => {
    const icon = await render(`<ui-icon name="bell" disabled></ui-icon>`)
    expect(icon.matches(":state(disabled)")).toBe(true)
    expect(icon.component!.isDisabled).toBe(false)
    expect(icon.internals.ariaDisabled).toBe(null)
    expect(boxesOf(icon).some((box) => box.inert)).toBe(false)
  })

  test("a form control disables its native control, which stays in the accessibility tree", async () => {
    const input = await render(`<ui-input disabled label="Name"></ui-input>`)
    expect(input.matches(":state(disabled)")).toBe(true)
    expect(input.component!.isDisabled).toBe(true)
    expect(input.shadowRoot!.querySelector("input")!.disabled).toBe(true)
    expect(boxesOf(input).some((box) => box.inert)).toBe(false)
  })

  test("a <fieldset disabled> around a form control still disables it", async () => {
    const fieldset = await render(`<fieldset disabled><ui-checkbox label="Yes"></ui-checkbox></fieldset>`)
    const checkbox = fieldset.querySelector("ui-checkbox") as DOMElement
    await ElementFixture.settle(fieldset)
    expect(checkbox.matches(":state(disabled)")).toBe(true)
    expect(checkbox.component!.isDisabled).toBe(true)
  })
})

////////////////
// ## loading
////////////////

describe("loading", () => {
  test("the base class's loader:  :state(loading) and :state(busy), aria-busy, its content inert", async () => {
    const menu = await render(`<ui-menu loading><ui-item>A</ui-item></ui-menu>`)
    expect(menu.matches(":state(loading)")).toBe(true)
    expect(menu.matches(":state(busy)")).toBe(true)
    expect(menu.internals.ariaBusy).toBe("true")
    expect(boxesOf(menu).every((box) => box.inert)).toBe(true)
    // the spinner, over the menu's box
    expect(getComputedStyle(menu, "::after").content).toBe('""')
    menu.loading = false
    await ElementFixture.settle(menu)
    expect(menu.matches(":state(busy)")).toBe(false)
    expect(menu.internals.ariaBusy).toBe(null)
    expect(boxesOf(menu).some((box) => box.inert)).toBe(false)
  })

  test("disabled AND loading:  enabling it again drops aria-disabled, while it stays busy and inert", async () => {
    const menu = await render(`<ui-menu disabled loading><ui-item>A</ui-item></ui-menu>`)
    expect(menu.internals.ariaDisabled).toBe("true")
    menu.disabled = false
    await ElementFixture.settle(menu)
    expect(menu.internals.ariaDisabled).toBe(null)
    expect(menu.internals.ariaBusy).toBe("true")
    expect(boxesOf(menu).every((box) => box.inert)).toBe(true)
  })

  test("a family's own loader:  :state(loading) only from the base class", async () => {
    const button = await render(`<ui-button loading>Save</ui-button>`)
    expect(button.matches(":state(loading)")).toBe(true)
    expect(button.matches(":state(busy)")).toBe(false)
    expect(boxesOf(button).some((box) => box.inert)).toBe(false)
  })
})

////////////////
// ## readonly
////////////////

describe("readonly (form controls)", () => {
  test(":state(readonly), and a <ui-select> undoes a change", async () => {
    const select = await render(`
      <ui-select readonly value="a" label="Pick">
        <ui-item value="a">A</ui-item>
        <ui-item value="b">B</ui-item>
      </ui-select>`)
    expect(select.matches(":state(readonly)")).toBe(true)
    const native = select.shadowRoot!.querySelector("select")!
    expect(native.getAttribute("aria-readonly")).toBe("true")
    const changed = vi.fn()
    select.addEventListener("ui-change", changed)
    native.value = "b"
    native.dispatchEvent(new Event("change", { bubbles: true }))
    await ElementFixture.settle(select)
    expect(changed).not.toHaveBeenCalled()
    expect(native.value).toBe("a")
    expect(select.value).toBe("a")
  })

  test("a <ui-search>'s input is read-only, and its results never open", async () => {
    const search = await render(`<ui-search readonly></ui-search>`)
    expect(search.matches(":state(readonly)")).toBe(true)
    expect(search.shadowRoot!.querySelector("input")!.readOnly).toBe(true)
    expect((search.component as UISearch).requestOpen(true)).toBe(false)
  })
})

////////////////
// ## visible, hidden, animation, inert
////////////////

/** `host`'s component, for its shared members (`animationToRun`, `isHiding`). */
function componentOf(host: Element): UIComponent {
  return (host as DOMElement).component as UIComponent
}

/** `host`'s `hidden` and `visible` attributes as written:  `"hidden"`, `visible="false"` ... joined in that order. */
function writtenOf(host: Element): string {
  const hidden = host.getAttribute("hidden")
  const visible = host.getAttribute("visible")
  const words = [
    hidden === null ? undefined : hidden === "" ? "hidden" : `hidden="${hidden}"`,
    visible === null ? undefined : visible === "" ? "visible" : `visible="${visible}"`
  ]
  return words.filter(Boolean).join(" ")
}

/** Does `host` take up room on screen? */
function shows(host: Element): boolean {
  return getComputedStyle(host).display !== "none"
}

describe("visible and hidden:  one fact, two names", () => {
  // J57's first table:  markup as written, what the element makes of it, what shows
  test.each([
    ["<ui-message>Saved</ui-message>", "", true],
    ["<ui-message hidden>Saved</ui-message>", "hidden", false],
    ['<ui-message visible="false">Saved</ui-message>', 'hidden visible="false"', false],
    ["<ui-message hidden visible>Saved</ui-message>", 'hidden visible="false"', false],
    ["<ui-message visible hidden>Saved</ui-message>", 'hidden visible="false"', false],
    // a family that starts hidden (`elementSetup.visible`)
    ["<ui-transition>Saved</ui-transition>", "hidden", false],
    ["<ui-transition visible>Saved</ui-transition>", "visible", true]
  ])("markup %s:  after it draws %j;  shows:  %s", async (html, written, isShown) => {
    const host = await render(html)
    expect(writtenOf(host)).toBe(written)
    expect(host.visible).toBe(isShown)
    expect(host.hidden).toBe(!isShown)
    expect(shows(host)).toBe(isShown)
  })

  // J57's second table:  what a script sees on a <ui-message> that's showing
  test("el.hidden = true animates out;  el.visible reads false;  no `visible` attribute appears", async () => {
    const message = await render(`<ui-message>Saved</ui-message>`)
    const animate = vi.spyOn(UI.transitions, "animate")
    message.hidden = true
    expect(message.visible).toBe(false)
    expect(writtenOf(message)).toBe("hidden")
    await vi.waitFor(() => expect(animate).toHaveBeenCalledWith(expect.objectContaining({ direction: "out" })))
    await vi.waitFor(() => expect(shows(message)).toBe(false))
    animate.mockRestore()
  })

  test("el.visible = false animates out;  el.hidden reads true", async () => {
    const message = await render(`<ui-message>Saved</ui-message>`)
    const animate = vi.spyOn(UI.transitions, "animate")
    message.visible = false
    expect(message.hidden).toBe(true)
    expect(writtenOf(message)).toBe("hidden")
    await vi.waitFor(() =>
      expect(animate).toHaveBeenCalledWith(expect.objectContaining({ name: "fade", direction: "out" }))
    )
    await vi.waitFor(() => expect(message.matches(":state(hidden)")).toBe(true))
    expect(shows(message)).toBe(false)
    animate.mockRestore()
  })

  test('setAttribute("visible", "false") animates out and writes `hidden`;  removing `hidden` animates in', async () => {
    const message = await render(`<ui-message>Saved</ui-message>`)
    const animate = vi.spyOn(UI.transitions, "animate")
    message.setAttribute("visible", "false")
    expect(writtenOf(message)).toBe('hidden visible="false"')
    expect(message.hidden).toBe(true)
    await vi.waitFor(() => expect(shows(message)).toBe(false))

    message.removeAttribute("hidden")
    expect(writtenOf(message)).toBe("visible")
    expect(message.visible).toBe(true)
    await ElementFixture.settle(message)
    expect(animate).toHaveBeenLastCalledWith(expect.objectContaining({ name: "fade", direction: "in" }))
    expect(shows(message)).toBe(true)
    await vi.waitFor(() => expect(boxesOf(message)[0]!.hidden).toBe(false))
    animate.mockRestore()
  })

  test("while a hide animates, the element stays on screen (:state(hiding)), then hides", async () => {
    const message = await render(`<ui-message animation="scale">Saved</ui-message>`)
    message.visible = false
    await vi.waitFor(() => expect(message.matches(":state(hiding)")).toBe(true))
    expect(shows(message)).toBe(true)
    await vi.waitFor(() => expect(message.matches(":state(hiding)")).toBe(false))
    expect(message.matches(":state(hidden)")).toBe(true)
    expect(shows(message)).toBe(false)
  })

  test('a page\'s own `visible` text is kept while it agrees (`visible="yes"`)', async () => {
    const message = await render(`<ui-message visible="yes">Saved</ui-message>`)
    expect(writtenOf(message)).toBe('visible="yes"')
    message.hidden = true
    expect(writtenOf(message)).toBe('hidden visible="false"')
  })

  test("removing `visible` hands it back to the family:  a transition hides, a message stays shown", async () => {
    const transition = await render(`<ui-transition visible>x</ui-transition>`)
    transition.removeAttribute("visible")
    expect(transition.hidden).toBe(true)
    const message = await render(`<ui-message visible>x</ui-message>`)
    message.removeAttribute("visible")
    expect(message.hidden).toBe(false)
  })

  test('hidden="until-found" counts as hidden, stays the browser\'s, and never animates', async () => {
    const message = await render(`<ui-message>Saved</ui-message>`)
    const animate = vi.spyOn(UI.transitions, "animate")
    message.setAttribute("hidden", "until-found")
    expect(message.visible).toBe(false)
    expect(writtenOf(message)).toBe('hidden="until-found"')
    await ElementFixture.settle(message)
    expect(shows(message)).toBe(true)
    animate.mockRestore()
  })

  test("before it first draws:  at once, with no animation", async () => {
    const animate = vi.spyOn(UI.transitions, "animate")
    const message = await render(`<ui-message visible="false">Saved</ui-message>`)
    expect(message.matches(":state(hidden)")).toBe(true)
    expect(animate).not.toHaveBeenCalled()
    animate.mockRestore()
  })
})

describe("animation:  the first one that applies", () => {
  test('1. motion off:  the element\'s own `animation="none"` -- it hides at once', async () => {
    const message = await render(`<ui-message animation="none">Saved</ui-message>`)
    const animate = vi.spyOn(UI.transitions, "animate")
    expect(componentOf(message).animationToRun).toBe("none")
    message.visible = false
    await ElementFixture.settle(message)
    expect(message.matches(":state(hiding)")).toBe(false)
    expect(shows(message)).toBe(false)
    expect(animate).not.toHaveBeenCalled()
    animate.mockRestore()
  })

  test.each([
    ['<ui-root animation="none">', "</ui-root>"],
    ['<ui-segment animation="none">', "</ui-segment>"],
    ['<div style="--ui-motion: none">', "</div>"]
  ])("1. motion off:  `none` from around it (%s) beats its own `animation`", async (open, close) => {
    const outer = await render(`${open}<ui-message animation="scale">Saved</ui-message>${close}`)
    const message = outer.querySelector("ui-message")!
    await ElementFixture.settle(outer)
    expect(componentOf(message).animationToRun).toBe("none")
  })

  test("1. motion off:  the person's reduced-motion setting", async () => {
    const message = await render(`<ui-message animation="scale">Saved</ui-message>`)
    const reduced = vi.spyOn(UI.browser, "isReducedMotion", "get").mockReturnValue(true)
    expect(componentOf(message).animationToRun).toBe("none")
    reduced.mockRestore()
  })

  test("2. the element's own `animation` (attribute or property) beats its family's", async () => {
    const message = await render(`<ui-message animation="fly down">Saved</ui-message>`)
    const component = componentOf(message)
    Object.defineProperty(component, "elementSetup", { value: { ...component.elementSetup, animation: "scale" } })
    expect(component.animationToRun).toBe("fly down")
    message.animation = "slide up"
    expect(component.animationToRun).toBe("slide up")
    const animate = vi.spyOn(UI.transitions, "animate")
    message.visible = false
    await vi.waitFor(() => expect(animate).toHaveBeenCalledWith(expect.objectContaining({ name: "slide-up" })))
    animate.mockRestore()
  })

  test("3. its family's default, `elementSetup.animation`", async () => {
    const message = await render(`<ui-message>Saved</ui-message>`)
    const component = componentOf(message)
    Object.defineProperty(component, "elementSetup", { value: { ...component.elementSetup, animation: "scale" } })
    expect(component.animationToRun).toBe("scale")
  })

  test("4. `fade`, where neither says", async () => {
    const message = await render(`<ui-message>Saved</ui-message>`)
    expect(componentOf(message).animationToRun).toBe("fade")
  })

  test("`--ui-motion: none` stills a family's own CSS motion too (a sidebar's slide)", async () => {
    const outer = await render(
      `<div style="--ui-motion: none"><ui-pushable><ui-sidebar>Menu</ui-sidebar><ui-pusher>Page</ui-pusher></ui-pushable></div>`
    )
    await ElementFixture.settle(outer)
    const panel = outer.querySelector("ui-sidebar")!.shadowRoot!.querySelector<HTMLElement>("[part~=sidebar]")!
    expect(Number.parseFloat(getComputedStyle(panel).transitionDuration)).toBeLessThan(0.001)
  })
})

describe("hidden and inert, the platform's", () => {
  test("hidden hides any element, whatever its own display", async () => {
    const segment = await render(`<ui-segment hidden>Text</ui-segment>`)
    expect(getComputedStyle(segment).display).toBe("none")
    expect(boxesOf(segment)[0]!.checkVisibility()).toBe(false)
  })

  test("<ui-divider spacer> is Fomantic's hidden divider:  the spacing without the line", async () => {
    const divider = await render(`<ui-divider spacer></ui-divider>`)
    expect(getComputedStyle(divider).display).toBe("contents")
    expect(boxesOf(divider)[0]!.className).toBe("ui hidden divider")
  })

  test("inert is the platform's, unstyled:  overlays set it on what they cover, which has a look of its own", async () => {
    const segment = await render(`<ui-segment inert>Text</ui-segment>`)
    expect(segment.matches(":state(dimmed)")).toBe(false)
    expect(getComputedStyle(boxesOf(segment)[0]!).opacity).toBe("1")
  })
})
