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
    store.showError(error)
  }

  /**
   * Wrapper class to manage scrolling.
   * This is automatically drawn by `ErrorHandler`,
   * and will be passed `Component` for the root `Match`.
   */
  Wrapper({ component, props }) {
    const classNames = ["MatchViewer"]
    if (props.scroll) classNames.push("scroll")
    return <div className={classNames.join(" ")}>{component}</div>
  }

  /**
   * Top-level viewer for a Match, e.g. for a `spellFile.match`.
   * Create one of these and it will create <MatchView>s and <TokenView>s underneath it.
   *
   * If you pass `inputOffset` as a character position in the source file,
   * we'll scroll to that position and highlight elements surrounding that position.
   */
  Component({ match, selection }) {
    // If we're passed a specific `selection`, scroll that line into view and flash its bg.
    React.useLayoutEffect(() => {
      const viewer = document.querySelector(".MatchViewer")
      if (!viewer || !selection) return
      // Scroll to match % of `selection` passed in
      if (typeof selection.scroll?.percent === "number") {
        const size = scrollForElement(viewer)
        // console.info(size, selection.scroll)
        viewer.scrollTop = selection.scroll.percent * size.available
      }

      if (typeof selection.head?.offset === "number") {
        // get the stack of what was matched, with the inner-most thing FIRST
        const stack = match.matchStackForOffset(selection.head.offset).reverse()
        // find the lowest item that corresponds to a `line`
        const lineMatch = stack.find((_match) => _match.rule?.name === "line")
        const lineEl = lineMatch && document.querySelector(`.Match.line[data-start="${lineMatch.start}"]`)
        if (!lineEl) return
        // console.warn({ selection, lineMatch, lineEl })
        // scroll the `name` thinger into the center of the display
        lineEl.querySelector(".name").scrollIntoView({ block: "center" })

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
    }, [selection])

    // Memoize for the specified `match`.
    // This allow us to update `selection` without redrawing matches.
    return React.useMemo(() => (match ? <MatchView match={match} /> : null), [match])
  }
}
