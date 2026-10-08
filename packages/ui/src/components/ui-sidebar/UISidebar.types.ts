/**
 * The constants and types the `ui-sidebar` family's components share:
 * `<ui-sidebar>` reports a `UIT.SidebarLayout`, which its `<ui-pushable>` turns into the pusher's tokens.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 * - A constant only one class reads sits below that class.
 * - The word widths are `UIT.WordWidths` (`<ui-flyout>`'s too).
 */

import type { pushableVocabulary } from "./UIPushable.en"
import type { sidebarVocabulary } from "./UISidebar.en"

/** `<ui-sidebar>`'s vocabulary type, for brevity. */
export type SidebarVocabulary = typeof sidebarVocabulary

/** `<ui-pushable>`'s vocabulary type, for brevity. */
export type PushableVocabulary = typeof pushableVocabulary

////////////////
// ## Pusher layout
////////////////

/** The pusher's `transform-origin` unless a `scale down` sidebar moves it:  its centre. */
export const CENTER = "50% 50%"
