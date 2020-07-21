/* eslint-disable react/prop-types */
import React from "react"

import { scrollForElement, scrollElementToCenterOfParent } from "~/util"
import { Token } from "~/parser"

import { ErrorHandler } from "./ErrorHandler"
import { MatchView } from "./MatchView"
import "./MatchViewer.less"

export class MatchViewer extends ErrorHandler {
  /** Clear `state.error` if `props.match` changes. */
  static getDerivedStateFromProps(props, oldState) {
    const newState = { match: props.match }
    if (oldState.match !== newState.match) newState.error = null
    return newState
  }

  /* Show error in UI when caught. */
  componentDidCatch(error, errorInfo) {
    this.props.showError(error)
  }

  /**
   * Wrapper class to manage scrolling.
   * This is automatically drawn by `ErrorHandler`,
   * and will be passed `Component` for the root `Match`.
   */
  Wrapper = ({ component, props }) => {
    const classNames = ["MatchViewer"]
    if (props.scroll) classNames.push("scroll")
    if (props.compact) classNames.push("compact")
    return <div className={classNames.join(" ")}>{component}</div>
  }

  /**
   * Memoized top-level viewer for a Match, e.g. for a `spellFile.match`.
   * Create one of these and it will create <MatchView>s and <TokenView>s underneath it.
   */
  Component({ match, selection }) {
    const component = React.useMemo(() => {
      if (!match) return null
      return <MatchView match={match} />
    }, [match])

    // If we're passed a specific `selection`, scroll that line into view and highlight it.
    const viewer = document.querySelector(".MatchViewer")
    React.useEffect(() => {
      if (!viewer || !match || !selection?.scroll) return
      MatchViewer.updateScroll(viewer, match, selection)
      MatchViewer.updateHighlight(viewer, match, selection)
    }, [viewer, component, match, selection])

    return component
  }

  /////////////////////////
  //  Scroll / highlight management
  /////////////////////////

  // Return element that corresponds to `matchOrToken`.
  static elementForMatch(viewer, matchOrToken) {
    let selector
    if (matchOrToken instanceof Token) {
      selector = `.Token.${matchOrToken.constructor.name}[data-start="${matchOrToken.start}"] > .value`
    } else {
      selector =
        matchOrToken.ruleName === "line" //
          ? `.Match.line[data-start="${matchOrToken.start}"]`
          : `.Match.${matchOrToken.ruleName.replace(/\$/g, "_")}[data-start="${matchOrToken.start}"] > .name`
    }
    return viewer.querySelector(selector)
  }

  /** Update scroll for `selection`. */
  static updateScroll(viewer, match, selection) {
    const { scroll } = selection
    if (scroll.event === "cursor" || typeof scroll.percent !== "number") return
    const size = scrollForElement(viewer)
    // console.info(selection.scroll, size)
    viewer.scrollTop = scroll.percent * size.max
  }

  /** Clear all highlighted nodes. */
  static clearHighlights(viewer) {
    viewer.querySelectorAll(".highlight").forEach((el) => el.classList.remove("highlight"))
  }
  // Highlight `matches`.
  static highlight(viewer, ...matches) {
    matches.forEach((match) => {
      const element = MatchViewer.elementForMatch(viewer, match)
      element?.classList.add("highlight")
    })
  }
  /** Update highlight for `match` and `selection` */
  static updateHighlight(viewer, match, selection) {
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
      const lineEl = viewer.querySelector(`.Match.line[data-line="${lineMatch.line}"]`)
      scrollElementToCenterOfParent(lineEl, viewer)
    }

    MatchViewer.clearHighlights(viewer)
    const toHighlight = stack.slice(0, stack.indexOf(lineMatch) + 1)
    MatchViewer.highlight(viewer, ...toHighlight.reverse())
  }
}
