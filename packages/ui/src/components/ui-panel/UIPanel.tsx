import { E } from "$/ui/core"
// the family barrel, not the leaf:  the lib build then imports `ui-section.js` instead of splitting a shared chunk
// (SIDE EFFECT:  defines `<ui-section>` / `<ui-sections>`, which panels nest in and hold)
import { UISection } from "$/ui/components/ui-section"
import { FoldIconPlace, type SectionVocabulary } from "$/ui/components/ui-section/UISection.types"
import { panelVocabulary } from "./UIPanel.en"

import panelCSS from "./UIPanel.css?inline"

/****************
 * ### `UIPanel`
 * The component behind `<ui-panel>`:  a property panel, as in the brand's inspector
 * (the Color Set Chooser's left column).
 *
 * - A tinted box whose title is a full-width HEADER BAND, over its fields.
 *   A panel inside a panel is a SUB-HEAD BAND (small capitals) over its own fields.  Every band can fold.
 * - It IS a `<ui-section>` (it extends `UISection`):  the same attributes, slots, parts,
 *   events and folding (`collapsible`, `collapsed`, `ui-open` / `ui-close`, find-in-page, `source`).
 *   - Its vocabulary is built on the section's (`UIPanel.en.ts`),
 *     so an attribute the section gains reaches the panel too.
 *   - Only the look differs:  `UIPanel.css`, adopted after the section's sheet.
 * - Classes:  `ui … panel section`, plus `sub` (before the noun too) when the section around it is a panel.
 * - The chevron sits at the far end of each band, after any actions:
 *   the section's `fold-icon="end"` is the panel's default (`defaultFoldIcon`).
 *   `info` puts the section's tip under a band.
 * - `color`:  any hue, a theme's too (`spell-brand`'s `accent`).
 *   The sheet paints the box, bands, border and text from it,
 *   and hands it to the sub-panels that have no `color` of their own.  No `color`:  `primary`.
 * - Tokens (`--ui-panel-*`, read through private aliases):  background, border colour, header and sub-head bands,
 *   radius, padding, gap, band space, shadow.
 *   Their defaults come from the panel's hue, with a plain `--ui-*` value under every `spell-brand` role,
 *   so it needs no brand theme.
 * - A folded LAST sub-panel closes the outer box:  its band reaches the bottom edge (`:host(:last-child)`).
 ****************/
export class UIPanel extends UISection {
  // the section's names under the panel's tag:  same shape, but TypeScript only knows the section's literals
  @E.proto static vocabulary = panelVocabulary as unknown as SectionVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { ...UISection.prototype.elementSetup.styleSheets, panel: panelCSS }
  } satisfies Partial<E.ElementSetup>
  // the band's chevron at its far end, after any actions (`fold-icon="start"` moves it back)
  @E.proto static defaultFoldIcon = FoldIconPlace.end

  /** `panel`, and `sub` inside another panel. */
  protected get extraClass(): string | undefined {
    const sub = this.parent instanceof UIPanel ? SUB_PANEL : undefined
    return [super.extraClass, PANEL, sub].filter(Boolean).join(" ")
  }
}

/** Class word added before the section's noun:  `ui ... panel section`. */
const PANEL = "panel"

/** Class word of a panel inside a panel:  drawn as a sub-head band. */
const SUB_PANEL = "sub"
