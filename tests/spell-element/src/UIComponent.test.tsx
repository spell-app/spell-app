import { onTestFinished, describe, expect, test } from "vite-plus/test"
import { createContext, createSignal, flush, Show, useContext } from "solid-js"
import { Dynamic, render, type JSX } from "@solidjs/web"

import {
  UIComponent,
  type AttributeSpec,
  type ComponentVocabulary,
  type DOMElement,
  type UIComponentClass
} from "$/spell-element"
import { ElementFixture } from "$/spell-element/test/ElementFixture"

/**
 * `UIComponent`:  each element draws in a Solid root of its OWN.
 * - A slotted element's root never belongs to the `<slot>` it lands in:  a host may re-create its slots freely.
 * - A Solid context never reaches inside an element (epic `spell-element`, Q9):  `<ui-root>`'s `appContext` does,
 *   tested with Spell UI's root (`tests/ui/components/ui-root/UIRoot.appContext.test.tsx`).
 */

/** A test element's component, its attributes read by name (`register()` puts a getter on the class for each). */
type TestComponent = UIComponent & Record<string, unknown>

/** How many test tags `defineElement()` has made:  each test defines its own. */
let tagCount = 0

/** A fresh test tag, `<x-<noun>-<n>>`. */
function nextTag(noun: string): string {
  return `x-${noun}-${++tagCount}`
}

/** Define test element `tag` (default a fresh one) whose `render()` returns `draw(component)`;  returns the tag. */
function defineElement(
  noun: string,
  draw: (component: TestComponent) => JSX.Element,
  attributes: readonly AttributeSpec[] = [],
  tag = nextTag(noun)
): string {
  const vocabulary = {
    tag,
    noun,
    attributes,
    events: [],
    slots: [],
    parts: [],
    states: [],
    texts: []
  } satisfies ComponentVocabulary
  /** The test element's component. */
  class TestElement extends UIComponent {
    render(): JSX.Element {
      return draw(this as unknown as TestComponent)
    }
  }
  Object.defineProperty(TestElement.prototype, "vocabulary", { value: vocabulary })
  ;(TestElement as unknown as UIComponentClass & typeof UIComponent).define()
  return tag
}

/** The `label` attribute of `defineLabel()`'s elements. */
const LABEL: AttributeSpec = { name: "label", kind: "string", description: "What it shows." }

/** The `wide` attribute of `defineSwapHost()`'s elements. */
const WIDE: AttributeSpec = { name: "wide", kind: "boolean", description: "Swap the slot into a `<section>`." }

/** Define an element showing its `label` attribute. */
function defineLabel(): string {
  return defineElement("label", (component) => <span>{component.label as string}</span>, [LABEL])
}

/** Define a host whose `<Show>` swaps the element holding its ONLY `<slot>`:  `<div>` <=> `<section>`. */
function defineSwapHost(tag?: string): string {
  return defineElement(
    "swap-host",
    (component) => (
      <Show
        when={component.wide as boolean}
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
    ),
    [WIDE],
    tag
  )
}

/** A fresh container on the page, removed after the test. */
function container(): HTMLElement {
  const element = document.createElement("div")
  document.body.append(element)
  onTestFinished(() => element.remove())
  return element
}

/** Text an element draws into its shadow root. */
function text(element: Element): string | null | undefined {
  return element.shadowRoot?.textContent
}

////////////////
// ## Solid roots
////////////////

