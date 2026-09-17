import React from "react"

import { view, scrollForElement, centerElementInParent } from "~/util"
import { P } from "~/parser"

import { actions } from "~/app/actions"
import * as UI from "./ui"
import { ErrorHandler } from "./ErrorHandler"
import type { ErrorHandlerState, ErrorHandlerWrapperProps } from "./ErrorHandler"
import type { EditorSelection } from "./ASTViewer"
import { MatchView } from "./MatchView"
import { store } from "~/app/store"
import "./MatchViewer.less"

export type MatchRootProps = {
  showToolbar?: boolean
  scrolling?: boolean
}

/**
 *  Root element to show the `<MatchViewer/>` in `SpellEditor`
 */

export const MatchRoot = view(function MatchRoot({ showToolbar = true, scrolling = true }: MatchRootProps) {
  const { showingMatchRuleNames: showNames } = store
  return (
    <div className="MatchRoot">
      {!!showToolbar && <MatchToolbar />}
      <MatchViewer //
        scrolling={scrolling}
        compact={showNames}
        match={store.file && "match" in store.file ? store.file.match : undefined}
        selection={store.selection}
        showError={store.showError}
      />
    </div>
  )
})

export const MatchToolbar = React.memo(function MatchToolbar() {
  return (
    <UI.PanelMenu>
      <UI.Submenu left spring>
        <UI.MenuHeader content="Matched Rules" />
      </UI.Submenu>
      <UI.Submenu right spring>
        <actions.toggleMatchRuleNames />
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.PanelMenu>
  )
})

export type MatchViewerProps = {
  scrolling?: boolean
  compact?: boolean
  match?: P.Match
  selection?: EditorSelection
  showError?: (error: unknown) => void
}

type MatchViewerState = ErrorHandlerState & { match?: P.Match }

export class MatchViewer extends ErrorHandler<MatchViewerProps> {
  /** Clear `state.error` if `props.match` changes. */
  static getDerivedStateFromProps(props: MatchViewerProps, oldState: MatchViewerState): Partial<MatchViewerState> {
    const newState: Partial<MatchViewerState> = { match: props.match }
    if (oldState.match !== newState.match) newState.error = undefined
    return newState
  }

  /* Show error in UI when caught. */
  componentDidCatch(error: Error) {
    this.props.showError?.(error)
  }

  /**
   * Wrapper class to manage scrolling.
   * This is automatically drawn by `ErrorHandler`,
   * and will be passed `Component` for the root `Match`.
   */
  Wrapper = ({ component, props }: ErrorHandlerWrapperProps<MatchViewerProps>) => {
    const classNames = ["MatchViewer"]
    if (props.scrolling) classNames.push("scrolling")
    if (props.compact) classNames.push("compact")
    return <div className={classNames.join(" ")}>{component}</div>
  }

  /**
   * Memoized top-level viewer for a Match, e.g. for a `spellFile.match`.
   * Create one of these and it will create <MatchView>s and <TokenView>s underneath it.
   */
  Component({ match, selection, compact }: MatchViewerProps) {
    const component = React.useMemo(() => {
      if (!match) return null
      return <MatchView match={match} />
    }, [match])

    // If we're passed a specific `selection`, scroll that line into view and highlight it.
    React.useEffect(() => {
      const viewer = document.querySelector<HTMLElement>(".MatchViewer")
      if (!viewer || !match || !selection?.scroll) return
      MatchViewer.updateScroll(viewer, match, selection)
      MatchViewer.updateHighlight(viewer, match, selection)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component, match, selection, compact])

    return component
  }

  /////////////////////////
  //  Scroll / highlight management
  /////////////////////////

  // Return element that corresponds to `matchOrToken`.
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
  // Highlight `matches`.
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
