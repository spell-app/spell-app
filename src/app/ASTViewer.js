/* eslint-disable react/prop-types */
import React from "react"

import { scrollForElement } from "~/util"
import { ErrorHandler } from "./ErrorHandler"
import "./ASTViewer.less"

function highlight(parent, element, delay = 0) {
  parent.querySelectorAll(".ASTNode.highlight").forEach((el) => el.classList.remove("highlight"))
  element.classList.add("highlight")
  // console.info("highlighted", element)
  // setTimeout(() => {
  //   setTimeout(() => element.classList.remove("highlight"), 400)
  // }, delay)
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
  Wrapper({ component, props }) {
    const classNames = ["ASTViewer"]
    if (props.scroll) classNames.push("scroll")
    return <div className={classNames.join(" ")}>{component}</div>
  }

  /** Actual component which draws the root `ast` ASTNode passed in. */
  Component({ ast, match, selection }) {
    // If we're passed a specific `selection`, scroll that line into view and flash its bg.
    React.useLayoutEffect(() => {
      const viewer = document.querySelector(".ASTViewer")
      if (viewer && typeof selection?.scroll?.percent === "number") {
        const size = scrollForElement(viewer)
        // console.info(size, selection.scroll)
        viewer.scrollTop = selection.scroll.percent * size.available
      }

      // get the stack of what was matched, with the inner-most thing FIRST
      // find the inner-most thing that's represented on the page
      if (viewer && match && typeof selection?.head?.offset === "number") {
        const stack = match.matchStackForOffset(selection.head.offset).reverse()
        let inner
        let element
        for (inner of stack) {
          element = viewer.querySelector(`.ASTNode[data-start="${inner.start}"]`)
          if (element) break
        }
        if (element) {
          // element.scrollIntoView({ block: "center" })
          // element.closest(".ASTViewer").scrollLeft = 0
          highlight(viewer, element)
        }
      }
    }, [match, selection])

    // Actual render is `ast.component`, which is alread memoized
    return ast?.component || null
  }
}