describe("UIComponent.mount() Solid roots", () => {
  test("a slotted element keeps updating after its host's `<Show>` re-creates the `<slot>`", async () => {
    const hostTag = defineSwapHost()
    const childTag = defineLabel()
    const host = await ElementFixture.render<DOMElement & { wide: boolean }>(
      `<${hostTag}><${childTag} label="before"></${childTag}></${hostTag}>`
    )
    const child = host.querySelector(childTag) as DOMElement & { label: string }
    host.wide = true
    await ElementFixture.settle()
    child.label = "after"
    await ElementFixture.settle()
    expect({ swapped: !!host.shadowRoot!.querySelector("section > slot"), text: text(child) }).toEqual({
      swapped: true,
      text: "after"
    })
  })

  test("the same with the child connected BEFORE its host was defined", async () => {
    const childTag = defineLabel()
    const hostTag = nextTag("swap-host")
    const root = container()
    root.innerHTML = `<${hostTag}><${childTag} label="before"></${childTag}></${hostTag}>`
    const child = root.querySelector(childTag) as DOMElement & { label: string }
    await child.ready
    defineSwapHost(hostTag)
    const host = root.querySelector(hostTag) as DOMElement & { wide: boolean }
    await ElementFixture.settle(root)
    host.wide = true
    await ElementFixture.settle(root)
    child.label = "after"
    await ElementFixture.settle(root)
    expect(text(child)).toBe("after")
  })

  test("a slotted element an APP created keeps updating after the host's `<Show>` re-creates the `<slot>`", async () => {
    const hostTag = defineSwapHost()
    const childTag = defineLabel()
    const [label, setLabel] = createSignal("before")
    const root = container()
    const dispose = render(
      () => (
        <Dynamic component={hostTag}>
          <Dynamic component={childTag} label={label()} />
        </Dynamic>
      ),
      root
    )
    onTestFinished(dispose)
    const host = root.querySelector(hostTag) as DOMElement & { wide: boolean }
    const child = root.querySelector(childTag) as DOMElement
    await ElementFixture.settle(root)
    const first = text(child)
    host.wide = true
    await ElementFixture.settle(root)
    setLabel("after")
    await ElementFixture.settle(root)
    expect({ first, last: text(child) }).toEqual({ first: "before", last: "after" })
  })

  test("an element created by `innerHTML` inside another element's shadow root draws and updates", async () => {
    const childTag = defineLabel()
    const outer = defineElement("outer", () => <div />)
    const host = await ElementFixture.render(`<${outer}></${outer}>`)
    // content arriving LATER, outside any render (a lazy template, `innerHTML`):  no Solid owner while it connects
    host.shadowRoot!.querySelector("div")!.innerHTML = `<${childTag} label="first"></${childTag}>`
    const child = host.shadowRoot!.querySelector(childTag) as DOMElement & { label: string }
    await child.ready
    const first = text(child)
    child.label = "second"
    await ElementFixture.settle(host)
    expect({ first, last: text(child) }).toEqual({ first: "first", last: "second" })
  })

  test("an element outlives the app that created it:  it keeps updating until `dispose()`", async () => {
    const tag = defineLabel()
    const [shown, setShown] = createSignal(true)
    const root = container()
    const dispose = render(
      () => (
        <Show when={shown()}>
          <Dynamic component={tag} label="before" />
        </Show>
      ),
      root
    )
    onTestFinished(dispose)
    const element = root.querySelector(tag) as DOMElement & { label: string }
    await ElementFixture.settle(root)
    // the app's branch goes, and the element with it;  the page puts the element back elsewhere
    setShown(false)
    flush()
    expect(element.isConnected).toBe(false)
    root.append(element)
    element.label = "moved"
    await ElementFixture.settle(root)
    const moved = text(element)
    element.dispose()
    element.label = "disposed"
    await ElementFixture.settle(root)
    expect({ moved, disposed: text(element) }).toEqual({ moved: "moved", disposed: "" })
  })

  test("deliberate:  context an app provides around an element never reaches inside it (`appContext` does)", () => {
    const Theme = createContext("missing")
    const tag = defineElement("reader", () => <span>{useContext(Theme)}</span>)
    const root = container()
    const dispose = render(
      () => (
        <Theme value="dark">
          <Dynamic component={tag} />
        </Theme>
      ),
      root
    )
    onTestFinished(dispose)
    expect(text(root.querySelector(tag)!)).toBe("missing")
  })

  test("deliberate:  context a component provides around its `<slot>` never reaches slotted elements", async () => {
    const Context = createContext("missing")
    const providerTag = defineElement("slot-provider", () => (
      <Context value="slot">
        <slot />
      </Context>
    ))
    const readerTag = defineElement("slot-reader", () => <span>{useContext(Context)}</span>)
    const host = await ElementFixture.render(`<${providerTag}><${readerTag}></${readerTag}></${providerTag}>`)
    expect(text(host.querySelector(readerTag)!)).toBe("missing")
  })
})
