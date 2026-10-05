import { describe, expect, it } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/brand/components/ui-brand-color-set"

/** A set host, as tests use it. */
type SetHost = HTMLElement & { value: string | undefined; internals: ElementInternals }

/** A chip host, as tests use it. */
type ChipHost = HTMLElement & { selected: boolean; internals: ElementInternals }

/** The Color Set Chooser's presets, as chips. */
const PRESETS = `
  <ui-brand-color name="brand" value="#8E96B5"></ui-brand-color>
  <ui-brand-color name="accent" value="#F1E7D4"></ui-brand-color>
  <ui-brand-color name="violet" value="#6550CA"></ui-brand-color>
  <ui-brand-color name="teal" value="#14A39A"></ui-brand-color>
  <ui-brand-color name="rose" value="#E8436A"></ui-brand-color>
  <ui-brand-color name="amber" value="#F0A020"></ui-brand-color>`

/** Render a set;  returns it and its chips. */
async function render(html: string) {
  const host = await ElementFixture.render<SetHost>(html)
  await ElementFixture.settle()
  return { host, chips: [...host.querySelectorAll<ChipHost>("ui-brand-color")] }
}

/** The chip part of a chip host. */
function chipOf(chip: Element): HTMLElement {
  return chip.shadowRoot!.querySelector<HTMLElement>("[part~=chip]")!
}

/** `ui-change` values `host` dispatches from now on. */
function changes(host: Element): string[] {
  const values: string[] = []
  host.addEventListener("ui-change", (event) => values.push((event as CustomEvent<{ value: string }>).detail.value))
  return values
}

