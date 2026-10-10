import { createSignal, flush, onCleanup, resetErrorHalt } from "solid-js"
import { render, type JSX } from "@solidjs/web"
import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { E } from "$/ui/core"
import { UIComponent, type DOMElement, type DOMElementClass, type ElementSetup } from "$/ui/elements"
import type { AttributeKind, AttributeSpec, ComponentVocabulary, Dictionary } from "$/ui/vocabulary"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { Fixture } from "$/ui/test/Fixture"

/**
 * The DOM element (`DOMElement`):  attributes and properties, the upgrade step, lifecycle, shadow root,
 * internals and forms, each on a test tag of its own.
 * - Ported from solid-element's tests (`solid-element/*.test.tsx`), each keeping its fix's intent:
 *   the layer they tested is folded into `DOMElement` and `UIComponent` (epic `spell-element`, P2).
 */

////////////////
// ## Test tags
////////////////

/** A test element as a test sees it:  a DOM element with its attribute properties. */
type Host = DOMElement & Record<string, unknown>

/** How many test tags were made:  every test defines its own. */
let tagCount = 0

/**
 * A test component:  shows its FIRST attribute as `typeof:value` (`boolean:true`), in part `text`.
 * - Reads it through the component's own getter, so the text follows every change.
 */
class Shows extends UIComponent<any> {
  render(): JSX.Element {
    return <span part="text">{this.shown()}</span>
  }

  /** The first attribute's value, as `typeof:value`. */
  protected shown(): string {
    const key = this.elementDefinition.attributes[0]?.key
    const value = key === undefined ? undefined : (this as unknown as Record<string, unknown>)[key]
    return `${typeof value}:${String(value)}`
  }
}

/** Options of `testTag()`. */
type TagOptions = {
  /** the component class to extend;  default `Shows` */
  Component?: typeof Shows
  /** the class's own `elementSetup` keys (`{ isAFormControl: true }`) */
  setup?: Partial<ElementSetup>
}

/**
 * A new test tag (`x-dom-<name>-<n>`) with `attributes`, on a fresh subclass of `Component`:  NOT defined yet.
 * - `define()` defines it (DOM API `customElements.define()`, through `UIComponent.define()`).
 * - With a `tag` and a `dictionary`, it defines a translated tag of it instead.
 */
function testTag(name: string, attributes: readonly AttributeSpec[], { Component = Shows, setup }: TagOptions = {}) {
  const tag = `x-dom-${name}-${++tagCount}`
  const Class = class extends Component {}
  const vocabulary: ComponentVocabulary = {
    tag,
    noun: tag,
    attributes,
    events: [],
    slots: [],
    parts: [{ name: "text", description: "The shown value." }],
    states: [],
    texts: []
  }
  Object.defineProperty(Class.prototype, "vocabulary", { value: vocabulary })
  // chained to the base's, as `@protoMerged static elementSetup` does
  if (setup) {
    const value = Object.setPrototypeOf({ ...setup }, Component.prototype.elementSetup)
    Object.defineProperty(Class.prototype, "elementSetup", { value })
  }
  const define = (translatedTag?: string, dictionary?: Dictionary) =>
    UIComponent.define.call(Class as never, translatedTag, dictionary) as DOMElementClass
  return { tag, define }
}

/** `testTag()`, defined at once;  returns the tag and its DOM element class. */
function definedTag(name: string, attributes: readonly AttributeSpec[], options?: TagOptions) {
  const { tag, define } = testTag(name, attributes, options)
  return { tag, Class: define() }
}

/** A vocabulary attribute:  `name` of `kind`, plus any other spec keys. */
function attribute(name: string, kind: AttributeKind, more: Partial<AttributeSpec> = {}): AttributeSpec {
  return { name, kind, description: `The ${name}.`, ...more }
}

/** Render `<tag ...>` (`attributes`:  its attribute text) and wait for it. */
function renderTag(tag: string, attributes = "") {
  return ElementFixture.render<Host>(`<${tag} ${attributes}></${tag}>`)
}

/** The text a `Shows` element shows. */
function shown(host: Element) {
  return host.shadowRoot!.querySelector("[part=text]")?.textContent
}

/** A container in the page (removed after the test), for elements a test creates and moves by hand. */
function container() {
  return Fixture.render(`<div></div>`)
}

////////////////
// ## Attributes and properties
//
// From solid-element's fix 4 (`attributes.test.tsx`).
////////////////

