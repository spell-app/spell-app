import { afterEach, describe, expect, it } from "vite-plus/test"

import { OwnerContext } from "$/ui/elements"

/**
 * Real custom elements with shadow roots and slots, as components will have:
 * - `<owner-card>` / `<owner-modal>` own parts;  the modal also renders a header INSIDE its shadow root
 * - `<owner-content>` / `<owner-header>` are generic parts, slotting their children
 * - `<owner-segment>` is a component that owns nothing (a barrier candidate)
 * - `<owner-closed>` owns parts from behind a CLOSED shadow root
 */
define("owner-card", `<article><slot></slot></article>`)
define("owner-modal", `<dialog open><owner-header id="internal"></owner-header><slot></slot></dialog>`)
define("owner-content", `<section><slot></slot></section>`)
define("owner-header", `<h2><slot></slot></h2>`)
define("owner-segment", `<div><slot></slot></div>`)
define("owner-closed", `<aside><slot></slot></aside>`, "closed")

/** Tags that own `header`. */
const OWNERS = new Set(["owner-card", "owner-modal", "owner-closed"])

const container = document.createElement("div")
afterEach(() => container.remove())

/** Render `html` into the live document;  return the element with `id`. */
function render(html: string, id: string) {
  container.innerHTML = html
  document.body.append(container)
  return container.querySelector(`#${id}`)!
}

describe("OwnerContext.find()", () => {
  it("finds a direct owner through its slot", () => {
    const header = render(`<owner-card id="card"><owner-header id="h">Hi</owner-header></owner-card>`, "h")
    expect(header.assignedSlot).not.toBeNull()
    expect(OwnerContext.find(header, OWNERS)).toEqual({
      owner: container.querySelector("#card"),
      ownerNoun: "card",
      depth: 0
    })
  })

  it("resolves a part inside a part to the component (card > content > header)", () => {
    const header = render(
      `<owner-card id="card"><owner-content><owner-header id="h">Hi</owner-header></owner-content></owner-card>`,
      "h"
    )
    expect(OwnerContext.find(header, OWNERS)).toMatchObject({ owner: container.querySelector("#card"), depth: 1 })
  })

  it("picks the NEAREST owner", () => {
    const header = render(
      `<owner-modal id="modal"><owner-card id="card"><owner-header id="h"></owner-header></owner-card></owner-modal>`,
      "h"
    )
    expect(OwnerContext.find(header, OWNERS)?.ownerNoun).toBe("card")
    const card = container.querySelector("#card")!
    expect(OwnerContext.find(card, OWNERS)?.ownerNoun).toBe("modal")
  })

  it("climbs out of the owner's own shadow root", () => {
    render(`<owner-modal id="modal"></owner-modal>`, "modal")
    const modal = container.querySelector("#modal")!
    const internal = modal.shadowRoot!.querySelector("#internal")!
    expect(OwnerContext.find(internal, OWNERS)).toEqual({ owner: modal, ownerNoun: "modal", depth: 0 })
  })

  it("finds owners of slotted light-DOM parts in a slotted component", () => {
    const header = render(
      `<owner-modal id="modal"><owner-content><owner-header id="h"></owner-header></owner-content></owner-modal>`,
      "h"
    )
    expect(OwnerContext.find(header, OWNERS)).toMatchObject({ ownerNoun: "modal", depth: 1 })
  })

  it("climbs through native wrappers without counting them", () => {
    const header = render(
      `<owner-card id="card"><div><p><owner-header id="h"></owner-header></p></div></owner-card>`,
      "h"
    )
    expect(OwnerContext.find(header, OWNERS)).toMatchObject({ ownerNoun: "card", depth: 0 })
  })

  it("climbs through a closed shadow root via the light parent", () => {
    const header = render(`<owner-closed id="closed"><owner-header id="h"></owner-header></owner-closed>`, "h")
    expect(header.assignedSlot).toBeNull()
    expect(OwnerContext.find(header, OWNERS)).toMatchObject({ ownerNoun: "closed", depth: 0 })
  })

  it("stops at a barrier", () => {
    const header = render(
      `<owner-card><owner-segment><owner-header id="h"></owner-header></owner-segment></owner-card>`,
      "h"
    )
    expect(OwnerContext.find(header, OWNERS)).toMatchObject({ ownerNoun: "card", depth: 1 })
    const barrier = (element: Element) => element.localName === "owner-segment"
    expect(OwnerContext.find(header, OWNERS, { barrier })).toBeUndefined()
  })

  it("never returns the element itself, and returns undefined without an owner", () => {
    const card = render(`<owner-card id="card"></owner-card>`, "card")
    expect(OwnerContext.find(card, OWNERS)).toBeUndefined()
  })

  it("takes a Map for translated tags, and a function", () => {
    const header = render(`<owner-card><owner-header id="h"></owner-header></owner-card>`, "h")
    expect(OwnerContext.find(header, new Map([["owner-card", "tarjeta"]]))?.ownerNoun).toBe("tarjeta")
    expect(OwnerContext.find(header, (tag) => tag === "owner-card")?.ownerNoun).toBe("card")
    expect(OwnerContext.find(header, (tag) => (tag === "owner-card" ? "custom" : undefined))?.ownerNoun).toBe("custom")
    expect(OwnerContext.find(header, () => false)).toBeUndefined()
  })

  it("hands a function lookup the element, so an owner can decide per instance", () => {
    const header = render(
      `<owner-card id="outer"><owner-card id="inner" data-owns="no"><owner-header id="h"></owner-header></owner-card></owner-card>`,
      "h"
    )
    const lookup = (tag: string, element: Element) => tag === "owner-card" && element.getAttribute("data-owns") !== "no"
    expect(OwnerContext.find(header, lookup)).toMatchObject({ owner: container.querySelector("#outer"), depth: 1 })
  })
})

describe("OwnerContext helpers", () => {
  it("names the custom state", () => {
    expect(OwnerContext.stateName("card")).toBe("in-card")
  })
})

////////////////
// ## Helpers
////////////////

/** Define custom element `tag` whose shadow root holds `html`. */
function define(tag: string, html: string, mode: ShadowRootMode = "open") {
  customElements.define(
    tag,
    class extends HTMLElement {
      constructor() {
        super()
        this.attachShadow({ mode }).innerHTML = html
      }
    }
  )
}
