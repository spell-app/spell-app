import { describe, expect, it } from "vitest"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"
import { Palette, STEPS, type Scale, type Step } from "$/brand"

import "$/brand/components/ui-brand-color-range"

/** A range host, as tests use it. */
type RangeHost = HTMLElement & {
  value: string | undefined
  anchor: string
  vibrancy: number
  hueShift: number
  name: string | undefined
  readonly scale: Scale | undefined
  readonly anchorStep: Step | undefined
  css(format?: "hex" | "oklch"): string
}

/** A chip host in a range. */
type ChipHost = HTMLElement & { value: string; name: string; selected: boolean }

/** Render a range;  returns it and its chips. */
async function render(html: string) {
  const host = await ElementFixture.render<RangeHost>(html)
  await ElementFixture.settle(host.parentElement!)
  await ElementFixture.settle(host.shadowRoot as unknown as Element)
  return { host, chips: chipsOf(host) }
}

/** The chips in `host`'s shadow root. */
function chipsOf(host: Element): ChipHost[] {
  return [...host.shadowRoot!.querySelectorAll<ChipHost>("ui-brand-color")]
}

/** `ui-change` details `host` dispatches from now on. */
function changes(host: Element) {
  const details: { value: string; scale: Scale; anchor: Step }[] = []
  host.addEventListener("ui-change", (event) => details.push((event as CustomEvent).detail))
  return details
}