describe("DOMElement attributes", () => {
  test("removing a bare attribute reaches the component", async () => {
    const { tag } = definedTag("bare-removal", [attribute("primary", "boolean")])
    const host = await renderTag(tag, "primary")
    expect(shown(host)).toBe("boolean:true")
    host.removeAttribute("primary")
    expect(host.primary).toBe(false)
    await ElementFixture.tick()
    expect(shown(host)).toBe("boolean:false")
  })

  test("change callbacks receive the source:  `attribute` or `property`", async () => {
    const { tag } = definedTag("change-source", [attribute("label", "string")])
    const host = await renderTag(tag)
    const seen: unknown[] = []
    host.addPropertyChangedCallback((...args) => seen.push(args))
    host.setAttribute("label", "a")
    host.label = "b"
    expect(seen).toEqual([
      ["label", "a", undefined, "attribute"],
      ["label", "b", "a", "property"]
    ])
  })

  test("an author's setAttribute() right after a reflecting property write is NOT swallowed", async () => {
    const { tag } = definedTag("same-tick", [attribute("label", "string")])
    const host = await renderTag(tag)
    host.label = "from property"
    host.setAttribute("label", "from attribute")
    expect(host.label).toBe("from attribute")
  })

  test('attribute writes are never reflected back (`primary="yes"` stays);  property writes are', async () => {
    const { tag } = definedTag("no-echo", [attribute("primary", "boolean")])
    const host = await renderTag(tag, `primary="yes"`)
    expect(host.primary).toBe(true)
    expect(host.getAttribute("primary")).toBe("yes")
    host.primary = false
    expect(host.hasAttribute("primary")).toBe(false)
    host.primary = true
    expect(host.getAttribute("primary")).toBe("")
  })

  test("reflecting an array keeps the array:  its own write is not parsed back", async () => {
    const { tag } = definedTag("array-reflect", [attribute("items", "string")])
    const host = await renderTag(tag)
    const sources: unknown[] = []
    host.addPropertyChangedCallback((_key, _value, _old, source) => sources.push(source))
    const items = ["a", "b"]
    host.items = items
    expect(host.items).toBe(items)
    expect(host.getAttribute("items")).toBe("a,b")
    expect(sources).toEqual(["property"])
    await ElementFixture.tick()
    expect(shown(host)).toBe("object:a,b")
  })

  test("an object written to a string attribute's property reflects as JSON, never `[object Object]`", async () => {
    const { tag } = definedTag("object-text", [attribute("label", "string")])
    const host = await renderTag(tag)
    host.label = { a: 1 }
    expect(host.getAttribute("label")).toBe('{"a":1}')
    // a string attribute holds text:  the property reads back the JSON, not the object
    expect(host.label).toBe('{"a":1}')
    host.label = 7
    expect(host.getAttribute("label")).toBe("7")
    await ElementFixture.tick()
    expect(shown(host)).toBe("string:7")
  })

  test("an array of objects reflects as JSON too:  the array itself is kept", async () => {
    const { tag } = definedTag("object-array", [attribute("items", "string")])
    const host = await renderTag(tag)
    const items = [{ a: 1 }, { b: 2 }]
    host.items = items
    expect(host.getAttribute("items")).toBe('[{"a":1},{"b":2}]')
    expect(host.items).toBe(items)
  })

  test("attributes are read before the element connects", () => {
    const { tag } = definedTag("before-connect", [attribute("count", "number", { default: 0 })])
    const host = document.createElement(tag) as Host
    expect(host.count).toBe(0)
    host.setAttribute("count", "3")
    expect(host.count).toBe(3)
  })

  test("a bare element grows NO attributes for its defaults", async () => {
    const { tag } = definedTag("no-default-reflect", [
      attribute("variant", "string", { default: "solid" }),
      attribute("open", "boolean", { default: false }),
      attribute("count", "number", { default: 3 })
    ])
    const host = await renderTag(tag)
    expect(host.variant).toBe("solid")
    expect(host.getAttributeNames()).toEqual([])
  })

  test("setting a property to its default value still reflects (an explicit set)", async () => {
    const { tag } = definedTag("default-write", [attribute("variant", "string", { default: "solid" })])
    const host = await renderTag(tag)
    expect(host.hasAttribute("variant")).toBe(false)
    host.variant = "solid"
    expect(host.getAttribute("variant")).toBe("solid")
    host.variant = ""
    expect(host.getAttribute("variant")).toBe("")
  })

  test("removing the attribute brings the default back, and leaves no attribute", async () => {
    const { tag } = definedTag("remove-restores", [attribute("variant", "string", { default: "solid" })])
    const host = await renderTag(tag, `variant="outline"`)
    expect(host.variant).toBe("outline")
    host.removeAttribute("variant")
    expect(host.variant).toBe("solid")
    expect(host.hasAttribute("variant")).toBe(false)
    await ElementFixture.tick()
    expect(shown(host)).toBe("string:solid")
  })
})

