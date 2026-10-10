import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { resetErrorHalt } from "solid-js"
import type { JSX } from "@solidjs/web"

import type { ComponentVocabulary, Dictionary } from "$/ui/vocabulary"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { UI } from "$/ui/core"
import { DOMElement, UIComponent, type DOMElementClass, type ElementSetup, type UIComponentClass } from "$/ui/elements"
import { HotDefinitions } from "$/ui/elements/HotDefinitions"

/**
 * Hot reload of `ui`'s elements (`HotDefinitions`):
 * a NEW version of a component class defined for a known tag swaps in place;  `update()` re-renders.
 * - A new version:  a second class of the same name, as re-running its module makes.
 * - Importing `HotDefinitions` wraps `UIComponent.define` for this file's page only:
 *   vitest's browser mode runs each test file in its own iframe, with its own module graph.
 * - Vitest serves the source through Vite's dev server, so `import.meta.hot` exists here:
 *   every DOM element made calls the hooks `HotDefinitions` installs (`DOMElement.hotReloadHooks`), as in `yarn dev`.
 *   - No test tracks one by hand.
 */

////////////////
// ## Components under test
////////////////

/** A test component, as `makeVersion()` returns it. */
type HotClass = UIComponentClass & typeof UIComponent

/** A test element, with its attribute properties loose. */
type HotElement = DOMElement & Record<string, any> & { shadowRoot: ShadowRoot }

/** The attribute every test tag has, unless a test says otherwise. */
const LABEL = { name: "label", kind: "string", description: "A label." } as const

/** What every element starts with for the shared attributes (`SharedVocabulary`), never written in these tests. */
const SHARED_STARTING_VALUES = { disabled: false, loading: false, visible: true, animation: undefined } as const

/** The Spanish names of a test tag:  `<x-hot-1-es etiqueta="...">`. */
const SPANISH = { lang: "es", attributes: { label: "etiqueta" } } as const satisfies Dictionary

/** How many tags `nextTag()` has handed out. */
let tagCount = 0

/** A tag no other test defined:  `x-hot-<n>`. */
function nextTag(): string {
  return `x-hot-${++tagCount}`
}

/** A vocabulary for test tag `tag`, with `attributes` and nothing else. */
function vocabularyFor(tag: string, attributes: readonly object[] = [LABEL]): ComponentVocabulary {
  return {
    tag,
    noun: "hot",
    attributes,
    events: [],
    slots: [],
    parts: [{ name: "text", description: "The text." }],
    states: [],
    texts: []
  } as unknown as ComponentVocabulary
}

/**
 * One version of a test component:  renders `<b part="text">` with `text`, then each attribute's value.
 * - EVERY call makes a new class named `XHot`, as re-running its module would:
 *   defined for a known tag, it's a new version of the class there.
 * - `render`:  replaces the default render (a throwing one, say).
 * - `elementSetup`:  what this version states (`UIComponent.elementSetup`).
 */
function makeVersion(
  text: string,
  vocabulary: ComponentVocabulary,
  { elementSetup, render }: { elementSetup?: Partial<ElementSetup>; render?: () => JSX.Element } = {}
): HotClass {
  class XHot extends UIComponent<any> {
    /** Component-internal state:  a new component starts again at 0. */
    taps = 0

    render(): JSX.Element {
      if (render) return render()
      const values = () =>
        vocabulary.attributes.map(({ name }) =>
          String((this as unknown as Record<string, string | number | boolean | undefined>)[name] ?? "-")
        )
      return <b part="text">{[text, ...values()].join(" ")}</b>
    }
  }
  Object.defineProperty(XHot.prototype, "vocabulary", { value: vocabulary })
  // chained to the base's, as `@protoMerged static elementSetup` does
  if (elementSetup) {
    Object.defineProperty(XHot.prototype, "elementSetup", {
      value: Object.setPrototypeOf({ ...elementSetup }, UIComponent.prototype.elementSetup)
    })
  }
  return XHot as unknown as HotClass
}

/** Render `html` (one test element), wait until it has rendered;  returns the element. */
async function mount(html: string): Promise<HotElement> {
  return ElementFixture.render<HotElement>(html)
}

/** `element`'s rendered text. */
function textOf(element: HotElement): string {
  return element.shadowRoot.querySelector("[part=text]")?.textContent ?? ""
}

/** `HotDefinitions.update()`, then wait for the re-render;  returns its result. */
async function update(hot?: Parameters<typeof HotDefinitions.update>[0]) {
  const result = HotDefinitions.update(hot)
  await ElementFixture.settle()
  return result
}

afterEach(() => {
  // a test that throws mid-swap leaves nothing pending for the next one
  HotDefinitions.update()
  resetErrorHalt()
})

