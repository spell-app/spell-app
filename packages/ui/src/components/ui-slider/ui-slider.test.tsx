import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import type { FormHost } from "$/ui/elements"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-slider"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-slider/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A slider host with its properties. */
type Slider = FormHost & {
  value: number | undefined
  end: number | undefined
  stepLabels: unknown
  formStateRestoreCallback(state: unknown, mode: string): void
}

/** Render one slider (at a known width);  returns the host and its pieces. */
async function slider(attributes: string, width = 400) {
  const container = await ElementFixture.render(
    `<div style="width: ${width}px"><ui-slider ${attributes}></ui-slider></div>`
  )
  await ElementFixture.tick()
  const host = container.querySelector<Slider>("ui-slider")!
  return { host, ...parts(host) }
}

/** Pieces of a rendered slider. */
function parts(host: Element) {
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=slider]")!
  return {
    root,
    inner: root.querySelector<HTMLElement>(".inner")!,
    fill: root.querySelector<HTMLElement>("[part~=track-fill]")!,
    thumbs: [...root.querySelectorAll<HTMLElement>("[part~=thumb]")],
    labels: [...root.querySelectorAll<HTMLElement>("[part~=label]")]
  }
}

/** Collect `detail`s of `name`. */
function events(host: Element, name: string) {
  const details: { value: number; end?: number }[] = []
  host.addEventListener(name, (event) => {
    const { value, end } = (event as CustomEvent).detail
    details.push(end === undefined ? { value } : { value, end })
  })
  return details
}

/** Wait for writes and the effects they trigger. */
async function settle() {
  await ElementFixture.tick()
  await ElementFixture.tick()
}

/** Dispatch pointer event `type` on `target` at `ratio` along `inner` (horizontal). */
function point(type: string, target: Element, inner: HTMLElement, ratio: number) {
  const box = inner.getBoundingClientRect()
  const thumb = inner.querySelector<HTMLElement>(".thumb")!.offsetWidth
  const clientX = box.left + thumb / 2 + ratio * (box.width - thumb)
  const clientY = box.top + box.height / 2
  target.dispatchEvent(
    new PointerEvent(type, { clientX, clientY, button: 0, pointerId: 1, bubbles: true, composed: true })
  )
}

////////////////
// ## Rendering
////////////////