////////////////
// ## Property values
//
// From solid-element's fix 3 (`props.test.tsx`):  what's left once the vocabulary decides each conversion.
////////////////

describe("DOMElement property values", () => {
  test("property writes convert as attribute text does, pre-upgrade ones included", async () => {
    const { tag, define } = testTag("from-property", [attribute("active", "boolean")])
    const early = document.createElement(tag) as Host
    early.active = "yes"
    define()
    customElements.upgrade(early)
    // captured before the tag was defined, converted at once (and set again on its first connect)
    expect(early.active).toBe(true)
    const host = await renderTag(tag)
    host.active = "yes"
    expect(host.active).toBe(true)
    expect(host.getAttribute("active")).toBe("")
    await ElementFixture.tick()
    expect(shown(host)).toBe("boolean:true")
    host.active = "no"
    expect(host.active).toBe(false)
    expect(host.hasAttribute("active")).toBe(false)
  })

  test("`json` and `reflect: false` are never written back;  their attribute text still reads in", async () => {
    const { tag } = definedTag("property-only", [
      attribute("config", "json"),
      attribute("note", "string", { reflect: false })
    ])
    const host = await renderTag(tag)
    const config = [1, 2]
    host.config = config
    host.note = "kept"
    expect(host.config).toBe(config)
    expect(host.getAttributeNames()).toEqual([])
    await ElementFixture.tick()
    expect(shown(host)).toBe("object:1,2")
    host.setAttribute("config", "[3]")
    expect(host.config).toEqual([3])
  })

  test("a translated tag renames the attribute and its property;  the component's key stays", async () => {
    const { define } = testTag("translated", [attribute("label", "string")])
    const tag = `x-dom-traducido-${tagCount}`
    const Class = define(tag, { lang: "es", attributes: { label: "etiqueta" } })
    // then the shared attributes (`SharedVocabulary`), under their Spanish names (`SharedVocabulary.es.ts`;
    // `animation` has none yet), and the platform's `hidden`, its other name
    expect(Class.observedAttributes).toEqual(["etiqueta", "desactivado", "cargando", "visible", "animation", "hidden"])
    const host = await renderTag(tag, `etiqueta="A"`)
    expect(host.etiqueta).toBe("A")
    expect("label" in host).toBe(false)
    expect(shown(host)).toBe("string:A")
    host.etiqueta = "B"
    expect(host.getAttribute("etiqueta")).toBe("B")
  })
})

////////////////
// ## The upgrade step, and the properties' names
//
// From solid-element's fix 2 (`upgrade.test.tsx`).
////////////////

