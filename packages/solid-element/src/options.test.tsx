/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/** FIX 1:  `customElement(tag, props, Component, options)` -- base class, registry, shadow root, form association. */

import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { customElement } from "./customElement"
import { cleanup, mount, nextTag, reproduce } from "./testing"

describe("fix 1:  options", () => {
  afterEach(cleanup)

  reproduce(
    "`BaseElement`:  the element extends your class",
    ({ customElement }) => {
      /** A base with its own member. */
      class Base extends HTMLElement {
        greet() {
          return "hi"
        }
      }
      const Class = customElement(nextTag("base"), {}, () => null, { BaseElement: Base })
      return Class.prototype instanceof Base
    },
    { original: false, fork: true }
  )

  reproduce(
    "`formAssociated`:  the defined class is form-associated",
    ({ customElement }) => {
      const Class = customElement(nextTag("form-associated"), {}, () => null, { formAssociated: true })
      return (Class as unknown as { formAssociated?: boolean }).formAssociated === true
    },
    { original: false, fork: true }
  )

  reproduce(
    "`shadowRootInit`:  `delegatesFocus` reaches `attachShadow()`",
    ({ customElement }) => {
      const tag = nextTag("delegates-focus")
      customElement(tag, {}, () => <button>inner</button>, { shadowRootInit: { mode: "open", delegatesFocus: true } })
      const element = mount(`<${tag}></${tag}>`).firstElementChild!
      return element.shadowRoot!.delegatesFocus
    },
    { original: false, fork: true }
  )

  reproduce(
    "`registry`:  defined in the given registry, not the global one",
    ({ customElement }) => {
      const tag = nextTag("scoped")
      const registry = { get: vi.fn(), define: vi.fn() }
      customElement(tag, {}, () => null, { registry })
      return { global: !!customElements.get(tag), scoped: registry.define.mock.calls.length }
    },
    { original: { global: true, scoped: 0 }, fork: { global: false, scoped: 1 } }
  )

  it("fork:  the base constructor runs first, and its members work", () => {
    const calls: string[] = []
    /** A base that records construction. */
    class Base extends HTMLElement {
      constructor() {
        super()
        calls.push("base")
      }
    }
    const tag = nextTag("base-order")
    customElement(
      tag,
      { label: "" },
      () => {
        calls.push("component")
        return null
      },
      { BaseElement: Base }
    )
    mount(`<${tag}></${tag}>`)
    expect(calls).toEqual(["base", "component"])
  })

  it("fork:  `shadowRootInit: false` renders into the element", () => {
    const tag = nextTag("light-dom")
    customElement(tag, {}, () => <b>light</b>, { shadowRootInit: false })
    const element = mount(`<${tag}></${tag}>`).firstElementChild!
    expect(element.shadowRoot).toBeNull()
    expect(element.innerHTML).toBe("<b>light</b>")
  })

  it("fork:  a closed shadow root is still the render root", () => {
    const tag = nextTag("closed")
    customElement(tag, {}, () => <i>closed</i>, { shadowRootInit: { mode: "closed" } })
    const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement & { renderRoot: ShadowRoot }
    expect(element.shadowRoot).toBeNull()
    expect(element.renderRoot.textContent).toBe("closed")
  })

  it("fork:  re-registering a tag swaps the component (hot reload);  a foreign tag throws", () => {
    const tag = nextTag("reregister")
    const First = customElement(tag, {}, () => "one")
    const Second = customElement(tag, {}, () => "two")
    expect(Second).toBe(First)
    expect(mount(`<${tag}></${tag}>`).firstElementChild!.shadowRoot!.textContent).toBe("two")
    const foreign = nextTag("foreign")
    customElements.define(foreign, class extends HTMLElement {})
    expect(() => customElement(foreign, {}, () => null)).toThrow(/another library/)
  })
})
