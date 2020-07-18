/* eslint-disable react/prop-types */
import React from "react"

import { scrollForElement } from "~/util"
import { Token } from "~/parser"

import { store } from "./store"
import { ErrorHandler } from "./ErrorHandler"
import { MatchView } from "./MatchView"

import "./MatchViewer.less"

function highlight(el, delay = 0) {
  setTimeout(() => {
    el.classList.add("highlight")
    setTimeout(() => el.classList.remove("highlight"), 400)
  }, delay)
}

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
    if (!viewer || typeof selection?.scroll?.percent !== "number") return
    const size = scrollForElement(viewer)
    // console.info(selection.scroll, size)
    viewer.scrollTop = selection.scroll.percent * size.max
  }

  /** Update highlight for `match` and `selection` */
  updateHighlight(viewer, match, selection) {
    if (!viewer || !match || typeof selection?.head?.offset !== "number") return
    // get the stack of what was matched, with the inner-most thing FIRST
    const stack = match.matchStackForOffset(selection.head.offset).reverse()
    // find the lowest item that corresponds to a `line`
    const lineMatch = stack.find((_match) => _match.rule?.name === "line")
    const lineEl = lineMatch && document.querySelector(`.Match.line[data-start="${lineMatch.start}"]`)
    if (!lineEl) return
    // console.warn({ selection, lineMatch, lineEl })

    // scroll the `name` thinger into the center of the display
    // lineEl.querySelector(".name").scrollIntoView({ block: "center" })

    // highlight the line element
    // highlight(lineEl)

    // highlight NAMEs of bits higher in the stack
    stack
      .slice(0, stack.indexOf(lineMatch))
      .reverse()
      .forEach((item, index) => {
        const itemEl =
          item instanceof Token
            ? document.querySelector(`.Token.${item.constructor.name}[data-start="${item.start}"] > .value`)
            : document.querySelector(`.Match.${getRuleName(item)}[data-start="${item.start}"] > .name`)
        if (itemEl) highlight(itemEl, index * 20)
      })
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
