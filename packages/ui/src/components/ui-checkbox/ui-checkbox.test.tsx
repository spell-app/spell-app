import { describe, expect, it, onTestFinished, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { OBSERVE } from "solid-js"
import { attribution } from "solid-js/attribution"

import { E } from "$/ui/core"
import type { FormHost } from "$/ui/elements"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"

import { UICheckbox } from "$/ui/components/ui-checkbox"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-checkbox/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A checkbox / radio host with its properties. */
type Check = FormHost & {
  selected: boolean
  checked: boolean
  indeterminate: boolean
  value: string
  checkable: string
  chosenValue: string | undefined
  unchosenValue: string | undefined
}

/** A subclass with class defaults for both values:  `<x-door>`, as the docs show it. */
class Door extends UICheckbox {
  @E.proto static onValue = "open"
  @E.proto static offValue = "closed"
}
Door.define("x-door")

/** Render one control;  returns the host, its root, input and label. */
async function check(html: string) {
  const host = await ElementFixture.render<Check>(html)
  return { host, ...parts(host) }
}

/** Pieces of a rendered checkbox / radio. */
function parts(host: Element) {
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=checkbox]")!
  return {
    root,
    input: root.querySelector<HTMLInputElement>("[part~=control]")!,
    label: root.querySelector<HTMLLabelElement>("[part~=label]")!
  }
}

/** Collect `detail`s of `ui-change`. */
function changes(host: Element) {
  const details: { selected: boolean; value: string; originalEvent?: Event }[] = []
  host.addEventListener("ui-change", (event) => details.push((event as CustomEvent).detail))
  return details
}

////////////////
// ## Classes
////////////////

describe("<ui-checkbox> classes", () => {
  it.each([
    ["", "ui checkbox"],
    ['size="large"', "ui large checkbox"],
    ['size="medium"', "ui checkbox"],
    ['color="red"', "ui red checkbox"],
    ['type="toggle"', "ui toggle checkbox"],
    ['type="slider" size="small" color="green"', "ui small green slider checkbox"],
    ["fitted invisible", "ui fitted invisible checkbox"],
    ["right-aligned", "ui right aligned checkbox"],
    ["readonly", "ui read-only checkbox"],
    ["disabled", "ui disabled checkbox"],
    ["inverted indeterminate", "ui indeterminate inverted checkbox"],
    ['fitted="no" disabled="yes"', "ui disabled checkbox"]
  ])("<ui-checkbox %s>", async (attributes, classes) => {
    const { root } = await check(`<ui-checkbox ${attributes}>Label</ui-checkbox>`)
    expect(root.className).toBe(classes)
  })

  it.each([
    ["", "ui radio checkbox"],
    ['type="toggle"', "ui toggle checkbox"],
    ['size="small" color="teal"', "ui small teal radio checkbox"]
  ])("<ui-radio %s>", async (attributes, classes) => {
    const { root, input } = await check(`<ui-radio ${attributes}>Label</ui-radio>`)
    expect(root.className).toBe(classes)
    expect(input.type).toBe("radio")
  })

  it("renders Fomantic's markup:  input, then a label for it around the slot", async () => {
    const { root, input, label } = await check(`<ui-checkbox label="Shorthand"></ui-checkbox>`)
    expect([...root.children].map((child) => child.localName)).toEqual(["input", "label"])
    expect(input.type).toBe("checkbox")
    expect(label.htmlFor).toBe(input.id)
    expect(label.querySelector("slot")!.textContent).toBe("Shorthand")
  })

  it("makes toggles and sliders switches", async () => {
    const { input } = await check(`<ui-checkbox type="toggle">Wifi</ui-checkbox>`)
    expect(input.getAttribute("role")).toBe("switch")
    const { input: plain } = await check(`<ui-checkbox>Wifi</ui-checkbox>`)
    expect(plain.hasAttribute("role")).toBe(false)
  })
})

////////////////
// ## Selected
////////////////

