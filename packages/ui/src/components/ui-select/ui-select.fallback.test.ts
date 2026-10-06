import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"
import type { SelectChangeDetail } from "$/ui/components/components.types"

import { SelectFallback } from "./ui-select.fallback"

FallbackStub.define(
  "x-fb-select",
  (host, root, internals) => SelectFallback.render({ host, root, error: new Error("boom"), internals }),
  true
)

/** The stub's `value` / `options` properties, as `<ui-select>` has. */
type SelectStub = StubHost & { value?: string | string[]; options?: { value: string; text: string }[] }

/** `<form>` around a select made from `html`. */
function select(html: string) {
  const form = Fixture.render<HTMLFormElement>(`<form>${html}</form>`)
  const host = form.querySelector<SelectStub>("x-fb-select")!
  return { form, host, native: () => FallbackStub.shadow(host).querySelector("select")! }
}

/** Choose `values` in `native` as a user would, firing `change`. */
function choose(native: HTMLSelectElement, ...values: string[]) {
  for (const option of native.options) option.selected = values.includes(option.value)
  native.dispatchEvent(new Event("change", { bubbles: true }))
}

describe("SelectFallback", () => {
  it("renders a native select with the class grammar and part", async () => {
    const { host, native } = select(
      `<x-fb-select size="small" fluid name="pick" placeholder="Pick one"><ui-item value="a">A</ui-item></x-fb-select>`
    )
    expect(native().className).toBe("ui small fluid select")
    expect(native().getAttribute("part")).toBe("select")
    expect(native().getAttribute("aria-label")).toBe("Pick one")
    expect(native().querySelector("button")).toBeNull()
    expect(host.matches(":state(errored)")).toBe(true)
    await expectAccessible(host)
  })

  it("builds options from <ui-item>s:  groups, dividers, flags and descriptions as text", () => {
    const { native } = select(`<x-fb-select placeholder="Pick">
      <ui-item type="header">Fruit</ui-item>
      <ui-item value="a" description="red">Apple</ui-item>
      <ui-item type="divider"></ui-item>
      <ui-item value="fr" flag="fr">France</ui-item>
      <ui-item value="b" disabled>Banana</ui-item>
    </x-fb-select>`)
    const group = native().querySelector("optgroup")!
    expect(group.label).toBe("Fruit")
    expect(group.querySelector("option")!.text).toBe("Apple red")
    expect(native().querySelector(":scope > hr")).not.toBeNull()
    expect([...native().querySelectorAll(":scope > option")].map((option) => option.textContent)).toEqual([
      "Pick",
      "🇫🇷France",
      "Banana"
    ])
    expect(native().querySelector<HTMLOptionElement>("option[value=b]")!.disabled).toBe(true)
  })

  it("builds options from the `options` property and starts on `value`", () => {
    const { host, native } = select(`<x-fb-select name="n" placeholder="Pick" value="y"></x-fb-select>`)
    host.options = [
      { value: "x", text: "Ex" },
      { value: "y", text: "Why" }
    ]
    host.render()
    expect([...native().options].map((option) => option.text)).toEqual(["Pick", "Ex", "Why"])
    expect(native().value).toBe("y")
  })

  it("starts on a `selected` item", () => {
    const { form, native } = select(
      `<x-fb-select name="n" aria-label="x"><ui-item>A</ui-item><ui-item selected>B</ui-item></x-fb-select>`
    )
    expect(native().value).toBe("B")
    expect(new FormData(form).get("n")).toBe("B")
  })

  it("follows a change into the form, host.value and ui-change", () => {
    const { form, host, native } = select(
      `<x-fb-select name="fruit" placeholder="Fruit"><ui-item value="a">A</ui-item><ui-item value="b">B</ui-item></x-fb-select>`
    )
    const changes: SelectChangeDetail[] = []
    host.addEventListener("ui-change", (event) => changes.push((event as CustomEvent<SelectChangeDetail>).detail))
    expect(new FormData(form).has("fruit")).toBe(false)
    choose(native(), "b")
    expect(new FormData(form).get("fruit")).toBe("b")
    expect(host.value).toBe("b")
    expect(changes.map((change) => change.value)).toEqual(["b"])
  })

  it("submits one entry per value with `multiple`, with no placeholder", () => {
    const { form, native } = select(`<x-fb-select multiple name="skills" aria-label="Skills" value="a,c">
      <ui-item value="a">A</ui-item><ui-item value="b">B</ui-item><ui-item value="c">C</ui-item>
    </x-fb-select>`)
    expect(native().multiple).toBe(true)
    expect(native().querySelector("option.placeholder")).toBeNull()
    expect(new FormData(form).getAll("skills")).toEqual(["a", "c"])
    choose(native(), "b")
    expect(new FormData(form).getAll("skills")).toEqual(["b"])
  })

  it("is invalid while `required` and empty;  its placeholder can't be chosen", () => {
    const { host, native } = select(
      `<x-fb-select name="size" required placeholder="Size"><ui-item value="s">S</ui-item></x-fb-select>`
    )
    expect(host.internals.validity.valueMissing).toBe(true)
    expect(native().options[0]!.disabled).toBe(true)
    choose(native(), "s")
    expect(host.internals.validity.valid).toBe(true)
  })
})
