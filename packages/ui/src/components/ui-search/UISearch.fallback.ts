import { E, UIT } from "$/ui/core"
import { searchVocabulary } from "./UISearch.en"
import { INPUT, PROMPT, type Vocabulary } from "./UISearch.types"

/****************
 * ### `SearchFallback`
 * The native fallback of `<ui-search>`:  what it shows when its component breaks,
 * so the text is still typed in, validated and submitted with the form.
 *
 * - Its shadow DOM:  a plain text field in the class grammar,
 *   `div.ui.search` > `div.ui.icon.input` > `<input class="prompt">`,
 *   whose suggestions are a native `<datalist>` of the local `source` titles.
 * - The input is a native search field (`type="search"`):  typing narrows the browser's own suggestion list.
 * - Its text is the DOM element's form value (with `required` validity), and `domElement.value` follows it;
 *   the native `change` sends `ui-change`.
 * - `readonly`:  the input's own `readonly`, as the component's;  its text can't be changed.
 * - Its accessible name is the DOM element's `aria-label`, else `placeholder`.
 ****************/
export class SearchFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabulary = searchVocabulary
  @E.proto static degraded = [
    "remote results (`url`):  no suggestions",
    "result descriptions, images, prices and categories (titles only, as the browser's suggestions)",
    "Fomantic's matching (`full-text-search`, `search-fields`, `max-results`):  the browser's own",
    "`ui-search`, `ui-select`, `ui-results`, `ui-open`, `ui-close`;  following a result's `url`",
    "the magnifying glass and the loading spinner"
  ]

  /** The native input, once built, for `attached()`. */
  private input: HTMLInputElement | undefined

  protected override build() {
    const domElement = this.domElement as SearchDOMElement
    const listId = `${this.vocabulary.tag}${SUGGESTIONS_SUFFIX}`
    const placeholder = this.attr("placeholder")
    const input = this.create("input", {
      class: PROMPT,
      type: "search",
      placeholder,
      required: this.flag("required"),
      disabled: this.flag("disabled"),
      readonly: this.flag("readonly"),
      autocomplete: "off",
      list: listId
    })
    input.value = typeof domElement.value === "string" ? domElement.value : (this.attr("value") ?? "")
    this.decorate(input, "prompt")
    if (!input.hasAttribute("aria-label") && placeholder) input.setAttribute("aria-label", placeholder)

    const list = this.create("datalist", { id: listId })
    const titles = new Set<string>()
    for (const result of Array.isArray(domElement.source) ? domElement.source : []) {
      if (typeof result?.title === "string") titles.add(result.title)
    }
    for (const title of titles) list.append(this.create("option", { value: title }))

    const box = this.create("div", { class: INPUT, part: INPUT_PART }, input, list)
    const root = this.create("div", { class: this.classes() }, box)

    this.listen(input, "input", () => {
      domElement.value = input.value
      this.sync(input)
    })
    this.listen(input, "change", (event) => {
      domElement.dispatchEvent(
        new CustomEvent(CHANGE_EVENT, {
          bubbles: true,
          composed: true,
          detail: { value: input.value, originalEvent: event }
        })
      )
    })
    this.input = input
    return [root]
  }

  /** The first form value and validity, which need the input attached. */
  protected override attached() {
    this.sync(this.input!)
  }

  /** Copy the input's text (and validity) onto the DOM element. */
  private sync(input: HTMLInputElement) {
    const internals = this.formInternals
    if (!internals) return
    internals.setFormValue(this.attr("name") ? input.value : null)
    const isMissing = input.validity.valueMissing
    internals.setValidity(isMissing ? { valueMissing: true } : {}, input.validationMessage, input)
  }
}

/** What the fallback reads and writes of the DOM element:  all optional, the element may not have upgraded. */
type SearchDOMElement = HTMLElement & {
  /** the text, once set as a property */
  value?: string
  /** the `source` property, once set */
  source?: readonly UIT.SearchResult[]
}

/** The event the input's `change` becomes. */
const CHANGE_EVENT: E.EventName<Vocabulary> = "ui-change"

/** The part of the box around the input (the input itself is `prompt`, through `decorate()`). */
const INPUT_PART: E.PartName<Vocabulary> = "input"

/** The suffix of the `<datalist>` id, after the tag. */
const SUGGESTIONS_SUFFIX = "-suggestions"
