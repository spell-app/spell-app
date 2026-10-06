import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import type { FormHost } from "$/ui/elements"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-rating"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-rating/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A rating host with its properties. */
type Rating = FormHost & { value: number | undefined; disabled: boolean; readonly: boolean }

/** Render one rating;  returns the host and its pieces. */
async function rating(html: string) {
  const host = await ElementFixture.render<Rating>(html)
  await ElementFixture.tick()
  return { host, ...parts(host) }
}

/** Pieces of a rendered rating. */
function parts(host: Element) {
  const group = host.shadowRoot!.querySelector<HTMLFieldSetElement>("[part~=rating]")!
  return {
    group,
    icons: [...group.querySelectorAll<HTMLLabelElement>("[part~=icon]")],
    radios: [...group.querySelectorAll<HTMLInputElement>("[part~=control]")]
  }
}

/** Collect `detail.value`s of `ui-change`. */
function changes(host: Element) {
  const values: number[] = []
  host.addEventListener("ui-change", (event) => values.push((event as CustomEvent).detail.value))
  return values
}

/** Wait for writes and the effects they trigger. */
async function settle() {
  await ElementFixture.tick()
  await ElementFixture.tick()
}

////////////////
// ## Rendering
////////////////

describe("<ui-rating> markup", () => {
  it.each([
    ["", "ui rating"],
    ['size="large" color="yellow"', "ui large yellow rating"],
    ["readonly", "ui read-only rating"],
    ["disabled", "ui disabled rating"]
  ])("<ui-rating %s>", async (attributes, classes) => {
    const { group } = await rating(`<ui-rating ${attributes} aria-label="R"></ui-rating>`)
    expect(group.className).toBe(classes)
  })

  it("is a named radio group of `max-rating` radios, each named `n of max`", async () => {
    const { group, radios, icons } = await rating(`<ui-rating max-rating="5" aria-label="Quality"></ui-rating>`)
    expect(group.localName).toBe("fieldset")
    expect(group.getAttribute("role")).toBe("radiogroup")
    expect(group.getAttribute("aria-label")).toBe("Quality")
    expect(radios).toHaveLength(5)
    expect(radios.map((radio) => radio.getAttribute("aria-label"))).toEqual([
      "1 of 5",
      "2 of 5",
      "3 of 5",
      "4 of 5",
      "5 of 5"
    ])
    expect(new Set(radios.map((radio) => radio.name)).size).toBe(1)
    // the glyph loads asynchronously the first time (`UI.icons`)
    await expect.poll(() => icons.every((icon) => icon.querySelector("svg"))).toBe(true)
  })

  it("fills the first `value` icons and checks that radio;  Fomantic's default is 4 icons", async () => {
    const { icons, radios } = await rating(`<ui-rating value="3" aria-label="R"></ui-rating>`)
    expect(icons.map((icon) => icon.className)).toEqual(["active icon", "active icon", "active icon", "icon"])
    expect(radios.map((radio) => radio.checked)).toEqual([false, false, true, false])
  })

  it("draws a fraction as a partial icon, described in words, with no radio checked", async () => {
    const { icons, radios, group } = await rating(`<ui-rating value="2.5" aria-label="R"></ui-rating>`)
    expect(icons[2]!.className).toBe("active partial icon")
    expect(icons[2]!.style.getPropertyValue("--full")).toBe("50%")
    await expect.poll(() => icons[2]!.querySelectorAll("svg").length).toBe(2)
    expect(radios.some((radio) => radio.checked)).toBe(false)
    expect(group.getAttribute("aria-description")).toBe("Rated 2.5 of 4")
  })

  it("draws the icon named by `icon`", async () => {
    const { icons: stars } = await rating(`<ui-rating aria-label="R"></ui-rating>`)
    const { icons: hearts } = await rating(`<ui-rating icon="heart" aria-label="R"></ui-rating>`)
    await expect.poll(() => hearts[0]!.querySelector("path")?.getAttribute("d")).toBeTruthy()
    await expect.poll(() => stars[0]!.querySelector("path")?.getAttribute("d")).toBeTruthy()
    expect(hearts[0]!.querySelector("path")!.getAttribute("d")).not.toBe(
      stars[0]!.querySelector("path")!.getAttribute("d")
    )
  })
})

////////////////
// ## Behaviour
////////////////