describe("<ui-brand-color-range>", () => {
  it("draws the 17 steps of `Palette.generateScale()`, named, numbered, the base colour's ringed", async () => {
    const { host, chips } = await render(`<ui-brand-color-range value="#8E96B5" name="brand"></ui-brand-color-range>`)
    const { scale, anchor } = Palette.generateScale("#8E96B5")
    expect(chips).toHaveLength(17)
    expect(chips.map((chip) => chip.value)).toEqual(STEPS.map((step) => scale[step]))
    expect(chips.map((chip) => chip.name)).toEqual(STEPS.map((step) => `brand-${step}`))
    expect(chips.filter((chip) => chip.selected).map((chip) => chip.name)).toEqual([`brand-${anchor}`])
    const numbers = [...host.shadowRoot!.querySelectorAll("[part~=number]")].map((number) => number.textContent)
    expect(numbers).toEqual(STEPS.map(String))
    const list = host.shadowRoot!.querySelector("ol")!
    expect(list.getAttribute("aria-label")).toBe("brand:  17 shades of #8E96B5")
    // the chips fill their columns
    const width = list.getBoundingClientRect().width
    const chip = chips[0]!.shadowRoot!.querySelector("[part~=chip]")!.getBoundingClientRect()
    expect(chip.width).toBeCloseTo((width - 16 * 4) / 17, 0)
    expect(chip.height).toBeCloseTo(chip.width, 0)
    await expectAccessible(host)
  })

  it("puts the base colour exactly on `anchor`;  `auto` picks the nearest step", async () => {
    const { host, chips } = await render(
      `<ui-brand-color-range value="#6550CA" anchor="600" name="violet"></ui-brand-color-range>`
    )
    expect(host.anchorStep).toBe(600)
    expect(chips[STEPS.indexOf(600)]!.value).toBe("#6550CA")
    expect(chips[STEPS.indexOf(600)]!.selected).toBe(true)
    host.anchor = "auto"
    expect(host.anchorStep).toBe(Palette.nearestStep(Palette.hexToOklch("#6550CA").l))
  })

  it("`vibrancy` and `hue-shift` bend the ladder", async () => {
    const { chips } = await render(
      `<ui-brand-color-range value="#14A39A" vibrancy="60" hue-shift="20"></ui-brand-color-range>`
    )
    const { scale } = Palette.generateScale("#14A39A", { chromaScale: 0.6, hueShift: 20 })
    expect(chips.map((chip) => chip.value)).toEqual(STEPS.map((step) => scale[step]))
    expect(chips[0]!.name).toBe("color-25")
  })

  it("`scale`, `anchorStep` and `css()`:  right straight after a write", async () => {
    const { host } = await render(`<ui-brand-color-range value="#8E96B5" name="Brand Set"></ui-brand-color-range>`)
    host.value = "#6550CA"
    host.anchor = "600"
    const { scale } = Palette.generateScale("#6550CA", { anchor: 600 })
    expect(host.scale).toEqual(scale)
    expect(host.anchorStep).toBe(600)
    const css = host.css()
    expect(css.split("\n").slice(0, 3)).toEqual([
      ":root {",
      "  /* brand-set — seed #6550CA @ 600 */",
      `  --brand-set-25: ${scale[25]};`
    ])
    expect(css.split("\n")).toHaveLength(20)
    expect(css.endsWith(`  --brand-set-975: ${scale[975]};\n}`)).toBe(true)
    expect(host.css("oklch")).toContain(`  --brand-set-600: ${Palette.format("#6550CA", "oklch")};`)
    host.value = "not a colour"
    expect(host.scale).toBeUndefined()
    expect(host.css()).toBe("")
  })

  it("`ui-change` when the colours change, not on first render, not for a new `name`", async () => {
    const { host } = await render(`<ui-brand-color-range value="#8E96B5"></ui-brand-color-range>`)
    const details = changes(host)
    await ElementFixture.tick()
    expect(details).toEqual([])
    host.vibrancy = 140
    await ElementFixture.tick()
    expect(details).toHaveLength(1)
    const { scale, anchor } = Palette.generateScale("#8E96B5", { chromaScale: 1.4 })
    expect(details[0]).toEqual({ value: "#8E96B5", scale, anchor })
    host.name = "brand"
    await ElementFixture.tick()
    expect(details).toHaveLength(1)
    expect(chipsOf(host)[0]!.name).toBe("brand-25")
  })

  it("hands `label`, `contrast`, `copy` and `details` to every chip", async () => {
    const { chips } = await render(
      `<ui-brand-color-range value="#8E96B5" label="hex" contrast copy="token" details></ui-brand-color-range>`
    )
    for (const chip of chips) {
      expect(chip.getAttribute("label")).toBe("hex")
      expect(chip.hasAttribute("contrast")).toBe(true)
      expect(chip.getAttribute("copy")).toBe("token")
      expect(chip.hasAttribute("details")).toBe(true)
    }
    await ElementFixture.settle(chips[0]!)
    expect(chips[0]!.shadowRoot!.querySelector("[part~=chip]")!.localName).toBe("button")
  })

  it("`strip`:  17 dots, one named image", async () => {
    const { host } = await render(`<ui-brand-color-range value="#8E96B5" name="brand" strip></ui-brand-color-range>`)
    const strip = host.shadowRoot!.querySelector("[part~=range]")!
    expect(strip.getAttribute("role")).toBe("img")
    const dots = [...strip.querySelectorAll<HTMLElement>("[part~=dot]")]
    expect(dots).toHaveLength(17)
    expect(dots[0]!.getBoundingClientRect().width).toBe(10)
    await expectAccessible(host)
  })

  it("draws nothing without a colour, and its fallback ladder when its render fails", async () => {
    const { host } = await render(`<ui-brand-color-range value="nope"></ui-brand-color-range>`)
    expect(host.shadowRoot!.querySelector("[part~=range]")).toBeNull()
    host.value = "#8E96B5"
    await ElementFixture.tick()
    await ElementFixture.breakRender(host as never)
    expect(host.matches(":state(errored)")).toBe(true)
    const swatches = host.shadowRoot!.querySelectorAll("[part~=step] [role=img]")
    expect(swatches).toHaveLength(17)
    expect(swatches[0]!.getAttribute("aria-label")).toBe(`color-25 ${Palette.generateScale("#8E96B5").scale[25]}`)
  })
})
