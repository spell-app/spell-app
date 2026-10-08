/**
 * The English vocabulary of `<ui-panel>`:  `<ui-section>`'s, under the panel's own tag, description and other names.
 * The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Built ON the section's:  the same attributes, slots, parts, events, states and texts,
 *   so it can't drift from what the component does,
 *   and an attribute the section gains reaches the panel with no change here.
 * - Only `color` and `fold-icon` are described again, as the panel uses them.
 *   `color` keeps the section's value set (`hues`), so a hue a theme adds is accepted
 *   (`spell-brand`'s `accent`, named by `packages/brand/src/hues.ts`).
 * - The same noun (`section`) and `ownsParts`:  a panel nests in a section, and a section in a panel.
 * - The class words are the section's, then `panel` (and `sub` inside another panel):
 *   `<ui-panel color="violet">` => `ui violet section panel`.
 */

import type { E } from "$/ui/core"
import { sectionVocabulary } from "$/ui/components/ui-section/UISection.vocabulary.en"

// NOTE:  above the vocabulary, which reads them as it's built

/** `color`'s description, as the panel uses it. */
const COLOR_DESCRIPTION =
  "Hue of the whole panel:  the header band, the box, the border and the sub-head bands (sub-panels follow it).  " +
  "None:  `primary`.  Any hue, including one a theme adds (`spell-brand`'s `accent`, Polished Ivory)."

/** `fold-icon`'s description, as the panel uses it:  its default is `end`. */
const FOLD_ICON_DESCRIPTION =
  "Where each band's fold chevron sits:  `end`, at the far end of the band after any actions (the panel's " +
  "default), or `start`, before the title."

/****************
 * ### `panelVocabulary`
 * The names of `<ui-panel>`, a property panel:  a tinted box with a full-width header band;
 * a panel inside it is a sub-head band.  Every band can fold.
 ****************/
export const panelVocabulary = {
  ...sectionVocabulary,
  tag: "ui-panel",
  topics: ["layout", "containers"],
  aka: ["inspector", "property panel", "properties", "settings panel", "fieldset", "property sheet"],
  description:
    "A panel is an inspector:  a tinted box of fields under a header band, with sub-head bands that fold.  " +
    "It takes every `<ui-section>` attribute.",
  attributes: sectionVocabulary.attributes.map((spec) =>
    spec.name === "color"
      ? { ...spec, description: COLOR_DESCRIPTION }
      : spec.name === "fold-icon"
        ? { ...spec, description: FOLD_ICON_DESCRIPTION }
        : spec
  )
} as const satisfies E.ComponentVocabulary
