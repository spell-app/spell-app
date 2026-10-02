/** @jsxImportSource react */
import React from "react"

import { view, scrollForElement, centerElementInParent } from "$/util"
import { P } from "$/parser"

import { editor } from "$/app/editor"

import { UI } from "$/app/ui"
import { Actions } from "./Actions"
import { ErrorHandler, type ErrorHandlerState, type ErrorHandlerWrapperProps } from "./ErrorHandler"
import type { EditorSelection } from "./ui.types"
import { MatchView } from "./MatchView"

import "./MatchViewer.css"

/****************
 * ### `<MatchRoot>`
 * Root element to show the `<MatchViewer/>` in `SpellEditor`.
 ****************/
export const MatchRoot = view(function MatchRoot({ showToolbar = true, scrolling = true }: MatchRootProps) {
  const { showingMatchRuleNames: showNames } = editor
  return (
    <div className="MatchRoot">
      {!!showToolbar && <MatchToolbar />}
      <MatchViewer //
        scrolling={scrolling}
        compact={showNames}
        match={editor.file && "match" in editor.file ? editor.file.match : undefined}
        selection={editor.selection}
        showError={editor.showError}
      />
    </div>
  )
})

/** Props for `<MatchRoot>`. */
export type MatchRootProps = {
  /** Show `<MatchToolbar>` above viewer. */
  showToolbar?: boolean
  /** Pass through to `<MatchViewer>`. */
  scrolling?: boolean
}

/****************
 * ### `<MatchToolbar>`
 * Toolbar above `<MatchViewer>`: header plus `toggleMatchRuleNames` action.
 ****************/
export const MatchToolbar = React.memo(function MatchToolbar() {
  return (
    <UI.PanelMenu>
      <UI.Submenu left spring>
        <UI.MenuHeader content="Matched Rules" />
      </UI.Submenu>
      <UI.Submenu right spring>
        <Actions.toggleMatchRuleNames />
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.PanelMenu>
  )
})

/****************
 * ### `<MatchViewer>`
 * Top-level error-handling wrapper around the matched-rule tree view (see `<MatchView>`).
 ****************/
export class MatchViewer extends ErrorHandler<MatchViewerProps> {
  /** Clear `state.error` if `props.match` changes. */
  static getDerivedStateFromProps(props: MatchViewerProps, oldState: MatchViewerState): Partial<MatchViewerState> {
    const newState: Partial<MatchViewerState> = { match: props.match }
    if (oldState.match !== newState.match) newState.error = undefined
    return newState
  }

  /** Show error in UI when caught. */
  componentDidCatch(error: Error) {
    this.props.showError?.(error)
  }

  /**
   * Wrapper class to manage scrolling.
   * This is automatically drawn by `ErrorHandler`,
   * and will be passed `Component` for the root `Match`.
   */
  Wrapper = MatchWrapper

  /**
   * Memoized top-level viewer for a Match, e.g. for a `spellFile.match`.
   * Create one of these and it will create <MatchView>s and <TokenView>s underneath it.
   * This lives on the class prototype (see `ErrorHandler`'s class doc) but is used only as a
   * detached function reference via `React.createElement(this.Component, props)` -- it's never
   * called as `this.Component()`, so it's a plain function component and hooks are legal here.
   */
  Component = MatchComponent

  ////////////////
  // ## Scroll / highlight management
  ////////////////

  /** Return element that corresponds to `matchOrToken`. */
  static elementForMatch(viewer: HTMLElement, matchOrToken: P.Match | P.Token): HTMLElement | null {
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

  /** Update scroll for `selection`. */
  static updateScroll(viewer: HTMLElement, match: P.Match, selection: EditorSelection): void {
    const { scroll } = selection
    if (scroll?.event === "cursor" || typeof scroll?.percent !== "number") return
    const size = scrollForElement(viewer)
    // console.info(selection.scroll, size)
    if (!size) return
    viewer.scrollTop = scroll.percent * size.max
  }

  /** Clear all highlighted nodes. */
  static clearHighlights(viewer: HTMLElement): void {
    viewer.querySelectorAll(".highlight").forEach((el) => el.classList.remove("highlight"))
  }

  /** Highlight `matches`. */
  static highlight(viewer: HTMLElement, ...matches: (P.Match | P.Token)[]): void {
    matches.forEach((match) => {
      const element = MatchViewer.elementForMatch(viewer, match)
      element?.classList.add("highlight")
    })
  }
  /** Update highlight for `match` and `selection` */
  static updateHighlight(viewer: HTMLElement, match: P.Match, selection: EditorSelection): void {
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

    MatchViewer.clearHighlights(viewer)
    const toHighlight = stack.slice(0, stack.indexOf(lineMatch) + 1)
    MatchViewer.highlight(viewer, ...toHighlight.reverse())
  }
}

/** State for `<MatchViewer>`: `ErrorHandlerState` plus the `match` we're tracking for reset purposes. */
type MatchViewerState = ErrorHandlerState & { match?: P.Match }

/****************
 * ### `<MatchWrapper>`
 * Wrapper component for a Match -- applies `scrolling`/`compact` classNames around `component`.
 ****************/
function MatchWrapper({ component, props }: ErrorHandlerWrapperProps<MatchViewerProps>) {
  const classNames = ["MatchViewer"]
  if (props.scrolling) classNames.push("scrolling")
  if (props.compact) classNames.push("compact")
  return <div className={classNames.join(" ")}>{component}</div>
}

/****************
 * ### `<MatchComponent>`
 * Component to render for a `Match` -- builds the `<MatchView>` tree (memoized on `match`) and,
 * when a `selection` is passed, scrolls/highlights the matching line via `MatchViewer.updateScroll`
 * / `updateHighlight`.
 ****************/
function MatchComponent({ match, selection, compact }: MatchViewerProps) {
  const element = React.useMemo(() => {
    if (!match) return null
    return <MatchView match={match} />
  }, [match])

  // If we're passed a specific `selection`, scroll that line into view and highlight it.
  React.useEffect(() => {
    const viewer = document.querySelector<HTMLElement>(".MatchViewer")
    if (!viewer || !match || !selection?.scroll) return
    MatchViewer.updateScroll(viewer, match, selection)
    MatchViewer.updateHighlight(viewer, match, selection)
  }, [element, match, selection, compact])

  return element
}

/** Props for `<MatchViewer>`. */
export type MatchViewerProps = {
  /** Add scrolling className to wrapper. */
  scrolling?: boolean
  /** Add compact className -- used when rule names are shown, to tighten spacing. */
  compact?: boolean
  /** Root match to render. */
  match?: P.Match
  /** Current editor selection, used to scroll/highlight the matching line. */
  selection?: EditorSelection
  /** Called with caught render error. */
  showError?: (error: unknown) => void
}
