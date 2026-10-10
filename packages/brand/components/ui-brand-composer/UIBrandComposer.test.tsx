import { describe, expect, it, vi } from "vite-plus/test"

import { UI, type DOMElement } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/brand/components/ui-brand-composer"

////////////////
// ## Fixtures
////////////////

/** `<ui-brand-composer>`'s DOM element. */
type ComposerDOMElement = HTMLElement & { value?: string; casting?: boolean; disabled?: boolean; cast(): boolean }

/** One event the composer dispatched. */
type Fired = { type: string; value: string }

////////////////
// ## Helpers
////////////////

/** A part of `host`'s shadow root. */
function part<T extends HTMLElement = HTMLElement>(host: Element, name: string): T {
  return host.shadowRoot!.querySelector<T>(`[part~="${name}"]`)!
}

/** The text box. */
function box(host: Element): HTMLTextAreaElement {
  return part<HTMLTextAreaElement>(host, "textarea")
}

/** The Cast button. */
function button(host: Element): HTMLButtonElement {
  return part<HTMLButtonElement>(host, "cast")
}

/** `ui-input` / `ui-change` / `ui-cast` events from `host`, in order. */
function record(host: Element): Fired[] {
  const fired: Fired[] = []
  for (const type of ["ui-input", "ui-change", "ui-cast"]) {
    host.addEventListener(type, (event) => fired.push({ type, value: (event as CustomEvent).detail.value }))
  }
  return fired
}

/** Type `text` into the text box (one `input` event, as a paste is). */
function type(host: Element, text: string) {
  const control = box(host)
  control.value = text
  control.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
}

/** Key `key` in the text box;  returns whether it was let through (not `preventDefault()`ed). */
function key(host: Element, key: string, init: KeyboardEventInit = {}): boolean {
  return box(host).dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true, ...init })
  )
}

/** Render a composer. */
async function composer(html: string): Promise<ComposerDOMElement> {
  return ElementFixture.render<ComposerDOMElement>(html)
}

////////////////
// ## The card
////////////////

