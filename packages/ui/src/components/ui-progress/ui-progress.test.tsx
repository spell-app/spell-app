import { describe, expect, it, onTestFinished } from "vite-plus/test"

import type { UIHost } from "$/ui/elements"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-progress"
import "$/ui/components/ui-segment"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-progress/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A progress host with its properties. */
type Progress = UIHost & { value: string; total: number; percent: string; state: string; indeterminate: unknown }

/** Render one progress;  returns the host and its pieces. */
async function progress(html: string) {
  const host = await ElementFixture.render<Progress>(html)
  return { host, ...parts(host) }
}

/** Pieces of a rendered progress. */
function parts(host: Element) {
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=progress]")!
  return {
    root,
    bars: [...root.querySelectorAll<HTMLElement>("[part~=bar]")],
    label: root.querySelector<HTMLElement>("[part~=label]")!
  }
}

/** Collect `detail`s of `name`. */
function events(host: Element, name: string) {
  const details: Record<string, unknown>[] = []
  host.addEventListener(name, (event) => details.push((event as CustomEvent).detail))
  return details
}

////////////////
// ## Classes
////////////////

describe("<ui-progress> classes", () => {
  it.each([
    ["", "ui progress"],
    ['size="small" color="teal"', "ui small teal progress"],
    ["active indicating", "ui active indicating progress"],
    ['state="warning"', "ui warning progress"],
    ["basic inverted right-aligned disabled", "ui basic disabled inverted right aligned progress"],
    ["indeterminate", "ui indeterminate progress"],
    ['indeterminate="sliding" speed="fast"', "ui fast sliding indeterminate progress"],
    ["attached", "ui attached progress"],
    ['attached="top"', "ui top attached progress"],
    ['value="100"', "ui success progress"],
    ['value="100" state="error"', "ui error progress"]
  ])("<ui-progress %s>", async (attributes, classes) => {
    const { root } = await progress(`<ui-progress ${attributes} aria-label="P"></ui-progress>`)
    expect(root.className).toBe(classes)
  })
})

////////////////
// ## Numbers
////////////////

