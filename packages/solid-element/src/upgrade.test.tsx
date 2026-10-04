/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/** FIX 2:  prototype accessors, the upgrade step, no shadowing of native members. */

import { flush } from "solid-js"
import { afterEach, describe, expect, it } from "vite-plus/test"

import { customElement } from "./customElement"
import { cleanup, mount, nextTag, reproduce } from "./testing"

describe("fix 2:  prototype accessors and upgrade", () => {
  afterEach(cleanup)

  reproduce(
    "a property set BEFORE the element is defined survives the upgrade",
    ({ customElement }) => {
      const tag = nextTag("pre-upgrade")
      const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement & { options: string[] }
      // a framework (React, Vue, Solid) sets rich data as a property, before the element's module has loaded
      element.options = ["a", "b"]
      customElement(tag, { options: { type: Array, value: [] as string[] } }, (props: { options: string[] }) => (
        <span>{props.options.join(",")}</span>
      ))
      flush()
      return { rendered: element.shadowRoot!.textContent, property: element.options }
    },
    // the constructor assigns `undefined` to every key (component-register.js:122)
    { original: { rendered: "", property: [] }, fork: { rendered: "a,b", property: ["a", "b"] } }
  )

  reproduce(
    "accessors live on the prototype;  the constructor adds no own properties",
    ({ customElement }) => {
      const tag = nextTag("prototype-accessors")
      const Class = customElement(tag, { count: 0 }, () => null)
      const element = document.createElement(tag)
      return {
        onPrototype: typeof Object.getOwnPropertyDescriptor(Class.prototype, "count")?.get,
        own: Object.hasOwn(element, "count"),
        in: "count" in element
      }
    },
    {
      original: { onPrototype: "undefined", own: true, in: true },
      fork: { onPrototype: "function", own: false, in: true }
    }
  )

  reproduce(
    "an `id` prop keeps the author's id attribute (issue #38)",
    ({ customElement }) => {
      const tag = nextTag("id-prop")
      const container = mount(`<${tag} id="author-id"></${tag}>`)
      // `property: "id"`:  overriding the native member on purpose (the original ignores the field)
      customElement(tag, { id: { value: "", property: "id" } }, () => null)
      return container.firstElementChild!.getAttribute("id")
    },
    { original: "undefined", fork: "author-id" }
  )

  reproduce(
    "a prop can't silently replace a native member (`style`)",
    ({ customElement }) => {
      const tag = nextTag("shadow-style")
      // parsed first, defined later (an upgrade):  `document.createElement()` would even fail in the original,
      // because its constructor's `this.style = undefined` adds a `style` attribute
      const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement
      try {
        customElement(tag, { style: "" }, () => null)
      } catch (error) {
        return (error as Error).message.includes("would shadow") ? "define throws" : "other error"
      }
      // an author's inline style now lands in the prop, not in CSS
      ;(element as unknown as { style: string }).style = "color: red"
      return typeof element.style
    },
    // component-register's per-instance accessor (component-register.js:41) turns `element.style` into a string
    { original: "string", fork: "define throws" }
  )

  it("fork:  `property` renames a shadowing key;  the attribute and the component's key stay", () => {
    const tag = nextTag("renamed")
    customElement(tag, { hidden: { type: Boolean, property: "isHidden" } }, (props) => (
      <span>{String(props.hidden)}</span>
    ))
    const element = mount(`<${tag} hidden></${tag}>`).firstElementChild as HTMLElement & { isHidden: boolean }
    expect(element.isHidden).toBe(true)
    expect(element.hidden).toBe(true)
    expect(element.shadowRoot!.textContent).toBe("true")
    element.isHidden = false
    flush()
    expect(element.shadowRoot!.textContent).toBe("false")
    // the native member still works
    element.hidden = false
    expect(element.hasAttribute("hidden")).toBe(false)
  })

  it("fork:  keys that shadow this package's own API throw too", () => {
    expect(() => customElement(nextTag("own-api"), { dispose: false }, () => null)).toThrow(/would shadow/)
    expect(() => customElement(nextTag("own-api"), { internals: false }, () => null)).toThrow(/would shadow/)
  })

  it("fork:  a pre-upgrade property wins over the attribute, reads right before connect, and reflects", () => {
    const tag = nextTag("upgrade-order")
    const element = document.createElement(tag) as HTMLElement & { label: string }
    element.setAttribute("label", "attribute")
    element.label = "property"
    customElement(tag, { label: { value: "", reflect: true } }, () => null)
    customElements.upgrade(element)
    expect(element.label).toBe("property")
    document.body.append(element)
    expect(element.label).toBe("property")
    expect(element.getAttribute("label")).toBe("property")
  })

  it("fork:  a pre-upgrade property equal to the default still reflects (an explicit set)", () => {
    const tag = nextTag("upgrade-default")
    const element = document.createElement(tag) as HTMLElement & { variant: string }
    element.variant = "solid"
    customElement(tag, { variant: { value: "solid", reflect: true } }, () => null)
    customElements.upgrade(element)
    document.body.append(element)
    expect(element.getAttribute("variant")).toBe("solid")
  })
})
