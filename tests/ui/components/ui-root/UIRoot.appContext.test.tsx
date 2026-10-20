import { onTestFinished, beforeAll, describe, expect, test } from "vite-plus/test"
import { Dynamic, type JSX } from "@solidjs/web"

import { UIComponent, type DOMElement, type UIComponentClass } from "$/spell-element"
import type { ComponentVocabulary } from "$/ui/vocabulary"
import { UI } from "$/ui/runtime"
import { ElementFixture } from "$/ui/test/ElementFixture"

/**
 * `UIComponent.appContext`:  what an app hands the elements inside a `<ui-root>`, read by `$/spell-element`'s
 * `UIComponent` from the nearest root around it.
 * - A Solid context never reaches inside an element (epic `spell-element`, Q9):  the root's `appContext` does.
 * - Tried on tiny test elements inside Spell UI's real `<ui-root>`, loaded by each test:
 *   the first test needs the tag still undefined.
 * - How each element draws in a Solid root of its own:
 *   spell-element's tests (`tests/spell-element/src/UIComponent.test.tsx`).
 */

////////////////
// ## Test elements
////////////////

/** How many test tags `defineElement()` has made:  each test defines its own. */
let tagCount = 0

/** Define test element `<x-<noun>-<n>>` whose `render()` returns `draw()`;  returns the tag. */
function defineElement(noun: string, draw: () => JSX.Element): string {
  const tag = `x-${noun}-${++tagCount}`
  const vocabulary = {
    tag,
    noun,
    attributes: [],
    events: [],
    slots: [],
    parts: [],
    states: [],
    texts: []
  } satisfies ComponentVocabulary
  /** The test element's component. */
  class TestElement extends UIComponent {
    render(): JSX.Element {
      return draw()
    }
  }
  Object.defineProperty(TestElement.prototype, "vocabulary", { value: vocabulary })
  ;(TestElement as unknown as UIComponentClass & typeof UIComponent).define()
  return tag
}

/** A fresh container on the page, removed after the test. */
function container(): HTMLElement {
  const element = document.createElement("div")
  document.body.append(element)
  onTestFinished(() => element.remove())
  return element
}

/** The `appContext` `element`'s component saw. */
function appContextOf(element: Element | null): unknown {
  return (element as DOMElement).component?.appContext
}

beforeAll(async () => {
  // loaded, so an element draws as it connects
  await UI.load()
})

////////////////
// ## Tests
////////////////

describe("UIComponent.appContext", () => {
  /** What the app hands its elements. */
  const APP = { theme: "dark" }

  // FIRST in the file to touch `<ui-root>`:  it must still be undefined here
  test("set on `<ui-root>` BEFORE its tag is defined:  the value survives the upgrade and reaches inside", async () => {
    expect(customElements.get("ui-root")).toBeUndefined()
    const tag = defineElement("early", () => <span />)
    const root = document.createElement("ui-root") as HTMLElement & { appContext?: unknown }
    root.appContext = APP
    root.innerHTML = `<${tag}></${tag}>`
    container().append(root)
    const before = appContextOf(root.querySelector(tag))
    await import("$/ui/components/ui-root")
    await customElements.whenDefined("ui-root")
    root.insertAdjacentHTML("beforeend", `<${tag}></${tag}>`)
    await ElementFixture.settle(root)
    expect({
      upgraded: root instanceof (customElements.get("ui-root") as CustomElementConstructor),
      value: root.appContext,
      before,
      after: appContextOf(root.lastElementChild)
    }).toEqual({ upgraded: true, value: APP, before: APP, after: APP })
  })

  test("an element inside `<ui-root>` sees the root's `appContext`", async () => {
    await import("$/ui/components/ui-root")
    const tag = defineElement("reader", () => <span />)
    const root = document.createElement("ui-root") as HTMLElement & { appContext?: unknown }
    root.appContext = APP
    container().append(root)
    root.innerHTML = `<div><${tag}></${tag}></div>`
    expect(appContextOf(root.querySelector(tag))).toBe(APP)
  })

  test("through a shadow root:  an element another element draws sees it too", async () => {
    await import("$/ui/components/ui-root")
    const inner = defineElement("inner", () => <span />)
    const outer = defineElement("outer", () => <Dynamic component={inner} />)
    const root = document.createElement("ui-root") as HTMLElement & { appContext?: unknown }
    root.appContext = APP
    container().append(root)
    root.innerHTML = `<${outer}></${outer}>`
    const host = root.querySelector(outer) as DOMElement
    await host.ready
    expect(appContextOf(host.shadowRoot!.querySelector(inner))).toBe(APP)
  })

  test("the NEAREST `<ui-root>` wins", async () => {
    await import("$/ui/components/ui-root")
    const tag = defineElement("reader", () => <span />)
    const NEAR = { theme: "light" }
    const outer = document.createElement("ui-root") as HTMLElement & { appContext?: unknown }
    const near = document.createElement("ui-root") as HTMLElement & { appContext?: unknown }
    outer.appContext = APP
    near.appContext = NEAR
    outer.append(near)
    container().append(outer)
    near.innerHTML = `<${tag}></${tag}>`
    expect(appContextOf(near.querySelector(tag))).toBe(NEAR)
  })

  test("a translated `<ui-root>` counts too", async () => {
    const { UIRoot } = await import("$/ui/components/ui-root")
    UIRoot.define("x-raiz")
    const tag = defineElement("reader", () => <span />)
    const root = document.createElement("x-raiz") as HTMLElement & { appContext?: unknown }
    root.appContext = APP
    container().append(root)
    root.innerHTML = `<${tag}></${tag}>`
    expect(appContextOf(root.querySelector(tag))).toBe(APP)
  })

  test("outside any `<ui-root>`, or inside one that holds no value:  `null`", async () => {
    await import("$/ui/components/ui-root")
    const tag = defineElement("reader", () => <span />)
    const outside = container()
    outside.innerHTML = `<${tag}></${tag}>`
    const empty = document.createElement("ui-root")
    container().append(empty)
    empty.innerHTML = `<${tag}></${tag}>`
    expect({
      outside: appContextOf(outside.querySelector(tag)),
      empty: appContextOf(empty.querySelector(tag))
    }).toEqual({
      outside: null,
      empty: null
    })
  })
})
