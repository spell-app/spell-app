import { onTestFinished, beforeAll, describe, expect, test } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { Dynamic, Portal, render, type JSX } from "@solidjs/web"

import type { AttributeSpec, ComponentVocabulary } from "$/ui/vocabulary"
import { UI } from "$/ui/runtime"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { UIComponent, type DOMElement, type UIComponentClass } from "$/ui/elements"

/**
 * `ShadowEvents`:  Solid's event delegation inside each element's shadow root leaves nothing behind on the event.
 * - Page listeners see the platform's retargeted event:  `target` === the host, `composedPath()[0]` the inner node.
 * - Solid handlers OUTSIDE the element (an app's `<x-el onClick>`, an enclosing element's) still run, once.
 * - Tried on tiny test elements;  `test/events.test.tsx` does the same for real `ui-*` elements, with typing and
 *   focus, and a Solid app elsewhere on the page.
 */

/** What a listener saw:  `target`, `currentTarget`, `composedPath()[0]`, as `name()`s. */
type Seen = { target?: string; currentTarget?: string; path0?: string }

/** Record `event` as `Seen`. */
function see(event: Event): Seen {
  return {
    target: name(event.target),
    currentTarget: name(event.currentTarget),
    path0: name(event.composedPath()[0])
  }
}

/** An element's local name (`"host"` for a custom element), else the node's name (`#document`). */
function name(target: EventTarget | null | undefined): string | undefined {
  if (!target) return undefined
  const local = (target as Element).localName
  if (local?.includes("-")) return "host"
  return local ?? (target as Node).nodeName
}

/** How many test tags `defineElement()` has made:  each test defines its own. */
let tagCount = 0

/** Define a test element `<x-<noun>-<n>>` whose `render()` returns `draw()`;  returns its tag. */
function defineElement(noun: string, draw: () => JSX.Element, attributes: readonly AttributeSpec[] = []): string {
  const tag = `x-${noun}-${++tagCount}`
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
      return draw()
    }
  }
  Object.defineProperty(TestElement.prototype, "vocabulary", { value: vocabulary })
  ;(TestElement as unknown as UIComponentClass & typeof UIComponent).define()
  return tag
}

/** Define a field:  an `<input>` with a delegated `onInput`, and a `<button onClick>`;  `log` hears both. */
function defineField(log: string[] = []): string {
  return defineElement("field", () => (
    <>
      <input onInput={() => log.push("input")} />
      <button onClick={() => log.push("click")}>go</button>
    </>
  ))
}

/** A fresh container on the page, removed after the test. */
function container(): HTMLElement {
  const element = document.createElement("div")
  document.body.append(element)
  onTestFinished(() => element.remove())
  return element
}

/**
 * A Solid app rendering `<section onClick><tag onClick /></section>`:  a second delegation root, AROUND the element;
 * returns the element.  Disposed after the test.
 */
function solidApp(tag: string, log: string[]): HTMLElement {
  const root = container()
  const dispose = render(
    () => (
      <section onClick={() => log.push("app section")}>
        <Dynamic component={tag} onClick={(event: Event) => log.push(`app host ${name(event.currentTarget)}`)} />
      </section>
    ),
    root
  )
  onTestFinished(dispose)
  return root.querySelector(tag) as HTMLElement
}

/** Render `<tag>` into a fresh container;  returns it once ready. */
async function mount(tag: string): Promise<DOMElement> {
  return ElementFixture.render<DOMElement>(`<${tag}></${tag}>`)
}

/** The first `selector` match in `host`'s shadow root. */
function inside<T extends Element = HTMLElement>(host: Element, selector: string): T {
  return host.shadowRoot!.querySelector(selector) as T
}

beforeAll(async () => {
  // loaded, so an element draws as it connects
  await UI.load()
})

////////////////
// ## Page listeners
////////////////