describe("<ui-slider> markup", () => {
  it.each([
    ["", "ui slider"],
    ['size="small" color="blue"', "ui small blue slider"],
    ["labeled ticked range", "ui labeled range ticked slider"],
    ["reversed vertical smooth hover basic inverted", "ui basic hover inverted reversed smooth vertical slider"],
    ['labeled aligned="bottom"', "ui labeled bottom aligned slider"],
    ["readonly disabled", "ui disabled read-only slider"]
  ])("<ui-slider %s>", async (attributes, classes) => {
    const { root } = await slider(`${attributes} aria-label="S"`)
    expect(root.className).toBe(classes)
  })

  it("is one APG slider:  range, value, text, name;  positioned by ratio", async () => {
    const { thumbs, inner } = await slider(`min="10" max="30" value="15" aria-label="Volume"`)
    expect(thumbs).toHaveLength(1)
    const [thumb] = thumbs
    expect(thumb!.getAttribute("role")).toBe("slider")
    expect(thumb!.tabIndex).toBe(0)
    expect(
      ["aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext", "aria-label"].map((name) =>
        thumb!.getAttribute(name)
      )
    ).toEqual(["10", "30", "15", "15", "Volume"])
    expect(thumb!.style.getPropertyValue("--_slider-at")).toBe("0.25")
    expect(inner.style.getPropertyValue("--_slider-to")).toBe("0.25")
    expect(inner.style.getPropertyValue("--_slider-from")).toBe("0")
  })

  it("draws the thumb and fill where the ratio says (400px track)", async () => {
    const { thumbs, fill, inner } = await slider(`value="10" aria-label="S"`)
    const box = inner.getBoundingClientRect()
    const thumb = thumbs[0]!.getBoundingClientRect()
    expect(thumb.left + thumb.width / 2 - box.left).toBeCloseTo(box.width / 2, 0)
    expect(fill.getBoundingClientRect().right).toBeCloseTo(thumb.left + thumb.width / 2, 0)
  })

  it("defaults to Fomantic's 0 ... 20, value `min`;  snaps and clamps the attribute", async () => {
    const { thumbs } = await slider(`aria-label="S"`)
    expect([thumbs[0]!.getAttribute("aria-valuemax"), thumbs[0]!.getAttribute("aria-valuenow")]).toEqual(["20", "0"])
    const { host, thumbs: snapped } = await slider(`value="7.6" step="2" aria-label="S"`)
    expect(snapped[0]!.getAttribute("aria-valuenow")).toBe("8")
    host.value = 99
    await settle()
    expect(snapped[0]!.getAttribute("aria-valuenow")).toBe("20")
  })

  it("range:  two thumbs in a named group, each bounding the other", async () => {
    const { thumbs, inner } = await slider(`range value="5" end="15" aria-label="Price"`)
    expect(thumbs).toHaveLength(2)
    expect([inner.getAttribute("role"), inner.getAttribute("aria-label")]).toEqual(["group", "Price"])
    expect(thumbs.map((thumb) => thumb.getAttribute("aria-label"))).toEqual(["Minimum", "Maximum"])
    expect(thumbs.map((thumb) => [thumb.getAttribute("aria-valuemin"), thumb.getAttribute("aria-valuemax")])).toEqual([
      ["0", "15"],
      ["5", "20"]
    ])
    expect([inner.style.getPropertyValue("--_slider-from"), inner.style.getPropertyValue("--_slider-to")]).toEqual([
      "0.25",
      "0.75"
    ])
  })

  it("labeled:  a label per step, the step labels as text and spoken value", async () => {
    const { labels, host, thumbs } = await slider(`labeled max="4" value="1" aria-label="Size"`)
    expect(labels.map((label) => label.textContent)).toEqual(["0", "1", "2", "3", "4"])
    expect(labels[2]!.style.getPropertyValue("--_slider-at")).toBe("0.5")
    expect(parts(host).root.querySelector("[part~=labels]")!.getAttribute("aria-hidden")).toBe("true")
    host.stepLabels = ["XS", "S", "M", "L", "XL"]
    await settle()
    expect(parts(host).labels.map((label) => label.textContent)).toEqual(["XS", "S", "M", "L", "XL"])
    expect(thumbs[0]!.getAttribute("aria-valuetext")).toBe("S")
  })

  it("labeled:  crowded labels become half ticks, the last always shows", async () => {
    const { labels } = await slider(`labeled ticked max="20" aria-label="S"`, 300)
    // measured by a `ResizeObserver`, which reports at the next rendering step
    await expect.poll(() => labels.filter((label) => label.className === "label").length).toBe(3)
    const full = labels.filter((label) => label.className === "label").map((label) => label.textContent)
    expect(full).toEqual(["0", "10", "20"])
    expect(full.at(-1)).toBe("20")
    expect(labels.filter((label) => label.className === "halftick label").every((label) => !label.textContent)).toBe(
      true
    )
  })

  it("`tick-step`:  labels every tick step, not every step", async () => {
    const { labels } = await slider(`labeled min="0" max="200" tick-step="50" aria-label="Chroma"`, 600)
    expect(labels.map((label) => label.textContent)).toEqual(["0", "50", "100", "150", "200"])
    expect(labels[1]!.style.getPropertyValue("--_slider-at")).toBe("0.25")
  })

  it("`ticked` alone:  a full tick per tick step, no numbers, drawn under the track", async () => {
    const { labels, root, inner } = await slider(`ticked min="0" max="200" tick-step="20" aria-label="Chroma"`, 600)
    expect(root.className).toBe("ui ticked slider")
    expect(labels).toHaveLength(11)
    expect(labels.every((label) => label.className === "label" && label.textContent === "")).toBe(true)
    const tick = labels[5]!.getBoundingClientRect()
    const track = inner.querySelector(".track")!.getBoundingClientRect()
    expect(tick.width).toBeGreaterThan(0)
    expect(tick.bottom).toBeGreaterThan(track.bottom)
    expect(tick.left + tick.width / 2).toBeCloseTo(track.left + track.width / 2, 0)
    const { labels: none } = await slider(`min="0" max="200" aria-label="Plain"`)
    expect(none).toHaveLength(0)
  })
})

////////////////
// ## Keyboard
////////////////

