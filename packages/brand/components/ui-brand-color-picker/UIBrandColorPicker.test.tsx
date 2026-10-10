import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import type { DOMElement } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"
import { Palette } from "$/brand"

import "$/brand/components/ui-brand-color-picker"
import "$/brand/components/ui-brand-field"

////////////////
// ## Fixtures
////////////////

/** `<ui-brand-color-picker>`'s DOM element. */
type PickerHost = HTMLElement & { value?: string }

/** One event the picker dispatched. */
type Fired = { type: string; value: string; format?: string }

////////////////
// ## Helpers
////////////////

/** A part of `host`'s shadow root. */
function part<T extends HTMLElement = HTMLElement>(host: Element, name: string): T {
  return host.shadowRoot!.querySelector<T>(`[part~="${name}"]`)!
}

/** Every element matching `selector` in `host`'s shadow root. */
function all<T extends HTMLElement = HTMLElement>(host: Element, selector: string): T[] {
  return [...host.shadowRoot!.querySelectorAll<T>(selector)]
}

/** The square's Saturation and Lightness sliders. */
function axes(host: Element): [HTMLInputElement, HTMLInputElement] {
  const [saturation, lightness] = all<HTMLInputElement>(host, ".plane > .axis")
  return [saturation!, lightness!]
}

/** HSL field `index` (0 H, 1 S, 2 L). */
function hslField(host: Element, index: number): HTMLInputElement {
  return all<HTMLInputElement>(host, '[part~="hsl"]')[index]!
}

/** OKLCH field `index` (0 L, 1 C, 2 H). */
function oklchField(host: Element, index: number): HTMLInputElement {
  return all<HTMLInputElement>(host, '[part~="oklch"]')[index]!
}

/** Copy button of row `index` (0 HSL, 1 RGB, 2 OKLCH). */
function copyButton(host: Element, index: number): HTMLButtonElement {
  return all<HTMLButtonElement>(host, '[part~="copy"]')[index]!
}

/** `ui-input` / `ui-change` / `ui-copy` events from `host`, in order. */
function record(host: Element): Fired[] {
  const fired: Fired[] = []
  for (const type of ["ui-input", "ui-change", "ui-copy"]) {
    host.addEventListener(type, (event) => {
      const { value, format } = (event as CustomEvent).detail
      fired.push(format ? { type, value, format } : { type, value })
    })
  }
  return fired
}

/** Type `text` into `input` (one `input` event). */
function type(input: HTMLInputElement, text: string) {
  input.value = text
  input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
}

/** Key `key` on `target`. */
function key(target: Element, key: string, init: KeyboardEventInit = {}) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true, ...init }))
}

/** Leave `input`. */
function leave(input: HTMLInputElement) {
  input.dispatchEvent(new FocusEvent("focusout", { bubbles: true, composed: true }))
}

/** Pointer event `type` at ratio (`x`, `y`) of the square. */
function pointer(host: Element, type: string, x: number, y: number) {
  const plane = part(host, "plane")
  const box = plane.getBoundingClientRect()
  plane.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      button: 0,
      pointerId: 7,
      isPrimary: true,
      clientX: box.left + x * box.width,
      clientY: box.top + y * box.height
    })
  )
}

/** Where the marker's centre is, as ratios of the square. */
function markerAt(host: Element): [number, number] {
  const marker = part(host, "marker").getBoundingClientRect()
  const plane = part(host, "plane").getBoundingClientRect()
  return [
    (marker.left + marker.width / 2 - plane.left) / plane.width,
    (marker.top + marker.height / 2 - plane.top) / plane.height
  ]
}

/** Render a picker. */
async function picker(html: string): Promise<PickerHost> {
  return ElementFixture.render<PickerHost>(html)
}

afterEach(() => {
  vi.restoreAllMocks()
})

////////////////
// ## Display
////////////////

