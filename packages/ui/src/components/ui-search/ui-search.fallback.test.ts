import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"
import type { SearchChangeDetail, SearchResult } from "$/ui/components/components.types"

import { SearchFallback } from "./ui-search.fallback"

FallbackStub.define(
  "x-fb-search",
  (host, root, internals) => SearchFallback.render({ host, root, error: new Error("boom"), internals }),
  true
)

/** The stub's `value` / `source` properties, as `<ui-search>` has. */
type SearchStub = StubHost & { value?: string; source?: SearchResult[] }

/** `<form>` around a search made from `html`. */
function search(html: string) {
  const form = Fixture.render<HTMLFormElement>(`<form>${html}</form>`)
  const host = form.querySelector<SearchStub>("x-fb-search")!
  const shadow = FallbackStub.shadow(host)
  return { form, host, input: () => shadow.querySelector("input")!, list: () => shadow.querySelector("datalist")! }
}

/** Type `text` into `input` as a user would:  `input`, then `change`. */
function type(input: HTMLInputElement, text: string) {
  input.value = text
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

describe("SearchFallback", () => {
  it("renders the class grammar around a native search field", async () => {
    const { host, input: prompt } = search(`<x-fb-search fluid size="small" placeholder="Fruit"></x-fb-search>`)
    const input = prompt()
    const root = input.parentElement!.parentElement!
    expect(root.className).toBe("ui small fluid search")
    expect(input.parentElement!.className).toBe("ui icon input")
    expect(input.parentElement!.getAttribute("part")).toBe("input")
    expect(input.className).toBe("prompt")
    expect(input.type).toBe("search")
    expect(input.getAttribute("part")).toBe("prompt")
    expect(input.getAttribute("aria-label")).toBe("Fruit")
    expect(host.matches(":state(errored)")).toBe(true)
    await expectAccessible(host)
  })

  it("suggests the local source's titles through a <datalist>", () => {
    const { host, input, list } = search(`<x-fb-search aria-label="Fruit"></x-fb-search>`)
    host.source = [{ title: "Apple" }, { title: "Banana" }, { title: "Apple" }]
    host.render()
    expect(input().getAttribute("list")).toBe(list().id)
    expect([...list().options].map((option) => option.value)).toEqual(["Apple", "Banana"])
  })

  it("puts its text in the form, host.value and ui-change", () => {
    const { form, host, input } = search(`<x-fb-search name="q" value="start" aria-label="Q"></x-fb-search>`)
    const changes: SearchChangeDetail[] = []
    host.addEventListener("ui-change", (event) => changes.push((event as CustomEvent<SearchChangeDetail>).detail))
    expect(input().value).toBe("start")
    expect(new FormData(form).get("q")).toBe("start")
    type(input(), "banana")
    expect(new FormData(form).get("q")).toBe("banana")
    expect(host.value).toBe("banana")
    expect(changes.map((change) => change.value)).toEqual(["banana"])
  })

  it("is invalid while `required` and empty", () => {
    const { host, input } = search(`<x-fb-search name="q" required aria-label="Q"></x-fb-search>`)
    expect(host.internals.validity.valueMissing).toBe(true)
    type(input(), "x")
    expect(host.internals.validity.valid).toBe(true)
  })
})