describe("<ui-slider> keyboard", () => {
  it("arrows step, pages take 2, Home / End go to the ends;  each ui-input then ui-change", async () => {
    const { host, thumbs } = await slider(`value="10" aria-label="S"`)
    const inputs = events(host, "ui-input")
    const changes = events(host, "ui-change")
    thumbs[0]!.focus()
    await userEvent.keyboard("{ArrowRight}")
    await settle()
    expect(host.value).toBe(11)
    await userEvent.keyboard("{ArrowDown}{ArrowLeft}")
    await settle()
    expect(host.value).toBe(9)
    await userEvent.keyboard("{PageUp}")
    await settle()
    expect(host.value).toBe(11)
    await userEvent.keyboard("{Home}")
    await settle()
    expect(host.value).toBe(0)
    await userEvent.keyboard("{End}")
    await settle()
    expect(host.value).toBe(20)
    await userEvent.keyboard("{End}")
    await settle()
    expect(inputs.map((detail) => detail.value)).toEqual([11, 10, 9, 11, 0, 20])
    expect(changes).toEqual(inputs)
    expect(thumbs[0]!.getAttribute("aria-valuenow")).toBe("20")
  })

  it("arrows follow the thumb on reversed and vertical sliders (Fomantic's key movement)", async () => {
    const { host, thumbs } = await slider(`reversed value="10" aria-label="S"`)
    thumbs[0]!.focus()
    await userEvent.keyboard("{ArrowLeft}")
    await settle()
    expect(host.value).toBe(11)
    const { host: vertical, thumbs: upright } = await slider(`vertical value="10" style="height: 200px" aria-label="S"`)
    upright[0]!.focus()
    await userEvent.keyboard("{ArrowDown}")
    await settle()
    expect(vertical.value).toBe(11)
    expect(upright[0]!.getAttribute("aria-orientation")).toBe("vertical")
  })

  it("range:  a thumb stops at the other", async () => {
    const { host, thumbs } = await slider(`range value="9" end="10" aria-label="S"`)
    thumbs[0]!.focus()
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{End}")
    await settle()
    expect([host.value, host.end]).toEqual([10, 10])
    thumbs[1]!.focus()
    await userEvent.keyboard("{Home}")
    await settle()
    expect(host.end).toBe(10)
    await userEvent.keyboard("{End}")
    await settle()
    expect(host.end).toBe(20)
  })

  it("keeps the host's value when a ui-input handler re-sets it", async () => {
    const { host, thumbs } = await slider(`value="4" aria-label="S"`)
    host.addEventListener("ui-input", () => (host.value = 4))
    const changes = events(host, "ui-change")
    thumbs[0]!.focus()
    await userEvent.keyboard("{ArrowRight}")
    await settle()
    expect(host.value).toBe(4)
    expect(changes).toEqual([])
    expect(thumbs[0]!.getAttribute("aria-valuenow")).toBe("4")
  })

  it("readonly and disabled never change;  disabled thumbs leave the tab order", async () => {
    const { host, thumbs } = await slider(`readonly value="4" aria-label="S"`)
    thumbs[0]!.focus()
    await userEvent.keyboard("{ArrowRight}{End}")
    await settle()
    expect(host.value).toBe(4)
    expect(thumbs[0]!.getAttribute("aria-readonly")).toBe("true")
    const { thumbs: off, host: disabled } = await slider(`disabled value="4" aria-label="S"`)
    expect(off[0]!.hasAttribute("tabindex")).toBe(false)
    expect(off[0]!.getAttribute("aria-disabled")).toBe("true")
    expect(disabled.matches(":state(disabled)")).toBe(true)
  })
})

////////////////
// ## Pointer
////////////////

describe("<ui-slider> pointer", () => {
  it("pressing the track jumps the thumb there;  dragging follows;  ui-change once at the end", async () => {
    const { host, inner, root } = await slider(`value="0" aria-label="S"`)
    const inputs = events(host, "ui-input")
    const changes = events(host, "ui-change")
    const track = root.querySelector(".track")!
    point("pointerdown", track, inner, 0.5)
    await settle()
    expect(host.value).toBe(10)
    expect(host.matches(":state(dragging)")).toBe(true)
    expect(host.shadowRoot!.activeElement).toBe(parts(host).thumbs[0])
    point("pointermove", inner, inner, 0.75)
    await settle()
    expect(host.value).toBe(15)
    point("pointerup", inner, inner, 0.75)
    await settle()
    expect(inputs.map((detail) => detail.value)).toEqual([10, 15])
    expect(changes).toEqual([{ value: 15 }])
    expect(host.matches(":state(dragging)")).toBe(false)
  })

  it("range:  moves the nearest thumb, never past the other", async () => {
    const { host, inner, root } = await slider(`range value="5" end="10" aria-label="S"`)
    const track = root.querySelector(".track")!
    point("pointerdown", track, inner, 0.9)
    await settle()
    expect([host.value, host.end]).toEqual([5, 18])
    point("pointerup", inner, inner, 0.9)
    point("pointerdown", parts(host).thumbs[0]!, inner, 0.25)
    point("pointermove", inner, inner, 1)
    await settle()
    expect([host.value, host.end]).toEqual([18, 18])
    point("pointerup", inner, inner, 1)
  })

  it("smooth:  the thumb glides with the pointer while its value snaps", async () => {
    const { host, inner, root } = await slider(`smooth step="5" aria-label="S"`)
    point("pointerdown", root.querySelector(".track")!, inner, 0.33)
    await settle()
    expect(host.value).toBe(5)
    expect(Number(parts(host).thumbs[0]!.style.getPropertyValue("--_slider-at"))).toBeCloseTo(0.33, 2)
    point("pointerup", inner, inner, 0.33)
    await settle()
    expect(parts(host).thumbs[0]!.style.getPropertyValue("--_slider-at")).toBe("0.25")
  })

  it("ignores the pointer while readonly", async () => {
    const { host, inner, root } = await slider(`readonly value="2" aria-label="S"`)
    point("pointerdown", root.querySelector(".track")!, inner, 0.9)
    await settle()
    expect(host.value).toBe(2)
  })
})