describe("<ui-brand-color-picker> display", () => {
  it("shows the value:  chip, hex, HSL / RGB / OKLCH rows;  reads `#abc`;  default `#8E96B5`", async () => {
    const host = await picker(`<ui-brand-color-picker value="#6550ca"></ui-brand-color-picker>`)
    expect(part(host, "hex").textContent).toBe("#6550CA")
    expect(part<HTMLInputElement>(host, "rgb").value).toBe("#6550CA")
    expect([0, 1, 2].map((index) => hslField(host, index).value)).toEqual(["250", "54", "55"])
    const { l, c, h } = Palette.hexToOklch("#6550CA")
    expect([0, 1, 2].map((index) => oklchField(host, index).value)).toEqual([
      (l * 100).toFixed(1),
      c.toFixed(3),
      h.toFixed(0)
    ])
    expect(all(host, '[part~="row"] > .row-label').map((label) => label.textContent)).toEqual(["HSL", "RGB", "OKLCH"])
    expect(getComputedStyle(part(host, "chip")).backgroundColor).toBe("rgb(101, 80, 202)")
    expect([...part(host, "picker").classList]).toEqual(["brand", "color", "picker"])

    const short = await picker(`<ui-brand-color-picker value="#abc"></ui-brand-color-picker>`)
    expect(part(short, "hex").textContent).toBe("#AABBCC")
    const none = await picker(`<ui-brand-color-picker></ui-brand-color-picker>`)
    expect(part(none, "hex").textContent).toBe("#8E96B5")
  })

  it("draws the HSL square for the hue:  the marker at saturation (across) and lightness (up)", async () => {
    const host = await picker(`<ui-brand-color-picker value="#6550CA"></ui-brand-color-picker>`)
    const { h, s, l } = Palette.hexToHsl("#6550CA")
    expect(getComputedStyle(part(host, "plane")).backgroundImage).toContain("linear-gradient")
    expect(Number(part(host, "picker").style.getPropertyValue("--_brand-color-picker-hue"))).toBeCloseTo(h, 5)
    const [x, y] = markerAt(host)
    expect(x).toBeCloseTo(s, 2)
    expect(y).toBeCloseTo(1 - l, 2)
  })

  it("is accessible:  a named group, the square's two sliders (one tab stop), the hue slider, named fields", async () => {
    const host = await picker(`<ui-brand-color-picker label="Base color"></ui-brand-color-picker>`)
    expect(part(host, "picker").getAttribute("aria-label")).toBe("Base color")
    const [saturation, lightness] = axes(host)
    expect({
      label: saturation.getAttribute("aria-label"),
      text: saturation.getAttribute("aria-valuetext"),
      tabIndex: saturation.tabIndex
    }).toEqual({ label: "Saturation", text: expect.stringMatching(/^\d+%$/), tabIndex: 0 })
    expect({ label: lightness.getAttribute("aria-label"), tabIndex: lightness.tabIndex }).toEqual({
      label: "Lightness",
      tabIndex: -1
    })
    expect(part(host, "hue").getAttribute("aria-label")).toBe("Hue")
    expect(hslField(host, 0).getAttribute("aria-label")).toBe("HSL hue, 0–360°")
    expect(copyButton(host, 2).getAttribute("aria-label")).toBe("Copy OKLCH")
    await expectAccessible(host)
  })

  it("takes its name from a <ui-brand-field>'s label, or a <label for>;  else 'Colour'", async () => {
    const field = await ElementFixture.render(`<ui-brand-field label="Base color">
      <ui-brand-color-picker></ui-brand-color-picker>
    </ui-brand-field>`)
    const inField = field.querySelector("ui-brand-color-picker")!
    await vi.waitFor(() => expect(part(inField, "picker").getAttribute("aria-label")).toBe("Base color"))
    // and fills the field's width
    expect(inField.getBoundingClientRect().width).toBeCloseTo(field.getBoundingClientRect().width, 0)
    const wrapper = await ElementFixture.render(`<div><label for="seed">Seed</label>
      <ui-brand-color-picker id="seed"></ui-brand-color-picker></div>`)
    const labelled = wrapper.querySelector("ui-brand-color-picker")!
    await vi.waitFor(() => expect(part(labelled, "picker").getAttribute("aria-label")).toBe("Seed"))
    const bare = await picker(`<ui-brand-color-picker></ui-brand-color-picker>`)
    expect(part(bare, "picker").getAttribute("aria-label")).toBe("Colour")
  })

  it("follows `value` set from outside:  redraws, no events;  reflects the property", async () => {
    const host = await picker(`<ui-brand-color-picker value="#8E96B5"></ui-brand-color-picker>`)
    const fired = record(host)
    host.value = "#14A39A"
    await ElementFixture.tick()
    expect(part(host, "hex").textContent).toBe("#14A39A")
    expect(part<HTMLInputElement>(host, "rgb").value).toBe("#14A39A")
    expect(host.getAttribute("value")).toBe("#14A39A")
    expect(part<HTMLInputElement>(host, "hue").value).toBe(String(Math.round(Palette.hexToHsl("#14A39A").h)))
    host.setAttribute("value", "#E8436A")
    await ElementFixture.tick()
    expect(part(host, "hex").textContent).toBe("#E8436A")
    expect(fired).toEqual([])
  })
})