describe("<ui-checkbox> selected", () => {
  it("toggles on click, with ui-change first", async () => {
    const { host, input, label } = await check(`<ui-checkbox value="yes">Agree</ui-checkbox>`)
    const details = changes(host)
    label.click()
    await ElementFixture.tick()
    expect(host.selected).toBe(true)
    expect(host.checked).toBe(true)
    expect(input.checked).toBe(true)
    expect(host.matches(":state(selected)")).toBe(true)
    expect(details).toEqual([expect.objectContaining({ selected: true, value: "yes" })])
    expect(details[0]!.originalEvent).toBeInstanceOf(Event)
    input.click()
    await ElementFixture.tick()
    expect(host.selected).toBe(false)
    expect(details.at(-1)).toEqual(expect.objectContaining({ selected: false }))
  })

  it("toggles with Space", async () => {
    const { host, input } = await check(`<ui-checkbox>Agree</ui-checkbox>`)
    input.focus()
    await userEvent.keyboard(" ")
    await ElementFixture.tick()
    expect(host.selected).toBe(true)
  })

  it("follows the property and the `checked` alias (property and attribute)", async () => {
    const { host, input } = await check(`<ui-checkbox checked>Agree</ui-checkbox>`)
    await ElementFixture.tick()
    expect(host.selected).toBe(true)
    expect(input.checked).toBe(true)
    host.checked = false
    await ElementFixture.tick()
    expect(host.selected).toBe(false)
    expect(input.checked).toBe(false)
    host.selected = true
    await ElementFixture.tick()
    expect(host.checked).toBe(true)
    host.removeAttribute("checked")
    await ElementFixture.tick()
    expect(host.selected).toBe(false)
  })

  it("keeps the host's state when a ui-change handler re-sets it", async () => {
    const { host, input } = await check(`<ui-checkbox>Agree</ui-checkbox>`)
    host.addEventListener("ui-change", () => (host.selected = false))
    input.click()
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(host.selected).toBe(false)
    expect(input.checked).toBe(false)
  })

  it("readonly never changes", async () => {
    const { host, input } = await check(`<ui-checkbox readonly selected>Locked</ui-checkbox>`)
    const details = changes(host)
    input.click()
    await ElementFixture.tick()
    expect(host.selected).toBe(true)
    expect(input.checked).toBe(true)
    expect(details).toEqual([])
  })

  it("indeterminate:  a dash on the input, cleared by the user's click", async () => {
    const { host, input } = await check(`<ui-checkbox indeterminate>Some</ui-checkbox>`)
    expect(input.indeterminate).toBe(true)
    expect(host.matches(":state(indeterminate)")).toBe(true)
    input.click()
    await ElementFixture.tick()
    expect(host.indeterminate).toBe(false)
    expect(input.indeterminate).toBe(false)
    expect(host.selected).toBe(true)
  })

  it("disabled can't be clicked", async () => {
    const { host, input } = await check(`<ui-checkbox disabled>Off</ui-checkbox>`)
    expect(input.disabled).toBe(true)
    host.click()
    await ElementFixture.tick()
    expect(host.selected).toBe(false)
  })
})

////////////////
// ## Forms
////////////////

