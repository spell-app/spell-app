/* eslint-disable react/prop-types */
import React from "react"

import { view, scrollForElement, centerElementInParent } from "~/util"

import { actions } from "~/app/actions"
import { UI } from "../ui"
import { ErrorHandler } from "./ErrorHandler"
import { store } from "~/app/store"
import "./ASTViewer.less"

/**
 *  Root element to show the `<ASTViewer/>` in `SpellEditor`
 */
export const ASTRoot = view(function ASTRoot({ showToolbar = true, scrolling = true }) {
  return (
    <div className="ASTRoot">
      {!!showToolbar && <ASTToolbar />}
      <ASTViewer scrolling={scrolling} ast={store.file?.AST} selection={store.selection} showError={store.showError} />
    </div>
  )
})

export function ASTToolbar() {
  return (
    <UI.PanelMenu>
      <UI.Submenu left spring>
        <UI.MenuHeader content="Javascript Output" />
      </UI.Submenu>
      <UI.Submenu right spring>
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.PanelMenu>
  )
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

  /**
   * Wrapper class to manage scrolling and showing selection.
   */
  Wrapper = ({ component, props }) => {
    const classNames = ["ASTViewer"]
    if (props.scrolling) classNames.push("scrolling")
    return <div className={classNames.join(" ")}>{component}</div>
  }

  /** Actual component which draws the root `ast` ASTNode passed in. */
  Component({ ast, selection }) {
    // `ast.component` is memoized
    const component = ast?.component || null

    // Update view to match selection
    React.useEffect(() => {
      if (!ast || !selection) return
      const viewer = document.querySelector(".ASTViewer")
      ASTViewer.updateScroll(viewer, ast.match, selection)
      ASTViewer.updateHighlight(viewer, ast.match, selection)
    }, [component, selection])

    return component
  }

  /////////////////////////
  //  Scroll / highlight management
  /////////////////////////

  /** Return element that corresponds to `match`. */
  static elementForMatch(viewer, match) {
    return viewer.querySelector(`.ASTNode[data-match="${match.ruleName}"][data-start="${match.start}"]`)
  }

  /** Update scroll for `selection`. */
  static updateScroll(viewer, match, selection) {
    if (selection?.scroll?.event === "cursor" || typeof selection.scroll.percent !== "number") return
    const size = scrollForElement(viewer)
    // console.info(selection.scroll, size)
    viewer.scrollTop = selection.scroll.percent * size.max
  }

  static clearHighlights(viewer) {
    viewer.querySelectorAll(".ASTNode.highlight").forEach((el) => el.classList.remove("highlight"))
  }
  static highlight(viewer, ...matches) {
    matches.forEach((match) => {
      const element = ASTViewer.elementForMatch(viewer, match)
      if (element) element.classList.add("highlight")
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
    // restrict to everything up to the first `line`, then reverse so the line is at the front
    const lineIndex = stack.findIndex((item) => item.ruleName === "line")

    if (lineIndex !== -1) stack = stack.slice(0, lineIndex + 1).reverse()
    if (stack.length === 0) {
      console.info("Got empty stack for", { selection, cursorOffset, lineIndex })
      return
    }

    // on "cursor" events, scroll the first element on that line to the center of the display
    const firstElForLine = viewer.querySelector(`.ASTNode[data-line="${stack[0].line}"]`)
    if (selection.scroll?.event === "cursor") {
      centerElementInParent(firstElForLine, viewer)
    }

    ASTViewer.clearHighlights(viewer)
    // find the inner-most thing that's represented on the page
    const innerItem = stack.reverse().find((item) => ASTViewer.elementForMatch(viewer, item))
    // console.info(stack, { lineIndex, innerItem, firstElForLine })
    if (innerItem) ASTViewer.highlight(viewer, innerItem)
    else if (firstElForLine) ASTViewer.highlight(viewer, firstElForLine)
  }
}
