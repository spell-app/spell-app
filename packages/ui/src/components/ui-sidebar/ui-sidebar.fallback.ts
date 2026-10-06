import { E, UIT } from "$/ui/core"
import { sidebarVocabulary } from "./ui-sidebar.vocabulary.en"
import { pushableVocabulary } from "./ui-pushable.vocabulary.en"
import { pusherVocabulary } from "./ui-pusher.vocabulary.en"

/****************
 * ### `SidebarFallback`
 * The sidebar family without Solid, keyed by the host's tag -- one class for the three, as they share
 * `ui-sidebar.css`:
 * - `<ui-pushable>` / `<ui-pusher>`:  `<div class="pushable | pusher" part="...">` around the slot
 * - `<ui-sidebar>`:  `<aside class="ui ... sidebar [visible]" part="sidebar" aria-label>` around the slot, following
 *   the host's `visible` (a `MutationObserver`:  the class grammar reads it) -- it slides over the page like an
 *   `overlay` sidebar
 ****************/
export class SidebarFallback extends E.NativeFallback<FallbackVocabulary> {
  @E.proto static vocabularies = [sidebarVocabulary, pushableVocabulary, pusherVocabulary]
  @E.proto static degraded = [
    "the pusher never moves, dims or goes `inert`;  every sidebar overlays it (no `transition` default by side)",
    "modality:  no focus move, trap, Escape, outside click or focus restore;  `ui-open` / `ui-close` / `ui-show` / " +
      "`ui-hide`, invoker commands;  the translated `sidebar` name (English only)"
  ]

  /** The panel, for a sidebar. */
  private panel?: HTMLElement

  /** Watches a sidebar host's `visible`. */
  private observer?: MutationObserver

  protected override build() {
    const { noun } = this.vocabulary
    if (this.vocabulary !== sidebarVocabulary) {
      return [this.decorate(this.create("div", { class: noun }, this.slot()), noun)]
    }
    const label = this.host.getAttribute(UIT.ARIA_LABEL) ?? sidebarVocabulary.texts[0].text
    this.panel = this.decorate(this.create("aside", { class: this.classes(), "aria-label": label }, this.slot()), noun)
    return [this.panel]
  }

  protected override attached() {
    if (!this.panel) return
    const panel = this.panel
    this.observer = new MutationObserver(() => (panel.className = this.classes()))
    this.observer.observe(this.host, { attributeFilter: [UIT.VISIBLE] })
  }

  /** The class grammar, plus a word width after the noun, as the element adds it (`UIT.WordWidthClasses`). */
  protected override classes(extra?: string): string {
    const word = UIT.WordWidthClasses.classFor(this.host.getAttribute(WIDTH))
    return super.classes([word, extra].filter(Boolean).join(" ") || undefined)
  }

  override dispose() {
    this.observer?.disconnect()
    super.dispose()
  }
}

/** Any of the family's vocabularies:  the fallback serves all three tags. */
type FallbackVocabulary = typeof sidebarVocabulary | typeof pushableVocabulary | typeof pusherVocabulary

/** The attribute with word values (`thin`, `very wide`). */
const WIDTH = "width"
