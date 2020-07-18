/* eslint-disable react/prop-types */
import React from "react"

import { scrollForElement, offsetTopRelativeTo } from "~/util"
import { Token } from "~/parser"

import { ErrorHandler } from "./ErrorHandler"
import { MatchView } from "./MatchView"

import "./MatchViewer.less"

function getRuleName(match) {
  return (match.rule.name || "anonymous-rule").replace(/\$/g, "_")
}

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

  /** Update scroll for `selection`. */
  updateScroll(viewer, match, selection) {
    const { scroll } = selection
    if (scroll.event === "cursor" || typeof scroll.percent !== "number") return
    const size = scrollForElement(viewer)
    // console.info(selection.scroll, size)
    viewer.scrollTop = scroll.percent * size.max
  }

  highlight(viewer, stack) {
    viewer.querySelectorAll(".highlight").forEach((el) => el.classList.remove("highlight"))
    stack.forEach((item, index) => {
      let itemEl
      if (item instanceof Token) {
        itemEl = viewer.querySelector(`.Token.${item.constructor.name}[data-start="${item.start}"] > .value`)
      } else {
        const ruleName = (item.rule?.name || "anonymous-rule").replace(/\$/g, "_")
        itemEl = viewer.querySelector(`.Match.${ruleName}[data-start="${item.start}"] > .name`)
      }
      if (itemEl) itemEl.classList.add("highlight")
    })
  }

  /** Update highlight for `match` and `selection` */
  updateHighlight(viewer, match, selection) {
    if (typeof selection.head?.offset !== "number") return
    // get the stack of what was matched, with the inner-most thing FIRST
    const stack = match.matchStackForOffset(selection.head.offset).reverse()
    // find the lowest item that corresponds to a `line`
    const lineMatch = stack.find((_match) => _match.rule?.name === "line")
    const lineEl = lineMatch && document.querySelector(`.Match.line[data-start="${lineMatch.start}"]`)
    if (!lineEl) return
    // console.info({ selection, lineMatch, lineEl })

    // on "cursor" events, scroll the `name` thinger into the center of the display
    if (selection.scroll?.event === "cursor") {
      const nameEl = lineEl.querySelector(".name")
      const top = offsetTopRelativeTo(nameEl, viewer) - viewer.clientHeight / 2
      viewer.scrollTo({ left: 0, top, behavior: "smooth" })
    }
    this.highlight(viewer, stack.slice(0, stack.indexOf(lineMatch)).reverse())
  }

  /**
   * Wrapper class to manage scrolling.
   * This is automatically drawn by `ErrorHandler`,
   * and will be passed `Component` for the root `Match`.
   */
  Wrapper = ({ component, props }) => {
    const { match, selection } = props
    // If we're passed a specific `selection`, scroll that line into view and flash its bg.
    React.useLayoutEffect(() => {
      const viewer = document.querySelector(".MatchViewer")
      if (!viewer || !match || !selection?.scroll) return
      this.updateScroll(viewer, match, selection)
      this.updateHighlight(viewer, match, selection)
    }, [match, selection])

    const classNames = ["MatchViewer"]
    if (props.scroll) classNames.push("scroll")
    return <div className={classNames.join(" ")}>{component}</div>
  }

  /**
   * Memoized top-level viewer for a Match, e.g. for a `spellFile.match`.
   * Create one of these and it will create <MatchView>s and <TokenView>s underneath it.
   */
  Component({ match }) {
    return React.useMemo(() => (match ? <MatchView match={match} /> : null), [match])
  }
}
