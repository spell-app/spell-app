/**
 * `<ui-brand-panel>`'s names, for its DOCS (`_data/components.json`, `yarn site:data` here):  `<ui-section>`'s
 * vocabulary under the panel's own tag, description and other names.
 * - NOTE:  the element itself is defined with `<ui-section>`'s vocabulary and a tag override
 *   (`UIBrandPanel.define(PANEL_TAG)`):  the same attributes, slots, parts, events and texts, so this file can't
 *   drift from what it does.  A static `vocabulary` of its own would need a cast:  `UISection`'s static type is
 *   `typeof sectionVocabulary`, tag included.
 * - Pure data:  `<ui-section>`'s vocabulary file directly (data only), not the `$/ui` barrel, which loads every element
 *   (node can't).
 */

import type { ComponentVocabulary } from "$/ui/core"
import { sectionVocabulary } from "$/ui/components/ui-section/ui-section.vocabulary.en"

// NOTE:  above the vocabulary, which reads them as it's built

/** `color`'s values:  Spell UI's hues (`ValueSets.hues`, as data here), then the brand's `accent`. */
const PANEL_HUES = [
  "primary",
  "secondary",
  "red",
  "orange",
  "yellow",
  "olive",
  "green",
  "teal",
  "blue",
  "violet",
  "purple",
  "pink",
  "brown",
  "grey",
  "black",
  "accent"
] as const

/** `color`'s description, as the panel uses it. */
const COLOR_DESCRIPTION =
  "Hue of the whole panel:  the header band, the box, the border and the sub-head bands (sub-panels follow it).  " +
  "None:  `primary`.  `accent`:  Polished Ivory, the brand's warm accent (the Color Set Chooser's look)."

/****************
 * ### `<ui-brand-panel>`
 * A property panel:  a tinted box with a full-width header band;  a panel inside it is a sub-head band.  Every band
 * can fold.
 ****************/
export const brandPanelVocabulary = {
  ...sectionVocabulary,
  // `color`:  the hues, plus the brand's `accent` (added at runtime by `src/hues.ts`)
  attributes: sectionVocabulary.attributes.map((spec) =>
    spec.name === "color" ? { ...spec, values: [...PANEL_HUES], description: COLOR_DESCRIPTION } : spec
  ),
  tag: "ui-brand-panel",
  topics: ["layout", "containers"],
  aka: ["inspector", "property panel", "properties", "settings panel", "fieldset"],
  description:
    "A brand panel is an inspector:  a tinted box of fields under a header band, with sub-head bands that fold."
} as const satisfies ComponentVocabulary
