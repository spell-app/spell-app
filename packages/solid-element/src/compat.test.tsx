/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * Compatibility:  `@solidjs/element`'s own test suite (solidjs/solid `next`, `packages/element/test/element.spec.tsx`)
 * and its README examples, run against BOTH implementations -- the fork must behave the same where the original
 * isn't buggy.
 */

import { register as originalRegister, compose as originalCompose } from "component-register"
import { withSolid as originalWithSolid } from "@solidjs/element"
import { createContext, createSignal, flush, getOwner, onCleanup, useContext } from "solid-js"
import { render } from "@solidjs/web"
import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { compose, register } from "./customElement"
import { withSolid } from "./withSolid"
import { IMPLEMENTATIONS, cleanup, nextTag } from "./testing"

describe.each(Object.entries(IMPLEMENTATIONS))("%s:  @solidjs/element test suite", (_name, api) => {
  const { customElement, noShadowDOM, getCurrentElement } = api
  afterEach(cleanup)

  test("renders into a shadow root by default", () => {
    const tag = nextTag("shadow-render")
    customElement(tag, {}, () => <span>Hello element</span>)
    const element = document.createElement(tag)
    document.body.append(element)
    expect(element.shadowRoot!.innerHTML).toBe("<span>Hello element</span>")
  })

  test("updates rendered output when element properties change", () => {
    const tag = nextTag("reactive-prop")
    customElement(tag, { count: 0 }, (props: { count: number }) => <span>{props.count}</span>)
    const element = document.createElement(tag) as HTMLElement & { count: number }
    document.body.append(element)
    element.count = 2
    flush()
    expect(element.shadowRoot!.textContent).toBe("2")
  })

  test("parses observed attributes into reactive props", () => {
    const tag = nextTag("reactive-attr")
    customElement(tag, { label: "initial" }, (props: { label: string }) => <span>{props.label}</span>)
    const element = document.createElement(tag)
    element.setAttribute("label", "updated")
    document.body.append(element)
    expect(element.shadowRoot!.textContent).toBe("updated")
  })

  test("runs cleanup when the element disconnects", async () => {
    const tag = nextTag("cleanup")
    const [count, setCount] = createSignal(0)
    let cleanups = 0
    customElement(tag, {}, () => {
      onCleanup(() => cleanups++)
      return <span>{count()}</span>
    })
    const element = document.createElement(tag)
    document.body.append(element)
    element.remove()
    await Promise.resolve()
    setCount(1)
    flush()
    expect(cleanups).toBe(1)
    expect(element.shadowRoot!.textContent).toBe("")
  })

  test("delegated events work when rendering a custom element inside a shadow root", () => {
    let clicks = 0
    const tag = nextTag("shadow-event")
    customElement(tag, {}, () => <button onClick={() => clicks++}>Click</button>)
    const host = document.createElement("div")
    const shadow = host.attachShadow({ mode: "open" })
    const element = document.createElement(tag)
    document.body.append(host)
    shadow.append(element)
    element
      .shadowRoot!.querySelector("button")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }))
    expect(clicks).toBe(1)
  })

  // NOTE:  the fork deliberately drops this (fix 11):  a slotted element adopting its SLOT's owner is disposed with
  // the slot's branch.  `owner.test.tsx` pins the fork's side.
  test.skipIf(_name === "fork")(
    "HTML-authored provider and reader custom elements share context through slot markers",
    () => {
      const Context = createContext("missing")
      const providerTag = nextTag("library-provider")
      const readerTag = nextTag("library-reader")
      customElement(providerTag, {}, () => (
        <Context value="slot">
          <slot />
        </Context>
      ))
      customElement(readerTag, {}, () => <span>{useContext(Context)}</span>)
      document.body.innerHTML = `<${providerTag}><${readerTag}></${readerTag}></${providerTag}>`
      expect(document.body.querySelector(readerTag)!.shadowRoot!.textContent).toBe("slot")
    }
  )

  test("ancestor owner markers are found while walking up from custom elements", () => {
    const Context = createContext("missing")
    const childTag = nextTag("ancestor-marker-child")
    const root = document.createElement("div")
    customElement(childTag, {}, () => <span>{useContext(Context)}</span>)
    function App() {
      const wrapper = document.createElement("section") as HTMLElement & { _$owner?: unknown }
      wrapper._$owner = getOwner()!
      wrapper.append(document.createElement(childTag))
      return wrapper
    }
    document.body.append(root)
    const dispose = render(
      () => (
        <Context value="ancestor">
          <App />
        </Context>
      ),
      root
    )
    expect(root.querySelector(childTag)!.shadowRoot!.textContent).toBe("ancestor")
    dispose()
  })

  test("falls back to an ownerless root when _$owner comes from a foreign runtime copy (#3053)", () => {
    const tag = nextTag("foreign-owner")
    customElement(tag, { label: "ok" }, (props: { label: string }) => <span>{props.label}</span>)
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    try {
      const wrapper = document.createElement("section") as HTMLElement & { _$owner?: unknown }
      wrapper._$owner = { id: "0", ke: { ct: null } }
      const element = document.createElement(tag) as HTMLElement & { label: string }
      wrapper.append(element)
      document.body.append(wrapper)
      expect(element.shadowRoot!.textContent).toBe("ok")
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("different copy"))
      element.label = "updated"
      flush()
      expect(element.shadowRoot!.textContent).toBe("updated")
    } finally {
      warn.mockRestore()
    }
  })

  test("HTML-authored elements without a provider create an independent root", () => {
    const Context = createContext("default")
    const childTag = nextTag("context-independent")
    customElement(childTag, {}, () => <span>{useContext(Context)}</span>)
    const child = document.createElement(childTag)
    document.body.append(child)
    expect(child.shadowRoot!.textContent).toBe("default")
  })

  ////////////////
  // ## README examples
  ////////////////

  test("README:  props become properties and hyphenated attributes", () => {
    const tag = nextTag("my-component")
    customElement(
      tag,
      { someProp: "one", otherProp: "two" },
      (props: { someProp: string; otherProp: string }, { element }: { element: HTMLElement }) => (
        <span>
          {props.someProp}/{props.otherProp}/{element.localName}
        </span>
      )
    )
    document.body.innerHTML = `<${tag} some-prop="some value" other-prop="other value"></${tag}>`
    const element = document.body.firstElementChild as HTMLElement & { someProp: string }
    expect(element.shadowRoot!.textContent).toBe(`some value/other value/${tag}`)
    expect(element.someProp).toBe("some value")
  })

  test("README:  noShadowDOM() renders into the element", () => {
    const tag = nextTag("no-shadow")
    customElement(tag, { someProp: "one" }, (props: { someProp: string }) => {
      noShadowDOM()
      return <b>{props.someProp}</b>
    })
    const element = document.createElement(tag)
    document.body.append(element)
    expect(element.shadowRoot).toBeNull()
    expect(element.innerHTML).toBe("<b>one</b>")
  })

  test("README:  getCurrentElement() during setup", () => {
    const tag = nextTag("current")
    let seen: Element | undefined
    customElement(tag, {}, () => {
      seen = getCurrentElement()
      return null
    })
    const element = document.createElement(tag)
    document.body.append(element)
    expect(seen).toBe(element)
  })
})