describe("DOMElement upgrade", () => {
  test("a property set BEFORE the tag is defined survives the upgrade", async () => {
    const { tag, define } = testTag("pre-upgrade", [attribute("options", "json")])
    const host = Fixture.render<Host>(`<${tag}></${tag}>`)
    // a framework (React, Vue, Solid) sets rich data as a property, before the element's module has loaded
    host.options = ["a", "b"]
    define()
    await ElementFixture.settle(host)
    expect(Object.hasOwn(host, "options")).toBe(false)
    expect(host.options).toEqual(["a", "b"])
    expect(shown(host)).toBe("object:a,b")
  })

  test("properties live on the PROTOTYPE:  the constructor adds no own properties", () => {
    const { tag, Class } = definedTag("prototype-accessors", [attribute("count", "number")])
    const host = document.createElement(tag)
    expect({
      onPrototype: typeof Object.getOwnPropertyDescriptor(Class.prototype, "count")?.get,
      own: Object.hasOwn(host, "count"),
      in: "count" in host
    }).toEqual({ onPrototype: "function", own: false, in: true })
  })

  test("a property the vocabulary NAMES takes over a member on purpose, and keeps the author's attribute", async () => {
    const { tag, define } = testTag("named-property", [
      attribute("inputmode", "enum", { property: "inputMode", values: ["text", "numeric"] })
    ])
    const host = Fixture.render<Host>(`<${tag} inputmode="numeric"></${tag}>`)
    const Class = define()
    await ElementFixture.settle(host)
    expect(Object.getOwnPropertyDescriptor(Class.prototype, "inputMode")?.get).toBeTypeOf("function")
    expect(host.getAttribute("inputmode")).toBe("numeric")
    expect(host.inputMode).toBe("numeric")
    expect(shown(host)).toBe("string:numeric")
  })

  test("an attribute can't silently hide a member of the element (`style`):  defining throws", () => {
    const { tag, define } = testTag("hide-style", [attribute("style", "string")])
    // parsed first, defined later (an upgrade)
    const host = Fixture.render(`<${tag}></${tag}>`)
    expect(() => define()).toThrow(TypeError)
    expect(customElements.get(tag)).toBeUndefined()
    // an author's inline style still lands in CSS
    host.style.color = "red"
    expect(host.getAttribute("style")).toBe("color: red;")
  })

  test("attributes that would hide DOMElement's own members throw too", () => {
    for (const name of ["dispose", "internals", "component", "ready"]) {
      expect(() => definedTag("own-api", [attribute(name, "boolean")]), name).toThrow(/would hide/)
    }
  })

  test("`property` renames a hiding attribute;  the attribute, the component's key and the member all stay", async () => {
    const { tag } = definedTag("renamed", [attribute("hidden", "boolean", { property: "isHidden" })])
    const host = await renderTag(tag, "hidden")
    expect(host.isHidden).toBe(true)
    expect(host.hidden).toBe(true)
    expect(shown(host)).toBe("boolean:true")
    host.isHidden = false
    expect(host.hasAttribute("hidden")).toBe(false)
    await ElementFixture.tick()
    expect(shown(host)).toBe("boolean:false")
    // the member still works, through the same attribute
    host.hidden = true
    expect(host.isHidden).toBe(true)
  })

  test("a pre-upgrade property wins over the attribute, reads right before connect, and reflects", () => {
    const { tag, define } = testTag("upgrade-order", [attribute("label", "string")])
    const host = document.createElement(tag) as Host
    host.setAttribute("label", "attribute")
    host.label = "property"
    define()
    customElements.upgrade(host)
    expect(host.label).toBe("property")
    container().append(host)
    expect(host.label).toBe("property")
    expect(host.getAttribute("label")).toBe("property")
  })

  test("a pre-upgrade property equal to the default still reflects (an explicit set)", () => {
    const { tag, define } = testTag("upgrade-default", [attribute("variant", "string", { default: "solid" })])
    const host = document.createElement(tag) as Host
    host.variant = "solid"
    define()
    customElements.upgrade(host)
    container().append(host)
    expect(host.getAttribute("variant")).toBe("solid")
  })
})

describe("DOMElement.defineProperties()", () => {
  test("throws ONE TypeError naming EVERY attribute property that would hide a member;  defines nothing", () => {
    const { tag, define } = testTag("clashes", [
      attribute("label", "string"),
      attribute("hidden", "boolean"),
      attribute("title", "string"),
      attribute("dispose", "boolean"),
      attribute("internals", "boolean"),
      attribute("lang", "string", { property: "language" })
    ])
    expect.assertions(4)
    try {
      define()
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
      expect((error as Error).message).toContain(`"hidden", "title", "dispose", "internals" would hide`)
      expect((error as Error).message).not.toMatch(/"label"|"language"/)
    }
    expect(customElements.get(tag)).toBeUndefined()
  })
})

////////////////
// ## Lifecycle
//
// From solid-element's fix 6 (`lifecycle.test.tsx`):  ui's elements always keep their component across
// disconnects (solid-element's `keepAlive`);  the hooks are the component's methods now.
////////////////

/** A counter whose count lives in the component:  a click on its button adds one. */
class Counter extends Shows {
  @E.state accessor count = 0

  /** Solid cleanups run so far (the component's root was disposed). */
  cleanups = 0

  /** Every `onConnect()` / `onDisconnect()`, in order. */
  readonly hooks: string[] = []

  constructor(...args: ConstructorParameters<typeof UIComponent>) {
    super(...args)
    onCleanup(() => this.cleanups++)
  }

  onConnect() {
    super.onConnect()
    this.hooks.push("connect")
  }