////////////////
// ## Forms
////////////////

describe("<ui-slider> forms", () => {
  it("submits `value`;  a range two entries under its name;  resets to the attributes", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-slider name="volume" value="7" aria-label="Volume"></ui-slider>
      <ui-slider name="price" range value="5" end="15" aria-label="Price"></ui-slider>
    </form>`)
    await settle()
    expect([...new FormData(form)]).toEqual([
      ["volume", "7"],
      ["price", "5"],
      ["price", "15"]
    ])
    const [volume, price] = form.querySelectorAll<Slider>("ui-slider")
    volume!.value = 3
    price!.end = 12
    await settle()
    expect(new FormData(form).getAll("price")).toEqual(["5", "12"])
    form.reset()
    await settle()
    expect([...new FormData(form)]).toEqual([
      ["volume", "7"],
      ["price", "5"],
      ["price", "15"]
    ])
  })

  it("is left out when disabled by a fieldset", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><fieldset disabled><ui-slider name="s" value="2" aria-label="S"></ui-slider></fieldset></form>`
    )
    await settle()
    expect(new FormData(form).has("s")).toBe(false)
    expect(parts(form.querySelector("ui-slider")!).thumbs[0]!.hasAttribute("tabindex")).toBe(false)
  })

  it("restores a saved state:  one value, or a range's entries", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(`<form>
      <ui-slider name="one" aria-label="One"></ui-slider>
      <ui-slider name="two" range aria-label="Two"></ui-slider>
    </form>`)
    const [one, two] = form.querySelectorAll<Slider>("ui-slider")
    one!.formStateRestoreCallback("6", "restore")
    const saved = new FormData()
    saved.append("two", "4")
    saved.append("two", "9")
    two!.formStateRestoreCallback(saved, "restore")
    await settle()
    expect([one!.value, two!.value, two!.end]).toEqual([6, 4, 9])
    expect(new FormData(form).getAll("two")).toEqual(["4", "9"])
  })

  it("is named by a <label for> across the shadow boundary", async () => {
    const container = await ElementFixture.render(
      `<div><label for="vol">Volume</label><ui-slider id="vol"></ui-slider></div>`
    )
    const host = container.querySelector<Slider>("ui-slider")!
    await expect.poll(() => parts(host).thumbs[0]!.getAttribute("aria-label")).toBe("Volume")
    container.querySelector("label")!.click()
    expect(host.shadowRoot!.activeElement).toBe(parts(host).thumbs[0])
    await expectAccessible(container)
  })
})

////////////////
// ## Tokens
////////////////

describe("<ui-slider> tokens from outside", () => {
  /** The track's height, which `--ui-slider-track-height` drives. */
  function trackHeight(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=track]")!).height
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await slider(`style="--ui-slider-track-height: 10px"`)
    expect(trackHeight(host)).toBe("10px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-slider-track-height: 10px"><div><ui-slider></ui-slider></div></section>`
    )
    expect(trackHeight(wrapper.querySelector("ui-slider")!)).toBe("10px")
  })

  it("takes a token set through `::part(slider)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(slider) { --ui-slider-track-height: 10px }</style><ui-slider class="themed"></ui-slider></div>`
    )
    expect(trackHeight(wrapper.querySelector("ui-slider")!)).toBe("10px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-slider-track-height", "10px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-slider-track-height")
    })
    const { host } = await slider("")
    expect(trackHeight(host)).toBe("10px")
  })

  it("variations:  `inverted` swaps the track colour for its own token", async () => {
    const red = "rgb(255, 0, 0)"
    const { host: plain } = await slider(`style="--ui-slider-track-color: ${red}"`)
    const track = (host: Element) => getComputedStyle(host.shadowRoot!.querySelector("[part~=track]")!)
    expect(track(plain).backgroundColor).toBe(red)
    const { host: inverted } = await slider(`inverted style="--ui-slider-track-color: ${red}"`)
    expect(track(inverted).backgroundColor).not.toBe(red)
    const { host: themed } = await slider(`inverted style="--ui-slider-inverted-track-color: ${red}"`)
    expect(track(themed).backgroundColor).toBe(red)
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-slider> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})
