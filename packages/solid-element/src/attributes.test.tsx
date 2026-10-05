/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/** FIX 4:  removals always apply;  change callbacks know their source;  synchronous reflection guard. */

import { flush } from "solid-js"
import { afterEach, describe, expect, it } from "vite-plus/test"

import { customElement } from "./customElement"
import type { ChangeSource, SolidElement } from "./solid-element.types"
import { cleanup, mount, nextTag, reproduce } from "./testing"

describe("fix 4:  attribute <=> property", () => {
  afterEach(cleanup)

  reproduce<string | boolean>(
    "removing a bare attribute reaches the component",
    ({ customElement }) => {
      const tag = nextTag("bare-removal")
      // `parse: false` (the workaround for the bare-boolean bug) makes the raw value `""`, which is falsy
      customElement(tag, { primary: { value: false, parse: false } }, () => null)
      const element = mount(`<${tag} primary></${tag}>`).firstElementChild as HTMLElement & {
        primary: string | boolean
      }
      element.removeAttribute("primary")
      return element.primary
    },
    // `if (newVal == null && !this[name]) return` (component-register.js:161)
    { original: "", fork: false }
  )

  reproduce(
    "change callbacks receive the source",
    ({ customElement }) => {
      const tag = nextTag("change-source")
      const sources: unknown[] = []
      customElement(tag, { label: "" }, (_props: unknown, { element }: { element: SolidElement }) => {
        element.addPropertyChangedCallback((...args: unknown[]) => sources.push(args[3]))
        return null
      })
      const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement & { label: string }
      element.setAttribute("label", "a")
      element.label = "b"
      return sources
    },
    { original: [undefined, undefined], fork: ["attribute", "property"] }
  )

  reproduce(
    "an author's setAttribute() right after a reflecting property write is not swallowed",
    ({ customElement }) => {
      const tag = nextTag("same-tick")
      customElement(tag, { label: { value: "", reflect: true } }, () => null)
      const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement & { label: string }
      element.label = "from property"
      element.setAttribute("label", "from attribute")
      return element.label
    },
    // `__updating[attribute]` is cleared a microtask later (component-register.js:70/73)
    { original: "from property", fork: "from attribute" }
  )

  it('fork:  attribute writes are not reflected back (`primary="yes"` stays)', () => {
    const tag = nextTag("no-echo")
    customElement(tag, { primary: { type: Boolean, reflect: true } }, () => null)
    const element = mount(`<${tag} primary="yes"></${tag}>`).firstElementChild as HTMLElement & { primary: boolean }
    expect(element.primary).toBe(true)
    expect(element.getAttribute("primary")).toBe("yes")
    element.primary = false
    expect(element.hasAttribute("primary")).toBe(false)
    element.primary = true
    expect(element.getAttribute("primary")).toBe("")
  })

  it("fork:  reflection of arrays round-trips without re-parsing its own write", () => {
    const tag = nextTag("array-reflect")
    const seen: ChangeSource[] = []
    customElement(tag, { items: { type: Array, value: [] as string[], reflect: true } }, (props, { element }) => {
      element.addPropertyChangedCallback((_key, _value, _old, source) => seen.push(source))
      return <span>{props.items.join(",")}</span>
    })
    const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement & { items: string[] }
    const items = ["a", "b"]
    element.items = items
    flush()
    expect(element.items).toBe(items)
    expect(element.getAttribute("items")).toBe('["a","b"]')
    expect(seen).toEqual(["property"])
    expect(element.shadowRoot!.textContent).toBe("a,b")
  })

  it("fork:  attributes are read before connect", () => {
    const tag = nextTag("before-connect")
    customElement(tag, { count: 0 }, () => null)
    const element = document.createElement(tag) as HTMLElement & { count: number }
    element.setAttribute("count", "3")
    expect(element.count).toBe(3)
  })

  reproduce(
    "a bare element does not grow attributes for defaulted props",
    ({ customElement }) => {
      const tag = nextTag("no-default-reflect")
      customElement(
        tag,
        { variant: { value: "solid", reflect: true }, open: { value: false, reflect: true } },
        () => null
      )
      const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement
      return element.outerHTML.replace(tag, "x").replace(tag, "x")
    },
    // `initializeProps` reflects every default on connect (component-register.js:40)
    { original: '<x variant="solid"></x>', fork: "<x></x>" }
  )

  it("fork:  setting a prop to its default value reflects", () => {
    const tag = nextTag("default-write")
    customElement(tag, { variant: { value: "solid", reflect: true } }, () => null)
    const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement & { variant: string }
    expect(element.hasAttribute("variant")).toBe(false)
    element.variant = "solid"
    expect(element.getAttribute("variant")).toBe("solid")
    element.variant = ""
    expect(element.getAttribute("variant")).toBe("")
  })

  it("fork:  removing the attribute restores the default and leaves no attribute", () => {
    const tag = nextTag("remove-restores")
    customElement(tag, { variant: { value: "solid", reflect: true } }, () => null)
    const element = mount(`<${tag} variant="outline"></${tag}>`).firstElementChild as HTMLElement & {
      variant: string
    }
    expect(element.variant).toBe("outline")
    element.removeAttribute("variant")
    expect(element.variant).toBe("solid")
    expect(element.hasAttribute("variant")).toBe(false)
  })
})
