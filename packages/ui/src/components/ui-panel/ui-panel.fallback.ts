import { E } from "$/ui/core"
// by path:  the section family's barrel exports its elements only
import { SectionFallback } from "$/ui/components/ui-section/ui-section.fallback"
import { panelVocabulary } from "./ui-panel.vocabulary.en"
import { PANEL, SUB_PANEL } from "./ui-panel.types"

/****************
 * ### `PanelFallback`
 * `SectionFallback` with a panel's names:  the same plain-DOM section (title bar, fold button, find-in-page), in the
 * panel's class grammar (`ui violet section panel`, `sub` inside another `<ui-panel>`), so `ui-panel.css` still draws
 * the box and the bands.
 * - The chevron's default place is the controller's `defaultFoldIcon` (`end`), read by `SectionFallback`;  `start`
 *   when the controller's constructor itself threw.
 ****************/
export class PanelFallback extends SectionFallback {
  // same shape as the section's vocabulary (built on it);  TypeScript only knows the section's literals
  @E.proto static vocabulary = panelVocabulary as unknown as typeof SectionFallback.prototype.vocabulary

  /** The class grammar, then `panel`, and `sub` inside another panel, as the element adds them. */
  protected override classes(extra?: string): string {
    const sub = this.host.parentElement?.closest(this.host.localName) ? SUB_PANEL : undefined
    return super.classes([extra, PANEL, sub].filter(Boolean).join(" "))
  }
}
