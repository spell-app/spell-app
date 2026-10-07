/**
 * Loose types and constants of the `epic-page` family;  and the JSX types of the Spell UI tags every `<epic-*>`
 * element draws in its shadow root.
 * - Data only:  nothing here runs.
 */

import type { JSX } from "@solidjs/web"

import type { Cell } from "$/ui/core"

import type { epicPageVocabulary } from "./epic-page.vocabulary.en"

/** `epicPageVocabulary`'s type. */
export type EpicPageVocabulary = typeof epicPageVocabulary

/**
 * The page-wide values its blocks read, per `<epic-page>` host (`EpicPage.signalsOf()`).
 * - Kept by host, not on the controller:  a section may connect before the page's controller exists (the pack
 *   defines its families in any order), and reads the same signals either way.
 */
export type PageSignals = {
  /** Where top-level titles stick:  below the site header and the page header, px from the viewport top. */
  top: Cell<number>
  /** Bumped when blocks come or go, or a phase's status or title changes:  numbers and the step label follow. */
  layout: Cell<number>
}

/** One phase, as the step label reads it. */
export type PhaseLine = {
  /** `p3` */
  id: string
  /** `todo`, `active`, `done` */
  status: string
  /** its title's text */
  title: string
}

/** The step label:  its look, its words, where it links. */
export type StepLabel = {
  color: "orange" | "green" | "grey" | "violet"
  icon: string
  /** what it says:  `P4`, `DONE`, `FUTURE` */
  words: string
  /** its tooltip */
  tip?: string
  /** where it links (`#p4`) */
  href?: string
}

/** The phase status that's under way, and the done one. */
export const ACTIVE = "active"
export const DONE = "done"
export const TODO = "todo"

/** The attributes a step label or a number depends on:  a change bumps the page's layout. */
export const LAYOUT_ATTRIBUTES = ["status", "state", "title", "kind", "commits"]

/** `localStorage` key prefix of the commits toggle, per page path. */
export const COMMITS_KEY = "epic-commits:"

/** The custom property the commits toggle sets for every `<epic-commit>` below:  `block` shows them. */
export const COMMITS_PROPERTY = "--epic-commits-display"

/** The custom property of the sticky stack's bottom, px from the viewport top (`EpicFold` sets it too). */
export const STACK_PROPERTY = "--epic-stack"

/** What shows the git toggle:  a commit, or a block whose part lists some. */
export const HAS_COMMITS = "epic-commit, [commits]"

/** Classes of the shadow markup. */
export const HEAD = "head"
export const HEADING = "heading"
export const META = "meta"
export const STATUS = "status"
export const GIT = "git"
export const NOTICE = "notice"
export const HUNG = "hung"

/** The kickoff prompt, which the `Plan hung?` aside offers to copy. */
export const PROMPT = 'epic-overview > [slot="prompt"]'
export const ICON = "icon"

/** Loose attributes of a Spell UI tag drawn in JSX:  HTML attributes, plus any attribute. */
export type UIJSXAttributes = JSX.HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }

declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      "ui-section": UIJSXAttributes
      "ui-label": UIJSXAttributes
      "ui-message": UIJSXAttributes
      "ui-code": UIJSXAttributes
    }
  }
}