////////////////
// ## Fields
////////////////

describe("<ui-brand-color-picker> fields", () => {
  it("hex field:  a valid keystroke is `ui-input`, Enter commits;  RGB triples, `#abc` and hsl() read", async () => {
    const host = await picker(`<ui-brand-color-picker value="#8E96B5"></ui-brand-color-picker>`)
    const fired = record(host)
    const rgb = part<HTMLInputElement>(host, "rgb")
    type(rgb, "#14a39a")
    await ElementFixture.tick()
    expect(host.value).toBe("#14A39A")
    key(rgb, "Enter")
    await ElementFixture.tick()
    expect(rgb.value).toBe("#14A39A")
    type(rgb, "232 67 106")
    await ElementFixture.tick()
    type(rgb, "#abc")
    await ElementFixture.tick()
    leave(rgb)
    await ElementFixture.tick()
    type(rgb, "hsl(120 100% 25%)")
    await ElementFixture.tick()
    expect(fired).toEqual([
      { type: "ui-input", value: "#14A39A" },
      { type: "ui-change", value: "#14A39A" },
      { type: "ui-input", value: "#E8436A" },
      { type: "ui-input", value: "#AABBCC" },
      { type: "ui-change", value: "#AABBCC" },
      { type: "ui-input", value: "#008000" }
    ])
  })

  it("hex field:  invalid text changes nothing, shows the error look, and reverts on leaving", async () => {
    const host = await picker(`<ui-brand-color-picker value="#8E96B5"></ui-brand-color-picker>`)
    const fired = record(host)
    const rgb = part<HTMLInputElement>(host, "rgb")
    type(rgb, "#12")
    await ElementFixture.tick()
    expect(host.value).toBe("#8E96B5")
    expect(rgb.getAttribute("aria-invalid")).toBe("true")
    expect(rgb.closest(".field")!.classList.contains("error")).toBe(true)
    leave(rgb)
    await ElementFixture.tick()
    expect(rgb.value).toBe("#8E96B5")
    expect(rgb.hasAttribute("aria-invalid")).toBe(false)
    expect(fired).toEqual([])
  })

  it("HSL fields:  H, S (%) and L (%) edit the colour;  bad numbers change nothing;  Escape drops the draft", async () => {
    const host = await picker(`<ui-brand-color-picker value="#6550CA"></ui-brand-color-picker>`)
    const fired = record(host)
    const start = Palette.hexToHsl("#6550CA")
    type(hslField(host, 0), "120")
    await ElementFixture.tick()
    expect(host.value).toBe(Palette.hslToHex({ ...start, h: 120 }))
    type(hslField(host, 1), "100")
    await ElementFixture.tick()
    type(hslField(host, 2), "25")
    await ElementFixture.tick()
    expect(host.value).toBe("#008000")
    key(hslField(host, 2), "Enter")
    await ElementFixture.tick()
    type(hslField(host, 1), "lots")
    await ElementFixture.tick()
    expect(hslField(host, 1).getAttribute("aria-invalid")).toBe("true")
    expect(host.value).toBe("#008000")
    key(hslField(host, 1), "Escape")
    await ElementFixture.tick()
    expect(hslField(host, 1).value).toBe("100")
    expect(fired.map((event) => event.type)).toEqual(["ui-input", "ui-input", "ui-input", "ui-change"])
  })

  it("OKLCH fields:  L (%), C and H edit the colour;  a C no screen shows is mapped in (same L and H)", async () => {
    const host = await picker(`<ui-brand-color-picker value="#8E96B5"></ui-brand-color-picker>`)
    const start = Palette.hexToOklch("#8E96B5")
    const [l, c, h] = [oklchField(host, 0), oklchField(host, 1), oklchField(host, 2)]
    type(l, "40")
    await ElementFixture.tick()
    expect(host.value).toBe(Palette.oklchToHex({ ...start, l: 0.4 }))
    leave(l)
    await ElementFixture.tick()
    type(h, "150")
    await ElementFixture.tick()
    leave(h)
    await ElementFixture.tick()
    const base = Palette.hexToOklch(host.value!)
    type(c, "0.4")
    await ElementFixture.tick()
    const mapped = Palette.oklchToHex({ ...base, c: 0.4 })
    expect(host.value).toBe(mapped)
    key(c, "Enter")
    await ElementFixture.tick()
    // committed:  the field shows the chroma that fits
    expect(Number(c.value)).toBeLessThan(0.4)
    expect(Number(h.value)).toBeCloseTo(150, -1)
  })
})

