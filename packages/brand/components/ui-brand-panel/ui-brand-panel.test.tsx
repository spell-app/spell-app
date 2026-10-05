import { describe, expect, it, vi } from "vite-plus/test"

import { ThemeSheets } from "$/ui/styles"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/brand/hues"
import "$/brand/components"

/** `value` (a CSS colour) as the browser computes it on a probe in the page. */
function probe(value: string): string {
  const span = document.createElement("span")
  span.style.backgroundColor = value
  document.body.append(span)
  const computed = getComputedStyle(span).backgroundColor
  span.remove()
  return computed
}

/** The section root in `host`'s shadow root. */
function root(host: Element): HTMLElement {
  return host.shadowRoot!.querySelector("section")!
}

/** A part of `host`'s section. */
function part(host: Element, name: string): HTMLElement {
  return host.shadowRoot!.querySelector(`[part~="${name}"]`)!
}

describe("<ui-brand-panel>", () => {
  it("is a section under its own tag:  `brand panel`, and `sub` inside another panel", async () => {
    const host = await ElementFixture.render(`<ui-brand-panel header="Color Set">
      <ui-brand-panel header="Tweak"><p>Vibrancy</p></ui-brand-panel>
    </ui-brand-panel>`)
    const inner = host.querySelector("ui-brand-panel")!
    await ElementFixture.settle()
    expect(root(host).className).toMatch(/\bsection brand panel\b/)
    expect(root(host).classList.contains("sub")).toBe(false)
    expect(root(inner).classList.contains("sub")).toBe(true)
    expect(part(host, "header").textContent).toBe("Color Set")
    await expectAccessible(host)
  })

  it("folds from its band:  the content hides, `:state(collapsed)`, `ui-close`", async () => {
    const host = await ElementFixture.render(
      `<ui-brand-panel header="Presets" collapsible><p>chips</p></ui-brand-panel>`
    )
    const closes: Event[] = []
    host.addEventListener("ui-close", (event) => closes.push(event))
    part(host, "toggle").click()
    await ElementFixture.tick()
    expect(closes).toHaveLength(1)
    expect(host.matches(":state(collapsed)")).toBe(true)
    expect(part(host, "content").getAttribute("hidden")).toBe("until-found")
  })

  it('puts each band\'s chevron at its far end, after the actions;  `fold-icon="start"` puts it back', async () => {
    const host = await ElementFixture.render(`<ui-brand-panel header="Theme" collapsible style="width: 320px">
      <button slot="actions">Copy</button>
      <ui-brand-panel header="Color" collapsible><p>fields</p></ui-brand-panel>
    </ui-brand-panel>`)
    const inner = host.querySelector("ui-brand-panel")!
    await ElementFixture.settle()
    for (const panel of [host, inner]) {
      const title = part(panel, "title")
      const icon = part(panel, "fold-icon")
      expect(icon.parentElement).toBe(title)
      expect(title.lastElementChild).toBe(icon)
      expect(getComputedStyle(icon).width).toBe("11px")
    }
    const actions = part(host, "actions").getBoundingClientRect()
    expect(part(host, "fold-icon").getBoundingClientRect().left).toBeGreaterThanOrEqual(actions.right)
    part(host, "fold-icon").click()
    await ElementFixture.tick()
    expect(host.matches(":state(collapsed)")).toBe(true)
    const start = await ElementFixture.render(
      `<ui-brand-panel header="Shape" collapsible fold-icon="start"><p>fields</p></ui-brand-panel>`
    )
    expect(part(start, "fold-icon").parentElement).toBe(part(start, "toggle"))
  })

  it("`info` shows the section's tip under a band", async () => {
    const host = await ElementFixture.render(`<ui-brand-panel header="Theme" collapsible>
      <span slot="info">A <b>theme</b> is the look of an app.</span><p>fields</p>
    </ui-brand-panel>`)
    await ElementFixture.settle()
    const tip = part(host, "tip")
    expect(tip.getAttribute("role")).toBe("tooltip")
    expect(part(host, "toggle").getAttribute("aria-describedby")).toBe(tip.id)
    expect(getComputedStyle(tip).visibility).toBe("hidden")
  })

  it("draws the box and the bands from its tokens", async () => {
    const host = await ElementFixture.render(`<ui-brand-panel header="Theme"
      style="--ui-brand-panel-background: rgb(1, 2, 3); --ui-brand-panel-header-background: rgb(4, 5, 6);
             --ui-brand-panel-subhead-background: rgb(7, 8, 9)">
      <ui-brand-panel header="Color"><p>sets</p></ui-brand-panel>
    </ui-brand-panel>`)
    await ElementFixture.settle()
    const inner = host.querySelector("ui-brand-panel")!
    expect(getComputedStyle(root(host)).backgroundColor).toBe("rgb(1, 2, 3)")
    expect(getComputedStyle(part(host, "title")).backgroundColor).toBe("rgb(4, 5, 6)")
    expect(getComputedStyle(part(inner, "title")).backgroundColor).toBe("rgb(7, 8, 9)")
    // the header band reaches the box's edges:  as wide as the box
    expect(part(host, "title").getBoundingClientRect().width).toBeCloseTo(root(host).clientWidth, 0)
    // the sub-head band reaches the OUTER box's edges too
    expect(part(inner, "title").getBoundingClientRect().width).toBeCloseTo(root(host).clientWidth, 0)
  })

  it("`color` paints the panel from the hue:  header band, box, sub-head bands;  a sub-panel follows", async () => {
    const host = await ElementFixture.render(`<ui-brand-panel header="Tweak" color="violet">
      <ui-brand-panel header="Presets"><p>chips</p></ui-brand-panel>
    </ui-brand-panel>`)
    await ElementFixture.settle()
    const inner = host.querySelector("ui-brand-panel")!
    const violetTint = probe("var(--ui-violet-background)")
    expect(root(host).classList.contains("violet")).toBe(true)
    expect(getComputedStyle(part(host, "title")).backgroundColor).toBe(violetTint)
    expect(getComputedStyle(root(host)).backgroundColor).not.toBe(violetTint) // a lighter mix
    // the sub-panel has no `color`, yet its band is the outer hue's mix, not ivory
    const ivory = probe("var(--spell-accent-75, transparent)")
    expect(getComputedStyle(part(inner, "title")).backgroundColor).not.toBe(ivory)
    expect(getComputedStyle(part(inner, "title")).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
  })

  it("no `color` is `primary`:  its band is the primary tint;  a sub-panel follows", async () => {
    const host = await ElementFixture.render(`<ui-brand-panel header="Theme">
      <ui-brand-panel header="Color"><p>sets</p></ui-brand-panel>
    </ui-brand-panel>`)
    await ElementFixture.settle()
    const inner = host.querySelector("ui-brand-panel")!
    expect(getComputedStyle(part(host, "title")).backgroundColor).toBe(probe("var(--ui-primary-background)"))
    const sub = getComputedStyle(part(inner, "title")).backgroundColor
    const primaryMix = probe("color-mix(in oklab, var(--ui-primary-background) 65%, var(--ui-surface))")
    expect(sub).toBe(primaryMix)
  })

  it('`color="accent"` is accepted (the brand\'s hue) and, in spell-brand, is the ivory look', async () => {
    await ThemeSheets.apply("spell-brand")
    const host = await ElementFixture.render(`<ui-brand-panel header="Theme" color="accent"><p>x</p></ui-brand-panel>`)
    await ElementFixture.settle()
    expect(root(host).classList.contains("accent")).toBe(true)
    await vi.waitFor(() => expect(getComputedStyle(part(host, "title")).backgroundColor).toBe("rgb(247, 239, 226)")) // accent-100
    await ThemeSheets.apply(undefined)
  })

  it("closes the box with a folded LAST sub-panel's band:  no padding left under it", async () => {
    const host = await ElementFixture.render(`<ui-brand-panel header="Color Set">
      <p>name</p>
      <ui-brand-panel header="Presets" collapsible collapsed><p>chips</p></ui-brand-panel>
    </ui-brand-panel>`)
    await ElementFixture.settle()
    const inner = host.querySelector("ui-brand-panel")!
    const band = part(inner, "title").getBoundingClientRect()
    const box = root(host).getBoundingClientRect()
    expect(part(inner, "content").getBoundingClientRect().height).toBe(0)
    expect(box.bottom - band.bottom).toBeCloseTo(1, 0) // the box's 1px border
  })

  it("puts each sub-panel band 20px under what's above it, flush under a folded band;  padding in px (I46)", async () => {
    const host = await ElementFixture.render(`<ui-brand-panel header="Theme" style="--ui-font-size: 16px">
      <p style="margin: 0">name</p>
      <ui-brand-panel header="Color" collapsible collapsed><p>chips</p></ui-brand-panel>
      <ui-brand-panel header="Type" collapsible><p style="margin: 0">fonts</p></ui-brand-panel>
      <ui-brand-panel header="Shape" collapsible><p>corners</p></ui-brand-panel>
    </ui-brand-panel>`)
    await ElementFixture.settle()
    const [color, type, shape] = [...host.querySelectorAll("ui-brand-panel")]
    const top = (panel: Element) => part(panel, "title").getBoundingClientRect().top
    const bottom = (element: Element) => element.getBoundingClientRect().bottom
    expect(top(color!) - bottom(host.querySelector("p")!)).toBeCloseTo(20, 0)
    expect(top(type!) - part(color!, "title").getBoundingClientRect().bottom).toBeCloseTo(0, 0)
    expect(top(shape!) - bottom(type!.querySelector("p")!)).toBeGreaterThanOrEqual(20)
    // a sub-panel's padding is the page's 16px, not 1em of its 14px content
    expect(getComputedStyle(part(type!, "content")).paddingLeft).toBe("16px")
  })
})
