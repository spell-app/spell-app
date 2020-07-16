/* eslint-disable react/prop-types */
import React from "react"

import { ErrorHandler } from "./ErrorHandler"
import "./ASTViewer.less"

function highlight(el, delay = 0) {
  setTimeout(() => {
    el.classList.add("highlight")
    setTimeout(() => el.classList.remove("highlight"), 400)
  }, delay)
}

/** Top-level error handler. */
export class ASTViewer extends ErrorHandler {
  /** Clear `state.error` if `props.ast` changes. */
  static getDerivedStateFromProps(props, oldState) {
    const newState = { ast: props.ast }
    if (oldState.ast !== newState.ast) newState.error = null
    return newState
  }

  /* Show error in UI when caught. */
  componentDidCatch(error, errorInfo) {
    this.props.showError(error)
  }

  /** Wrapper class to manage scrolling. */
  Wrapper({ contents, props }) {
    const classNames = ["ASTViewer"]
    if (props.scroll) classNames.push("scroll")
    return <div className={classNames.join(" ")}>{contents}</div>
  }

  /** Actual component which draws the root `ast` ASTNode passed in. */
  Component({ ast, match, selection }) {
    // If we're passed a specific `selection`, scroll that line into view and flash its bg.
    React.useLayoutEffect(() => {
      if (!match || typeof selection?.headOffset !== "number") return
      const viewer = document.querySelector(".ASTViewer")
      const { scrollTop, clientHeight, scrollHeight } = viewer
      // const outerNode = document.querySelector(".ASTViewer > .ASTNode")

      // get the stack of what was matched, with the inner-most thing FIRST
      // find the inner-most thing that's represented on the page
      const stack = match.matchStackForOffset(selection.headOffset).reverse()
      let inner
      let element
      for (inner of stack) {
        element = document.querySelector(`.ASTNode[data-start="${inner.start}"]`)
        if (element) break
      }
      if (element) {
      }
      // if (!element) return
      // element.scrollIntoView({ block: "center" })
      // element.closest(".ASTViewer").scrollLeft = 0
      // highlight(element)
    }, [match, selection])

    return ast?.component || null
  }
}
