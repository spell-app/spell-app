/**
 * The types and constants of the section family that `<ui-section>` and `<ui-panel>` share.
 * - `UIPanel` extends `UISection`, and reuses its vocabulary type and its chevron places.
 * - Pure data:  `import type` only, so node can load it (`yarn site:data`).
 * - A constant only `UISection` reads sits below that class, in `UISection.tsx`.
 */

import type { sectionVocabulary } from "./UISection.vocabulary.en"

/** `<ui-section>`'s vocabulary type, for brevity (`<ui-panel>` reuses it). */
export type SectionVocabulary = typeof sectionVocabulary

////////////////
// ## Folding
////////////////

/**
 * `fold-icon`'s values:  the chevron before the title (`start`, inside the fold button), or at the far end of the
 * title bar (`end`, after the badge and actions).
 */
export const FoldIconPlace = { start: "start", end: "end" } as const
/** One of `FoldIconPlace`'s values, e.g. `"end"`. */
export type FoldIconPlace = (typeof FoldIconPlace)[keyof typeof FoldIconPlace]