describe("ShadowEvents page listeners", () => {
  test("a listener on the host sees `target` === host, `currentTarget` === host", async () => {
    const host = await mount(defineField())
    let seen: Seen = {}
    host.addEventListener("click", (event) => (seen = see(event)))
    inside(host, "button").click()
    expect(seen).toEqual({ target: "host", currentTarget: "host", path0: "button" })
  })

  test("listeners for `input`, `keydown`, `focusin` see the host too, not only `click`", async () => {
    const log: string[] = []
    // its own element, not `defineField()`:  other tests compare that one's `log` whole
    const tag = defineElement("typing", () => (
      <input
        onInput={() => log.push("input")}
        onKeyDown={() => log.push("keydown")}
        onFocusIn={() => log.push("focusin")}
      />
    ))
    const host = await mount(tag)
    const types = ["focusin", "keydown", "input"]
    const seen: Record<string, Seen[]> = {}
    for (const type of types) {
      const record = (event: Event) => (seen[type] ??= []).push(see(event))
      host.addEventListener(type, record)
      document.addEventListener(type, record)
      onTestFinished(() => document.removeEventListener(type, record))
    }
    await userEvent.type(inside(host, "input"), "a")
    // Solid's walk really ran for all three:  the component's own handlers fired
    expect(log).toEqual(types)
    for (const type of types) {
      expect(seen[type]![0]).toEqual({ target: "host", currentTarget: "host", path0: "input" })
      expect(seen[type]![1]).toEqual({ target: "host", currentTarget: "#document", path0: "input" })
    }
  })

  test("`stopPropagation()` in the component stops there:  no app handler, no page listener", () => {
    const log: string[] = []
    const tag = defineElement("stopper", () => <button onClick={(event) => event.stopPropagation()}>stop</button>)
    const host = solidApp(tag, log)
    host.addEventListener("click", () => log.push("page"))
    inside(host, "button").click()
    expect(log).toEqual([])
  })

  test("a component's own listener on its render root passes through untouched, and can be removed", async () => {
    const seen: Seen[] = []
    const record = (event: Event) => seen.push(see(event))
    const host = await mount(defineElement("own", () => <button onClick={() => {}}>own</button>))
    const root = host.shadowRoot!
    root.addEventListener("click", record)
    inside(host, "button").click()
    root.removeEventListener("click", record)
    inside(host, "button").click()
    expect(seen).toEqual([{ target: "button", currentTarget: "#document-fragment", path0: "button" }])
  })
})

////////////////
// ## Solid handlers outside the element
////////////////

describe("ShadowEvents Solid handlers outside", () => {
  test("an app's handlers run ONCE for a click inside the element;  page listeners still see the host", () => {
    const log: string[] = []
    const host = solidApp(defineField(log), log)
    const seen: Seen[] = []
    host.addEventListener("click", (event) => seen.push(see(event)))
    const record = (event: Event) => seen.push(see(event))
    document.addEventListener("click", record)
    onTestFinished(() => document.removeEventListener("click", record))
    inside(host, "button").click()
    expect(log).toEqual(["click", "app host host", "app section"])
    expect(seen[0]).toEqual({ target: "host", currentTarget: "host", path0: "button" })
    // NOTE:  `currentTarget` on the document is still wrong here:  the APP's container leaks it (plain Solid)
    expect(seen[1]).toMatchObject({ target: "host", path0: "button" })
  })

  test("handlers above a NESTED element run, with that element as `target`", async () => {
    const log: string[] = []
    const inner = defineField(log)
    const outer = defineElement("outer", () => (
      <div onClick={(event: Event) => log.push(`outer div ${name(event.target)}`)}>
        <Dynamic component={inner} onClick={(event: Event) => log.push(`outer host ${name(event.currentTarget)}`)} />
      </div>
    ))
    const host = await mount(outer)
    inside(inside(host, inner), "button").click()
    expect(log).toEqual(["click", "outer host host", "outer div host"])
  })

  test("slotted light content:  its handler, the component's and the app's each run once", async () => {
    const log: string[] = []
    const tag = defineElement("slotting", () => (
      <button onClick={(event) => log.push(`inner ${name(event.target)}`)} style={{ padding: "8px" }}>
        <slot />
      </button>
    ))
    const root = container()
    const dispose = render(
      () => (
        <main onClick={() => log.push("app main")}>
          <Dynamic component={tag} onClick={() => log.push("app host")}>
            <b onClick={() => log.push("app b")}>Save</b>
          </Dynamic>
        </main>
      ),
      root
    )
    onTestFinished(dispose)
    const host = root.querySelector(tag)!
    const seen: Seen[] = []
    host.addEventListener("click", (event) => seen.push(see(event)))
    await userEvent.click(host.querySelector("b")!)
    expect(log).toEqual(["app b", "inner b", "app host", "app main"])
    expect(seen).toEqual([{ target: "b", currentTarget: "host", path0: "b" }])
  })

  test("a nested element slotted into another:  the outer slot's ancestors run once, `target` = the nested host", async () => {
    const log: string[] = []
    const inner = defineField(log)
    const outer = defineElement("option", () => (
      <div role="option" onClick={(event: Event) => log.push(`option ${name(event.target)}`)}>
        <slot />
      </div>
    ))
    const host = await ElementFixture.render(`<${outer}><${inner}></${inner}></${outer}>`)
    inside(host.querySelector(inner)!, "button").click()
    expect(log).toEqual(["click", "option host"])
  })
})

