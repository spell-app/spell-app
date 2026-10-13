import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"
import { Palette } from "$/brand"

import "$/brand/components/ui-brand-color"

////////////////
// ## Helpers
////////////////

/** A part of `host`'s shadow root, or `null`. */
function part(host: Element, name: string): HTMLElement | null {
  return host.shadowRoot!.querySelector(`[part~="${name}"]`)
}

/** `value` (a CSS colour) as the browser computes it. */
function rgb(hex: string): string {
  const [r, g, b] = Palette.hexToRgb(hex).map((channel) => Math.round(channel * 255))
  return `rgb(${r}, ${g}, ${b})`
}

/** Stub the clipboard;  returns the spy. */
function stubClipboard() {
  return vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

////////////////
// ## Drawing
////////////////

describe("<ui-brand-color> chip", () => {
  it("draws a square chip in the colour, ink picked for contrast, named by name and colour", async () => {
    const host = await ElementFixture.render(`<ui-brand-color value="#8e96b5" name="brand-500"></ui-brand-color>`)
    const chip = part(host, "chip")!
    expect({ tag: chip.localName, role: chip.getAttribute("role"), label: chip.getAttribute("aria-label") }).toEqual({
      tag: "span",
      role: "img",
      label: "brand-500 #8E96B5"
    })
    const style = getComputedStyle(chip)
    expect(style.backgroundColor).toBe(rgb("#8E96B5"))
    expect(style.color).toBe(rgb(Palette.ink("#8E96B5")))
    const box = chip.getBoundingClientRect()
    expect([box.width, box.height]).toEqual([48, 48])
    expect([...chip.classList]).toEqual(["brand", "color"])
    await expectAccessible(host)
  })

  it("reads RGB and OKLCH values too;  draws no colour for one it can't read", async () => {
    const host = await ElementFixture.render(`<div>
      <ui-brand-color value="142 150 181"></ui-brand-color>
      <ui-brand-color value="oklch(67.7% 0.047 274)"></ui-brand-color>
      <ui-brand-color value="nope"></ui-brand-color>
    </div>`)
    const [rgbChip, oklchChip, bad] = [...host.querySelectorAll("ui-brand-color")].map((chip) => part(chip, "chip")!)
    expect(getComputedStyle(rgbChip!).backgroundColor).toBe(rgb("#8E96B5"))
    expect(rgbChip!.getAttribute("aria-label")).toBe("#8E96B5")
    expect(getComputedStyle(oklchChip!).backgroundColor).toBe(rgb(Palette.parse("oklch(67.7% 0.047 274)")!))
    expect(getComputedStyle(bad!).backgroundColor).toBe("rgba(0, 0, 0, 0)")
  })

  it("labels the chip:  hex, OKLCH, name or step", async () => {
    const host = await ElementFixture.render(`<div>
      <ui-brand-color value="#8E96B5" name="brand-500" label="hex"></ui-brand-color>
      <ui-brand-color value="#8E96B5" name="brand-500" label="oklch"></ui-brand-color>
      <ui-brand-color value="#8E96B5" name="brand-500" label="name"></ui-brand-color>
      <ui-brand-color value="#8E96B5" name="brand-500" label="step"></ui-brand-color>
      <ui-brand-color value="#8E96B5" name="brand-500"></ui-brand-color>
    </div>`)
    const labels = [...host.querySelectorAll("ui-brand-color")].map((chip) => part(chip, "label")?.textContent)
    const { l, c, h } = Palette.hexToOklch("#8E96B5")
    expect(labels).toEqual([
      "8E96B5",
      `${Math.round(l * 100)} ${c.toFixed(2)} ${Math.round(h)}`,
      "brand-500",
      "500",
      undefined
    ])
    expect(part(host.querySelector("ui-brand-color")!, "chip")!.classList.contains("labelled")).toBe(true)
  })

  it("`contrast` marks AA only where white or ink text passes 4.5:1", async () => {
    const host = await ElementFixture.render(`<div>
      <ui-brand-color value="#6550CA" contrast></ui-brand-color>
      <ui-brand-color value="#808080" contrast></ui-brand-color>
    </div>`)
    const [dark, mid] = host.querySelectorAll("ui-brand-color")
    expect(Palette.contrast(Palette.ink("#6550CA"), "#6550CA")).toBeGreaterThanOrEqual(4.5)
    expect(Palette.contrast(Palette.ink("#808080"), "#808080")).toBeLessThan(4.5)
    expect(part(dark!, "mark")!.textContent).toBe("AA")
    expect(part(dark!, "chip")!.getAttribute("aria-label")).toBe("#6550CA AA")
    expect(part(mid!, "mark")).toBeNull()
  })
})

////////////////
// ## Copying
////////////////

describe("<ui-brand-color> copy", () => {
  it("`copy`:  a button named after the chip;  a click copies, `ui-copy`, then `:state(copied)` for a moment", async () => {
    const writeText = stubClipboard()
    const host = await ElementFixture.render(`<ui-brand-color value="#8E96B5" name="brand-500" copy></ui-brand-color>`)
    const chip = part(host, "chip")! as HTMLButtonElement
    expect(chip.localName).toBe("button")
    expect(chip.getAttribute("aria-label")).toBe("Copy brand-500")
    const onCopy = vi.fn()
    host.addEventListener("ui-copy", onCopy)
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
    chip.click()
    await vi.waitFor(() => expect(onCopy).toHaveBeenCalled())
    expect(writeText).toHaveBeenCalledWith("#8E96B5")
    expect(onCopy.mock.calls[0]![0].detail).toMatchObject({ value: "#8E96B5", originalEvent: expect.any(MouseEvent) })
    await ElementFixture.tick()
    expect(host.matches(":state(copied)")).toBe(true)
    expect(part(host, "copied")).not.toBeNull()
    expect(host.shadowRoot!.querySelector("[role=status]")!.textContent).toBe("Copied #8E96B5")
    await vi.advanceTimersByTimeAsync(1400)
    vi.useRealTimers()
    await ElementFixture.tick()
    expect(host.matches(":state(copied)")).toBe(false)
    await expectAccessible(host)
  })

  it("copies OKLCH, the token or a CSS declaration", async () => {
    const writeText = stubClipboard()
    const host = await ElementFixture.render(`<div>
      <ui-brand-color value="#8E96B5" name="brand-500" copy="oklch"></ui-brand-color>
      <ui-brand-color value="#8E96B5" name="brand-500" copy="token"></ui-brand-color>
      <ui-brand-color value="#8E96B5" name="brand-500" copy="css"></ui-brand-color>
      <ui-brand-color value="#8E96B5" copy="token"></ui-brand-color>
    </div>`)
    for (const chip of host.querySelectorAll("ui-brand-color")) {
      part(chip, "chip")!.click()
      await ElementFixture.tick()
    }
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(4))
    expect(writeText.mock.calls.map(([text]) => text)).toEqual([
      Palette.format("#8E96B5", "oklch"),
      "var(--brand-500)",
      "--brand-500: #8E96B5;",
      "#8E96B5"
    ])
  })
})