describe("<ui-rating> choosing", () => {
  it("chooses on click, with ui-change first", async () => {
    const { host, icons, radios } = await rating(`<ui-rating aria-label="R"></ui-rating>`)
    const values = changes(host)
    icons[2]!.click()
    await settle()
    expect(host.value).toBe(3)
    expect(values).toEqual([3])
    expect(radios[2]!.checked).toBe(true)
    expect(parts(host).icons.map((icon) => icon.classList.contains("active"))).toEqual([true, true, true, false])
  })

  it("keeps the host's value when a ui-change handler re-sets it", async () => {
    const { host, icons, radios } = await rating(`<ui-rating value="1" aria-label="R"></ui-rating>`)
    host.addEventListener("ui-change", () => (host.value = 1))
    icons[3]!.click()
    await settle()
    expect(host.value).toBe(1)
    expect(radios.map((radio) => radio.checked)).toEqual([true, false, false, false])
  })

  it("`clearable`:  the current rating clicked again clears;  a single icon always toggles", async () => {
    const { host, icons } = await rating(`<ui-rating value="2" clearable aria-label="R"></ui-rating>`)
    const values = changes(host)
    icons[1]!.click()
    await settle()
    expect(host.value).toBe(0)
    expect(values).toEqual([0])
    const { host: single, icons: one } = await rating(`<ui-rating max-rating="1" aria-label="Like"></ui-rating>`)
    one[0]!.click()
    await settle()
    expect(single.value).toBe(1)
    one[0]!.click()
    await settle()
    expect(single.value).toBe(0)
  })

  it("without `clearable`, clicking the current rating keeps it", async () => {
    const { host, icons } = await rating(`<ui-rating value="2" aria-label="R"></ui-rating>`)
    icons[1]!.click()
    await settle()
    expect(host.value).toBe(2)
  })

  it("previews a choice under the pointer", async () => {
    const { host, icons, group } = await rating(`<ui-rating value="1" aria-label="R"></ui-rating>`)
    await userEvent.hover(icons[2]!)
    await settle()
    expect(parts(host).icons.map((icon) => icon.classList.contains("selected"))).toEqual([true, true, true, false])
    expect(group.classList.contains("selected")).toBe(true)
    await userEvent.unhover(icons[2]!)
    await userEvent.hover(document.body)
    await settle()
    expect(group.classList.contains("selected")).toBe(false)
  })

  it("readonly:  nothing changes it, by click or key", async () => {
    const { host, icons, radios, group } = await rating(`<ui-rating readonly value="2" aria-label="R"></ui-rating>`)
    const values = changes(host)
    expect(group.getAttribute("aria-readonly")).toBe("true")
    icons[3]!.click()
    radios[1]!.focus()
    await userEvent.keyboard("{ArrowRight}{End}")
    await settle()
    expect(host.value).toBe(2)
    expect(values).toEqual([])
    expect(radios.map((radio) => radio.checked)).toEqual([false, true, false, false])
  })

  it("disabled:  a disabled fieldset, out of the tab order;  clicks do nothing", async () => {
    const { host, icons, group, radios } = await rating(`<ui-rating disabled value="1" aria-label="R"></ui-rating>`)
    expect(group.disabled).toBe(true)
    expect(radios[0]!.matches(":disabled")).toBe(true)
    icons[3]!.click()
    await settle()
    expect(host.value).toBe(1)
    expect(host.matches(":state(disabled)")).toBe(true)
  })
})

describe("<ui-rating> keyboard", () => {
  it("is one Tab stop:  the chosen radio", async () => {
    const container = await ElementFixture.render(
      `<div><button>Before</button><ui-rating value="3" aria-label="R"></ui-rating><button>After</button></div>`
    )
    await ElementFixture.tick()
    const host = container.querySelector<Rating>("ui-rating")!
    container.querySelector("button")!.focus()
    await Keys.tab()
    expect(host.shadowRoot!.activeElement).toBe(parts(host).radios[2])
    await Keys.tab()
    expect(document.activeElement).toBe(container.querySelectorAll("button")[1])
  })

  it("`focus()` goes to the tab stop, as Tab does", async () => {
    const { host, radios } = await rating(`<ui-rating value="3" aria-label="R"></ui-rating>`)
    host.focus()
    expect(host.shadowRoot!.activeElement).toBe(radios[2])
    const { host: empty, radios: none } = await rating(`<ui-rating aria-label="R"></ui-rating>`)
    empty.focus()
    expect(empty.shadowRoot!.activeElement).toBe(none[0])
  })

  it("arrows move and choose (wrapping);  Home / End jump", async () => {
    const { host, radios } = await rating(`<ui-rating value="2" aria-label="R"></ui-rating>`)
    const values = changes(host)
    radios[1]!.focus()
    await userEvent.keyboard("{ArrowRight}")
    await settle()
    expect(host.value).toBe(3)
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}")
    await settle()
    expect(host.value).toBe(1)
    await userEvent.keyboard("{ArrowLeft}")
    await settle()
    expect(host.value).toBe(4)
    await userEvent.keyboard("{Home}")
    await settle()
    expect(host.value).toBe(1)
    expect(host.shadowRoot!.activeElement).toBe(radios[0])
    await userEvent.keyboard("{End}")
    await settle()
    expect(host.value).toBe(4)
    expect(values).toEqual([3, 2, 1, 4, 1, 4])
  })

  it("Backspace / Delete clear a clearable rating only", async () => {
    const { host, radios } = await rating(`<ui-rating value="2" clearable aria-label="R"></ui-rating>`)
    radios[1]!.focus()
    await userEvent.keyboard("{Backspace}")
    await settle()
    expect(host.value).toBe(0)
    expect(radios.some((radio) => radio.checked)).toBe(false)
    const { host: fixed, radios: fixedRadios } = await rating(`<ui-rating value="2" aria-label="R"></ui-rating>`)
    fixedRadios[1]!.focus()
    await userEvent.keyboard("{Delete}")
    await settle()
    expect(fixed.value).toBe(2)
  })
})

