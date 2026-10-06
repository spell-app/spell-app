import { E, UIT } from "$/ui/core"
import { tableVocabulary } from "./ui-table.vocabulary.en"
import { TableClassMirror } from "./TableClassMirror"
import { TableGrammar } from "./TableGrammar"
import { TABLE } from "./ui-table.types"

/****************
 * ### `TableFallback`
 * The element's shadow markup and its light-DOM class mirroring, from the host's attributes:
 * - `<div class="[scroller words] scroller" part="scroller"><slot></slot></div>`;  while `scrolling` /
 *   `overflowing`, a focusable region named by the host's `aria-label`, else the `<caption>`, else `Table`
 * - the class string mirrored onto the slotted `<table>` (`TableClassMirror`, author classes kept);  the page
 *   sheet `ui-table.css` is registered by the real element, or linked by the page (`ui.css` + family sheets)
 ****************/
export class TableFallback extends E.NativeFallback<typeof tableVocabulary> {
  @E.proto static vocabulary = tableVocabulary
  @E.proto static degraded = [
    "sorting:  `ui-sort`, `aria-sort`, focusable headers, `client-sort`",
    "data mode (`rows` / `columnDefs`):  nothing renders without a slotted `<table>`",
    "translated `label` (English only)",
    "later attribute changes (read once)"
  ]

  /** Mirrors the classes onto the slotted table. */
  private readonly mirror = new TableClassMirror()

  protected override build() {
    const value = (name: string) => this.value(name)
    const classes = TableGrammar.scroller(value)
    if (!TableGrammar.scrolls(value)) return [this.create("div", { class: classes, part: SCROLLER }, this.slot())]
    const region = this.create(
      "div",
      { class: classes, [UIT.TABINDEX]: "0", role: UIT.REGION, [UIT.ARIA_LABEL]: this.regionLabel() },
      this.slot()
    )
    return [this.decorate(region, SCROLLER)]
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
    for (const child of this.host.children) if (child.localName === TABLE) return child as HTMLTableElement
    return undefined
  }

  /** Name of the scrolling region:  the host's `aria-label`, else the `<caption>` text, else the English `label`. */
  private regionLabel(): string {
    const caption = this.table()?.caption?.textContent?.trim()
    return this.host.getAttribute(UIT.ARIA_LABEL) ?? (caption || LABEL)
  }

  /** Host attribute `name` converted as the element would:  booleans, `keyOrValueAndKey` values. */
  private value(name: string): unknown {
    // `getAttribute()`:  `null` when absent
    const text = this.host.getAttribute(name)
    const spec = tableVocabulary.attributes.find((attribute) => attribute.name === name)
    if (text === null || !spec) return undefined
    if (spec.kind === "keyOnly") return E.Converters.boolean(text, name)
    if (spec.kind === "keyOrValueAndKey") return E.Converters.keyOrValue(text, undefined)
    return text
  }
}

/** The fallback's one part, the scroller. */
const SCROLLER = "scroller"

/** The English `label` text, from the vocabulary:  a failed render can't count on the runtime's translations. */
const LABEL = tableVocabulary.texts.find(({ key }) => key === "label")!.text