////////////////
// ## Square and hue slider
////////////////

describe("<ui-brand-color-picker> square and hue", () => {
  it("hue slider:  changes the hue (`ui-input`), commits on `change`;  the square's hue follows", async () => {
    const host = await picker(`<ui-brand-color-picker value="#6550CA"></ui-brand-color-picker>`)
    const fired = record(host)
    const hue = part<HTMLInputElement>(host, "hue")
    hue.value = "140"
    hue.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
    hue.dispatchEvent(new Event("change", { bubbles: true }))
    await ElementFixture.tick()
    const { s, l } = Palette.hexToHsl("#6550CA")
    expect(host.value).toBe(Palette.hslToHex({ h: 140, s, l }))
    expect(hslField(host, 0).value).toBe("140")
    expect(part(host, "picker").style.getPropertyValue("--_brand-color-picker-hue")).toBe("140")
    expect(fired.map((event) => event.type)).toEqual(["ui-input", "ui-change"])
    // 360 stays at the slider's end
    hue.value = "360"
    hue.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
    await ElementFixture.tick()
    expect(hue.value).toBe("360")
  })

  it("square:  a press jumps there, a drag follows (`ui-input`), release commits once (`ui-change`)", async () => {
    const host = await picker(`<ui-brand-color-picker value="#8E96B5"></ui-brand-color-picker>`)
    const fired = record(host)
    const { h } = Palette.hexToHsl("#8E96B5")
    pointer(host, "pointerdown", 0.2, 0.5)
    await ElementFixture.tick()
    expect(host.matches(":state(dragging)")).toBe(true)
    expect(host.value).toBe(Palette.hslToHex({ h, s: 0.2, l: 0.5 }))
    pointer(host, "pointermove", 0.9, 0.3)
    await ElementFixture.tick()
    expect(host.value).toBe(Palette.hslToHex({ h, s: 0.9, l: 0.7 }))
    pointer(host, "pointerup", 0.9, 0.3)
    await ElementFixture.tick()
    expect(host.matches(":state(dragging)")).toBe(false)
    expect(fired.map((event) => event.type)).toEqual(["ui-input", "ui-input", "ui-change"])
    expect(fired.at(-1)!.value).toBe(host.value)
    const [x, y] = markerAt(host)
    expect(x).toBeCloseTo(0.9, 2)
    expect(y).toBeCloseTo(0.3, 2)
    expect(host.shadowRoot!.activeElement).toBe(axes(host)[0])
  })

  it("keyboard on the square:  arrows move S and L (Shift 10x), Home / End S 0 / 100%;  each commits", async () => {
    const host = await picker(`<ui-brand-color-picker value="#6550CA"></ui-brand-color-picker>`)
    const fired = record(host)
    const [saturation, lightness] = axes(host)
    const start = Palette.hexToHsl("#6550CA")
    key(saturation, "ArrowUp")
    await ElementFixture.tick()
    expect(host.value).toBe(Palette.hslToHex({ ...start, l: start.l + 0.01 }))
    key(lightness, "ArrowDown", { shiftKey: true })
    await ElementFixture.tick()
    expect(host.value).toBe(Palette.hslToHex({ ...start, l: start.l + 0.01 - 0.1 }))
    key(saturation, "ArrowLeft")
    await ElementFixture.tick()
    expect(host.value).toBe(Palette.hslToHex({ ...start, s: start.s - 0.01, l: start.l - 0.09 }))
    key(saturation, "Home")
    await ElementFixture.tick()
    expect(Palette.hexToHsl(host.value!).s).toBe(0)
    key(saturation, "End")
    await ElementFixture.tick()
    const vivid = Palette.hexToHsl(host.value!)
    expect(vivid.s).toBeCloseTo(1, 2)
    // the hue the grey "forgot" came back:  the picker kept it
    expect(vivid.h).toBeCloseTo(start.h, 0)
    expect(fired.map((event) => event.type)).toEqual(Array(5).fill(["ui-input", "ui-change"]).flat())
  })

  it("a grey keeps its hue;  black and white keep hue and saturation", async () => {
    const host = await picker(`<ui-brand-color-picker value="#6550CA"></ui-brand-color-picker>`)
    const hue = part<HTMLInputElement>(host, "hue").value
    const saturation = hslField(host, 1).value
    host.value = "#808080"
    await ElementFixture.tick()
    expect(part<HTMLInputElement>(host, "hue").value).toBe(hue)
    expect(hslField(host, 1).value).toBe("0")
    host.value = "#6550CA"
    await ElementFixture.tick()
    host.value = "#000000"
    await ElementFixture.tick()
    expect(part<HTMLInputElement>(host, "hue").value).toBe(hue)
    expect(hslField(host, 1).value).toBe(saturation)
    expect(hslField(host, 2).value).toBe("0")
  })
})

