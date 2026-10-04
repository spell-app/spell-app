/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * Integration:  one realistic form control using every fix together -- the shape `@spell-app/ui`'s `ui-dropdown`
 * needs.
 */

import { For, createEffect, createMemo, createSignal, flush } from "solid-js"
import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { customElement } from "./customElement"
import { onFormReset } from "./internals"
import type { SolidElement } from "./solid-element.types"
import { cleanup, mount, nextTag, settle } from "./testing"

/** A `<x-select>`:  `options` (rich, property-only), `value`, `disabled`, `open`. */
type SelectElement = SolidElement & { options: string[]; value: string; disabled: boolean; open: boolean }

/** Define a select-like element as `tag`;  rendering the value `failOn` throws. */
function defineSelect(tag: string, failOn = "poison") {
  const onError = vi.fn()
  customElement(
    tag,
    {
      options: { type: Array, value: [] as string[], attribute: false },
      value: { type: String, value: "", reflect: true },
      disabled: { type: Boolean, reflect: true },
      open: { type: Boolean, reflect: true }
    },
    (props, { element }) => {
      // component-local state that must survive a move
      const [picks, setPicks] = createSignal(0)
      const selected = createMemo(() => {
        if (props.value === failOn) throw new Error(`cannot render ${failOn}`)
        return props.value
      })
      createEffect(
        () => ({ value: selected(), disabled: props.disabled, open: props.open }),
        ({ value, disabled, open }) => {
          element.internals!.setFormValue(value)
          element.internals!.states[disabled ? "add" : "delete"]("disabled")
          element.internals!.states[open ? "add" : "delete"]("open")
        }
      )
      onFormReset(() => (element.value = ""))
      return (
        <div>
          <button disabled={props.disabled} data-picks={String(picks())}>
            {selected() || "choose"}
          </button>
          <ul>
            <For each={props.options}>
              {(option) => (
                <li
                  onClick={() => {
                    setPicks((n) => n + 1)
                    element.value = option
                  }}
                >
                  {option}
                </li>
              )}
            </For>
          </ul>
        </div>
      )
    },
    {
      formAssociated: true,
      shadowRootInit: { mode: "open", delegatesFocus: true },
      keepAlive: true,
      onError,
      fallback: () => <select />
    }
  )
  return onError
}

describe("integration:  a form-associated select", () => {
  afterEach(cleanup)

  it("works end to end", async () => {
    const tag = nextTag("x-select")
    // parsed, and given rich data BEFORE its definition exists, as a framework would
    const container = mount(
      `<form><${tag} name="fruit"></${tag}><${tag} name="other"></${tag}></form><div id="elsewhere"></div>`
    )
    const form = container.querySelector("form")!
    const [element, sibling] = [...container.querySelectorAll(tag)] as SelectElement[]
    element.options = ["apple", "pear"]
    const onError = defineSelect(tag)

    // pre-upgrade property survived and rendered
    const items = () => [...element.shadowRoot!.querySelectorAll("li")]
    expect(element.options).toEqual(["apple", "pear"])
    expect(items().map((li) => li.textContent)).toEqual(["apple", "pear"])

    // delegatesFocus:  focusing the host focuses the inner button
    element.focus()
    expect(element.shadowRoot!.activeElement).toBe(element.shadowRoot!.querySelector("button"))

    // a user pick:  property + reflected attribute + form value
    items()[1]!.click()
    flush()
    expect(element.value).toBe("pear")
    expect(element.getAttribute("value")).toBe("pear")
    expect(new FormData(form).get("fruit")).toBe("pear")

    // boolean attribute round trip, with custom states
    element.setAttribute("disabled", "")
    flush()
    expect(element.disabled).toBe(true)
    expect(element.matches(":state(disabled)")).toBe(true)
    expect(element.shadowRoot!.querySelector("button")!.disabled).toBe(true)
    element.removeAttribute("disabled")
    flush()
    expect(element.disabled).toBe(false)
    expect(element.matches(":state(disabled)")).toBe(false)
    element.open = true
    flush()
    expect(element.getAttribute("open")).toBe("")
    expect(element.matches(":state(open)")).toBe(true)

    // move within the DOM (keepAlive):  component-local state survives
    const button = () => element.shadowRoot!.querySelector("button")!
    expect(button().dataset.picks).toBe("1")
    container.querySelector("#elsewhere")!.append(element)
    await settle()
    form.append(element)
    flush()
    expect(button().dataset.picks).toBe("1")
    expect(button().textContent).toBe("pear")

    // form reset reaches the component's hook
    form.reset()
    flush()
    expect(element.value).toBe("")
    expect(new FormData(form).get("fruit")).toBe("")

    // an error while rendering:  the fallback shows, the sibling keeps updating
    element.value = "poison"
    flush()
    expect(onError).toHaveBeenCalledOnce()
    expect(element.shadowRoot!.innerHTML).toBe("<select></select>")
    expect(element.matches(":state(errored)")).toBe(true)
    expect(element.isConnected).toBe(true)
    sibling.options = ["plum"]
    flush()
    sibling.shadowRoot!.querySelector("li")!.click()
    flush()
    expect(sibling.shadowRoot!.querySelector("button")!.textContent).toBe("plum")
    expect(new FormData(form).get("other")).toBe("plum")
  })
})