describe("<ui-brand-composer> card", () => {
  it("renders the card:  text box (3 rows, the placeholder), the platform's hint, a named Cast button", async () => {
    const host = await composer(`<ui-brand-composer></ui-brand-composer>`)
    expect([...part(host, "composer").classList]).toEqual(["brand", "composer"])
    expect({
      rows: box(host).rows,
      placeholder: box(host).placeholder,
      label: box(host).getAttribute("aria-label")
    }).toEqual({ rows: 3, placeholder: "Describe what you want to build…", label: "Your spell" })
    const apple = UI.browser.isApple
    expect(part(host, "hint").textContent).toBe(apple ? "⌘↵ to cast" : "Ctrl+↵ to cast")
    expect(box(host).getAttribute("aria-describedby")).toBe(part(host, "hint").id)
    expect(box(host).getAttribute("aria-keyshortcuts")).toBe(apple ? "Meta+Enter" : "Control+Enter")
    expect(button(host).getAttribute("aria-label")).toBe("Cast spell")
    expect(button(host).type).toBe("button")
    await vi.waitFor(() => expect(button(host).querySelector("svg")).not.toBeNull())
    expect(host.shadowRoot!.querySelector('[part~="eyebrow"]')).toBeNull()
    expect(host.shadowRoot!.querySelector('[part~="tools"]')).toBeNull()
    await expectAccessible(host)
  })

  it("looks like the brand's box:  serif 17px text, `--ui-radius-l` corners, a 36px round button", async () => {
    // the `spell-brand` theme's large radius
    const host = await composer(
      `<ui-brand-composer value="A habit tracker" style="--ui-radius-l: 16px"></ui-brand-composer>`
    )
    const text = getComputedStyle(box(host))
    expect(text.fontSize).toBe("17px")
    expect(text.borderTopWidth).toBe("0px")
    expect(getComputedStyle(part(host, "composer")).borderTopLeftRadius).toBe("16px")
    const cast = button(host).getBoundingClientRect()
    expect([cast.width, cast.height]).toEqual([36, 36])
    expect(getComputedStyle(button(host)).borderTopLeftRadius).toBe("50%")
  })

  it('`size="large"` is the hero\'s box:  19px text, 20px radius, a 38px button', async () => {
    const host = await composer(`<ui-brand-composer size="large" style="--ui-radius-l: 16px"></ui-brand-composer>`)
    expect([...part(host, "composer").classList]).toEqual(["brand", "large", "composer"])
    expect(getComputedStyle(box(host)).fontSize).toBe("19px")
    expect(getComputedStyle(part(host, "composer")).borderTopLeftRadius).toBe("20px")
    expect(button(host).getBoundingClientRect().width).toBe(38)
  })

  it('`placeholder`, `rows`, `label` and `hint`;  `placeholder=""` and `hint=""` show none', async () => {
    const host = await composer(
      `<ui-brand-composer placeholder="Say it" rows="2" label="Your app" hint="Enter twice"></ui-brand-composer>`
    )
    expect({
      rows: box(host).rows,
      placeholder: box(host).placeholder,
      label: box(host).getAttribute("aria-label")
    }).toEqual({ rows: 2, placeholder: "Say it", label: "Your app" })
    expect(part(host, "hint").textContent).toBe("Enter twice")
    const bare = await composer(`<ui-brand-composer placeholder="" hint=""></ui-brand-composer>`)
    expect(box(bare).placeholder).toBe("")
    expect(bare.shadowRoot!.querySelector('[part~="hint"]')).toBeNull()
    expect(box(bare).hasAttribute("aria-describedby")).toBe(false)
  })

  it("grows with its text from `rows` lines", async () => {
    const host = await composer(`<ui-brand-composer rows="2"></ui-brand-composer>`)
    const lineHeight = Number.parseFloat(getComputedStyle(box(host)).lineHeight)
    expect(box(host).getBoundingClientRect().height).toBeCloseTo(2 * lineHeight, 0)
    type(host, "one\ntwo\nthree\nfour")
    await ElementFixture.tick()
    expect(box(host).getBoundingClientRect().height).toBeCloseTo(4 * lineHeight, 0)
  })

  it('`eyebrow`:  a line above the box, which also names it;  `slot="eyebrow"` is the rich version', async () => {
    const host = await composer(`<ui-brand-composer eyebrow="Try a spell"></ui-brand-composer>`)
    expect(part(host, "eyebrow").textContent).toBe("Try a spell")
    expect(getComputedStyle(part(host, "eyebrow")).textTransform).toBe("uppercase")
    expect(box(host).getAttribute("aria-label")).toBe("Try a spell")
    const rich = await composer(`<ui-brand-composer label="Spell"><b slot="eyebrow">Rich</b></ui-brand-composer>`)
    expect(part(rich, "eyebrow").querySelector("slot")!.assignedElements()[0]!.textContent).toBe("Rich")
    await expectAccessible(host)
  })

  it("the `tools` slot sits in the bar, before the hint;  the Cast button at the far end", async () => {
    const host = await composer(`<ui-brand-composer style="width: 600px">
      <button slot="tools" type="button">English</button>
    </ui-brand-composer>`)
    const tools = part(host, "tools")
    expect(tools.querySelector("slot")!.assignedElements()).toHaveLength(1)
    expect(tools.nextElementSibling).toBe(part(host, "hint"))
    const bar = part(host, "bar").getBoundingClientRect()
    expect(button(host).getBoundingClientRect().right).toBeCloseTo(bar.right, 0)
    await expectAccessible(host)
  })
})

////////////////
// ## Typing and casting
////////////////

