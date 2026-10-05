/**
 * Loose constants and types of the `ui-panel` family:  what its element class, vocabulary and native fallback share.
 * - Data only:  nothing here runs.
 * - NOTE:  `import type` only from the vocabulary (it imports nothing from here, but a value import would be a cycle
 *   the day it does).
 */

import type { panelVocabulary } from "./ui-panel.vocabulary.en"

////////////////
// ## UIPanel
////////////////

/** PanelVocabulary type, for brevity. */
export type PanelVocabulary = typeof panelVocabulary

/** Class word added after the section's:  `ui ... section panel`. */
export const PANEL = "panel"

/** Class word of a panel inside a panel:  drawn as a sub-head band. */
export const SUB_PANEL = "sub"
