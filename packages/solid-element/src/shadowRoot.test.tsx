/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/** FIX 9:  an existing declarative shadow root is adopted and replaced, not appended to. */

import { afterEach, describe, expect, it } from "vite-plus/test"

import { customElement } from "./customElement"
import { cleanup, mount, nextTag, reproduce } from "./testing"

/** A container holding server-rendered `<tag>` markup with a declarative shadow root. */
function serverRendered(tag: string, mode: "open" | "closed" = "open") {
  const container = mount()
  container.setHTMLUnsafe(`<${tag}><template shadowrootmode="${mode}"><p>server</p></template></${tag}>`)
  return container.firstElementChild as HTMLElement & { renderRoot: ShadowRoot }
}

describe("fix 9:  declarative shadow DOM", () => {
  afterEach(cleanup)

  reproduce(
    "the client render replaces the server-rendered content",
    ({ customElement }) => {
      const tag = nextTag("dsd")
      const element = serverRendered(tag)
      customElement(tag, {}, () => <p>client</p>)
      return element.shadowRoot!.innerHTML
    },
    // `renderRoot` returns the existing root and `insert()` appends to it (component-register.js:169-172)
    { original: "<p>server</p><p>client</p>", fork: "<p>client</p>" }
  )

  it("fork:  a CLOSED declarative root is adopted through internals", () => {
    const tag = nextTag("dsd-closed")
    const element = serverRendered(tag, "closed")
    customElement(tag, {}, () => <p>client</p>, { internals: true, shadowRootInit: { mode: "closed" } })
    expect(element.shadowRoot).toBeNull()
    expect(element.renderRoot.innerHTML).toBe("<p>client</p>")
  })

  it("fork:  the adopted root is the same node the server made", () => {
    const tag = nextTag("dsd-same")
    const element = serverRendered(tag)
    const serverRoot = element.shadowRoot
    customElement(tag, {}, () => <p>client</p>)
    expect(element.shadowRoot).toBe(serverRoot)
  })
})
