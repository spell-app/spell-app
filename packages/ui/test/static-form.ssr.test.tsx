/// <reference types="node" />

import { parseHTML } from "linkedom"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { StaticRender } from "$/ui/static"
import { UIButton } from "$/ui/components/ui-button/UIButton"
import { UICalendar } from "$/ui/components/ui-calendar/UICalendar"
import { UICheckbox } from "$/ui/components/ui-checkbox/UICheckbox"
import { UIRadio } from "$/ui/components/ui-checkbox/UIRadio"
import { UIDropdown } from "$/ui/components/ui-dropdown/UIDropdown"
import { UIInput } from "$/ui/components/ui-input/UIInput"
import { UITextarea } from "$/ui/components/ui-input/UITextarea"
import { UIItem } from "$/ui/components/ui-item/UIItem"
import { UIRating } from "$/ui/components/ui-rating/UIRating"
import { UISearch } from "$/ui/components/ui-search/UISearch"
import { UISelect } from "$/ui/components/ui-select/UISelect"
import { UISlider } from "$/ui/components/ui-slider/UISlider"
import { EMPTY_FORM_ENTRIES, EMPTY_FORM_HTML, STATIC_FORM_ENTRIES, STATIC_FORM_HTML } from "$/ui/test/static-form.cases"

/**
 * A static form's round trip (seo plan, P4):  `STATIC_FORM_HTML` rendered by `StaticRender.page()`, then the entry
 * list a browser would submit from that plain HTML, with no script -- computed here from the HTML spec's
 * "constructing the entry list" -- must equal what the LIVE elements submit (`static-form.test.ts`, the same
 * `STATIC_FORM_ENTRIES`).
 */
describe("static form round trip", () => {
  let document: Document

  beforeAll(async () => {
    StaticRender.define(
      UIInput,
      UITextarea,
      UICheckbox,
      UIRadio,
      UISelect,
      UIDropdown,
      UIItem,
      UISearch,
      UISlider,
      UIRating,
      UICalendar,
      UIButton
    )
    const page = `<!doctype html><html><head></head><body>${STATIC_FORM_HTML}</body></html>`
    await StaticRender.prepare(page)
    document = parseHTML(StaticRender.page(page)).document
  })

  it("leaves no ui-* element and one form", () => {
    const html = document.documentElement.outerHTML
    expect(html).not.toMatch(/<ui-/)
    expect(document.querySelectorAll("form")).toHaveLength(1)
  })

  it("submits, with its Save button, what the live elements submit", () => {
    const form = document.querySelector("form")!
    const submitter = form.querySelector(`button[type="submit"]`)
    expect(submitter).not.toBeNull()
    expect(StaticFormData.entries(form, submitter)).toEqual(STATIC_FORM_ENTRIES)
  })

  it("submits each control's default when nothing has a value, as the live elements do", () => {
    const page = `<!doctype html><html><head></head><body>${EMPTY_FORM_HTML}</body></html>`
    const form = parseHTML(StaticRender.page(page)).document.querySelector("form")!
    expect(StaticFormData.entries(form, form.querySelector(`button[type="submit"]`))).toEqual(EMPTY_FORM_ENTRIES)
  })

  it("leaves no flattener mark on the native controls", () => {
    expect(document.querySelectorAll("[data-ui-control]")).toHaveLength(0)
  })
})

/****************
 * ### `StaticFormData`
 * The HTML spec's "constructing the entry list" for a form in a static page:  what a browser without scripts
 * submits.  Enough of it for these controls:  no files, `dirname`, `<object>` or image buttons.
 ****************/
class StaticFormData {
  /** `form`'s entries, submitted by `submitter`, in tree order. */
  static entries(form: Element, submitter: Element | null): [string, string][] {
    const entries: [string, string][] = []
    const id = form.getAttribute("id")
    for (const field of form.ownerDocument.querySelectorAll("button, input, select, textarea")) {
      if (StaticFormData.owner(field) !== form && !(id && field.getAttribute("form") === id)) continue
      if (StaticFormData.disabled(field)) continue
      const name = field.getAttribute("name")
      if (!name) continue
      const type = (field.getAttribute("type") ?? "").toLowerCase()
      switch (field.localName) {
        case "button":
          if (field === submitter) entries.push([name, field.getAttribute("value") ?? ""])
          break
        case "select":
          for (const option of StaticFormData.selected(field)) entries.push([name, StaticFormData.optionValue(option)])
          break
        case "textarea":
          entries.push([name, (field.textContent ?? "").replace(/\r\n?/g, "\n")])
          break
        default:
          if (["submit", "reset", "button", "image"].includes(type)) {
            if (field === submitter) entries.push([name, field.getAttribute("value") ?? ""])
          } else if (type === "checkbox" || type === "radio") {
            if (field.hasAttribute("checked")) entries.push([name, field.getAttribute("value") ?? "on"])
          } else if (type !== "file") entries.push([name, field.getAttribute("value") ?? ""])
      }
    }
    return entries
  }

  /** The nearest `<form>` around `field`. */
  private static owner(field: Element): Element | null {
    return field.closest("form")
  }

  /** Disabled:  its own `disabled`, or inside a disabled `<fieldset>` (outside its first `<legend>`). */
  private static disabled(field: Element): boolean {
    if (field.hasAttribute("disabled")) return true
    for (let parent = field.parentElement; parent; parent = parent.parentElement) {
      if (parent.localName !== "fieldset" || !parent.hasAttribute("disabled")) continue
      const legend = [...parent.children].find((child) => child.localName === "legend")
      if (!legend?.contains(field)) return true
    }
    return false
  }

  /**
   * `select`'s selected, enabled options:  `selected` ones, else (single, display size 1) the first enabled one --
   * the "selectedness setting algorithm".
   */
  private static selected(select: Element): Element[] {
    const options = [...select.querySelectorAll("option")]
    const chosen = options.filter((option) => option.hasAttribute("selected"))
    const multiple = select.hasAttribute("multiple")
    const size = Number(select.getAttribute("size") ?? (multiple ? 4 : 1))
    const picked =
      chosen.length || multiple || size > 1 ? chosen : options.filter((o) => !StaticFormData.disabled(o)).slice(0, 1)
    return (multiple ? picked : picked.slice(-1)).filter((option) => !StaticFormData.disabled(option))
  }

  /** An `<option>`'s value:  `value`, else its text, whitespace collapsed. */
  private static optionValue(option: Element): string {
    return option.getAttribute("value") ?? (option.textContent ?? "").replace(/\s+/g, " ").trim()
  }
}
