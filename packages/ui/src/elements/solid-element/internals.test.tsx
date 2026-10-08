/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/** FIX 5:  `element.internals` and the form hooks. */

import { createSignal, flush } from "solid-js"
import { afterEach, describe, expect, it } from "vite-plus/test"

import { customElement } from "./customElement"
import { onFormAssociated, onFormDisabled, onFormReset, onFormStateRestore } from "./internals"
import type { SolidElement } from "./solid-element.types"
import { cleanup, mount, nextTag, reproduce } from "./testing"

describe("fix 5:  ElementInternals and form hooks", () => {
  afterEach(cleanup)

  reproduce(
    "a form-associated element submits its value (issue #15)",
    ({ customElement }) => {
      const tag = nextTag("form-value")
      customElement(
        tag,
        { value: "" },
        (props: { value: string }, { element }: { element: SolidElement }) => {
          // with the original there are no internals:  nothing to submit through
          element.internals?.setFormValue(props.value)
          return null
        },
        { formAssociated: true }
      )
      const form = mount(`<form><${tag} name="field" value="42"></${tag}></form>`).firstElementChild as HTMLFormElement
      return new FormData(form).get("field")
    },
    { original: null, fork: "42" }
  )

  it("fork:  `internals: true` without form association gives custom states", () => {
    const tag = nextTag("states")
    customElement(
      tag,
      {},
      (_props, { element }) => {
        element.internals!.states.add("ready")
        return null
      },
      { internals: true }
    )
    const element = mount(`<${tag}></${tag}>`).firstElementChild!
    expect(element.matches(":state(ready)")).toBe(true)
  })

  it("fork:  internals a base class attached already are reused, not attached twice", () => {
    /** A base that attaches its own internals. */
    class Base extends HTMLElement {
      internals = this.attachInternals()
    }
    const tag = nextTag("base-internals")
    customElement(tag, {}, () => null, { BaseElement: Base, internals: true })
    const element = mount(`<${tag}></${tag}>`).firstElementChild as Base
    expect(element.internals).toBeInstanceOf(ElementInternals)
  })

  it("fork:  the platform's form callbacks reach hooks registered during setup", () => {
    const tag = nextTag("form-hooks")
    const log: unknown[] = []
    customElement(
      tag,
      { value: "start" },
      (props, { element }) => {
        const [value, setValue] = createSignal(props.value)
        onFormAssociated((form) => log.push(["associated", form?.id]))
        onFormDisabled((disabled) => log.push(["disabled", disabled]))
        onFormReset(() => {
          log.push(["reset"])
          setValue("start")
        })
        onFormStateRestore((state, mode) => log.push(["restore", state, mode]))
        return (
          <input
            value={value()}
            onInput={(event) => {
              setValue(event.currentTarget.value)
              element.internals!.setFormValue(event.currentTarget.value)
            }}
          />
        )
      },
      { formAssociated: true }
    )
    const container = mount(`<form id="f"><fieldset><${tag} name="field"></${tag}></fieldset></form>`)
    const form = container.querySelector("form")!
    const element = container.querySelector(tag) as SolidElement & {
      formStateRestoreCallback(s: unknown, m: string): void
    }
    const input = element.shadowRoot!.querySelector("input")!
    input.value = "typed"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    flush()
    expect(new FormData(form).get("field")).toBe("typed")
    container.querySelector("fieldset")!.disabled = true
    form.reset()
    flush()
    expect(input.value).toBe("start")
    // restore needs a navigation;  call the platform callback directly to check the forwarding
    element.formStateRestoreCallback("restored", "restore")
    expect(log).toEqual([["associated", "f"], ["disabled", true], ["reset"], ["restore", "restored", "restore"]])
  })

  it("fork:  a base class's own form callback still runs first", () => {
    const log: string[] = []
    /** A base with its own reset handling. */
    class Base extends HTMLElement {
      formResetCallback() {
        log.push("base")
      }
    }
    const tag = nextTag("base-callback")
    customElement(
      tag,
      {},
      () => {
        onFormReset(() => log.push("hook"))
        return null
      },
      { BaseElement: Base, formAssociated: true }
    )
    const form = mount(`<form><${tag}></${tag}></form>`).firstElementChild as HTMLFormElement
    form.reset()
    expect(log).toEqual(["base", "hook"])
  })

  it("fork:  a hook outside a component throws", () => {
    expect(() => onFormReset(() => {})).toThrow(/outside a component/)
  })
})