  onDisconnect() {
    super.onDisconnect()
    this.hooks.push("disconnect")
  }

  render(): JSX.Element {
    return (
      <button part="text" onClick={() => this.count++}>
        {this.count}|{this.shown()}
      </button>
    )
  }
}

/** Click `host`'s counter, and let the view follow. */
async function click(host: Element) {
  host.shadowRoot!.querySelector("button")!.click()
  await ElementFixture.tick()
}

describe("DOMElement lifecycle", () => {
  test("the component survives a disconnect and a move:  same object, same state;  properties flow while detached", async () => {
    const { tag } = definedTag("keep-alive", [attribute("label", "string")], { Component: Counter })
    const [left, right] = [container(), container()]
    const host = document.createElement(tag) as Host
    left.append(host)
    await ElementFixture.settle(host)
    const component = host.component as Counter
    await click(host)
    host.remove()
    await ElementFixture.tick()
    host.label = "b"
    await ElementFixture.tick()
    expect(shown(host)).toBe("1|string:b")
    right.append(host)
    await ElementFixture.tick()
    expect(host.component).toBe(component)
    expect(shown(host)).toBe("1|string:b")
    expect(component.cleanups).toBe(0)
  })

  test("dispose() ends the component (Solid cleanups, shadow root emptied, no more changes);  idempotent", async () => {
    const { tag } = definedTag("dispose", [attribute("label", "string")], { Component: Counter })
    const host = await renderTag(tag, `label="a"`)
    const component = host.component as Counter
    const released: string[] = []
    host.addReleaseCallback(() => released.push("first"))
    host.addReleaseCallback(() => released.push("second"))
    host.dispose()
    host.dispose()
    expect(component.cleanups).toBe(1)
    expect(released).toEqual(["second", "first"])
    expect(host.shadowRoot!.textContent).toBe("")
    // the property still works;  the old component's view hears nothing of it
    host.label = "b"
    await ElementFixture.tick()
    expect(host.label).toBe("b")
    expect(host.shadowRoot!.textContent).toBe("")
  })

  test("a connect after dispose() builds a NEW component", async () => {
    const { tag } = definedTag("remount", [attribute("label", "string")], { Component: Counter })
    const host = await renderTag(tag, `label="a"`)
    const first = host.component
    await click(host)
    expect(shown(host)).toBe("1|string:a")
    host.dispose()
    const parent = host.parentElement!
    host.remove()
    parent.append(host)
    await ElementFixture.settle(host)
    expect(host.component).not.toBe(first)
    expect(shown(host)).toBe("0|string:a")
  })

  test("onConnect() / onDisconnect() are called on EVERY connect (the first included) and disconnect", async () => {
    const { tag } = definedTag("hooks", [], { Component: Counter })
    const parent = container()
    const host = document.createElement(tag) as Host
    parent.append(host)
    host.remove()
    parent.append(host)
    await ElementFixture.settle(host)
    expect((host.component as Counter).hooks).toEqual(["connect", "disconnect", "connect"])
  })
})

////////////////
// ## Element setup
//
// From solid-element's fix 1 (`options.test.tsx`):  each tag's options come from its component's `elementSetup`.
////////////////

describe("DOMElement element setup", () => {
  test("`isAFormControl` makes THAT tag form-associated (DOM API `static formAssociated`)", async () => {
    const control = definedTag("form-control", [], { setup: { isAFormControl: true } })
    const plain = definedTag("not-a-control", [])
    expect((control.Class as unknown as { formAssociated: boolean }).formAssociated).toBe(true)
    expect((plain.Class as unknown as { formAssociated: boolean }).formAssociated).toBe(false)
    const form = await ElementFixture.render(`<form><${control.tag}></${control.tag}></form>`)
    expect(form.querySelector<Host>(control.tag)!.internals.form).toBe(form)
  })

  test("`delegatesFocus` reaches the shadow root:  on by default, off when the component says", async () => {
    const delegating = definedTag("delegates-focus", [])
    const not = definedTag("keeps-focus", [], { setup: { delegatesFocus: false } })
    expect((await renderTag(delegating.tag)).shadowRoot!.delegatesFocus).toBe(true)
    expect((await renderTag(not.tag)).shadowRoot!.delegatesFocus).toBe(false)
  })

  test("the shadow root is open;  `slotAssignment` picks its slot assignment", async () => {
    const byName = definedTag("slots-by-name", [])
    const manually = definedTag("slots-manually", [], { setup: { slotAssignment: "manual" } })
    const named = (await renderTag(byName.tag)).shadowRoot!
    const manual = (await renderTag(manually.tag)).shadowRoot!
    expect([named.mode, named.slotAssignment]).toEqual(["open", "named"])
    expect([manual.mode, manual.slotAssignment]).toEqual(["open", "manual"])
  })
})

