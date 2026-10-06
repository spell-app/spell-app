import { E, UIT } from "$/ui/core"
import { VocabularyTexts } from "$/ui/docs-components/docs-components.types"
import { docsTocVocabulary } from "./ui-docs-toc.vocabulary.en"
import { TocIndex } from "./TocIndex"
import type { DocsTocVocabulary } from "./ui-docs-toc.types"

/****************
 * ### `DocsTocFallback`
 * `<div part="toc" class="ui ... toc">`:  a `<p part="header">` and a `<nav part="menu" aria-label>` list of plain links,
 * one per section and entry, from ONE scan of the followed content (`TocIndex`).
 * - Native elements only:  no widgets, no following (nothing is marked current), no rescans.
 ****************/
export class DocsTocFallback extends E.NativeFallback<typeof docsTocVocabulary> {
  @E.proto static vocabulary = docsTocVocabulary
  @E.proto static degraded = [
    "plain links, no `<ui-menu>`",
    "doesn't follow the scroll or the tabs:  every section listed with its entries, as at load"
  ]

  protected override build() {
    const document = this.host.ownerDocument
    const followed = TocIndex.followed(document, this.attr("for"))
    const root = followed?.tabs ? TocIndex.shownPane(followed.tabs) : followed?.root
    const links: Node[] = []
    for (const section of root ? TocIndex.scan(root) : []) {
      links.push(this.link(section.id, section.text, "section"))
      // nested sections' entries too, in page order
      for (const entry of TocIndex.flatten(section.entries)) links.push(this.link(entry.id, entry.text, "entry"))
    }
    const label = VocabularyTexts.english(docsTocVocabulary, "label")
    const children: Node[] = []
    const header = this.attr("header")
    if (header) children.push(this.decorate(this.create("p", {}, header), "header"))
    const list = this.create("ul", {}, ...links)
    children.push(this.decorate(this.create("nav", { [UIT.ARIA_LABEL]: label }, list), "menu"))
    return [this.decorate(this.create("div", { class: this.classes() }, ...children), "toc")]
  }

  /** A list item holding a link to `#id`, as part `part`. */
  private link(id: string, text: string, part: E.PartNameOf<DocsTocVocabulary>): HTMLElement {
    return this.create("li", {}, this.decorate(this.create("a", { href: `#${id}` }, text), part))
  }
}
