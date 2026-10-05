import { afterEach, describe, expect, it } from "vite-plus/test"

import { closestAcrossShadow, isBrowser, nextFrame, whenDefined } from "./dom"

/** Unique tag per test, since `customElements.define()` can't be undone. */
let tagCount = 0
function uniqueTag(name: string) {
  return `test-${name}-${++tagCount}`
}

describe("isBrowser()", () => {
  it("is true under vitest browser mode", () => {
    expect(isBrowser()).toBe(true)
  })
})

describe("nextFrame()", () => {
  it("resolves with a frame timestamp", async () => {
    const time = await nextFrame()
    expect(typeof time).toBe("number")
  })
})

describe("whenDefined()", () => {
  it("resolves once the element is defined", async () => {
    const tag = uniqueTag("later")
    const pending = whenDefined(tag)
    class Later extends HTMLElement {}
    customElements.define(tag, Later)
    expect(await pending).toBe(Later)
  })

  it("resolves immediately for an already-defined element", async () => {
    const tag = uniqueTag("now")
    class Now extends HTMLElement {}
    customElements.define(tag, Now)
    expect(await whenDefined(tag)).toBe(Now)
  })
})

describe("closestAcrossShadow()", () => {
  const container = document.createElement("div")
  afterEach(() => container.remove())

  /**
   * `<test-owner class="owner">` whose shadow root wraps a `<slot>` in a `<section class="inner">`,
   * with a light-DOM `<span class="part">` slotted into it.
   */
  function render() {
    const tag = uniqueTag("owner")
    customElements.define(
      tag,
      class extends HTMLElement {
        constructor() {
          super()
          this.attachShadow({
            mode: "open"
          }).innerHTML = `<section class="inner"><slot></slot><b class="deep"></b></section>`
        }
      }
    )
    container.innerHTML = `<div class="page"><${tag} class="owner"><span class="part"></span></${tag}></div>`
    document.body.append(container)
    const owner = container.querySelector(".owner")!
    return { owner, part: owner.querySelector(".part")!, deep: owner.shadowRoot!.querySelector(".deep")! }
  }

  it("matches the element itself", () => {
    const { part } = render()
    expect(closestAcrossShadow(part, ".part")).toBe(part)
  })

  it("climbs from a slotted element through its slot", () => {
    const { part, owner } = render()
    expect(closestAcrossShadow(part, ".inner")).toBe(owner.shadowRoot!.querySelector(".inner"))
    expect(closestAcrossShadow(part, ".owner")).toBe(owner)
  })

  it("climbs out of a shadow root to its host and beyond", () => {
    const { deep, owner } = render()
    expect(closestAcrossShadow(deep, ".owner")).toBe(owner)
    expect(closestAcrossShadow(deep, ".page")).toBe(container.querySelector(".page"))
  })

  it("returns null when nothing matches", () => {
    const { deep } = render()
    expect(closestAcrossShadow(deep, ".nowhere")).toBeNull()
  })
})