////////////////
// ## Shadow root
//
// From solid-element's fix 9 (`shadowRoot.test.tsx`).
////////////////

/** Server-rendered `<tag label="client">` in the page, with a declarative shadow root holding `<p>server</p>`. */
function serverRendered(tag: string) {
  container().setHTMLUnsafe(`<${tag} label="client"><template shadowrootmode="open"><p>server</p></template></${tag}>`)
  return document.querySelector<Host>(tag)!
}

describe("DOMElement shadow root", () => {
  test("a server-rendered root is adopted, and emptied BEFORE the first render:  replaced, not appended to", async () => {
    const { tag, define } = testTag("dsd", [attribute("label", "string")])
    const host = serverRendered(tag)
    const serverRoot = host.shadowRoot!
    const records: MutationRecord[] = []
    const observer = new MutationObserver((batch) => records.push(...batch))
    observer.observe(serverRoot, { childList: true })
    define()
    await ElementFixture.settle(host)
    records.push(...observer.takeRecords())
    observer.disconnect()
    expect(host.shadowRoot).toBe(serverRoot)
    expect(serverRoot.querySelector("p")).toBeNull()
    expect(shown(host)).toBe("string:client")
    // the server's content went first, then the client's came, and nothing was removed after it
    const [first, ...rest] = records
    expect([...first!.removedNodes].map((node) => node.nodeName)).toEqual(["P"])
    expect(rest.some((record) => record.removedNodes.length)).toBe(false)
  })

  test("it's emptied ONCE:  later calls leave the client's content", async () => {
    const { tag, define } = testTag("dsd-once", [attribute("label", "string")])
    const host = serverRendered(tag)
    define()
    await ElementFixture.settle(host)
    host.clearServerContent()
    expect(shown(host)).toBe("string:client")
  })
})

////////////////
// ## Internals and forms
//
// From solid-element's fix 5 (`internals.test.tsx`):  the form callbacks are the component's methods now.
////////////////

/** A form control that logs every form callback its component gets. */
class FormLog extends Shows {
  /** The id of the form the element already had when this component was built. */
  readonly formWhenBuilt = this.domElement.internals.form?.id

  /** Every form callback, in order. */
  readonly log: unknown[] = []

  onFormAssociated(form: HTMLFormElement | null) {
    this.log.push(["associated", form?.id ?? null])
  }

  onFormDisabled(disabled: boolean) {
    super.onFormDisabled(disabled)
    this.log.push(["disabled", disabled])
  }

  onFormReset() {
    this.log.push(["reset"])
  }

  onFormStateRestore(state: File | string | FormData | null, mode: string) {
    this.log.push(["restore", state, mode])
  }
}

describe("DOMElement internals", () => {
  test("internals are always attached:  custom states anywhere, a form value on a form control", async () => {
    const plain = definedTag("states", [])
    const control = definedTag("form-value", [], { setup: { isAFormControl: true } })
    const host = await renderTag(plain.tag)
    expect(host.internals).toBeInstanceOf(ElementInternals)
    host.setState("lit", true)
    expect(host.matches(":state(lit)")).toBe(true)
    const form = await ElementFixture.render<HTMLFormElement>(
      `<form><${control.tag} name="field"></${control.tag}></form>`
    )
    form.querySelector<Host>(control.tag)!.internals.setFormValue("42")
    expect(new FormData(form).get("field")).toBe("42")
  })

  test("the browser's form callbacks reach the component's methods", async () => {
    const { tag } = definedTag("form-callbacks", [], { Component: FormLog, setup: { isAFormControl: true } })
    const host = await renderTag(tag)
    const form = await ElementFixture.render<HTMLFormElement>(`<form id="f"><fieldset></fieldset></form>`)
    const fieldset = form.querySelector("fieldset")!
    const component = host.component as FormLog
    fieldset.append(host)
    fieldset.disabled = true
    form.reset()
    // a restore needs a navigation:  call the DOM API callback directly to check the forwarding
    host.formStateRestoreCallback("restored", "restore")
    expect(host.component).toBe(component)
    expect(component.log).toEqual([
      ["associated", "f"],
      ["disabled", true],
      ["reset"],
      ["restore", "restored", "restore"]
    ])
    expect(component.formIsDisabled).toBe(true)
  })

  test("form state the browser reports BEFORE the component exists is handed to it once built", async () => {
    const { tag } = definedTag("early-form", [], { Component: FormLog, setup: { isAFormControl: true } })
    const form = await ElementFixture.render<HTMLFormElement>(`<form id="g"><fieldset disabled></fieldset></form>`)
    const host = document.createElement(tag) as Host
    // inserting it reports its form (and the disabled fieldset) first, then connects it, which builds the component
    form.querySelector("fieldset")!.append(host)
    await ElementFixture.settle(host)
    const component = host.component as FormLog
    // the form was the element's before its component existed:  the browser had already reported it
    expect(component.formWhenBuilt).toBe("g")
    expect(component.log).toEqual([
      ["associated", "g"],
      ["disabled", true]
    ])
    expect(component.formIsDisabled).toBe(true)
  })
})

