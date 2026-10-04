import { NativeFallback, proto } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"

import { docsNavVocabulary } from "./ui-docs-nav.vocabulary.en"
import { NavIndex } from "./NavIndex"
import { FOUNDATION_PAGES, TOP_PAGES, type DocsNavText, type NavPage } from "./ui-docs-nav.types"

/****************
 * ### `DocsNavFallback`
 * The panel without its widgets:  `<div class="ui nav" part="nav">` around `<nav part="menu" aria-label>` of three
 * groups, each an `<h2 class="heading band">` over a `<ul class="rows">` of `<li class="row"><a class="item">`:  Get
 * started, every component A-Z, Foundation;  the current page `aria-current="page"`.  The element's sheet draws them
 * as it draws the element's bands and rows.
 * - Native links only:  no header band, search, views, topics, favourites, folding or badges.
 * - The component list fills in once `SiteData` has loaded (the same fetch the element made);  if it fails, the
 *   list stays empty.
 ****************/
export class DocsNavFallback extends NativeFallback<typeof docsNavVocabulary> {
  @proto static vocabulary = docsNavVocabulary
  @proto static degraded = [
    "plain links in fixed groups:  no header band, no search, no folding",
    "every component A-Z only:  no topics, no favourites, no status badges",
    "the current page isn't scrolled into view",
    "English texts only"
  ]

  /** The component list, filled once the data arrives. */
  private readonly components = this.create("ul", { class: "rows" })

  protected override build() {
    const nav = this.create(
      "nav",
      { "aria-label": this.text("navLabel") },
      this.heading("getStarted"),
      this.list(TOP_PAGES),
      this.heading("components"),
      this.components,
      this.heading("foundation"),
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

  /** A group's `<h2>`, drawn as its band. */
  private heading(key: DocsNavText): HTMLHeadingElement {
    return this.create("h2", { class: "heading band" }, this.text(key))
  }

  /** A `<ul>` of `pages`' links. */
  private list(pages: readonly NavPage[]): HTMLUListElement {
    return this.create(
      "ul",
      { class: "rows" },
      ...pages.map((page) => this.link(page.file, this.text(page.text), page.id === this.current()))
    )
  }

  /** One `<li><a>`, `current` marked. */
  private link(path: string, text: string, current: boolean): HTMLLIElement {
    const href = (this.attr("base") ?? SiteData.root()) + path
    const link = this.create("a", { class: "item", href, "aria-current": current ? "page" : null }, text)
    return this.create("li", { class: "row" }, link)
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
