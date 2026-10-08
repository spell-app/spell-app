import { E } from "$/ui/core"
// the family barrel, not the leaf:  the lib build then imports `ui-section.js` instead of splitting a shared chunk
// (SIDE EFFECT:  defines `<ui-section>` / `<ui-sections>`, which panels nest in and hold)
import { UISection } from "$/ui/components/ui-section"
import { FoldIconPlace, type SectionVocabulary } from "$/ui/components/ui-section/ui-section.types"
import { panelVocabulary } from "./ui-panel.vocabulary.en"
import { PanelFallback } from "./ui-panel.fallback"
import { PANEL, SUB_PANEL } from "./ui-panel.types"

import panelCSS from "./ui-panel.css?inline"

/****************
 * ### `<ui-panel>`
 * A property panel, as the brand's inspector (Color Set Chooser's left column):  a tinted box whose title is a
 * full-width HEADER BAND, holding fields;  a panel inside a panel is a SUB-HEAD BAND (small capitals) over its own
 * fields.  Every band can fold.
 * - A `<ui-section>` underneath (epic `design-system`, decision D9):  same attributes, slots, parts, events and
 *   folding (`collapsible`, `collapsed`, `ui-open` / `ui-close`, find-in-page), with its own vocabulary built on the
 *   section's (`ui-panel.vocabulary.en.ts`), so an attribute the section gains reaches the panel too (`source`, from
 *   epic `claude-design`).  Only the look differs:  `ui-panel.css`, after the section's sheet.
 * - Classes:  `ui ... section panel`, plus `sub` when its enclosing section is a panel too.
 * - The chevron sits at the far end of each band, after any actions:  the section's `fold-icon="end"` is the
 *   panel's default (`defaultFoldIcon`);  `info` puts the section's tip under a band.
 * - Tokens (`--ui-panel-*`, read through private aliases):  background, border colour, header and sub-head bands,
 *   radius, padding, gap, band space, shadow.  Defaults come from the panel's hue (`color`, else `primary`), with
 *   plain `--ui-*` fallbacks for every `spell-brand` role, so it needs no brand theme.
 * - `color`:  the section's own attribute, any hue, a theme's too (`spell-brand`'s `accent`);  the sheet paints the
 *   box, bands, border and text from the hue, and hands it to sub-panels without a `color` of their own.  No
 *   `color`:  `primary` (Owen, 2026-10-04).
 * - A folded LAST sub-panel closes the outer box:  its band reaches the bottom edge (`:host(:last-child)`).
 ****************/
export class UIPanel extends UISection {
  // the section's names under the panel's tag:  same shape, but TypeScript only knows the section's literals
  @E.proto static vocabulary = panelVocabulary as unknown as SectionVocabulary
  @E.proto static styleSheets = { ...UISection.styleSheets, panel: panelCSS }
  @E.proto static elementSetup = { Fallback: PanelFallback }
  // the band's chevron at its far end, after any actions (`fold-icon="start"` moves it back)
  @E.proto static defaultFoldIcon = FoldIconPlace.end

  /** `panel`, and `sub` inside another panel. */
  protected get extraClasses(): string | undefined {
    const sub = this.parent instanceof UIPanel ? SUB_PANEL : undefined
    return [super.extraClasses, PANEL, sub].filter(Boolean).join(" ")
  }
}
