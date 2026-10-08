/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * Owner lookup.
 * - FIX 8:  the walk crosses shadow roots.
 * - FIX 11:  an element adopts the owner that CREATED it (or its nearest created ancestor), never the owner of
 *   the `<slot>` it's assigned to.
 */

import {
  children,
  createContext,
  createRenderEffect,
  createSignal,
  getOwner,
  Show,
  useContext,
  type Accessor
} from "solid-js"
import { render, type JSX } from "@solidjs/web"
import { afterEach, describe, expect, it } from "vite-plus/test"

import { customElement } from "./customElement"
import { lookupOwner } from "./owner"
import { IMPLEMENTATIONS, cleanup, mount, nextTag, reproduce, settle, type Implementation } from "./testing"

describe("fix 8:  owner lookup across shadow roots", () => {
  afterEach(cleanup)

  reproduce(
    "an element created without JSX inside another element's shadow root sees the page's context",
    ({ customElement }) => {
      const Theme = createContext("missing")
      const outerTag = nextTag("outer")
      const innerTag = nextTag("inner")
      customElement(innerTag, {}, () => <span>{useContext(Theme)}</span>)
      customElement(outerTag, {}, () => <div />)
      /** The outer element, stamped as Solid's compiler stamps a custom element written in JSX. */
      function Outer() {
        const outer = document.createElement(outerTag) as HTMLElement & { _$owner?: unknown }
        outer._$owner = getOwner()!
        return outer
      }
      const root = mount()
      const dispose = render(
        () => (
          <Theme value="dark">
            <Outer />
          </Theme>
        ),
        root
      )
      const outer = root.querySelector(outerTag)! as HTMLElement & { _$owner?: unknown }
      // content arriving LATER, outside any render (a lazy template, `innerHTML`):  no `_$owner` stamp on it, and
      // no Solid owner current while it connects
      outer.shadowRoot!.querySelector("div")!.innerHTML = `<${innerTag}></${innerTag}>`
      const text = outer.shadowRoot!.querySelector(innerTag)!.shadowRoot!.textContent
      dispose()
      return { stamped: outer._$owner !== undefined, text }
    },
    { original: { stamped: true, text: "missing" }, fork: { stamped: true, text: "dark" } }
  )

  it("fork:  the walk never reads `host` off a non-ShadowRoot node (`<a>.host` is a URL part)", () => {
    const anchor = document.createElement("a")
    anchor.href = "https://example.com/"
    const child = document.createElement("span")
    anchor.append(child)
    expect(lookupOwner(child)).toBeUndefined()
  })
})