////////////////
// ## Tests
////////////////

describe("HotDefinitions.liveElements()", () => {
  test("tracks every element of a tag's class:  in the document, in a shadow root, detached", async () => {
    const tag = nextTag()
    const TagClass = makeVersion("one", vocabularyFor(tag)).define() as DOMElementClass
    const inDocument = await mount(`<${tag}></${tag}>`)
    const holder = (await mount(`<div></div>`)).attachShadow({ mode: "open" })
    holder.innerHTML = `<${tag}></${tag}>`
    const detached = document.createElement(tag)
    const live = HotDefinitions.liveElements(TagClass)
    expect(live).toHaveLength(3)
    expect(live).toEqual(expect.arrayContaining([inDocument, holder.firstElementChild, detached]))
  })
})

describe("HotDefinitions.update()", () => {
  test("re-renders every live element IN PLACE:  same element and shadow root, values kept, state reset", async () => {
    const tag = nextTag()
    const vocabulary = vocabularyFor(tag, [LABEL, { name: "size", kind: "string", description: "A size." }])
    makeVersion("one", vocabulary).define()
    const element = await mount(`<${tag} label="a"></${tag}>`)
    const holder = (await mount(`<div></div>`)).attachShadow({ mode: "open" })
    holder.innerHTML = `<${tag} label="s"></${tag}>`
    const nested = holder.firstElementChild as HotElement
    await ElementFixture.settle()
    element.size = "big"
    await ElementFixture.tick()
    const root = element.shadowRoot
    const component = element.component as UIComponent<any> & { taps: number }
    component.taps = 5
    expect(textOf(element)).toBe("one a big")

    const Next = makeVersion("two", vocabulary)
    expect(Next.define()).toBe(element.constructor)
    // nothing re-renders until the barrel has re-run and called `update()`
    expect(textOf(element)).toBe("one a big")
    expect(await update()).toEqual({ reloaded: [tag], refused: [] })
    expect(element.isConnected).toBe(true)
    expect(element.shadowRoot).toBe(root)
    expect(textOf(element)).toBe("two a big")
    expect(textOf(nested)).toBe("two s -")
    expect(element.getAttribute("label")).toBe("a")
    expect(element.component).toBeInstanceOf(Next)
    expect((element.component as unknown as { taps: number }).taps).toBe(0)
    // and the new component is live, not a snapshot
    element.label = "b"
    await ElementFixture.tick()
    expect(textOf(element)).toBe("two b big")
  })

  test("a new version takes over the translated aliases too", async () => {
    const tag = nextTag()
    const alias = `${tag}-es`
    const vocabulary = vocabularyFor(tag)
    const First = makeVersion("one", vocabulary)
    First.define()
    First.define(alias, SPANISH)
    const english = await mount(`<${tag} label="a"></${tag}>`)
    const spanish = await mount(`<${alias} etiqueta="b"></${alias}>`)
    expect(textOf(spanish)).toBe("one b")

    makeVersion("two", vocabulary).define()
    expect(await update()).toEqual({ reloaded: [tag, alias], refused: [] })
    expect(textOf(english)).toBe("two a")
    expect(textOf(spanish)).toBe("two b")
    spanish.etiqueta = "c"
    await ElementFixture.tick()
    expect(textOf(spanish)).toBe("two c")
  })

  test.each([
    [
      "a new observed attribute",
      { attributes: [LABEL, { name: "extra", kind: "string" }] },
      "observed attributes changed (+extra)"
    ],
    ["a removed observed attribute", { attributes: [] }, "observed attributes changed (-label)"],
    [
      "the DOM element class",
      { elementSetup: { DOMElement: class extends DOMElement {} } },
      "DOM element class changed"
    ],
    ["formAssociated", { elementSetup: { isAFormControl: true } }, "formAssociated changed"],
    ["shadow root options", { elementSetup: { delegatesFocus: false } }, "shadow root options changed"]
  ] as [string, { attributes?: readonly object[]; elementSetup?: Partial<ElementSetup> }, string][])(
    "refuses %s:  warns, calls `invalidate()`, the element keeps its version",
    async (_title, change, reason) => {
      const tag = nextTag()
      makeVersion("one", vocabularyFor(tag)).define()
      const element = await mount(`<${tag} label="a"></${tag}>`)
      const vocabulary = change.attributes ? vocabularyFor(tag, change.attributes) : vocabularyFor(tag)
      makeVersion("two", vocabulary, { elementSetup: change.elementSetup }).define()
      const invalidate = vi.fn()
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      const message = `<${tag}>: ${reason}, full reload`
      expect(await update({ invalidate })).toEqual({ reloaded: [], refused: [{ tag, reason }] })
      expect(invalidate).toHaveBeenCalledWith(message)
      expect(warn).toHaveBeenCalledWith(expect.stringContaining(message))
      warn.mockRestore()
      HotDefinitions.reload(element)
      await ElementFixture.settle()
      expect(textOf(element)).toBe("one a")
    }
  )

  test("recovers an element whose new version threw:  the next good one renders, `:state(errored)` cleared", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const tag = nextTag()
    const vocabulary = vocabularyFor(tag)
    makeVersion("one", vocabulary).define()
    const element = await mount(`<${tag} label="a"></${tag}>`)
    const render = () => {
      throw new Error("boom in render")
    }
    makeVersion("broken", vocabulary, { render }).define()
    await update()
    await ElementFixture.tick()
    expect(element.matches(":state(errored)")).toBe(true)
    expect(textOf(element)).toBe("")

    makeVersion("fixed", vocabulary).define()
    await update()
    expect(element.matches(":state(errored)")).toBe(false)
    expect(textOf(element)).toBe("fixed a")
    error.mockRestore()
  })

  test("only disposes a detached element:  it renders the new version on its next connect", async () => {
    const tag = nextTag()
    const vocabulary = vocabularyFor(tag)
    makeVersion("one", vocabulary).define()
    const element = await mount(`<${tag} label="a"></${tag}>`)
    const container = element.parentElement!
    element.remove()
    const Next = makeVersion("two", vocabulary)
    Next.define()
    expect(await update()).toEqual({ reloaded: [tag], refused: [] })
    expect(element.shadowRoot.childNodes).toHaveLength(0)
    container.append(element)
    await ElementFixture.settle()
    expect(element.component).toBeInstanceOf(Next)
    expect(textOf(element)).toBe("two a")
  })
})