////////////////
// ## Copying
////////////////

describe("<ui-brand-color-picker> copy", () => {
  it("copy buttons:  HSL as shown, the hex, OKLCH;  `ui-copy`, a check, an announcement", async () => {
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    const host = await picker(`<ui-brand-color-picker value="#6550CA"></ui-brand-color-picker>`)
    const fired = record(host)
    for (const index of [0, 1, 2]) {
      copyButton(host, index).click()
      await vi.waitFor(() => expect(fired).toHaveLength(index + 1))
    }
    expect(write.mock.calls.map(([text]) => text)).toEqual([
      "hsl(250 54% 55%)",
      "#6550CA",
      Palette.format("#6550CA", "oklch")
    ])
    expect(fired).toEqual([
      { type: "ui-copy", value: "hsl(250 54% 55%)", format: "hsl" },
      { type: "ui-copy", value: "#6550CA", format: "hex" },
      { type: "ui-copy", value: Palette.format("#6550CA", "oklch"), format: "oklch" }
    ])
    await ElementFixture.tick()
    expect(host.matches(":state(copied)")).toBe(true)
    expect(copyButton(host, 2).classList.contains("copied")).toBe(true)
    expect(copyButton(host, 0).classList.contains("copied")).toBe(false)
    expect(host.shadowRoot!.querySelector('[role="status"]')!.textContent).toBe(
      `Copied ${Palette.format("#6550CA", "oklch")}`
    )
  })

  it("copy:  a refused clipboard write does nothing", async () => {
    const write = vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"))
    const host = await picker(`<ui-brand-color-picker value="#6550CA"></ui-brand-color-picker>`)
    const fired = record(host)
    copyButton(host, 1).click()
    // the picker's own `await` on the write was queued first:  its `catch` has run once this resumes
    await (write.mock.results[0]!.value as Promise<void>).catch(() => undefined)
    await ElementFixture.tick()
    expect(fired).toEqual([])
    expect(host.matches(":state(copied)")).toBe(false)
  })
})

////////////////
// ## Form control and states
////////////////

