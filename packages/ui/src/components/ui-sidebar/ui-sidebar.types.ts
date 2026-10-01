/**
 * Loose constants, types and helpers of `<ui-sidebar>`, `<ui-pushable>` and `<ui-pusher>`:  the element classes, the
 * vocabularies and the native fallback import them from here.
 */

import { pushableVocabulary } from "./ui-pushable.vocabulary.en"
import { sidebarVocabulary } from "./ui-sidebar.vocabulary.en"
import { pusherVocabulary } from "./ui-pusher.vocabulary.en"

/** Fomantic's word widths (`thin sidebar`), which `width` takes beside column counts. */
export const SIDEBAR_WORD_WIDTHS = ["very thin", "thin", "wide", "very wide"] as const

////////////////
// ## UIPushable
////////////////

/** PushableVocabulary type, for brevity. */
export type PushableVocabulary = typeof pushableVocabulary

/** Class of the root (`ui-sidebar.css`). */
export const PUSHABLE = "pushable"
export const CENTER = "50% 50%"
export const ON = "1"
export const OFF = "0"

/** The attribute it adds to the children beside a modal sidebar. */
export const INERT = "inert"

////////////////
// ## UIPusher
////////////////

/** Class of the root (`ui-sidebar.css`). */
export const PUSHER = "pusher"

////////////////
// ## UISidebar
////////////////

/** SidebarVocabulary type, for brevity. */
export type SidebarVocabulary = typeof sidebarVocabulary

/** Top / bottom sidebars:  full width, move the pusher vertically. */
export const VERTICAL = new Set(["top", "bottom"])

/** Transitions it treats specially. */
export const OVERLAY = "overlay"
export const UNCOVER = "uncover"
export const SCALE_DOWN = "scale down"

/** Pusher transforms. */
export const NONE_TRANSFORM = "none"
export const SCALE = "scale(0.75)"

/** Where a scaled-down pusher shrinks towards, by the sidebar's side (Fomantic's `transform-origin`s). */
export const SCALE_ORIGINS: Readonly<Record<string, string>> = {
  left: "75% 50%",
  right: "25% 50%",
  top: "50% 75%",
  bottom: "50% 25%"
}

/** `closedby` values it reads. */
export const ANY = "any"

////////////////
// ## ui-sidebar.fallback
////////////////

/** Any of the family's vocabularies, for brevity. */
export type SidebarFallbackVocabulary = typeof sidebarVocabulary | typeof pushableVocabulary | typeof pusherVocabulary

/** The family's vocabularies, by tag. */
export const VOCABULARIES: readonly SidebarFallbackVocabulary[] = [
  sidebarVocabulary,
  pushableVocabulary,
  pusherVocabulary
]

/** The attribute with word values. */
export const WIDTH = "width"