describe("<ui-checkbox> forms", () => {
  it("submits `value` (default `on`) while chosen, resets to the starting state", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-checkbox name="terms" selected>Terms</ui-checkbox>
      <ui-checkbox name="news" value="weekly">News</ui-checkbox>
      <ui-checkbox name="spam" checked value="lots">Spam</ui-checkbox>
    </form>`)
    await ElementFixture.tick()
    expect([...new FormData(form)]).toEqual([
      ["terms", "on"],
      ["spam", "lots"]
    ])
    const [terms, news] = form.querySelectorAll<Check>("ui-checkbox")
    parts(news!).input.click()
    terms!.selected = false
    await ElementFixture.tick()
    expect([...new FormData(form)]).toEqual([
      ["news", "weekly"],
      ["spam", "lots"]
    ])
    form.reset()
    await ElementFixture.tick()
    expect([...new FormData(form)]).toEqual([
      ["terms", "on"],
      ["spam", "lots"]
    ])
  })

  it("is left out when disabled by a fieldset", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><fieldset disabled><ui-checkbox name="a" selected>A</ui-checkbox></fieldset></form>`
    )
    await ElementFixture.tick()
    expect(new FormData(form).has("a")).toBe(false)
    expect(parts(form.querySelector("ui-checkbox")!).input.disabled).toBe(true)
  })

  it("`required` must be checked;  :state(invalid) only after interaction", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-checkbox name="terms" required>I agree to the terms</ui-checkbox></form>`
    )
    const host = form.querySelector<Check>("ui-checkbox")!
    expect(host.validity.valueMissing).toBe(true)
    expect(host.validationMessage).toBe("I agree to the terms must be checked")
    expect(host.matches(":state(invalid)")).toBe(false)
    form.reportValidity()
    await ElementFixture.tick()
    expect(host.matches(":state(invalid)")).toBe(true)
    parts(host).input.click()
    await ElementFixture.tick()
    expect(host.validity.valid).toBe(true)
    expect(host.matches(":state(invalid)")).toBe(false)
  })
})

describe("<ui-checkbox> off-value", () => {
  it("submits `off-value` while unchosen and `value` while chosen;  ui-change says which", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-checkbox type="toggle" name="panel" value="open" off-value="closed">Open</ui-checkbox></form>`
    )
    await ElementFixture.tick()
    const host = form.querySelector<Check>("ui-checkbox")!
    const details = changes(host)
    expect([...new FormData(form)]).toEqual([["panel", "closed"]])
    parts(host).input.click()
    await ElementFixture.tick()
    expect([...new FormData(form)]).toEqual([["panel", "open"]])
    parts(host).input.click()
    await ElementFixture.tick()
    expect([...new FormData(form)]).toEqual([["panel", "closed"]])
    expect(details.map(({ selected, value }) => ({ selected, value }))).toEqual([
      { selected: true, value: "open" },
      { selected: false, value: "closed" }
    ])
  })

  it("never satisfies `required`:  it still means chosen", async () => {
    const host = (await check(`<ui-checkbox name="terms" off-value="no" required>Terms</ui-checkbox>`)).host
    expect(host.validity.valueMissing).toBe(true)
    parts(host).input.click()
    await ElementFixture.tick()
    expect(host.validity.valid).toBe(true)
  })

  it("resets to the starting state's value", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-checkbox name="panel" value="open" off-value="closed" selected>Open</ui-checkbox></form>`
    )
    const host = form.querySelector<Check>("ui-checkbox")!
    host.selected = false
    await ElementFixture.tick()
    expect(new FormData(form).get("panel")).toBe("closed")
    form.reset()
    await ElementFixture.tick()
    expect(new FormData(form).get("panel")).toBe("open")
  })

  it("comes from a subclass's `@E.proto static` defaults;  the attributes still win", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><x-door name="front">Front</x-door><x-door name="back" value="ajar" off-value="shut">Back</x-door></form>`
    )
    await ElementFixture.tick()
    const [front, back] = form.querySelectorAll<Check>("x-door")
    expect([front!.chosenValue, front!.unchosenValue, back!.chosenValue, back!.unchosenValue]).toEqual([
      "open",
      "closed",
      "ajar",
      "shut"
    ])
    expect([...new FormData(form)]).toEqual([
      ["front", "closed"],
      ["back", "shut"]
    ])
    parts(front!).input.click()
    await ElementFixture.tick()
    expect(new FormData(form).get("front")).toBe("open")
  })

  it("leaves boxes without one, and radios, as they were:  nothing while unchosen", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-checkbox name="news">News</ui-checkbox><ui-radio name="plan" value="pro">Pro</ui-radio></form>`
    )
    await ElementFixture.tick()
    const [news, plan] = form.querySelectorAll<Check>("ui-checkbox, ui-radio")
    expect([...new FormData(form)]).toEqual([])
    expect([news!.chosenValue, news!.unchosenValue, plan!.chosenValue, plan!.unchosenValue]).toEqual([
      "on",
      undefined,
      "pro",
      undefined
    ])
  })
})

////////////////
// ## Labels
////////////////

describe("<ui-checkbox> labels", () => {
  it("names a fitted box from <label for> across the shadow boundary;  clicking that label toggles", async () => {
    const container = await ElementFixture.render<HTMLDivElement>(
      `<div><label for="agree">Agree</label><ui-checkbox id="agree" fitted></ui-checkbox></div>`
    )
    const host = container.querySelector<Check>("ui-checkbox")!
    const { input } = parts(host)
    expect([...host.labels]).toEqual([container.querySelector("label")])
    await expect.poll(() => input.getAttribute("aria-label")).toBe("Agree")
    container.querySelector("label")!.click()
    await ElementFixture.tick()
    expect(host.selected).toBe(true)
    await expectAccessible(container)
  })

  it("names from slotted text, never overriding it", async () => {
    const { input } = await check(`<ui-checkbox aria-label="Ignored">Visible text</ui-checkbox>`)
    expect(input.hasAttribute("aria-label")).toBe(false)
  })
})

////////////////
// ## <ui-radio> groups
////////////////

describe("<ui-radio> groups", () => {
  /** Three radios of one name in a form. */
  const GROUP = `<form>
    <ui-radio name="size" value="s">Small</ui-radio>
    <ui-radio name="size" value="m" selected>Medium</ui-radio>
    <ui-radio name="size" value="l">Large</ui-radio>
    <ui-radio name="other" value="x">Other group</ui-radio>
  </form>`

  it("chooses one per name:  choosing another unchooses the rest, only it fires ui-change", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(GROUP)
    await ElementFixture.tick()
    const [small, medium, large, other] = form.querySelectorAll<Check>("ui-radio")
    const mediumChanges = changes(medium!)
    const largeChanges = changes(large!)
    expect(new FormData(form).get("size")).toBe("m")
    parts(large!).label.click()
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect([small!.selected, medium!.selected, large!.selected]).toEqual([false, false, true])
    expect(largeChanges).toEqual([expect.objectContaining({ selected: true, value: "l" })])
    expect(mediumChanges).toEqual([])
    expect([...new FormData(form)]).toEqual([["size", "l"]])
    parts(other!).input.click()
    await ElementFixture.tick()
    expect(large!.selected).toBe(true)
    expect(new FormData(form).get("other")).toBe("x")
    expect(other!.checkable).toBe("radio")
  })

  it("renders its tab stops consistently:  no `EFFECT_RELAY_TEAR` (a frame against stale membership)", async () => {
    // the relay detector lives in Solid's attribution engine (dev only)
    attribution.enable()
    const events = OBSERVE!.diagnostics.capture()
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    try {
      const form = await ElementFixture.render<HTMLFormElement>(GROUP)
      await ElementFixture.tick()
      const radios = [...form.querySelectorAll<Check>("ui-radio[name=size]")]
      radios[2]!.selected = true
      await ElementFixture.tick()
      const tears = events.stop().filter((event) => event.code === "EFFECT_RELAY_TEAR")
      expect(tears.map((event) => event.message)).toEqual([])
    } finally {
      attribution.disable()
      warn.mockRestore()
      info.mockRestore()
    }
  })

  it("has one tab stop:  the chosen radio, else the first enabled one", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(GROUP)
    await ElementFixture.tick()
    const radios = [...form.querySelectorAll<Check>("ui-radio[name=size]")]
    await expect.poll(() => radios.map((radio) => parts(radio).input.tabIndex)).toEqual([-1, 0, -1])
    radios[1]!.selected = false
    await ElementFixture.tick()
    await expect.poll(() => radios.map((radio) => parts(radio).input.tabIndex)).toEqual([0, -1, -1])
  })

  it("arrow keys move the choice (and focus) through the group, wrapping, skipping disabled", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-radio name="n" value="a" selected>A</ui-radio>
      <ui-radio name="n" value="b" disabled>B</ui-radio>
      <ui-radio name="n" value="c">C</ui-radio>
    </form>`)
    await ElementFixture.tick()
    const [a, b, c] = form.querySelectorAll<Check>("ui-radio")
    parts(a!).input.focus()
    await userEvent.keyboard("{ArrowDown}")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect([a!.selected, b!.selected, c!.selected]).toEqual([false, false, true])
    expect(c!.shadowRoot!.activeElement).toBe(parts(c!).input)
    await userEvent.keyboard("{ArrowRight}")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(a!.selected).toBe(true)
    await userEvent.keyboard("{ArrowUp}")
    await ElementFixture.tick()
    expect(c!.selected).toBe(true)
  })

  it("arrow keys never change a readonly group", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-radio name="n" value="a" selected readonly>A</ui-radio>
      <ui-radio name="n" value="b" readonly>B</ui-radio>
    </form>`)
    await ElementFixture.tick()
    const [a, b] = form.querySelectorAll<Check>("ui-radio")
    const detailsA = changes(a!)
    const detailsB = changes(b!)
    parts(a!).input.focus()
    await userEvent.keyboard("{ArrowDown}")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect([a!.selected, b!.selected]).toEqual([true, false])
    expect([...detailsA, ...detailsB]).toEqual([])
  })

  it("groups by root node outside a form, and regroups on rename", async () => {
    const container = await ElementFixture.render<HTMLDivElement>(`<div>
      <ui-radio name="g" value="1" selected>One</ui-radio><ui-radio name="g" value="2">Two</ui-radio>
    </div>`)
    await ElementFixture.tick()
    const [one, two] = container.querySelectorAll<Check>("ui-radio")
    two!.selected = true
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(one!.selected).toBe(false)
    two!.setAttribute("name", "h")
    await ElementFixture.tick()
    one!.selected = true
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(two!.selected).toBe(true)
  })

  it("`required` on one member requires a choice in the group", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-radio name="plan" value="free" required>Free</ui-radio><ui-radio name="plan" value="pro">Pro</ui-radio>
    </form>`)
    await ElementFixture.tick()
    const [free, pro] = form.querySelectorAll<Check>("ui-radio")
    expect(form.checkValidity()).toBe(false)
    expect(pro!.validity.valueMissing).toBe(true)
    pro!.selected = true
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(free!.validity.valid).toBe(true)
    expect(form.checkValidity()).toBe(true)
  })

  it("resets the group to its starting choice", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(GROUP)
    await ElementFixture.tick()
    const [small] = form.querySelectorAll<Check>("ui-radio")
    parts(small!).input.click()
    await ElementFixture.tick()
    expect(new FormData(form).get("size")).toBe("s")
    form.reset()
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(new FormData(form).get("size")).toBe("m")
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-checkbox> tokens from outside", () => {
  /** The drawn box's top-left radius, which `--ui-checkbox-radius` drives. */
  function radius(host: Element): string {
    return getComputedStyle(parts(host).label, "::before").borderTopLeftRadius
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await check(`<ui-checkbox style="--ui-checkbox-radius: 6px">A</ui-checkbox>`)
    expect(radius(host)).toBe("6px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-checkbox-radius: 6px"><div><ui-checkbox>A</ui-checkbox></div></section>`
    )
    expect(radius(wrapper.querySelector("ui-checkbox")!)).toBe("6px")
  })

  it("takes a token set through `::part(checkbox)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(checkbox) { --ui-checkbox-radius: 6px }</style><ui-checkbox class="themed">A</ui-checkbox></div>`
    )
    expect(radius(wrapper.querySelector("ui-checkbox")!)).toBe("6px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-checkbox-radius", "6px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-checkbox-radius")
    })
    const { host } = await check(`<ui-checkbox>A</ui-checkbox>`)
    expect(radius(host)).toBe("6px")
  })

  it("variations:  `inverted` swaps the label colour for its own token", async () => {
    const red = "rgb(255, 0, 0)"
    const { label: plain } = await check(`<ui-checkbox style="--ui-checkbox-label-color: ${red}">A</ui-checkbox>`)
    expect(getComputedStyle(plain).color).toBe(red)
    const { label: inverted } = await check(
      `<ui-checkbox inverted style="--ui-checkbox-label-color: ${red}">A</ui-checkbox>`
    )
    expect(getComputedStyle(inverted).color).not.toBe(red)
    const { label: themed } = await check(
      `<ui-checkbox inverted style="--ui-checkbox-inverted-color: ${red}">A</ui-checkbox>`
    )
    expect(getComputedStyle(themed).color).toBe(red)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-checkbox> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})