describe("HotDefinitions.define()", () => {
  test("throws, changing nothing, when the new version's property would hide a member of the element", async () => {
    const tag = nextTag()
    makeVersion("one", vocabularyFor(tag, [{ ...LABEL, name: "title", property: "heading" }])).define()
    const element = await mount(`<${tag} title="a"></${tag}>`)
    // `title` camelCased is `title`:  the new property would hide `HTMLElement.title`
    const Next = makeVersion("two", vocabularyFor(tag, [{ ...LABEL, name: "title" }]))
    expect(() => Next.define()).toThrow(/would hide the element's own member/)
    expect(await update()).toEqual({ reloaded: [], refused: [] })
    expect(element.heading).toBe("a")
    expect(textOf(element)).toBe("one a")
    element.heading = "b"
    await ElementFixture.tick()
    expect(textOf(element)).toBe("one b")
  })
})

describe("HotDefinitions.migrate()", () => {
  test("keeps PROPERTY writes as they are, converts ATTRIBUTE writes again, starts the rest anew", async () => {
    const tag = nextTag()
    const attributes = (kind: string, tone: string) => [
      { name: "count", kind, description: "Written by its attribute." },
      { name: "size", kind, description: "Written as a property." },
      { name: "tone", kind: "string", default: tone, description: "Never written." }
    ]
    makeVersion("one", vocabularyFor(tag, attributes("string", "warm"))).define()
    const element = await mount(`<${tag} count="5"></${tag}>`)
    element.size = "7"
    await ElementFixture.tick()
    expect(element.attributeValues).toEqual({ ...SHARED_STARTING_VALUES, count: "5", size: "7", tone: "warm" })

    // the new version reads `count` and `size` as numbers, and starts `tone` cool
    makeVersion("two", vocabularyFor(tag, attributes("number", "cool"))).define()
    await update()
    expect(element.attributeValues).toEqual({ ...SHARED_STARTING_VALUES, count: 5, size: "7", tone: "cool" })
    expect(textOf(element)).toBe("two 5 7 cool")
  })
})

describe("HotDefinitions.updateStyle()", () => {
  test.each([
    ["/src/components/ui-button/UIButton.css?inline", "button"],
    ["/src/components/ui-tree/UITreeDiagram.css", "tree-diagram"],
    ["UIDimmer.page.css", undefined],
    ["/src/components/ui-button/button.css", undefined]
  ])("re-registers %s's sheet as %s", async (id, name) => {
    // loaded, so the re-registration runs at once
    await UI.load()
    const register = vi.spyOn(UI.styles, "register").mockImplementation(() => new CSSStyleSheet())
    HotDefinitions.updateStyle(id, ".x {}")
    if (name) expect(register).toHaveBeenCalledWith(name, ".x {}")
    else expect(register).not.toHaveBeenCalled()
    register.mockRestore()
  })
})