describe("<ui-brand-color-set>", () => {
  it("lays chips out in one row, each at its own size, shrinking alike when narrow", async () => {
    const { host, chips } = await render(`<ui-brand-color-set>${PRESETS}</ui-brand-color-set>`)
    const box = host.shadowRoot!.querySelector("[part~=set]")!
    expect([...box.classList]).toEqual(["set", "color", "brand"])
    const tops = chips.map((chip) => chip.getBoundingClientRect().top)
    expect(new Set(tops).size).toBe(1)
    expect(chipOf(chips[0]!).getBoundingClientRect().width).toBe(48)
    host.style.width = "120px"
    await ElementFixture.tick()
    const widths = chips.map((chip) => chipOf(chip).getBoundingClientRect().width)
    expect(widths.every((width) => width < 48 && Math.abs(width - widths[0]!) < 0.5)).toBe(true)
    await expectAccessible(host)
  })

  it("`columns`:  a grid of equal cells, chips filling them", async () => {
    const { host, chips } = await render(
      `<ui-brand-color-set columns="3" style="width: 316px; --ui-brand-color-set-gap: 8px">${PRESETS}</ui-brand-color-set>`
    )
    const box = host.shadowRoot!.querySelector("[part~=set]")!
    expect(box.classList.contains("grid")).toBe(true)
    const sizes = chips.map((chip) => chipOf(chip).getBoundingClientRect())
    expect(sizes.map((size) => size.width)).toEqual([100, 100, 100, 100, 100, 100])
    expect(sizes.map((size) => size.height)).toEqual([100, 100, 100, 100, 100, 100])
    expect(sizes[3]!.top).toBeGreaterThan(sizes[0]!.top)
  })

  it("`value` selects the chip it names, by name or by colour however written;  unset, chips keep their own", async () => {
    const { host, chips } = await render(`<ui-brand-color-set value="violet">${PRESETS}</ui-brand-color-set>`)
    expect(chips.map((chip) => chip.selected)).toEqual([false, false, true, false, false, false])
    host.value = "20 163 154"
    await ElementFixture.settle()
    expect(chips.map((chip) => chip.selected)).toEqual([false, false, false, true, false, false])
    expect(chipOf(chips[3]!).classList.contains("selected")).toBe(true)
    host.value = "#f0a020"
    await ElementFixture.settle()
    expect(chips.map((chip) => chip.selected)).toEqual([false, false, false, false, false, true])
    const { chips: own } = await render(`<ui-brand-color-set>
      <ui-brand-color value="#8E96B5"></ui-brand-color><ui-brand-color value="#6550CA" selected></ui-brand-color>
    </ui-brand-color-set>`)
    expect(own.map((chip) => chip.selected)).toEqual([false, true])
  })

  it("`selectable`:  a radio group of radios, one Tab stop, no buttons inside", async () => {
    const { host, chips } = await render(
      `<ui-brand-color-set selectable value="violet" aria-label="Presets">${PRESETS.replaceAll("<ui-brand-color ", "<ui-brand-color copy ")}</ui-brand-color-set>`
    )
    expect(host.internals.role).toBe("radiogroup")
    expect(chips.map((chip) => chip.internals.role)).toEqual(Array(6).fill("radio"))
    expect(chips.map((chip) => chip.internals.ariaChecked)).toEqual([
      "false",
      "false",
      "true",
      "false",
      "false",
      "false"
    ])
    expect(chips[0]!.internals.ariaLabel).toBe("brand #8E96B5")
    expect(chips.map((chip) => chip.tabIndex)).toEqual([-1, -1, 0, -1, -1, -1])
    expect(chips.map((chip) => chipOf(chip).localName)).toEqual(Array(6).fill("span"))
    expect(chips.every((chip) => chip.matches(":state(choice)"))).toBe(true)
    await expectAccessible(host)
  })

  it("a click chooses:  `ui-change`, then `value`, `selected` and the Tab stop move", async () => {
    const { host, chips } = await render(`<ui-brand-color-set selectable>${PRESETS}</ui-brand-color-set>`)
    expect(chips.map((chip) => chip.tabIndex)).toEqual([0, -1, -1, -1, -1, -1])
    const values = changes(host)
    chipOf(chips[4]!).click()
    await ElementFixture.settle()
    expect(values).toEqual(["rose"])
    expect(host.value).toBe("rose")
    expect(host.getAttribute("value")).toBe("rose")
    expect(chips.map((chip) => chip.selected)).toEqual([false, false, false, false, true, false])
    expect(chips.map((chip) => chip.tabIndex)).toEqual([-1, -1, -1, -1, 0, -1])
    expect(document.activeElement).toBe(chips[4])
    chipOf(chips[4]!).click()
    await ElementFixture.settle()
    expect(values).toEqual(["rose"])
  })

  it("the keyboard:  arrows move and choose (wrapping), Home / End, Space", async () => {
    const { host, chips } = await render(
      `<ui-brand-color-set selectable value="accent">${PRESETS}</ui-brand-color-set>`
    )
    const values = changes(host)
    chips[1]!.focus()
    await userEvent.keyboard("{ArrowRight}")
    await ElementFixture.settle()
    expect(document.activeElement).toBe(chips[2])
    expect(host.value).toBe("violet")
    await userEvent.keyboard("{End}")
    await ElementFixture.settle()
    await userEvent.keyboard("{ArrowDown}")
    await ElementFixture.settle()
    expect(document.activeElement).toBe(chips[0])
    await userEvent.keyboard("{ArrowLeft}")
    await ElementFixture.settle()
    await userEvent.keyboard("{Home}")
    await ElementFixture.settle()
    expect(values).toEqual(["violet", "amber", "brand", "amber", "brand"])
    expect(chips.map((chip) => chip.internals.ariaChecked)).toEqual([
      "true",
      "false",
      "false",
      "false",
      "false",
      "false"
    ])
  })

  it("a `ui-change` handler that re-sets `value` wins", async () => {
    const { host, chips } = await render(`<ui-brand-color-set selectable value="brand">${PRESETS}</ui-brand-color-set>`)
    host.addEventListener("ui-change", () => (host.value = "brand"))
    chipOf(chips[2]!).click()
    await ElementFixture.settle()
    expect(host.value).toBe("brand")
    expect(chips.map((chip) => chip.selected)).toEqual([true, false, false, false, false, false])
  })

  it("follows chips added and removed;  a chip that leaves is a plain chip again", async () => {
    const { host, chips } = await render(`<ui-brand-color-set selectable value="teal">${PRESETS}</ui-brand-color-set>`)
    const leaving = chips[0]!
    leaving.remove()
    document.body.append(leaving)
    const added = document.createElement("ui-brand-color")
    added.setAttribute("value", "#14A39A")
    added.setAttribute("name", "teal")
    host.prepend(added)
    await ElementFixture.settle()
    await ElementFixture.tick()
    expect(leaving.hasAttribute("tabindex")).toBe(false)
    expect((leaving as ChipHost).internals.role).toBeNull()
    expect(chipOf(leaving).getAttribute("role")).toBe("img")
    expect((added as ChipHost).selected).toBe(true)
    expect(chips[3]!.selected).toBe(false)
    leaving.remove()
  })
})
