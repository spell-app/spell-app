import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"
import type { DropdownChangeDetail } from "$/ui/components/components.types"

import { DropdownFallback } from "./ui-dropdown.fallback"

FallbackStub.define(
  "x-fb-dropdown",
  (host, root, internals) => DropdownFallback.render({ host, root, error: new Error("boom"), internals }),
  true
)

/** The stub's `value` / `options` properties, as `<ui-dropdown>` has. */
type DropdownStub = StubHost & { value?: string | string[]; options?: { value: string; text: string }[] }

/** `<form>` around a dropdown made from `html`. */
function dropdown(html: string) {
  const form = Fixture.render<HTMLFormElement>(`<form>${html}</form>`)
  const host = form.querySelector<DropdownStub>("x-fb-dropdown")!
  return { form, host, select: () => FallbackStub.shadow(host).querySelector("select")! }
}

/** Choose `values` in `select` as a user would, firing `change`. */
function choose(select: HTMLSelectElement, ...values: string[]) {
  for (const option of select.options) option.selected = values.includes(option.value)
  select.dispatchEvent(new Event("change", { bubbles: true }))
}

describe("DropdownFallback", () => {
  it("renders a native select with the class grammar and parts", async () => {
    const { host, select } = dropdown(
      `<x-fb-dropdown selection fluid name="pick" placeholder="Pick one"><ui-item value="a">A</ui-item></x-fb-dropdown>`
    )
    expect(select().className).toBe("ui fluid selection dropdown")
    expect(select().getAttribute("part")).toBe("trigger select")
    expect(select().getAttribute("aria-label")).toBe("Pick one")
    expect(select().multiple).toBe(false)
    expect(host.matches(":state(errored)")).toBe(true)
    await expectAccessible(host)
  })

  it("keeps an explicit aria-label", () => {
    const { select } = dropdown(`<x-fb-dropdown aria-label="Colour" placeholder="Pick"></x-fb-dropdown>`)
    expect(select().getAttribute("aria-label")).toBe("Colour")
  })

  it("builds options from <ui-item>s, with groups and dividers", () => {
    const { select } = dropdown(`<x-fb-dropdown placeholder="Pick" aria-label="x">
      <ui-item type="header" text="Fruit"></ui-item>
      <ui-item value="a" text="Apple"></ui-item>
      <ui-item type="divider"></ui-item>
      <ui-item value="b" disabled>Banana</ui-item>
      <ui-item>Plain</ui-item>
    </x-fb-dropdown>`)
    const group = select().querySelector("optgroup")!
    expect(group.label).toBe("Fruit")
    expect([...group.children].map((option) => (option as HTMLOptionElement).value)).toEqual(["a", "b", "Plain"])
    expect((group.children[1] as HTMLOptionElement).disabled).toBe(true)
    expect(group.children[1].textContent).toBe("Banana")
    expect(select().querySelectorAll("option").length).toBe(4)
  })

  it("builds options from the `options` property", () => {
    const { host, select } = dropdown(`<x-fb-dropdown name="n" placeholder="Pick" value="y"></x-fb-dropdown>`)
    host.options = [
      { value: "x", text: "Ex" },
      { value: "y", text: "Why" }
    ]
    host.render()
    expect([...select().options].map((option) => option.textContent)).toEqual(["Ex", "Why"])
    expect(select().value).toBe("y")
  })

  it("shows the placeholder option until a value is chosen", () => {
    const { select } = dropdown(`<x-fb-dropdown placeholder="Pick one"><ui-item value="a">A</ui-item></x-fb-dropdown>`)
    expect(select().options[0].value).toBe("")
    expect(select().options[0].textContent).toBe("Pick one")
    expect(select().value).toBe("")
  })

  it("has no placeholder option when a value is set, and prefers the `value` property", () => {
    const { host, select } = dropdown(
      `<x-fb-dropdown value="a" aria-label="x"><ui-item value="a">A</ui-item><ui-item value="b">B</ui-item></x-fb-dropdown>`
    )
    expect(select().options.length).toBe(2)
    expect(select().value).toBe("a")
    host.value = "b"
    host.render()
    expect(select().value).toBe("b")
  })

  it("submits its initial value without any change", () => {
    const { form } = dropdown(
      `<x-fb-dropdown name="pick" value="b" aria-label="x"><ui-item value="a">A</ui-item><ui-item value="b">B</ui-item></x-fb-dropdown>`
    )
    expect(new FormData(form).get("pick")).toBe("b")
  })

  it("changes the form value, host value, and fires ui-change", () => {
    const { form, host, select } = dropdown(
      `<x-fb-dropdown name="pick" aria-label="x"><ui-item value="a">A</ui-item><ui-item value="b">B</ui-item></x-fb-dropdown>`
    )
    const details: CustomEvent<DropdownChangeDetail>[] = []
    form.addEventListener("ui-change", (event) => details.push(event as CustomEvent<DropdownChangeDetail>))
    choose(select(), "b")
    expect(new FormData(form).get("pick")).toBe("b")
    expect(host.value).toBe("b")
    expect(details.length).toBe(1)
    expect(details[0].detail.value).toBe("b")
    expect(details[0].detail.originalEvent?.type).toBe("change")
    expect(details[0].composed).toBe(true)
  })

  it("supports multiple selection", () => {
    const { form, host, select } = dropdown(
      `<x-fb-dropdown multiple name="tags" value="a, c" aria-label="x">
        <ui-item value="a">A</ui-item><ui-item value="b">B</ui-item><ui-item value="c">C</ui-item>
      </x-fb-dropdown>`
    )
    expect(select().multiple).toBe(true)
    expect(select().className).toBe("ui multiple dropdown")
    expect(new FormData(form).getAll("tags")).toEqual(["a", "c"])
    choose(select(), "b", "c")
    expect(new FormData(form).getAll("tags")).toEqual(["b", "c"])
    expect(host.value).toEqual(["b", "c"])
  })

  it("respects disabled and required", () => {
    const { form, select } = dropdown(
      `<x-fb-dropdown name="pick" required aria-label="x"><ui-item value="a">A</ui-item></x-fb-dropdown>`
    )
    expect(select().required).toBe(true)
    expect(form.checkValidity()).toBe(false)
    choose(select(), "a")
    expect(form.checkValidity()).toBe(true)
    const off = dropdown(`<x-fb-dropdown disabled="yes" aria-label="x"></x-fb-dropdown>`)
    expect(off.select().disabled).toBe(true)
    const on = dropdown(`<x-fb-dropdown disabled="no" aria-label="x"></x-fb-dropdown>`)
    expect(on.select().disabled).toBe(false)
  })
})