////////////////
// ## States, size and fallback
////////////////

describe("<ui-brand-color> states", () => {
  it("`selected` draws the double ring", async () => {
    const host = await ElementFixture.render(`<ui-brand-color value="#8E96B5" selected></ui-brand-color>`)
    const chip = part(host, "chip")!
    expect(chip.classList.contains("selected")).toBe(true)
    expect(getComputedStyle(chip).boxShadow).toContain("3.5px")
  })

  it("`details`:  a tip with the name, hex, OKLCH and contrast, describing a focusable chip", async () => {
    const host = await ElementFixture.render(
      `<ui-brand-color value="#6550CA" name="violet-600" details></ui-brand-color>`
    )
    const chip = part(host, "chip")!
    const tip = part(host, "tip")!
    expect(chip.getAttribute("tabindex")).toBe("0")
    expect(host.shadowRoot!.getElementById(chip.getAttribute("aria-describedby")!)).toBe(tip)
    expect(tip.getAttribute("role")).toBe("tooltip")
    expect(tip.querySelector("b")!.textContent).toBe("violet-600")
    const rows = [...tip.querySelectorAll("dd")].map((row) => row.textContent)
    const onWhite = Palette.contrast("#FFFFFF", "#6550CA").toFixed(1)
    expect(rows.slice(0, 3)).toEqual(["#6550CA", Palette.format("#6550CA", "oklch"), `${onWhite}:1 AA`])
    expect(tip.textContent).toContain("Good for text:  white text")
    expect(getComputedStyle(tip).visibility).toBe("hidden")
    chip.focus()
    await vi.waitFor(() => expect(getComputedStyle(tip).opacity).toBe("1"))
    await expectAccessible(host)
  })

  it("`size` scales the chip", async () => {
    const host = await ElementFixture.render(`<div>
      <ui-brand-color value="#8E96B5" size="mini"></ui-brand-color>
      <ui-brand-color value="#8E96B5" size="massive"></ui-brand-color>
      <ui-brand-color value="#8E96B5" style="--ui-brand-color-size: 28px"></ui-brand-color>
    </div>`)
    const widths = [...host.querySelectorAll("ui-brand-color")].map(
      (chip) => part(chip, "chip")!.getBoundingClientRect().width
    )
    expect(widths).toEqual([30, 96, 28])
  })
})
