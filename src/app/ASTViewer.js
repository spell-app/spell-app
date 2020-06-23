/* eslint-disable react/prop-types */
import React from "react"

import { store } from "./store"
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
    store.showError(error)
  }

  /** Wrapper class to manage scrolling. */
  Wrapper({ contents, props }) {
    const classNames = ["ASTViewer"]
    if (props.scroll) classNames.push("scroll")
    return <div className={classNames.join(" ")}>{contents}</div>
  }

  /** Actual component which draws the root `ast` ASTNode passed in. */
  Component({ ast, match, inputOffset }) {
    // If we're passed a specific `inputOffset`, scroll that line into view and flash its bg.
    React.useLayoutEffect(() => {
      if (!ast) return
      if (typeof inputOffset !== "number" || !match) return
      // get the stack of what was matched, with the inner-most thing FIRST
      const stack = match.matchStackForOffset(inputOffset).reverse()
      // find the lowest item that corresponds to a `line`
      const lineAST = stack.find((_match) => _match.rule?.name === "line")
      const lineEl = lineAST && document.querySelector(`.ASTNode[data-start="${lineAST.start}"]`)
      if (!lineEl) return
      // console.warn({ inputOffset, lineAST, lineEl })
      // scroll the `name` thinger into the center of the display
      lineEl.scrollIntoView({ block: "center" })

      // make sure we're scrolled all the way to the left horizontally
      lineEl.closest(".ASTViewer").scrollLeft = 0
      // parent.scrollTo(0, parent.scrollTop)

      // highlight the line element
      highlight(lineEl)

      // highlight NAMEs of bits higher in the stack
      // stack
      //   .slice(0, stack.indexOf(lineAST))
      //   .reverse()
      //   .forEach((item, index) => {
      //     const itemEl = document.querySelector(`.ASTNode.${item.rule?.name}[data-start="${item.start}"] > .name`)
      //     if (itemEl) highlight(itemEl, index * 20)
      //   })
    }, [match, inputOffset])

    return ast?.component || null
  }
}
