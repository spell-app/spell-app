import { Show, createEffect } from "solid-js"

import { scrollForElement, centerElementInParent } from "$/util"
import { P } from "$/parser"

import { editor } from "$/app/editor"
import type { UI } from "$/app/ui"
import { Actions, ErrorBoundary, MenuHeader, MoreMenu, PanelMenu, Submenu, tracked } from "$/app/solid"
import { MatchView } from "./MatchView"

import "./MatchViewer.css"

/****************
 * ### `<MatchRoot>`
 * Root element to show the `<MatchViewer/>` in `SpellEditor`.
 * - Follows `editor.file`'s `match`, `editor.selection` and `editor.showingMatchRuleNames` through `tracked()`.
 ****************/
export function MatchRoot(props: MatchRootProps) {
  const showNames = tracked(() => editor.showingMatchRuleNames)
  const match = tracked(() => {
    const file = editor.file
    return file && "match" in file ? file.match : undefined
  })
  const selection = tracked(() => editor.selection)
  return (
    <div class="MatchRoot">
      <Show when={props.showToolbar ?? true}>
        <MatchToolbar />
      </Show>
      <MatchViewer
        scrolling={props.scrolling ?? true}
        compact={showNames()}
        match={match()}
        selection={selection()}
        showError={(error) => editor.showError(error)}
      />
    </div>
  )
}

/** Props for `<MatchRoot>`. */
export type MatchRootProps = {
  /** Show `<MatchToolbar>` above viewer.  Default:  `true`. */
  showToolbar?: boolean
  /** Pass through to `<MatchViewer>`.  Default:  `true`. */
  scrolling?: boolean
}

/****************
 * ### `<MatchToolbar>`
 * Toolbar above `<MatchViewer>`: header plus `toggleMatchRuleNames` action.
 ****************/
export function MatchToolbar() {
  return (
    <PanelMenu>
      <Submenu left spring>
        <MenuHeader>Matched Rules</MenuHeader>
      </Submenu>
      <Submenu right spring>
        <Actions.toggleMatchRuleNames />
        <MoreMenu stub />
      </Submenu>
    </PanelMenu>
  )
}

/****************
 * ### `<MatchViewer>`
 * Top-level error-handling wrapper around the matched-rule tree view (see `<MatchView>`).
 * - The `.MatchViewer` box stays when the tree throws:  `<ErrorBoundary>` shows the error inside it, tells
 *   `showError`, and heals when a new `match` renders.
 * - SIDE EFFECT:  when `selection` has a `scroll`, scrolls the box to it and highlights the line under the cursor
 *   -- again whenever `match`, `selection` or `compact` (which re-lays out the tree) changes.
 ****************/
export function MatchViewer(props: MatchViewerProps) {
  let viewer: HTMLDivElement | undefined

  createEffect(
    () => [props.match, props.selection, props.compact] as const,
    ([match, selection]) => {
      if (!viewer || !match || !selection?.scroll) return
      updateScroll(viewer, selection)
      updateHighlight(viewer, match, selection)
    }
  )

  return (
    <div
      ref={(element) => {
        viewer = element
      }}
      class={["MatchViewer", { scrolling: !!props.scrolling, compact: !!props.compact }]}
    >
      <ErrorBoundary onError={(error) => props.showError?.(error)}>
        <MatchView match={props.match} />
      </ErrorBoundary>
    </div>
  )
}

/** Props for `<MatchViewer>`. */
export type MatchViewerProps = {
  /** Add scrolling className to wrapper. */
  scrolling?: boolean
  /**
   * Add compact className -- tightens spacing and HIDES rule names.
   * - NOTE: `<MatchRoot>` passes `editor.showingMatchRuleNames`, so `true` there hides them (as React's did).
   */
  compact?: boolean
  /** Root match to render. */
  match?: P.Match
  /** Current editor selection, used to scroll/highlight the matching line. */
  selection?: UI.EditorSelection
  /** Called with caught render error. */
  showError?: (error: unknown) => void
}

////////////////
// ## Scroll / highlight management
// Static methods of React's `MatchViewer` class;  module functions here.
////////////////

/** Return element that corresponds to `matchOrToken`. */
function elementForMatch(viewer: HTMLElement, matchOrToken: P.Match | P.Token): HTMLElement | null {
  let selector: string
  if (matchOrToken instanceof P.Token) {
    selector = `.Token.${matchOrToken.constructor.name}[data-start="${matchOrToken.start}"] > .value`
  } else {
    selector =
      matchOrToken.ruleName === "line" //
        ? `.Match.line[data-start="${matchOrToken.start}"]`
        : `.Match.${matchOrToken.ruleName?.replace(/\$/g, "_")}[data-start="${matchOrToken.start}"] > .name`
  }
  return viewer.querySelector(selector)
}

/** Update scroll for `selection`:  only on a scroll (a cursor move centers its line instead). */
function updateScroll(viewer: HTMLElement, selection: UI.EditorSelection): void {
  const { scroll } = selection
  if (scroll?.event === "cursor" || typeof scroll?.percent !== "number") return
  const size = scrollForElement(viewer)
  if (!size) return
  viewer.scrollTop = scroll.percent * size.max
}

/** Clear all highlighted nodes. */
function clearHighlights(viewer: HTMLElement): void {
  viewer.querySelectorAll(".highlight").forEach((el) => el.classList.remove("highlight"))
}

/** Highlight `matches`. */
function highlight(viewer: HTMLElement, ...matches: (P.Match | P.Token)[]): void {
  for (const match of matches) elementForMatch(viewer, match)?.classList.add("highlight")
}

/** Update highlight for `match` and `selection`. */
function updateHighlight(viewer: HTMLElement, match: P.Match, selection: UI.EditorSelection): void {
  const cursorOffset = selection.head?.offset
  if (typeof cursorOffset !== "number") return

  // get the stack of what was matched, with the inner-most thing FIRST
  let stack = match.matchStackForOffset(cursorOffset).reverse()
  // if we got a `line` match as the first thing, we're at the end of the line
  if (stack[0]?.ruleName === "line") {
    // -- back up one and try again
    stack = match.matchStackForOffset(cursorOffset - 1).reverse()
  }

  // find INNERMOST match that corresponds to a `line`
  const lineMatch = stack.find((_match) => _match.rule?.name === "line")
  if (!lineMatch) return

  // on "cursor" events, scroll the `name` thinger into the center of the display
  if (selection.scroll?.event === "cursor") {
    const lineEl = viewer.querySelector<HTMLElement>(`.Match.line[data-line="${lineMatch.line}"]`)
    centerElementInParent(lineEl, viewer)
  }

  clearHighlights(viewer)
  const toHighlight = stack.slice(0, stack.indexOf(lineMatch) + 1)
  highlight(viewer, ...toHighlight.reverse())
}