describe("<ui-brand-composer> casting", () => {
  it("typing:  `ui-input` per keystroke, `host.value` follows;  leaving it edited:  `ui-change`", async () => {
    const host = await composer(`<ui-brand-composer></ui-brand-composer>`)
    const fired = record(host)
    type(host, "A")
    type(host, "A book club")
    await ElementFixture.tick()
    expect(host.value).toBe("A book club")
    expect(host.matches(":state(empty)")).toBe(false)
    box(host).dispatchEvent(new Event("change", { bubbles: true }))
    expect(fired).toEqual([
      { type: "ui-input", value: "A" },
      { type: "ui-input", value: "A book club" },
      { type: "ui-change", value: "A book club" }
    ])
  })

  it("a `ui-input` handler that re-sets `value` wins;  an outside set redraws without events", async () => {
    const host = await composer(`<ui-brand-composer value="Habits"></ui-brand-composer>`)
    host.addEventListener("ui-input", () => (host.value = "Habits"), { once: true })
    type(host, "Hab")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(host.value).toBe("Habits")
    expect(box(host).value).toBe("Habits")
    const fired = record(host)
    host.value = "Dinner RSVP"
    await ElementFixture.tick()
    expect(box(host).value).toBe("Dinner RSVP")
    expect(fired).toEqual([])
  })

  it("Cmd+Enter or Ctrl+Enter casts;  plain Enter types a newline", async () => {
    const host = await composer(`<ui-brand-composer value="A habit tracker"></ui-brand-composer>`)
    const fired = record(host)
    expect(key(host, "Enter")).toBe(true)
    expect(key(host, "Enter", { shiftKey: true })).toBe(true)
    expect(fired).toEqual([])
    expect(key(host, "Enter", { metaKey: true })).toBe(false)
    expect(key(host, "Enter", { ctrlKey: true })).toBe(false)
    expect(key(host, "Enter", { metaKey: true, isComposing: true })).toBe(true)
    expect(fired).toEqual([
      { type: "ui-cast", value: "A habit tracker" },
      { type: "ui-cast", value: "A habit tracker" }
    ])
  })

  it("the Cast button casts;  with blank text it's dimmed, `aria-disabled` and casts nothing", async () => {
    const host = await composer(`<ui-brand-composer value="  "></ui-brand-composer>`)
    const fired = record(host)
    expect(host.matches(":state(empty)")).toBe(true)
    expect(button(host).getAttribute("aria-disabled")).toBe("true")
    expect(button(host).disabled).toBe(false)
    expect(getComputedStyle(button(host)).opacity).toBe("0.5")
    button(host).click()
    key(host, "Enter", { metaKey: true })
    expect(fired).toEqual([])
    type(host, "Book club")
    await ElementFixture.tick()
    expect(button(host).hasAttribute("aria-disabled")).toBe(false)
    button(host).click()
    expect(fired).toEqual([
      { type: "ui-input", value: "Book club" },
      { type: "ui-cast", value: "Book club" }
    ])
  })

  it("`cast()` casts what the page just set:  the hero's idea chips fill the box and cast", async () => {
    const host = await composer(`<ui-brand-composer></ui-brand-composer>`)
    const fired = record(host)
    expect(host.cast()).toBe(false)
    host.value = "Guests reply yes, no or maybe."
    expect(host.cast()).toBe(true)
    expect(fired).toEqual([{ type: "ui-cast", value: "Guests reply yes, no or maybe." }])
  })

  it("`casting`:  the button spins, the card is busy, it's announced, and casting waits", async () => {
    const host = await composer(`<ui-brand-composer value="Habits"></ui-brand-composer>`)
    const fired = record(host)
    host.casting = true
    expect(host.cast()).toBe(false)
    await ElementFixture.tick()
    expect(host.matches(":state(casting)")).toBe(true)
    expect([...part(host, "composer").classList]).toContain("casting")
    expect(part(host, "composer").getAttribute("aria-busy")).toBe("true")
    expect(button(host).getAttribute("aria-disabled")).toBe("true")
    expect(button(host).querySelector(".icon.spin")).not.toBeNull()
    const status = host.shadowRoot!.querySelector('[role="status"]')!
    expect(status.textContent).toBe("Casting your spell…")
    expect(box(host).disabled).toBe(false)
    button(host).click()
    key(host, "Enter", { metaKey: true })
    expect(fired).toEqual([])
    host.casting = false
    await ElementFixture.tick()
    expect(status.textContent).toBe("")
    expect(button(host).querySelector(".icon.spin")).toBeNull()
    expect(host.cast()).toBe(true)
  })

  it("`disabled`:  faded, the box and button disabled, nothing casts", async () => {
    const host = await composer(`<ui-brand-composer value="Habits" disabled></ui-brand-composer>`)
    const fired = record(host)
    expect(host.matches(":state(disabled)")).toBe(true)
    expect(box(host).disabled).toBe(true)
    expect(button(host).disabled).toBe(true)
    expect(host.cast()).toBe(false)
    expect(fired).toEqual([])
  })
})

