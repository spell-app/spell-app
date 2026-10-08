import { describe, expect, it, vi } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/brand/components/ui-brand-flourish"

/** The `<svg part="art">` of a `<ui-brand-flourish>`. */
function art(host: Element): SVGSVGElement {
  return host.shadowRoot!.querySelector<SVGSVGElement>(`[part~="art"]`)!
}

describe("<ui-brand-flourish>", () => {
  it("fills its positioned parent, decorative, sized to it", async () => {
    const host = await ElementFixture.render(
      `<div style="position: relative; width: 400px; height: 200px"><ui-brand-flourish></ui-brand-flourish></div>`
    )
    const flourish = host.querySelector<HTMLElement>("ui-brand-flourish")!
    const box = flourish.getBoundingClientRect()
    expect([box.width, box.height]).toEqual([400, 200])
    expect(getComputedStyle(flourish).pointerEvents).toBe("none")
    const svg = art(flourish)
    expect(svg.getAttribute("aria-hidden")).toBe("true")
    await vi.waitFor(() => expect(svg.getAttribute("viewBox")).toBe("0 0 400 200"))
    expect(svg.innerHTML).toContain("<path")
  })

  it("redraws on resize and on a new variant or seed", async () => {
    const host = await ElementFixture.render(
      `<div style="position: relative; width: 400px; height: 200px"><ui-brand-flourish></ui-brand-flourish></div>`
    )
    const flourish = host.querySelector<HTMLElement>("ui-brand-flourish")!
    const svg = art(flourish)
    await vi.waitFor(() => expect(svg.getAttribute("viewBox")).toBe("0 0 400 200"))
    const before = svg.innerHTML
    host.style.width = "500px"
    await vi.waitFor(() => expect(svg.getAttribute("viewBox")).toBe("0 0 500 200"))
    const wider = svg.innerHTML
    expect(wider).not.toBe(before)
    flourish.setAttribute("seed", "3")
    await vi.waitFor(() => expect(svg.innerHTML).not.toBe(wider))
    flourish.setAttribute("variant", "blobs")
    await vi.waitFor(() => expect(svg.querySelectorAll("path").length).toBe(3))
  })

  it("takes its colours from the theme's art roles, or its attributes", async () => {
    const host = await ElementFixture.render(
      `<div style="position: relative; width: 400px; height: 200px; --spell-line-flourish: rgb(1, 2, 3)">
        <ui-brand-flourish></ui-brand-flourish>
        <ui-brand-flourish stroke="rgb(4, 5, 6)"></ui-brand-flourish>
      </div>`
    )
    const [themed, given] = [...host.querySelectorAll("ui-brand-flourish")].map((element) => art(element))
    expect(getComputedStyle(themed!.querySelector("path")!).stroke).toBe("rgb(1, 2, 3)")
    expect(getComputedStyle(given!.querySelector("path")!).stroke).toBe("rgb(4, 5, 6)")
  })
})