describe("<ui-progress> numbers", () => {
  it("draws one bar at `value` percent, with `data-percent`", async () => {
    const { root, bars } = await progress(`<ui-progress value="45" aria-label="P"></ui-progress>`)
    expect(bars).toHaveLength(1)
    expect(bars[0]!.style.width).toBe("45%")
    expect(root.dataset.percent).toBe("45")
    expect(bars[0]!.matches(":empty")).toBe(true)
  })

  it("reads `value` as a share of `total`, or `percent` directly, clamped", async () => {
    const { bars } = await progress(`<ui-progress value="9" total="20" aria-label="P"></ui-progress>`)
    expect(bars[0]!.style.width).toBe("45%")
    const { bars: direct } = await progress(`<ui-progress percent="30" value="90" aria-label="P"></ui-progress>`)
    expect(direct[0]!.style.width).toBe("30%")
    const { bars: over } = await progress(`<ui-progress value="130" aria-label="P"></ui-progress>`)
    expect(over[0]!.style.width).toBe("100%")
  })

  it("writes the bar text in the `bar-text` format, rounded to `precision`", async () => {
    const { bars } = await progress(`<ui-progress value="1" total="3" bar-text="percent" aria-label="P"></ui-progress>`)
    expect(bars[0]!.querySelector("[part~=bar-text]")!.textContent).toBe("33%")
    const { bars: precise } = await progress(
      `<ui-progress value="1" total="3" bar-text="percent" precision="1" aria-label="P"></ui-progress>`
    )
    expect(precise[0]!.textContent).toBe("33.3%")
    const { bars: ratio } = await progress(
      `<ui-progress value="9" total="20" bar-text="ratio" aria-label="P"></ui-progress>`
    )
    expect(ratio[0]!.textContent).toBe("9 of 20")
  })

  it("draws several bars from a list:  hues, a hidden zero bar, inner corners squared", async () => {
    const { root, bars } = await progress(
      `<ui-progress value="10,0,30,20" bar-colors="red nope blue" aria-label="P"></ui-progress>`
    )
    expect(bars).toHaveLength(4)
    expect(bars.map((bar) => bar.className)).toEqual(["ui-red bar", "bar", "ui-blue bar", "bar"])
    expect(bars.map((bar) => bar.style.width)).toEqual(["10%", "", "30%", "20%"])
    expect(bars[1]!.style.display).toBe("none")
    expect(bars[0]!.style.borderTopRightRadius).toBe("0px")
    expect(bars[0]!.style.borderTopLeftRadius).toBe("")
    expect(bars[3]!.style.borderTopLeftRadius).toBe("0px")
    expect(bars[3]!.style.borderTopRightRadius).toBe("")
    expect(root.dataset.percent).toBe("60")
    expect(root.className).toBe("ui progress")
  })

  it("follows attribute and property changes", async () => {
    const { host, root } = await progress(`<ui-progress value="10" aria-label="P"></ui-progress>`)
    host.value = "70"
    await ElementFixture.tick()
    expect(parts(host).bars[0]!.style.width).toBe("70%")
    expect(root.dataset.percent).toBe("70")
    host.setAttribute("total", "200")
    await ElementFixture.tick()
    expect(parts(host).bars[0]!.style.width).toBe("35%")
  })

  it("indeterminate:  no width, no `data-percent`", async () => {
    const { root, bars, host } = await progress(`<ui-progress indeterminate value="40" aria-label="P"></ui-progress>`)
    expect(bars[0]!.style.width).toBe("")
    expect(root.hasAttribute("data-percent")).toBe(false)
    expect(host.matches(":state(indeterminate)")).toBe(true)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-progress> tokens from outside", () => {
  /** The first bar's height. */
  function height(host: Element): string {
    return getComputedStyle(parts(host).bars[0]!).height
  }

  it("takes a token set on the HOST", async () => {
    const { host } = await progress(`<ui-progress value="40" style="--ui-progress-bar-height: 20px"></ui-progress>`)
    expect(height(host)).toBe("20px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-progress-bar-height: 20px"><ui-progress value="40"></ui-progress></section>`
    )
    expect(height(wrapper.querySelector("ui-progress")!)).toBe("20px")
  })

  it("takes a token set through `::part(progress)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(progress) { --ui-progress-bar-height: 20px }</style>` +
        `<ui-progress class="themed" value="40"></ui-progress></div>`
    )
    expect(height(wrapper.querySelector("ui-progress")!)).toBe("20px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-progress-bar-height", "20px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-progress-bar-height")
    })
    const { host } = await progress(`<ui-progress value="40"></ui-progress>`)
    expect(height(host)).toBe("20px")
  })

  it("a size swaps the bar height", async () => {
    const { host } = await progress(
      `<ui-progress size="large" value="40" style="--ui-progress-bar-height: 20px"></ui-progress>`
    )
    expect(height(host)).not.toBe("20px")
  })
})

////////////////
// ## Label
////////////////

describe("<ui-progress> label", () => {
  it("fills the `label` shorthand's placeholders", async () => {
    const { label } = await progress(`<ui-progress value="9" total="20" label="{value} of {total}, {left} left">
      </ui-progress>`)
    expect(label.querySelector("slot")!.textContent).toBe("9 of 20, 11 left")
  })

  it("shows slotted content instead", async () => {
    const { label, host } = await progress(`<ui-progress value="5">Uploading <b>files</b></ui-progress>`)
    expect(label.querySelector("slot")!.assignedNodes().length).toBeGreaterThan(0)
    expect(host.internals.ariaLabel).toBe("Uploading files")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-progress> accessibility", () => {
  it("is a progressbar through internals:  range, value, text, name", async () => {
    const { host } = await progress(`<ui-progress value="9" total="20" label="Files"></ui-progress>`)
    expect(host.internals).toMatchObject({
      role: "progressbar",
      ariaValueMin: "0",
      ariaValueMax: "20",
      ariaValueNow: "9",
      ariaValueText: "45%",
      ariaLabel: "Files"
    })
  })

  it("speaks the ratio with `bar-text=ratio`, every bar's text for several", async () => {
    const { host } = await progress(`<ui-progress value="9" total="20" bar-text="ratio" label="F"></ui-progress>`)
    expect(host.internals.ariaValueText).toBe("9 of 20")
    const { host: multiple } = await progress(`<ui-progress value="10,20" label="F"></ui-progress>`)
    expect([multiple.internals.ariaValueNow, multiple.internals.ariaValueText]).toEqual(["30", "10%, 20%"])
  })

  it("has no value while indeterminate", async () => {
    const { host } = await progress(`<ui-progress indeterminate label="Waiting"></ui-progress>`)
    expect(host.internals.ariaValueNow).toBeNull()
    expect(host.internals.ariaValueText).toBeNull()
  })

  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await ElementFixture.tick()
    await expectAccessible(root)
  })
})

////////////////
// ## Events and states
////////////////

describe("<ui-progress> events and states", () => {
  it("fires ui-change on changes (not the first render), ui-complete once at 100", async () => {
    const { host } = await progress(`<ui-progress value="20" total="40" aria-label="P"></ui-progress>`)
    const changes = events(host, "ui-change")
    const completes = events(host, "ui-complete")
    await ElementFixture.tick()
    expect(changes).toEqual([])
    host.value = "30"
    await ElementFixture.tick()
    expect(changes).toEqual([{ percent: 75, percents: [75], value: 30, total: 40 }])
    host.value = "40"
    await ElementFixture.tick()
    expect(completes).toEqual([{ value: 40, total: 40 }])
    expect(host.matches(":state(complete)")).toBe(true)
    host.value = "40"
    host.setAttribute("precision", "1")
    await ElementFixture.tick()
    expect(completes).toHaveLength(1)
  })

  it("sets :state(active) and :state(disabled) for page styling", async () => {
    const { host } = await progress(`<ui-progress active disabled value="5" aria-label="P"></ui-progress>`)
    expect(host.matches(":state(active)")).toBe(true)
    expect(host.matches(":state(disabled)")).toBe(true)
  })
})