////////////////
// ## Form control and fallback
////////////////

describe("<ui-brand-composer> form", () => {
  it("in a `<form>`:  submits `value` under `name` on cast;  `preventDefault()` on `ui-cast` stops it", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-brand-composer name="spell" value="A habit tracker"></ui-brand-composer></form>`
    )
    const host = form.querySelector<ComposerDOMElement>("ui-brand-composer")!
    const submitted: (string | null)[] = []
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      submitted.push(new FormData(form).get("spell") as string | null)
    })
    expect(new FormData(form).get("spell")).toBe("A habit tracker")
    key(host, "Enter", { metaKey: true })
    expect(submitted).toEqual(["A habit tracker"])
    host.addEventListener("ui-cast", (event) => event.preventDefault(), { once: true })
    button(host).click()
    expect(submitted).toEqual(["A habit tracker"])
    button(host).click()
    expect(submitted).toEqual(["A habit tracker", "A habit tracker"])
  })

  it("form reset goes back to the `value` attribute", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-brand-composer name="spell" value="Habits"></ui-brand-composer></form>`
    )
    const host = form.querySelector<ComposerDOMElement>("ui-brand-composer")!
    type(host, "Book club")
    await ElementFixture.tick()
    expect(new FormData(form).get("spell")).toBe("Book club")
    form.reset()
    await ElementFixture.tick()
    expect(host.value).toBe("Habits")
    expect(box(host).value).toBe("Habits")
    expect(new FormData(form).get("spell")).toBe("Habits")
  })

  it("`required`:  fails while nothing (or only blank) is written", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-brand-composer name="spell" required></ui-brand-composer></form>`
    )
    const host = form.querySelector<ComposerDOMElement>("ui-brand-composer")!
    await ElementFixture.tick()
    expect(form.checkValidity()).toBe(false)
    type(host, "   ")
    await ElementFixture.tick()
    expect(form.checkValidity()).toBe(false)
    type(host, "Book club")
    await ElementFixture.tick()
    expect(form.checkValidity()).toBe(true)
  })

  it("takes its name from a `<label for>`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><label for="spell">Describe your app</label><ui-brand-composer id="spell"></ui-brand-composer></div>`
    )
    const host = wrapper.querySelector("ui-brand-composer")!
    await ElementFixture.tick()
    expect(box(host).getAttribute("aria-label")).toBe("Describe your app")
  })

  it("falls back to a native text box and button when its render breaks, still casting and a form control", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-brand-composer name="spell" value="Habits"></ui-brand-composer></form>`
    )
    const host = form.querySelector<ComposerDOMElement & DOMElement>("ui-brand-composer")!
    await ElementFixture.breakRender(host)
    expect(host.matches(":state(errored)")).toBe(true)
    const control = host.shadowRoot!.querySelector<HTMLTextAreaElement>("textarea")!
    expect(control.value).toBe("Habits")
    const fired = record(host)
    const submitted: unknown[] = []
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      submitted.push(new FormData(form).get("spell"))
    })
    control.value = "Book club"
    control.dispatchEvent(new Event("input", { bubbles: true }))
    expect(host.value).toBe("Book club")
    host.shadowRoot!.querySelector<HTMLButtonElement>('[part~="cast"]')!.click()
    expect(fired).toEqual([
      { type: "ui-input", value: "Book club" },
      { type: "ui-cast", value: "Book club" }
    ])
    expect(submitted).toEqual(["Book club"])
  })
})