////////////////
// ## Containers inside a render root
////////////////

describe("ShadowEvents containers inside a render root", () => {
  test("a Solid `render()` into the shadow root:  its handlers, then the component's, then the app's, once each", async () => {
    const log: string[] = []
    const target = document.createElement("div")
    const tag = defineElement("nested-render", () => (
      <section onClick={(event: Event) => log.push(`section ${name(event.target)}`)}>{target}</section>
    ))
    const host = solidApp(tag, log)
    await (host as DOMElement).ready
    const dispose = render(() => <button onClick={() => log.push("nested button")}>go</button>, target)
    onTestFinished(dispose)
    const seen: Seen[] = []
    host.addEventListener("click", (event) => seen.push(see(event)))
    target.querySelector("button")!.click()
    expect(log).toEqual(["nested button", "section button", "app host host", "app section"])
    expect(seen).toEqual([{ target: "host", currentTarget: "host", path0: "button" }])
  })

  test("a `<Portal>` mounted inside the same shadow root:  handlers follow the portal's place in the JSX", async () => {
    const log: string[] = []
    const target = document.createElement("div")
    const tag = defineElement("portal", () => (
      <>
        <aside>{target}</aside>
        <section onClick={() => log.push("section")}>
          <Portal mount={target}>
            <button onClick={() => log.push("portal button")}>go</button>
          </Portal>
        </section>
      </>
    ))
    const host = solidApp(tag, log)
    await (host as DOMElement).ready
    await ElementFixture.tick()
    const seen: Seen[] = []
    host.addEventListener("click", (event) => seen.push(see(event)))
    target.querySelector("button")!.click()
    expect(log).toEqual(["portal button", "section", "app host host", "app section"])
    expect(seen).toEqual([{ target: "host", currentTarget: "host", path0: "button" }])
  })

  test("a `<Portal>` out to the page:  the component's handlers run once, from the portal's place in the JSX", async () => {
    const log: string[] = []
    const target = container()
    const tag = defineElement("portal-out", () => (
      <section onClick={() => log.push("section")}>
        <Portal mount={target}>
          <button onClick={() => log.push("portal button")}>go</button>
        </Portal>
      </section>
    ))
    await mount(tag)
    await ElementFixture.tick()
    target.querySelector("button")!.click()
    expect(log).toEqual(["portal button", "section"])
  })
})

////////////////
// ## Reconnecting
////////////////

describe("ShadowEvents reconnecting", () => {
  test("moving the element keeps ONE working listener", async () => {
    const log: string[] = []
    const host = await mount(defineField(log))
    const parent = host.parentElement!
    host.remove()
    await Promise.resolve()
    parent.append(host)
    inside(host, "button").click()
    expect(log).toEqual(["click"])
  })

  test("`dispose()`, then a fresh render on the next connect:  still ONE working listener", async () => {
    const log: string[] = []
    const host = await mount(defineField(log))
    const parent = host.parentElement!
    host.remove()
    host.dispose()
    parent.append(host)
    await ElementFixture.settle(parent)
    inside(host, "button").click()
    expect(log).toEqual(["click"])
  })
})
