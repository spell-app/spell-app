import { NativeFallback, proto } from "$/ui/core"

import { searchVocabulary } from "./ui-search.vocabulary.en"
import { CHANGE_EVENT, PROMPT, PARTS, INPUT } from "./ui-search.types"
import type { SearchHost } from "./ui-search.types"

/****************
 * ### `SearchFallback`
 * A plain text field in the class grammar:  `div.ui.search` > `div.ui.icon.input` > `<input class="prompt">`, whose
 * suggestions are a native `<datalist>` of the local `source` titles.
 * - The input is a native search field (`type="search"`):  typing narrows the browser's own suggestion list.
 * - Its text is the host's form value (and `required` validity);  `ui-change` fires on the native `change`, and
 *   `host.value` follows.
 * - Accessible name:  the host's `aria-label`, else `placeholder`.
 ****************/
export class SearchFallback extends NativeFallback<typeof searchVocabulary> {
  @proto static vocabulary = searchVocabulary
  @proto static degraded = [
    "remote results (`url`):  no suggestions",
    "result descriptions, images, prices and categories (titles only, as the browser's suggestions)",
    "Fomantic's matching (`full-text-search`, `search-fields`, `max-results`):  the browser's own",
    "`ui-search`, `ui-select`, `ui-results`, `ui-open`, `ui-close`;  following a result's `url`",
    "the magnifying glass and the loading spinner"
  ]

  /** Built input, for `attached()`. */
  private input: HTMLInputElement | undefined

  protected override build() {
    const host = this.host as SearchHost
    const listId = `${this.vocabulary.tag}-suggestions`
    const input = this.create("input", {
      class: PROMPT,
      type: "search",
      name: null,
      placeholder: this.attr("placeholder"),
      required: this.flag("required"),
      disabled: this.flag("disabled"),
      autocomplete: "off",
      list: listId
    })
    input.value = typeof host.value === "string" ? host.value : (this.attr("value") ?? "")
    this.decorate(input, PARTS.prompt)
    const placeholder = this.attr("placeholder")
    if (!input.hasAttribute("aria-label") && placeholder) input.setAttribute("aria-label", placeholder)

    const list = this.create("datalist", { id: listId })
    const titles = new Set<string>()
    for (const result of Array.isArray(host.source) ? host.source : []) {
      if (typeof result?.title === "string") titles.add(result.title)
    }
    for (const title of titles) list.append(this.create("option", { value: title }))

    const box = this.create("div", { class: INPUT, part: PARTS.input }, input, list)
    const root = this.create("div", { class: this.classes() }, box)

    this.listen(input, "input", () => {
      host.value = input.value
      this.sync(input)
    })
    this.listen(input, "change", (event) => {
      host.dispatchEvent(
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

  /** First form value + validity, which need the input attached. */
  protected override attached() {
    this.sync(this.input!)
  }

  /** Push the input's text into the form (and validity). */
  private sync(input: HTMLInputElement) {
    const internals = this.formInternals
    if (!internals) return
    internals.setFormValue(this.attr("name") ? input.value : null)
    const missing = input.validity.valueMissing
    internals.setValidity(missing ? { valueMissing: true } : {}, input.validationMessage, input)
  }
}
