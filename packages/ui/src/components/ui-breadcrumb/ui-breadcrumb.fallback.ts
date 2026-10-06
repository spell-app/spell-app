import { NativeFallback, proto, UIT } from "$/ui/core"

import { breadcrumbSectionVocabulary } from "./ui-breadcrumb-section.vocabulary.en"
import { breadcrumbVocabulary } from "./ui-breadcrumb.vocabulary.en"
import { BreadcrumbDivider } from "./BreadcrumbDivider"

/****************
 * ### `BreadcrumbFallback`
 * The element's markup, keyed by the host's tag:
 * - `<ui-breadcrumb>`:  `<nav part="breadcrumb" class="ui ... breadcrumb" aria-label><ol part="list"><slot>`,
 *   with the text `divider` token inline
 * - `<ui-breadcrumb-section>`:  the empty `aria-hidden` divider, then `<a class="section" href>`,
 *   `<span class="active section" aria-current="page">` or `<span class="section">`;  `role=listitem` on the
 *   host (internals)
 ****************/
export class BreadcrumbFallback extends NativeFallback {
  @proto static vocabularies = [breadcrumbVocabulary, breadcrumbSectionVocabulary]
  @proto static degraded = ["`divider-icon` (the text divider shows instead)", "translated `label` (English only)"]

  protected override build() {
    return this.vocabulary === breadcrumbVocabulary ? [this.breadcrumb()] : this.section()
  }

  /** The `<nav>` landmark around the list. */
  private breadcrumb(): HTMLElement {
    const label = breadcrumbVocabulary.texts.find(({ key }) => key === "label")!.text
    const nav = this.create(
      "nav",
      { class: this.classes(), "aria-label": label },
      this.create("ol", { part: "list" }, this.slot())
    )
    const divider = this.host.getAttribute("divider")
    const standard = this.vocabulary.attributes.find(({ name }) => name === "divider")?.default
    if (divider !== null && divider !== standard)
      nav.style.setProperty(UIT.BREADCRUMB_DIVIDER_TOKENS.text, BreadcrumbDivider.cssString(divider))
    return this.decorate(nav, "breadcrumb")
  }

  /** The section's divider and its link / text. */
  private section(): Node[] {
    if (this.internals) this.internals.role = "listitem"
    const divider = this.create("span", { class: "divider", part: "divider", "aria-hidden": "true" })
    const active = this.flag("active")
    const href = active ? null : this.host.getAttribute("href")
    const section =
      href === null
        ? this.create("span", { class: this.classes(), "aria-current": active ? "page" : null }, this.slot())
        : this.create("a", { class: this.classes(), href, target: this.host.getAttribute("target") }, this.slot())
    return [divider, this.decorate(section, "section")]
  }
}