////////////////
// ## Forms
////////////////

describe("<ui-rating> forms", () => {
  it("submits the rating (nothing at 0), resets to the attribute", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-rating name="food" value="3" aria-label="Food"></ui-rating>
      <ui-rating name="service" aria-label="Service"></ui-rating>
    </form>`)
    await settle()
    expect([...new FormData(form)]).toEqual([["food", "3"]])
    const [food, service] = form.querySelectorAll<Rating>("ui-rating")
    parts(service!).icons[1]!.click()
    food!.value = 1
    await settle()
    expect([...new FormData(form)]).toEqual([
      ["food", "1"],
      ["service", "2"]
    ])
    form.reset()
    await settle()
    expect([...new FormData(form)]).toEqual([["food", "3"]])
    expect(parts(food!).radios[2]!.checked).toBe(true)
  })

  it("is left out when disabled by a fieldset", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><fieldset disabled><ui-rating name="r" value="2" aria-label="R"></ui-rating></fieldset></form>`
    )
    await settle()
    expect(new FormData(form).has("r")).toBe(false)
    expect(parts(form.querySelector("ui-rating")!).group.disabled).toBe(true)
  })

  it("`required` needs a rating;  :state(invalid) only after interaction", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-rating name="r" required aria-label="Stars"></ui-rating></form>`
    )
    await settle()
    const host = form.querySelector<Rating>("ui-rating")!
    expect(host.validity.valueMissing).toBe(true)
    expect(host.matches(":state(invalid)")).toBe(false)
    form.reportValidity()
    await settle()
    expect(host.matches(":state(invalid)")).toBe(true)
    parts(host).icons[0]!.click()
    await settle()
    expect(host.validity.valid).toBe(true)
    expect(host.matches(":state(invalid)")).toBe(false)
  })

  it("restores a saved state (back / forward cache, autofill)", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-rating name="r" aria-label="R"></ui-rating></form>`
    )
    const host = form.querySelector<Rating & { formStateRestoreCallback(state: unknown, mode: string): void }>(
      "ui-rating"
    )!
    host.formStateRestoreCallback("3", "restore")
    await settle()
    expect(host.value).toBe(3)
    expect(new FormData(form).get("r")).toBe("3")
  })

  it("is named by a <label for> across the shadow boundary", async () => {
    const container = await ElementFixture.render(
      `<div><label for="stars">Stars</label><ui-rating id="stars"></ui-rating></div>`
    )
    const host = container.querySelector<Rating>("ui-rating")!
    await expect.poll(() => parts(host).group.getAttribute("aria-label")).toBe("Stars")
    await expectAccessible(container)
  })
})

////////////////
// ## Tokens
////////////////

describe("<ui-rating> tokens from outside", () => {
  /** The first icon's width, which `--ui-rating-icon-width` drives. */
  function iconWidth(host: Element): string {
    return getComputedStyle(parts(host).icons[0]!).width
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await rating(`<ui-rating max="3" style="--ui-rating-icon-width: 40px"></ui-rating>`)
    expect(iconWidth(host)).toBe("40px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-rating-icon-width: 40px"><div><ui-rating max="3"></ui-rating></div></section>`
    )
    expect(iconWidth(wrapper.querySelector("ui-rating")!)).toBe("40px")
  })

  it("takes a token set through `::part(rating)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(rating) { --ui-rating-icon-width: 40px }</style><ui-rating class="themed" max="3"></ui-rating></div>`
    )
    expect(iconWidth(wrapper.querySelector("ui-rating")!)).toBe("40px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-rating-icon-width", "40px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-rating-icon-width")
    })
    const { host } = await rating(`<ui-rating max="3"></ui-rating>`)
    expect(iconWidth(host)).toBe("40px")
  })

  it("keeps its defaults when nothing is set", async () => {
    const { host } = await rating(`<ui-rating max="3"></ui-rating>`)
    expect(iconWidth(host)).toBe("20px")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-rating> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})
