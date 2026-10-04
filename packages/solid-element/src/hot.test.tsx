/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * Hot module replacement (`hot.ts`):  a re-registration swaps the definition in place, `hotUpdate()` re-renders.
 * - Vitest serves this package through Vite, so `import.meta.hot` exists here:  the DEV path (tracking,
 *   redefinition) is the one under test.
 */

import { flush } from "solid-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { customElement } from "./customElement"
import { hot, hotUpdate, liveElements, reloadElements } from "./hot"
import type { ElementOptions } from "./solid-element.types"
import { cleanup, mount, nextTag, settle } from "./testing"

/** An element with loose props, as the tests poke it. */
type Loose = HTMLElement & Record<string, any> & { shadowRoot: ShadowRoot }

describe("hot module replacement", () => {
  // other files re-register tags too (`options.test.tsx`):  start from an empty queue
  beforeEach(() => void hotUpdate())
  afterEach(cleanup)

  it("tracks live instances per class:  in the document, in open shadow roots, detached", () => {
    const tag = nextTag("hot-live")
    const Class = customElement(tag, {}, () => "x")
    const inDocument = mount(`<${tag}></${tag}>`).firstElementChild!
    const holder = mount().attachShadow({ mode: "open" })
    holder.innerHTML = `<${tag}></${tag}>`
    const detached = document.createElement(tag)
    const live = liveElements(Class as never)
    expect(live).toHaveLength(3)
    expect(live).toEqual(expect.arrayContaining([inDocument, holder.firstElementChild, detached]))
    expect(liveElements(tag)).toHaveLength(3)
    expect(liveElements(nextTag("never-defined"))).toEqual([])
  })

  it("re-registering swaps in place;  hotUpdate() re-renders every instance, same element, same values", () => {
    const tag = nextTag("hot-swap")
    const props = {
      label: { value: "", reflect: true },
      items: { type: Array, value: [] as number[], attribute: false }
    }
    customElement(tag, props, (values: any) => <b>{`one ${values.label} ${values.items.length}`}</b>)
    const container = mount(`<${tag} label="a"></${tag}>`)
    const element = container.firstElementChild as Loose
    const holder = mount().attachShadow({ mode: "open" })
    holder.innerHTML = `<${tag} label="s"></${tag}>`
    const nested = holder.firstElementChild as Loose
    element.items = [1, 2]
    flush()
    expect(element.shadowRoot.textContent).toBe("one a 2")
    const root = element.shadowRoot

    const Again = customElement(tag, props, (values: any) => <i>{`two ${values.label} ${values.items.length}`}</i>)
    expect(Again).toBe(element.constructor)
    // nothing re-renders until the module has finished re-running
    expect(element.shadowRoot.textContent).toBe("one a 2")
    expect(hotUpdate()).toEqual({ reloaded: [tag], incompatible: [] })
    flush()
    expect(container.firstElementChild).toBe(element)
    expect(element.shadowRoot).toBe(root)
    expect(element.shadowRoot.innerHTML).toBe("<i>two a 2</i>")
    expect(nested.shadowRoot.textContent).toBe("two s 0")
    expect(element.getAttribute("label")).toBe("a")
    // and the new component is live, not a snapshot
    element.label = "b"
    flush()
    expect(element.shadowRoot.textContent).toBe("two b 2")
  })

  it("keeps property writes, re-converts attribute values with the new converter, defaults new props", () => {
    const tag = nextTag("hot-props")
    const render = (values: any) => <b>{`${values.mode} ${values.size} ${values.extra}`}</b>
    customElement(
      tag,
      {
        mode: { value: "a", converter: (text: string | null) => (text === "b" ? "b" : "a") },
        size: { value: 0 },
        gone: { value: 1, attribute: false }
      },
      render
    )
    const element = mount(`<${tag} mode="c"></${tag}>`).firstElementChild as Loose
    element.size = 5
    flush()
    expect(element.shadowRoot.textContent).toBe("a 5 undefined")

    customElement(
      tag,
      {
        mode: { value: "a", converter: (text: string | null) => text ?? "a" },
        size: { value: 0 },
        extra: { value: "x", attribute: false }
      },
      render
    )
    hotUpdate()
    flush()
    expect(element.shadowRoot.textContent).toBe("c 5 x")
    expect("gone" in element).toBe(false)
    element.extra = "y"
    flush()
    expect(element.shadowRoot.textContent).toBe("c 5 y")
  })

  it.each([
    ["a new observed attribute", { a: "", b: "" }, {}, "observed attributes changed (+b)"],
    ["a removed observed attribute", {}, {}, "observed attributes changed (-a)"],
    ["formAssociated", { a: "" }, { formAssociated: true }, "formAssociated changed"],
    ["internals", { a: "" }, { internals: true }, "internals changed"],
    ["the base class", { a: "" }, { BaseElement: class extends HTMLElement {} }, "base class changed"],
    [
      "shadow root options",
      { a: "" },
      { shadowRootInit: { mode: "open", delegatesFocus: true } },
      "shadow root options changed"
    ]
  ] as [string, Record<string, unknown>, ElementOptions, string][])(
    "refuses %s:  hotUpdate() warns and invalidates, the element keeps its definition",
    (_title, props, options, reason) => {
      const tag = nextTag("hot-refused")
      customElement(tag, { a: "" }, () => "old")
      const element = mount(`<${tag}></${tag}>`).firstElementChild as Loose
      customElement(tag, props, () => "new", options)
      const invalidate = vi.fn()
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      const message = `<${tag}>: ${reason}, full reload`
      expect(hotUpdate({ invalidate })).toEqual({ reloaded: [], incompatible: [{ tag, reason }] })
      expect(invalidate).toHaveBeenCalledWith(message)
      expect(warn).toHaveBeenCalledWith(message)
      warn.mockRestore()
      reloadElements(tag)
      flush()
      expect(element.shadowRoot.textContent).toBe("old")
    }
  )

  it("throws, changing nothing, when a new prop would shadow an element member", () => {
    const tag = nextTag("hot-shadowing")
    customElement(tag, { a: "" }, () => "old")
    const element = mount(`<${tag} a="1"></${tag}>`).firstElementChild as Loose
    expect(() => customElement(tag, { a: "", title: { value: "", attribute: false } }, () => "new")).toThrow(/shadow/)
    expect(hotUpdate()).toEqual({ reloaded: [], incompatible: [] })
    expect(element.a).toBe("1")
  })

  it("recovers an element whose new render threw:  the next good one renders, `:state(errored)` cleared", () => {
    const tag = nextTag("hot-recover")
    const options: ElementOptions = { internals: true, onError: () => {}, fallback: () => "fallback" }
    customElement(tag, {}, () => <b>ok</b>, options)
    const element = mount(`<${tag}></${tag}>`).firstElementChild as Loose
    customElement(
      tag,
      {},
      () => {
        throw new Error("boom")
      },
      options
    )
    hotUpdate()
    flush()
    expect(element.shadowRoot.textContent).toBe("fallback")
    expect(element.matches(":state(errored)")).toBe(true)
    customElement(tag, {}, () => <b>fixed</b>, options)
    hotUpdate()
    flush()
    expect(element.shadowRoot.innerHTML).toBe("<b>fixed</b>")
    expect(element.matches(":state(errored)")).toBe(false)
  })

  it("disposes a detached (`keepAlive`) element;  it renders the new component on its next connect", () => {
    const tag = nextTag("hot-detached")
    customElement(tag, {}, () => <b>old</b>, { keepAlive: true })
    const element = mount(`<${tag}></${tag}>`).firstElementChild as Loose
    element.remove()
    customElement(tag, {}, () => <b>new</b>, { keepAlive: true })
    hotUpdate()
    expect(element.shadowRoot.textContent).toBe("")
    mount().append(element)
    flush()
    expect(element.shadowRoot.textContent).toBe("new")
  })

  it("keeps `hot(module, tag)` (webpack style):  accepts, then reloads every `<tag>` on the next task", async () => {
    const tag = nextTag("hot-webpack")
    customElement(tag, {}, () => "old")
    const element = mount(`<${tag}></${tag}>`).firstElementChild as Loose
    const accept = vi.fn()
    hot({ hot: { accept, status: () => "idle" } }, tag)
    expect(accept).toHaveBeenCalledOnce()
    customElement(tag, {}, () => "new")
    accept.mock.calls[0]![0]()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await settle()
    expect(element.shadowRoot.textContent).toBe("new")
  })
})
