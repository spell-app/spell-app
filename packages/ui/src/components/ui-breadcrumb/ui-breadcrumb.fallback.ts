import { E, UIT } from "$/ui/core"
import { BreadcrumbDivider } from "./BreadcrumbDivider"
import { DIVIDER } from "./ui-breadcrumb.types"
import { breadcrumbSectionVocabulary } from "./ui-breadcrumb-section.vocabulary.en"
import { breadcrumbVocabulary } from "./ui-breadcrumb.vocabulary.en"

/****************
 * ### `BreadcrumbFallback`
 * The element's markup, keyed by the host's tag:
 * - `<ui-breadcrumb>`:  `<nav part="breadcrumb" class="ui ... breadcrumb" aria-label><ol part="list"><slot>`,
 *   with the text `divider` token inline
 * - `<ui-breadcrumb-section>`:  the empty `aria-hidden` divider, then `<a class="section" href>`,
 *   `<span class="active section" aria-current="page">` or `<span class="section">`;  `role=listitem` on the
 *   host (internals)
 ****************/
export class BreadcrumbFallback extends E.NativeFallback<
  typeof breadcrumbVocabulary | typeof breadcrumbSectionVocabulary
> {
  @E.proto static vocabularies = [breadcrumbVocabulary, breadcrumbSectionVocabulary]
  @E.proto static degraded = ["`divider-icon` (the text divider shows instead)", "translated `label` (English only)"]

  protected override build() {
    return this.vocabulary === breadcrumbVocabulary ? [this.breadcrumb()] : this.section()
  }

  /** The `<nav>` landmark around the list. */
  private breadcrumb(): HTMLElement {
    const label = breadcrumbVocabulary.texts.find(({ key }) => key === "label")!.text
    const nav = this.create(
      "nav",
      { class: this.classes(), [UIT.ARIA_LABEL]: label },
      this.create("ol", { part: LIST_PART }, this.slot())
    )
    // only when set, as the element does:  a page theming the token on a wrapper keeps it
    const divider = this.attr("divider")
    if (divider !== null) {
      nav.style.setProperty(UIT.BREADCRUMB_DIVIDER_TOKENS.text, BreadcrumbDivider.cssString(divider))
    }
    return this.decorate(nav, "breadcrumb")
  }

  /** The section's divider and its link / text. */
  private section(): Node[] {
    if (this.internals) this.internals.role = UIT.LISTITEM
    const divider = this.create("span", { class: DIVIDER, part: DIVIDER, "aria-hidden": UIT.TRUE })
    const isActive = this.flag("active")
    const href = this.attr("href")
    const section =
      isActive || href === null
        ? this.create("span", { class: this.classes(), "aria-current": isActive ? UIT.PAGE : undefined }, this.slot())
        : this.create("a", { class: this.classes(), href, target: this.attr("target") }, this.slot())
    return [divider, this.decorate(section, "section")]
  }
}

/** Part of the `<ol>` the sections are items of. */
const LIST_PART: E.PartNameOf<typeof breadcrumbVocabulary> = "list"
