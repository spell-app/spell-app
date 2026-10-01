import { Converters, NativeFallback, proto } from "$/ui/core"

import { tableVocabulary } from "./table.vocabulary.en"
import { TableClassMirror } from "./TableClassMirror"
import { TableGrammar } from "./TableGrammar"

/****************
 * ### `TableFallback`
 * The element's shadow markup and its light-DOM class mirroring, from the host's attributes:
 * - `<div class="[scroller words] scroller" part="scroller"><slot></slot></div>`;  while `scrolling` /
 *   `overflowing`, a focusable region named by the host's `aria-label`, else the `<caption>`, else `Table`
 * - the class string mirrored onto the slotted `<table>` (`TableClassMirror`, author classes kept);  the page
 *   sheet `table.css` is registered by the real element, or linked by the page (`ui.css` + family sheets)
 ****************/
export class TableFallback extends NativeFallback<typeof tableVocabulary> {
  @proto static vocabulary = tableVocabulary
  @proto static degraded = [
    "sorting:  `ui-sort`, `aria-sort`, focusable headers, `client-sort`",
    "data mode (`rows` / `columnDefs`):  nothing renders without a slotted `<table>`",
    "translated `label` (English only)",
    "later attribute changes (read once)"
  ]

  /** Mirrors the classes onto the slotted table. */
  private readonly mirror = new TableClassMirror()

  protected override build() {
    const value = (name: string) => this.value(name)
    const scroller = this.create("div", { class: TableGrammar.scroller(value), part: SCROLLER }, this.slot())
    if (!TableGrammar.scrolls(value)) return [scroller]
    this.decorate(scroller, SCROLLER)
    const caption = this.table()?.caption?.textContent?.trim()
    const label = tableVocabulary.texts.find(({ key }) => key === "label")!.text
    scroller.setAttribute("tabindex", "0")
    scroller.setAttribute("role", "region")
    scroller.setAttribute("aria-label", this.host.getAttribute("aria-label") ?? (caption || label))
    return [scroller]
  }

  protected override attached() {
    this.mirror.apply(this.table(), this.classes())
  }

  override dispose() {
    super.dispose()
    this.mirror.detach()
  }

  /** The slotted `<table>`, if any. */
  private table(): HTMLTableElement | undefined {
    for (const child of this.host.children) if (child instanceof HTMLTableElement) return child
    return undefined
  }

  /** Host attribute `name` converted as the element would:  booleans, `keyOrValueAndKey` values. */
  private value(name: string): unknown {
    const text = this.host.getAttribute(name)
    const spec = tableVocabulary.attributes.find((attribute) => attribute.name === name)
    if (text == null || !spec) return undefined
    if (spec.kind === "keyOnly") return Converters.boolean(text, name)
    if (spec.kind === "keyOrValueAndKey") return Converters.keyOrValue(text, undefined)
    return text
  }
}

/** The fallback's one part. */
const SCROLLER = "scroller"
