import { NativeFallback, proto } from "$/ui/core"

import { SIDEBAR_WORD_WIDTHS } from "./ui-sidebar.types"
import { sidebarVocabulary } from "./ui-sidebar.vocabulary.en"
import { VOCABULARIES, WIDTH } from "./ui-sidebar.types"
import type { SidebarFallbackVocabulary } from "./ui-sidebar.types"
import { ARIA_LABEL, VISIBLE } from "$/ui/components/components.types"

/****************
 * ### `SidebarFallback`
 * The sidebar family without Solid, keyed by the host's tag -- one class for the three, as they share
 * `ui-sidebar.css`:
 * - `<ui-pushable>` / `<ui-pusher>`:  `<div class="pushable | pusher" part="...">` around the slot
 * - `<ui-sidebar>`:  `<aside class="ui ... sidebar [visible]" part="sidebar" aria-label>` around the slot, following
 *   the host's `visible` (a `MutationObserver`:  the class grammar reads it) -- it slides over the page like an
 *   `overlay` sidebar
 ****************/
export class SidebarFallback extends NativeFallback<SidebarFallbackVocabulary> {
  @proto static vocabularies = VOCABULARIES
  @proto static degraded = [
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
    const label = this.host.getAttribute(ARIA_LABEL) ?? sidebarVocabulary.texts[0].text
    this.panel = this.decorate(this.create("aside", { class: this.classes(), "aria-label": label }, this.slot()), noun)
    return [this.panel]
  }

  protected override attached() {
    if (!this.panel) return
    const panel = this.panel
    this.observer = new MutationObserver(() => (panel.className = this.classes()))
    this.observer.observe(this.host, { attributeFilter: [VISIBLE] })
  }

  /** The class grammar, plus a word width after the noun, as the element adds it. */
  protected override classes(extra?: string): string {
    const width = this.host
      .getAttribute(WIDTH)
      ?.trim()
      .replace(/[\s-]+/g, " ")
    const word = SIDEBAR_WORD_WIDTHS.find((each) => each === width)
    return super.classes([word, extra].filter(Boolean).join(" ") || undefined)
  }

  override dispose() {
    this.observer?.disconnect()
    super.dispose()
  }
}