describe("README:  compose(register(tag, props), withSolid)", () => {
  afterEach(cleanup)

  test("original:  component-register's register + @solidjs/element's withSolid", () => {
    const tag = nextTag("composed-original")
    originalCompose(
      originalRegister(tag, { someProp: "one" }),
      originalWithSolid
    )((props: { someProp: string }) => <i>{props.someProp}</i>)
    const element = document.createElement(tag)
    document.body.append(element)
    expect(element.shadowRoot!.textContent).toBe("one")
  })

  test("fork:  register + compose + withSolid from this package", () => {
    const tag = nextTag("composed-fork")
    compose(register(tag, { someProp: "one" }), withSolid)((props: { someProp: string }) => <i>{props.someProp}</i>)
    const element = document.createElement(tag) as HTMLElement & { someProp: string }
    document.body.append(element)
    element.someProp = "two"
    flush()
    expect(element.shadowRoot!.textContent).toBe("two")
  })

  test("fork's withSolid runs on component-register's element class (drop-in)", () => {
    const tag = nextTag("composed-mixed")
    // `as never`:  the two packages' `ComponentOptions` types differ;  the runtime contract is the same
    originalRegister(tag, { someProp: "one" })(
      withSolid((props: { someProp: string }) => <i>{props.someProp}</i>) as never
    )
    const element = document.createElement(tag) as HTMLElement & { someProp: string }
    document.body.append(element)
    element.someProp = "two"
    flush()
    expect(element.shadowRoot!.textContent).toBe("two")
  })
})
