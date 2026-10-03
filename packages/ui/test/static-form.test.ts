import { describe, expect, it } from "vitest"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { EMPTY_FORM_ENTRIES, EMPTY_FORM_HTML, STATIC_FORM_ENTRIES, STATIC_FORM_HTML } from "$/ui/test/static-form.cases"

import "$/ui/components/ui-button"
import "$/ui/components/ui-calendar"
import "$/ui/components/ui-checkbox"
import "$/ui/components/ui-dropdown"
import "$/ui/components/ui-input"
import "$/ui/components/ui-item"
import "$/ui/components/ui-rating"
import "$/ui/components/ui-search"
import "$/ui/components/ui-select"
import "$/ui/components/ui-slider"

/**
 * A static form's round trip, the LIVE half (seo plan, P4):  `STATIC_FORM_HTML` as elements, submitted with its Save
 * button, sends `STATIC_FORM_ENTRIES` -- which `static-form.ssr.test.tsx` checks the static render sends too.
 */
describe("static form round trip (live elements)", () => {
  it("submits, with its Save button, the entries the static render submits", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(STATIC_FORM_HTML)
    let entries: [string, string][] | undefined
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      entries = entriesOf(form)
    })
    const save = form.querySelector("ui-button")!
    save.shadowRoot!.querySelector("button")!.click()
    expect(entries).toEqual(STATIC_FORM_ENTRIES)
  })

  it("submits each control's default when nothing has a value", async () => {
    const form = await ElementFixture.render<HTMLFormElement>(EMPTY_FORM_HTML)
    expect(entriesOf(form)).toEqual(EMPTY_FORM_ENTRIES)
  })
})

/** `form`'s `FormData` as `[name, value]` pairs;  a file by its name. */
function entriesOf(form: HTMLFormElement): [string, string][] {
  return [...new FormData(form)].map(([name, value]) => [name, typeof value === "string" ? value : value.name])
}
