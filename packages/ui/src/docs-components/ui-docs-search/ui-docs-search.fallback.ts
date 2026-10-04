import { NativeFallback, proto } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"

import { docsSearchVocabulary } from "./ui-docs-search.vocabulary.en"
import type { DocsSearchText } from "./ui-docs-search.types"

/****************
 * ### `DocsSearchFallback`
 * The field without its card:  `<div class="ui finder" part="search">` around `<div class="field" part="field">`
 * holding a native `<input type="search" part="input" list>` and its `<datalist>` of every component (once
 * `SiteData` has loaded;  if it fails, the list stays empty).  The element's sheet draws the pill.
 * - Picking a component's name from the browser's suggestions loads its page;  typing still fires `ui-input`
 *   (`{ value }`), so `<ui-docs-nav>` still filters its list.
 ****************/
export class DocsSearchFallback extends NativeFallback<typeof docsSearchVocabulary> {
  @proto static vocabulary = docsSearchVocabulary
  @proto static degraded = [
    "the browser's own suggestions:  components by name only, no sections, pages or attributes",
    "no results card, no ranking, no marked matches",
    "no `/` or Cmd / Ctrl+K shortcut",
    "English texts only"
  ]

  /** Id of the datalist, in the shadow root. */
  static readonly LIST = "docs-search-list"

  /** The suggestions, filled once the data arrives. */
  private readonly list = this.create("datalist", { id: DocsSearchFallback.LIST })

  /** Component name => its page, from the data. */
  private readonly pages = new Map<string, string>()

  /** The field. */
  private readonly input = this.create("input", {
    type: "search",
    list: DocsSearchFallback.LIST,
    "aria-label": this.text("label"),
    placeholder: this.attr("placeholder") ?? this.text("placeholder"),
    autocomplete: "off"
  })

  protected override build() {
    const field = this.decorate(this.create("div", { class: "field" }, this.input), "field")
    this.input.setAttribute("part", "input")
    return [this.decorate(this.create("div", { class: this.classes() }, field, this.list), "search")]
  }

  protected override attached() {
    this.listen(this.input, "input", (event) => this.typed(event))
    this.listen(this.input, "change", () => this.picked())
    void SiteData.load().then(
      (data) => {
        for (const tag of data.components) this.pages.set(tag.name, tag.href ?? `components/${tag.mainTag}.html`)
        this.list.replaceChildren(
          ...data.components.map((tag) => this.create("option", { value: tag.name, label: `<${tag.tag}>` }))
        )
      },
      () => undefined
    )
  }

  /** A keystroke:  `ui-input`, as the element fires it. */
  private typed(event: Event) {
    const detail = { value: this.input.value, originalEvent: event }
    this.host.dispatchEvent(new CustomEvent("ui-input", { detail, bubbles: true, composed: true }))
  }

  /** The text is a component's name (a suggestion picked):  load its page. */
  private picked() {
    const path = this.pages.get(this.input.value.trim())
    if (!path) return
    let base = this.attr("base")
    if (base === null) {
      try {
        base = SiteData.root()
      } catch {
        base = ""
      }
    }
    location.assign(new URL(base + path, location.href).href)
  }

  /** The vocabulary's English text for `key`. */
  private text(key: DocsSearchText): string {
    return docsSearchVocabulary.texts.find((text) => text.key === key)?.text ?? key
  }
}