describe("<ui-brand-color-picker> form and states", () => {
  it("a `ui-input` handler that re-sets `value` wins", async () => {
    const host = await picker(`<ui-brand-color-picker value="#8E96B5"></ui-brand-color-picker>`)
    host.addEventListener("ui-input", () => (host.value = "#8E96B5"))
    type(part<HTMLInputElement>(host, "rgb"), "#14A39A")
    await ElementFixture.tick()
    expect(host.value).toBe("#8E96B5")
    expect(part(host, "hex").textContent).toBe("#8E96B5")
  })

  it("is a form control:  submits `value` under `name`;  reset goes back to the first value", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-brand-color-picker name="base" value="#8E96B5"></ui-brand-color-picker></form>`
    )
    const host = form.querySelector<PickerHost>("ui-brand-color-picker")!
    expect(new FormData(form).get("base")).toBe("#8E96B5")
    type(part<HTMLInputElement>(host, "rgb"), "#14A39A")
    await ElementFixture.tick()
    expect(new FormData(form).get("base")).toBe("#14A39A")
    form.reset()
    await ElementFixture.tick()
    expect(host.value).toBe("#8E96B5")
    expect(new FormData(form).get("base")).toBe("#8E96B5")
  })

  it("`required`:  fails while no `value` was set, though it shows the default;  met once a colour is picked", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-brand-color-picker name="base" required></ui-brand-color-picker></form>`
    )
    const host = form.querySelector<PickerHost>("ui-brand-color-picker")!
    await ElementFixture.tick()
    expect(form.checkValidity()).toBe(false)
    // the default is still what a submit would send
    expect(new FormData(form).get("base")).toBe("#8E96B5")
    type(part<HTMLInputElement>(host, "rgb"), "#14A39A")
    await ElementFixture.tick()
    expect(form.checkValidity()).toBe(true)
    form.reset()
    await ElementFixture.tick()
    expect(form.checkValidity()).toBe(false)
  })

  it("slots:  `header` and `actions` in the head row;  the default slot under the rows", async () => {
    const host = await picker(`<ui-brand-color-picker>
      <b slot="header">Choose a colour</b><button slot="actions" aria-label="Done">x</button><p>families</p>
    </ui-brand-color-picker>`)
    expect(part(host, "head").querySelector<HTMLSlotElement>('slot[name="header"]')!.assignedElements()).toHaveLength(1)
    expect(part(host, "head").querySelector<HTMLSlotElement>('slot[name="actions"]')!.assignedElements()).toHaveLength(
      1
    )
    expect(part(host, "families").querySelector("slot")!.assignedElements()[0]!.textContent).toBe("families")
    const empty = await picker(`<ui-brand-color-picker></ui-brand-color-picker>`)
    expect(empty.shadowRoot!.querySelector('[part~="families"]')).toBeNull()
  })

  it("disabled:  `:state(disabled)`, its inputs and buttons disabled, the square ignores the pointer", async () => {
    const host = await picker(`<ui-brand-color-picker value="#8E96B5" disabled></ui-brand-color-picker>`)
    const fired = record(host)
    expect(host.matches(":state(disabled)")).toBe(true)
    expect(all<HTMLInputElement>(host, "input, button").every((control) => control.disabled)).toBe(true)
    pointer(host, "pointerdown", 0.5, 0.5)
    await ElementFixture.tick()
    expect(host.value).toBe("#8E96B5")
    expect(fired).toEqual([])
  })

  it("falls back to the browser's colour input when its render breaks, still a form control", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><ui-brand-color-picker name="base" value="#6550CA"></ui-brand-color-picker></form>`
    )
    const host = form.querySelector<PickerHost & DOMElement>("ui-brand-color-picker")!
    await ElementFixture.breakRender(host)
    expect(host.matches(":state(errored)")).toBe(true)
    const input = host.shadowRoot!.querySelector<HTMLInputElement>('input[type="color"]')!
    expect(input.value).toBe("#6550ca")
    const fired = record(host)
    input.value = "#14a39a"
    input.dispatchEvent(new Event("change", { bubbles: true }))
    expect(host.value).toBe("#14A39A")
    expect(new FormData(form).get("base")).toBe("#14A39A")
    expect(fired).toEqual([{ type: "ui-change", value: "#14A39A" }])
  })
})