describe("fix 11:  a slotted element's root never belongs to its slot's branch", () => {
  afterEach(cleanup)

  reproduce(
    "a slotted element keeps updating after its host's `<Show>` re-creates the `<slot>` (host rendered first)",
    async (api) => {
      const { host, child } = swapFixture(api, "host-first")
      host.wide = true
      await settle()
      child.label = "after"
      await settle()
      return { swapped: !!host.shadowRoot!.querySelector("section > slot"), text: text(child) }
    },
    // the child's root was created under the fallback branch's owner, which `<Show>` disposed with its `<slot>`
    { original: { swapped: true, text: "before" }, fork: { swapped: true, text: "after" } }
  )

  it("fork:  the same with the child connected BEFORE its host rendered a slot (never adopted one)", async () => {
    const { host, child } = swapFixture(IMPLEMENTATIONS.fork, "child-first")
    host.wide = true
    await settle()
    child.label = "after"
    await settle()
    expect(text(child)).toBe("after")
  })

  it("fork:  a slotted element written in an app gets the app's context, and outlives the host's branch", async () => {
    const Theme = createContext("missing")
    const hostTag = nextTag("app-host")
    const childTag = nextTag("app-child")
    customElement(childTag, { label: "" }, (props: { label: string }) => (
      <span>
        {useContext(Theme)}/{props.label}
      </span>
    ))
    customElement(hostTag, { wide: false }, SwapHost, { keepAlive: true })
    const [label, setLabel] = createSignal("before")
    const root = mount()
    const dispose = render(
      () => (
        <Theme value="dark">
          <Stamped tag={hostTag}>
            <Stamped tag={childTag} label={label} />
          </Stamped>
        </Theme>
      ),
      root
    )
    const host = root.querySelector(hostTag) as SwapElement
    const child = root.querySelector(childTag) as ChildElement
    const first = text(child)
    host.wide = true
    await settle()
    setLabel("after")
    await settle()
    const last = text(child)
    dispose()
    expect({ first, last }).toEqual({ first: "dark/before", last: "dark/after" })
  })

  it("fork, deliberate:  context a component provides around its `<slot>` doesn't reach slotted elements", () => {
    const Context = createContext("missing")
    const providerTag = nextTag("slot-provider")
    const readerTag = nextTag("slot-reader")
    customElement(providerTag, {}, () => (
      <Context value="slot">
        <slot />
      </Context>
    ))
    customElement(readerTag, {}, () => <span>{useContext(Context)}</span>)
    const root = mount(`<${providerTag}><${readerTag}></${readerTag}></${providerTag}>`)
    // rc.11 says "slot" (`compat.test.tsx`), at the price of the reader's root dying with the provider's branch
    expect(text(root.querySelector(readerTag)!)).toBe("missing")
  })

  it("fork:  a stamp whose owner is already disposed is skipped", () => {
    const element = document.createElement("span") as StampedNode
    const wrapper = document.createElement("section") as StampedNode
    const dispose = render(() => {
      element._$owner = wrapper._$owner = getOwner()!
      return null
    }, mount())
    dispose()
    wrapper.append(element)
    expect(lookupOwner(element)).toBeUndefined()
  })
})

/** A host whose `<Show>` swaps the element holding its ONLY `<slot>`:  `<div>` <=> `<section>`. */
function SwapHost(props: { wide: boolean }) {
  return (
    <Show
      when={props.wide}
      fallback={
        <div>
          <slot />
        </div>
      }
    >
      <section>
        <slot />
      </section>
    </Show>
  )
}

/**
 * `tag`, created and stamped with the current owner as Solid's compiler stamps a custom element written in JSX
 * (`<Dynamic>` doesn't stamp);  `label` is bound as a property.
 */
function Stamped(props: { tag: string; label?: Accessor<string>; children?: unknown }) {
  const element = document.createElement(props.tag) as StampedNode & { label?: string }
  element._$owner = getOwner()!
  // children first, as the compiler builds a template:  the host renders (and connects) with its child in place
  for (const child of children(() => props.children as JSX.Element).toArray()) {
    if (child instanceof Node) element.append(child)
  }
  const label = props.label
  if (label) createRenderEffect(label, (value) => void (element.label = value))
  return element
}

/** A node Solid's compiler may stamp. */
type StampedNode = HTMLElement & { _$owner?: unknown }

/** The swapping host element. */
type SwapElement = HTMLElement & { wide: boolean }

/** The slotted element. */
type ChildElement = HTMLElement & { label: string }

/**
 * Define a `SwapHost` element and a label element slotted into it (both `keepAlive`;  the original ignores it).
 * - `host-first`:  both defined before the markup connects, so the host renders its slot BEFORE the child's
 *   connect looks for an owner.  `@spell-app/ui` once its runtime is loaded:  a synchronous first render.
 * - `child-first`:  the host is defined after the child connected.
 */
function swapFixture(api: Implementation, order: "host-first" | "child-first") {
  const hostTag = nextTag("swap-host")
  const childTag = nextTag("swap-child")
  const options = { keepAlive: true }
  api.customElement(childTag, { label: "before" }, (props: { label: string }) => <span>{props.label}</span>, options)
  if (order === "host-first") api.customElement(hostTag, { wide: false }, SwapHost, options)
  const root = mount(`<${hostTag}><${childTag}></${childTag}></${hostTag}>`)
  if (order === "child-first") api.customElement(hostTag, { wide: false }, SwapHost, options)
  const host = root.querySelector(hostTag) as SwapElement
  const child = root.querySelector(childTag) as ChildElement
  return { host, child }
}

/** Text an element renders into its shadow root. */
function text(element: Element): string | null | undefined {
  return element.shadowRoot?.textContent
}
