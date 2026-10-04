import { proto } from "$/ui/core"
import { UISection } from "$/ui"

import { BRAND_PANEL, SUB_PANEL } from "./ui-brand-panel.types"

import panelCSS from "./ui-brand-panel.css?inline"

/****************
 * ### `<ui-brand-panel>`
 * A property panel, as the brand's inspector (Color Set Chooser's left column):  a tinted box whose title is a
 * full-width HEADER BAND, holding fields;  a panel inside a panel is a SUB-HEAD BAND (small capitals) over its own
 * fields.  Every band can fold.
 * - A `<ui-section>` underneath (decision D9):  same attributes, slots, parts, events and folding (`collapsible`,
 *   `collapsed`, `ui-open` / `ui-close`, find-in-page), defined under its own tag with `<ui-section>`'s vocabulary
 *   (`define(tag)`).  Only the look differs:  `ui-brand-panel.css`, after the section's sheet.
 * - Classes:  `ui ... section brand panel`, plus `sub` when its enclosing section is a panel too.
 * - Tokens (`--ui-brand-panel-*`, read through private aliases):  background, border colour, header and sub-head
 *   bands, radius, padding, gap, shadow.  Defaults come from the panel's hue (`color`, else `primary`), with
 *   plain `--ui-*` fallbacks under any other theme.
 * - `color`:  the section's own attribute, any hue or the brand's `accent` (`src/hues.ts`);  the sheet paints the box,
 *    bands, border and text from the hue, and hands it to sub-panels without a `color` of their own.  No `color`:
 *   `primary` (Owen, 2026-10-04);  `accent` is the brand's ivory.
 * - A folded LAST sub-panel closes the outer box:  its band reaches the bottom edge (`:host(:last-child)`).
 ****************/
export class UIBrandPanel extends UISection {
  @proto static styles = { ...UISection.styles, panel: panelCSS }

  /** `brand panel`, and `sub` inside another panel. */
  protected extraClasses(): string | undefined {
    const sub = this.parent() instanceof UIBrandPanel ? SUB_PANEL : undefined
    return [super.extraClasses(), BRAND_PANEL, sub].filter(Boolean).join(" ")
  }
}
