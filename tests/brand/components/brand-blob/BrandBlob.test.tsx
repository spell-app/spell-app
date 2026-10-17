import { describe, expect, it } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/brand/components/brand-blob"

/** The `<div part="blob">` of a `<brand-blob>`. */
function shape(host: Element): HTMLElement {
  return host.shadowRoot!.querySelector<HTMLElement>(`[part~="blob"]`)!
}

/** A clipping 800 x 400 box holding `blob`;  returns the blob's box relative to it. */
async function place(blob: string) {
  const host = await ElementFixture.render(
    `<div style="position: relative; overflow: hidden; width: 800px; height: 400px">${blob}</div>`
  )
  const element = host.firstElementChild!
  const outer = host.getBoundingClientRect()
  const box = element.getBoundingClientRect()
  return { element, left: box.left - outer.left, top: box.top - outer.top, width: box.width, height: box.height }
}

describe("<brand-blob>", () => {
  it("hangs off the bottom-right corner by default, 420 x 360, decorative", async () => {
    const { element, left, top, width, height } = await place(`<brand-blob></brand-blob>`)
    expect({ left, top, width, height }).toEqual({
      left: 800 + 160 - 420,
      top: 400 + 180 - 360,
      width: 420,
      height: 360
    })
    expect(getComputedStyle(element).pointerEvents).toBe("none")
    expect(shape(element).getAttribute("aria-hidden")).toBe("true")
    expect([...shape(element).classList]).toEqual(["blob", "organic", "bottom-right", "tone-blob"])
  })

  it("goes to any corner, sized and offset by its tokens", async () => {
    const tokens = "--brand-blob-width: 100px; --brand-blob-height: 80px; --brand-blob-x: 20px; --brand-blob-y: 10px"
    const { left, top, width } = await place(`<brand-blob corner="top-left" style="${tokens}"></brand-blob>`)
    expect([left, top, width]).toEqual([-20, -10, 100])
  })

  it("a `mound` turns its flat side out:  flipped at the top, mirrored on the left", async () => {
    const { element } = await place(`<brand-blob shape="mound" corner="top-left"></brand-blob>`)
    expect(getComputedStyle(shape(element)).scale).toBe("-1")
  })

  it("a `wave` sits flush in its corner, masked by the montage's path, mirrored to face the corner", async () => {
    const size = "--brand-blob-width: 640px; --brand-blob-height: 424px"
    const topLeft = await place(`<brand-blob shape="wave" corner="top-left" style="${size}"></brand-blob>`)
    expect([topLeft.left, topLeft.top]).toEqual([0, 0])
    const mask = getComputedStyle(shape(topLeft.element)).maskImage
    expect(mask).toMatch(/^url\("data:image\/svg\+xml/)
    expect(getComputedStyle(shape(topLeft.element)).scale).toBe("none")
    const corner = await place(`<brand-blob shape="wave" style="${size}"></brand-blob>`)
    expect([corner.left + corner.width, corner.top + corner.height]).toEqual([800, 400])
    expect(getComputedStyle(shape(corner.element)).scale).toBe("-1")
    const hung = await place(
      `<brand-blob shape="wave" corner="top-right" style="${size}; --brand-blob-x: 40px"></brand-blob>`
    )
    expect([hung.left + hung.width, hung.top]).toEqual([840, 0])
    expect(getComputedStyle(shape(hung.element)).scale).toBe("-1 1")
  })

  it("`tone` sets the colour;  `--brand-blob-color` overrides it", async () => {
    const { element } = await place(`<brand-blob style="--spell-blob: rgb(1, 2, 3)"></brand-blob>`)
    expect(getComputedStyle(shape(element)).backgroundColor).toBe("rgb(1, 2, 3)")
    element.setAttribute("style", "--brand-blob-color: rgb(4, 5, 6)")
    expect(getComputedStyle(shape(element)).backgroundColor).toBe("rgb(4, 5, 6)")
  })
})
