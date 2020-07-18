/* eslint-disable react/prop-types */
import React from "react"

import { scrollForElement, scrollElementToCenterOfParent } from "~/util"
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

  /** Update scroll for `selection`. */
  updateScroll(viewer, match, selection) {
    if (selection.scroll.event === "cursor" || typeof selection.scroll?.percent !== "number") return
    const size = scrollForElement(viewer)
    // console.info(selection.scroll, size)
    viewer.scrollTop = selection.scroll.percent * size.max
  }

  /** Update highlight for `match` and `selection` */
  updateHighlight(viewer, match, selection) {
    if (typeof selection?.head?.offset !== "number") return
    // get the stack of what was matched, with the inner-most thing FIRST
    // find the inner-most thing that's represented on the page
    const stack = match.matchStackForOffset(selection.head.offset).reverse()
    let element
    for (let inner of stack) {
      element = viewer.querySelector(`.ASTNode[data-start="${inner.start}"]`)
      if (element) break
    }
    if (!element) return
    // console.info(element)
    // on "cursor" events, scroll the element into the center of the display
    if (selection.scroll?.event === "cursor") {
      scrollElementToCenterOfParent(element, viewer)
    }
    highlight(viewer, element)
  }

  /**
   * Wrapper class to manage scrolling and showing selection.
   */
  Wrapper = ({ component, props }) => {
    const { match, selection } = props
    // Update view to match selection
    React.useLayoutEffect(() => {
      const viewer = document.querySelector(".ASTViewer")
      if (!viewer || !match || !selection?.scroll) return
      this.updateScroll(viewer, match, selection)
      this.updateHighlight(viewer, match, selection)
    }, [match, selection])

    const classNames = ["ASTViewer"]
    if (props.scroll) classNames.push("scroll")
    return <div className={classNames.join(" ")}>{component}</div>
  }

  /** Actual component which draws the root `ast` ASTNode passed in. */
  Component({ ast }) {
    // `ast.component` is memoized
    return ast?.component || null
  }
}