////////////////
// ## Solid 2
//
// From solid-element's `solid2.test.tsx`:  Solid 2 traps an element must hide.
////////////////

describe("DOMElement under Solid 2", () => {
  afterEach(() => {
    resetErrorHalt()
  })

  test("setting an element property inside a Solid component body is allowed (it's a DOM API)", async () => {
    const { tag } = definedTag("owned-write", [attribute("label", "string")])
    const host = await renderTag(tag, `label="a"`)
    /** An app component that configures an existing element while rendering. */
    function App() {
      host.label = "from a component body"
      return null
    }
    const dispose = render(() => <App />, container())
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(shown(host)).toBe("string:from a component body")
    dispose()
  })

  test("the component's constructor runs ONCE, untracked", async () => {
    const [outside, setOutside] = createSignal(0)
    let runs = 0
    /** Reads an attribute and an outside signal in its constructor:  tracked, either would build it again. */
    class Reads extends Shows {
      constructor(...args: ConstructorParameters<typeof UIComponent>) {
        super(...args)
        runs++
        void (this as unknown as Record<string, unknown>).label
        void outside()
      }
    }
    const { tag } = definedTag("untracked", [attribute("label", "string")], { Component: Reads })
    const host = await renderTag(tag, `label="a"`)
    host.label = "b"
    setOutside(1)
    flush()
    await ElementFixture.tick()
    expect(runs).toBe(1)
    expect(shown(host)).toBe("string:b")
  })

  // found porting this test (epic `spell-element` P2):  `<Show>` evaluates its children in a TRACKED computation, so
  // `UIComponent.onMount()` untracks its `render()` call
  test("render() runs ONCE, untracked, even when its body reads reactive values", async () => {
    const [outside, setOutside] = createSignal(0)
    const runs = { label: 0, signal: 0 }
    /** Reads an attribute and an outside signal in its render() body, counting its runs after each. */
    class Reads extends Shows {
      render(): JSX.Element {
        void (this as unknown as Record<string, unknown>).label
        void outside()
        runs.label++
        runs.signal++
        return super.render()
      }
    }
    const { tag } = definedTag("render-once", [attribute("label", "string")], { Component: Reads })
    const host = await renderTag(tag, `label="a"`)
    runs.label = runs.signal = 0
    host.label = "b"
    await ElementFixture.tick()
    const afterLabel = runs.label
    runs.signal = 0
    setOutside(1)
    flush()
    await ElementFixture.tick()
    // today:  { label: 1, signal: 1 }, one extra render() for each
    expect({ label: afterLabel, signal: runs.signal }).toEqual({ label: 0, signal: 0 })
  })

  test("a `ui-error` listener may write signals (it runs outside any owner)", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    /** Throws while rendering. */
    class Throws extends Shows {
      render(): JSX.Element {
        throw new Error("bad")
      }
    }
    const { tag } = definedTag("error-write", [], { Component: Throws })
    const [message, setMessage] = createSignal("")
    const listener = (event: Event) => setMessage(((event as CustomEvent).detail.error as Error).message)
    document.addEventListener(E.ERROR_EVENT, listener)
    const host = await renderTag(tag)
    document.removeEventListener(E.ERROR_EVENT, listener)
    flush()
    expect(host.matches(":state(errored)")).toBe(true)
    expect(message()).toBe("bad")
    error.mockRestore()
  })
})
