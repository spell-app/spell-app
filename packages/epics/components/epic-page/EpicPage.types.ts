/**
 * Loose types and constants of the `epic-page` family;  and the JSX types of the Spell UI tags every `<epic-*>`
 * element draws in its shadow root.
 * - Data only:  nothing here runs.
 */

import type { JSX } from "@solidjs/web"

import type { E } from "$/ui/core"

import type { epicPageVocabulary } from "./EpicPage.en"

/** `epicPageVocabulary`'s type. */
export type EpicPageVocabulary = typeof epicPageVocabulary

/**
 * The page-wide values its blocks read, per `<epic-page>` DOM element (`EpicPage.signalsOf()`).
 * - Kept by DOM element, not on the component:  a section may connect before the page's component exists (the pack
 *   defines its families in any order), and reads the same signals either way.
 */
export type PageSignals = {
  /** Where top-level titles stick:  below the site header and the page header, px from the viewport top. */
  top: E.Cell<number>
  /** Bumped when blocks come or go, or a phase's status or title changes:  numbers and the step label follow. */
  layout: E.Cell<number>
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
  /** `blue` the active phase (outlined:  Claude is on it), `green` DONE (solid), `grey` the next one, or FUTURE */
  color: "blue" | "green" | "grey"
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
export const TITLES = "titles"
export const HEADING = "heading"
export const HEADING_COPY = "heading-copy"
export const SUBHEAD = "subhead"
export const META = "meta"
export const STATUS = "status"
export const GIT = "git"
export const NOTICE = "notice"
export const HUNG = "hung"

export const SEND = "send"
export const REVIEW_NOW = "review-now"
export const STATE = "state"
export const REVIEW_LINE = "review-line"

/** Classes of the toolbar row, its tools at the right, the send bar and its pill (epic `airplane` P8). */
export const TOOLBAR = "toolbar"
export const TOOLBAR_TOOLS = "toolbar-tools"
export const SEND_BAR = "send-bar"
export const PILL = "pill"

/** The crumbs' class. */
export const CRUMBS = "crumbs"

/**
 * The crumbs' links, from the page's folder:  a plan doc is always `epics/<name>/<name>.plan.html`.  `target`s name
 * the VS Code side bar's tab, as the old crumbs did.
 */
export const CRUMB_LINKS = {
  docs: { href: "../../pages/index.html", target: "src-packages-docs-index-html" },
  epics: { href: "../../epics/index.html", target: "src-epics-index-html" }
} as const

/**
 * The crumbs a doc may still hold before the page, from before P14 (`ui-breadcrumb.spell-crumbs` in `<main>`):  while
 * they're there, the page draws none of its own, so they never show twice.  REFACTOR:  goes once every doc is
 * migrated (P14's second pass).
 */
export const OLD_CRUMBS = ":scope > .spell-crumbs"

/** How long the review line flashes once copied, ms:  as the old runtime's (`FLASH_MS`). */
export const FLASH_MS = 900

/** The Send button's look:  no marks, some not sent, all sent. */
export type SendState = "idle" | "unsent" | "sent"

/** What the header's review buttons show:  from the review inbox, while the page is reviewed. */
export type HeaderMarks = {
  /** Send's look */
  send: SendState
  /** marks not sent yet */
  unsent: number
  /** marks Review Now would have Claude work through:  all but the requests already on their way */
  waiting: number
  /** a Claude session is listening */
  listening: boolean
}

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
      "ui-breadcrumb": UIJSXAttributes
      "ui-breadcrumb-section": UIJSXAttributes
      // the pack's own families it draws in its shadow root
      "epic-new-item": UIJSXAttributes
      "epic-agents": UIJSXAttributes
    }
  }
}
