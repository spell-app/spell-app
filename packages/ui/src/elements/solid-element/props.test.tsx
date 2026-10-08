/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/** FIX 3:  per-prop definitions, the boolean rule, JSON only for `Object` / `Array`, attribute names. */

import { flush } from "solid-js"
import { afterEach, describe, expect, it } from "vite-plus/test"

import { customElement } from "./customElement"
import { toAttribute } from "./props"
import { cleanup, mount, nextTag, reproduce } from "./testing"

/** Render `props[key]` as text, typed:  `boolean:true`. */
function Show(key: string) {
  return (props: Record<string, unknown>) => (
    <span>
      {typeof props[key]}:{String(props[key])}
    </span>
  )
}

describe("fix 3:  prop definitions", () => {
  afterEach(cleanup)

  reproduce(
    'a bare boolean attribute (`primary`, text `""`) is true',
    ({ customElement }) => {
      const tag = nextTag("bare-boolean")
      customElement(tag, { primary: false }, Show("primary"))
      return mount(`<${tag} primary></${tag}>`).firstElementChild!.shadowRoot!.textContent
    },
    // `parseAttributeValue("")` returns undefined before trying JSON (component-register.js:60)
    { original: "undefined:undefined", fork: "boolean:true" }
  )

  reproduce(
    '`true` reflects as `""`, not `"true"`',
    ({ customElement }) => {
      const tag = nextTag("reflect-true")
      // `parse: false` is how a caller avoids the bare-boolean bug above -- and then reflection writes "true"
      customElement(tag, { open: { value: false, parse: false, reflect: true } }, Show("open"))
      const element = document.createElement(tag) as HTMLElement & { open: boolean }
      document.body.append(element)
      element.open = true
      return element.getAttribute("open")
    },
    { original: "true", fork: "" }
  )

  reproduce(
    "a numeric id string stays a string (issue #8)",
    ({ customElement }) => {
      const tag = nextTag("numeric-id")
      customElement(tag, { userId: undefined }, Show("userId"))
      return mount(`<${tag} user-id="210246661446959104"></${tag}>`).firstElementChild!.shadowRoot!.textContent
    },
    { original: "number:210246661446959100", fork: "string:210246661446959104" }
  )

  reproduce(
    "a removed attribute falls back to the default (issue #20)",
    ({ customElement }) => {
      const tag = nextTag("removed-default")
      customElement(tag, { label: "default" }, Show("label"))
      const element = mount(`<${tag} label="set"></${tag}>`).firstElementChild!
      element.removeAttribute("label")
      flush()
      return element.shadowRoot!.textContent
    },
    { original: "object:null", fork: "string:default" }
  )

  reproduce(
    "every underscore maps to a dash (issue #40)",
    ({ customElement }) => {
      const tag = nextTag("underscores")
      const Class = customElement(tag, { this_is_a_prop: "" }, Show("this_is_a_prop")) as unknown as {
        observedAttributes: string[]
      }
      return Class.observedAttributes
    },
    { original: ["this-is_a_prop"], fork: ["this-is-a-prop"] }
  )

  it("fork:  `type` decides conversion;  JSON only for Object / Array", () => {
    const tag = nextTag("typed")
    customElement(
      tag,
      {
        count: { type: Number, value: 0 },
        name: { type: String },
        items: { type: Array, value: [] as unknown[] },
        config: { type: Object, value: { a: 1 } },
        flag: { type: Boolean }
      },
      (props) => (
        <span>
          {props.count + 1}|{props.name}|{props.items.length}|{JSON.stringify(props.config)}|{String(props.flag)}
        </span>
      )
    )
    const element = mount(
      `<${tag} count="41" name="[1]" items="[1,2,3]" config='{"b":2}' flag></${tag}>`
    ).firstElementChild!
    expect(element.shadowRoot!.textContent).toBe('42|[1]|3|{"b":2}|true')
    element.setAttribute("config", "not json")
    flush()
    // malformed JSON falls back to the default
    expect(element.shadowRoot!.textContent).toBe('42|[1]|3|{"a":1}|true')
  })

  it("fork:  a converter wins over `type`, both directions", () => {
    const tag = nextTag("converter")
    const yesNo = {
      fromAttribute: (text: string | null) => text !== null && text !== "no" && text !== "false",
      toAttribute: (value: boolean) => (value ? "yes" : null)
    }
    customElement(tag, { active: { value: false, converter: yesNo, reflect: true } }, Show("active"))
    const element = mount(`<${tag} active="no"></${tag}>`).firstElementChild as HTMLElement & { active: boolean }
    expect(element.shadowRoot!.textContent).toBe("boolean:false")
    element.active = true
    flush()
    expect(element.getAttribute("active")).toBe("yes")
    expect(element.shadowRoot!.textContent).toBe("boolean:true")
  })

  it("fork:  `converter.fromProperty` normalizes property writes, pre-upgrade ones included", () => {
    const tag = nextTag("from-property")
    const yesNo = (value: unknown) => value === true || value === "" || value === "yes"
    const early = document.createElement(tag) as HTMLElement & { active: unknown }
    early.active = "yes"
    customElement(tag, { active: { value: false, converter: { fromProperty: yesNo }, reflect: true } }, Show("active"))
    customElements.upgrade(early)
    const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement & { active: unknown }
    element.active = "yes"
    flush()
    expect(element.active).toBe(true)
    expect(element.getAttribute("active")).toBe("")
    expect(element.shadowRoot!.textContent).toBe("boolean:true")
    element.active = "no"
    flush()
    expect(element.active).toBe(false)
    expect(element.hasAttribute("active")).toBe(false)
    // captured before the element was defined, converted at once (and again when re-applied on connect)
    expect(early.active).toBe(true)
  })

  it("fork:  an object written to a `String` prop reflects as JSON, never `[object Object]`", () => {
    const tag = nextTag("object-text")
    customElement(tag, { label: { value: "", reflect: true } }, Show("label"))
    const element = mount(`<${tag}></${tag}>`).firstElementChild as HTMLElement & { label: unknown }
    element.label = { a: 1 }
    expect(element.getAttribute("label")).toBe('{"a":1}')
    element.label = 7
    expect(element.getAttribute("label")).toBe("7")
  })

  it("fork:  `attribute: false` is property-only;  `attribute` renames", () => {
    const tag = nextTag("attribute-names")
    const Class = customElement(
      tag,
      { secret: { value: 1, attribute: false }, label: { value: "", attribute: "aria-label-text" } },
      Show("label")
    ) as unknown as { observedAttributes: string[] }
    expect(Class.observedAttributes).toEqual(["aria-label-text"])
  })

  it("fork:  `component-register`'s shape `{ value, attribute, parse, reflect }` still works", () => {
    const tag = nextTag("legacy-shape")
    customElement(
      tag,
      {
        raw: { value: "", attribute: "raw-text", parse: false, reflect: true },
        loose: { value: undefined, parse: true, notify: true }
      },
      (props) => (
        <span>
          {props.raw}|{JSON.stringify(props.loose)}
        </span>
      )
    )
    const element = mount(`<${tag} raw-text="[1]" loose='{"x":1}'></${tag}>`).firstElementChild!
    expect(element.shadowRoot!.textContent).toBe('[1]|{"x":1}')
    element.setAttribute("loose", "plain text")
    flush()
    expect(element.shadowRoot!.textContent).toBe('[1]|"plain text"')
  })

  it("fork:  attribute names", () => {
    expect(toAttribute("someProp")).toBe("some-prop")
    expect(toAttribute("URLValue")).toBe("urlvalue")
    expect(toAttribute("a_b_c")).toBe("a-b-c")
  })
})
