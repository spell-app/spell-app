import { NativeFallback, proto } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"

import { docsNavVocabulary } from "./ui-docs-nav.vocabulary.en"
import { NavIndex } from "./NavIndex"
import { FOUNDATION_PAGES, TOP_PAGES, type DocsNavText, type NavPage } from "./ui-docs-nav.types"

/****************
 * ### `DocsNavFallback`
 * `<div class="ui nav" part="nav">` around `<nav part="menu" aria-label>`:  the top links, a "Components" `<h2>`
 * over every component A-Z, a "Foundation" `<h2>` over its links;  the current page `aria-current="page"`.
 * - Native links only:  no search, views, topics, favourites or badges.
 * - The component list fills in once `SiteData` has loaded (the same fetch the element made);  if it fails, the
 *   list stays empty.
 ****************/
export class DocsNavFallback extends NativeFallback<typeof docsNavVocabulary> {
  @proto static vocabulary = docsNavVocabulary
  @proto static degraded = [
    "plain links, no `<ui-menu>`",
    "every component A-Z only:  no search, no topics, no favourites, no status badges",
    "the current page isn't scrolled into view",
    "English texts only"
  ]

  /** The component list, filled once the data arrives. */
  private readonly components = this.create("ul", {})

  protected override build() {
    const nav = this.create(
      "nav",
      { "aria-label": this.text("navLabel") },
      this.list(TOP_PAGES),
      this.create("h2", {}, this.text("components")),
      this.components,
      this.create("h2", {}, this.text("foundation")),
      this.list(FOUNDATION_PAGES)
    )
    return [this.decorate(this.create("div", { class: this.classes() }, this.decorate(nav, "menu")), "nav")]
  }

  protected override attached() {
    void SiteData.load().then(
      (data) =>
        this.components.replaceChildren(
          ...new NavIndex(data).rows.map((row) => this.link(row.href, row.name, row.main && row.tag === this.current()))
        ),
      () => undefined
    )
  }

  /** A `<ul>` of `pages`' links. */
  private list(pages: readonly NavPage[]): HTMLUListElement {
    return this.create(
      "ul",
      {},
      ...pages.map((page) => this.link(page.file, this.text(page.text), page.id === this.current()))
    )
  }

  /** One `<li><a>`, `current` marked. */
  private link(path: string, text: string, current: boolean): HTMLLIElement {
    const href = (this.attr("base") ?? SiteData.root()) + path
    return this.create("li", {}, this.create("a", { href, "aria-current": current ? "page" : null }, text))
  }

  /** `current`, else the page's file name. */
  private current(): string {
    return this.attr("current") || NavIndex.page()
  }

  /** The vocabulary's English text for `key`. */
  private text(key: DocsNavText): string {
    return docsNavVocabulary.texts.find((text) => text.key === key)?.text ?? key
  }
}
