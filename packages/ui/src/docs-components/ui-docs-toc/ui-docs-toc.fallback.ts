import { NativeFallback, proto } from "$/ui/core"

import { docsTocVocabulary } from "./ui-docs-toc.vocabulary.en"
import { TocIndex } from "./TocIndex"

/****************
 * ### `DocsTocFallback`
 * `<div part="toc" class="ui ... toc">`:  a `<p part="header">` and a `<nav part="menu" aria-label>` list of plain links,
 * one per section and entry, from ONE scan of the followed content (`TocIndex`).
 * - Native elements only:  no widgets, no following (nothing is marked current), no rescans.
 ****************/
export class DocsTocFallback extends NativeFallback<typeof docsTocVocabulary> {
  @proto static vocabulary = docsTocVocabulary
  @proto static degraded = [
    "plain links, no `<ui-menu>`",
    "doesn't follow the scroll or the tabs:  every section listed with its entries, as at load"
  ]

  protected override build() {
    const document = this.host.ownerDocument
    const followed = TocIndex.followed(document, this.attr("for") ?? undefined)
    const root = followed?.tabs ? TocIndex.shownPane(followed.tabs) : followed?.root
    const links: Node[] = []
    for (const section of root ? TocIndex.scan(root) : []) {
      links.push(this.link(section.id, section.text, "section"))
      for (const entry of section.entries) links.push(this.link(entry.id, entry.text, "entry"))
    }
    const label = docsTocVocabulary.texts[0].text
    const children: Node[] = []
    const header = this.attr("header")
    if (header) children.push(this.decorate(this.create("p", {}, header), "header"))
    children.push(this.decorate(this.create("nav", { "aria-label": label }, this.create("ul", {}, ...links)), "menu"))
    return [this.decorate(this.create("div", { class: this.classes() }, ...children), "toc")]
  }

  /** A list item holding a link to `#id`. */
  private link(id: string, text: string, part: "section" | "entry"): HTMLElement {
    return this.create("li", {}, this.decorate(this.create("a", { href: `#${id}` }, text), part))
  }
}
