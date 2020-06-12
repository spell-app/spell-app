/* eslint-disable react/prop-types */
import React from "react"

import { store } from "./store"
import "./ASTViewer.less"

function highlight(el, delay = 0) {
  setTimeout(() => {
    el.classList.add("highlight")
    setTimeout(() => el.classList.remove("highlight"), 400)
  }, delay)
}

/** Top-level viewer for a ASTNode.
 * Create one of these and it will create <ASTView>s and <TokenView>s underneath it.the
 */
export function ASTViewerInner({ ast, match, inputOffset }) {
  if (!ast) return null
  // If we're passed a specific `inputOffset`, scroll that line into view and flash its bg.
  React.useLayoutEffect(() => {
    if (typeof inputOffset !== "number" || !match) return
    // get the stack of what was matched, with the inner-most thing FIRST
    const stack = match.matchStackForOffset(inputOffset).reverse()
    // find the lowest item that corresponds to a `line`
    const lineAST = stack.find(_match => _match.rule?.name === "line")
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
  return <div className="ASTViewer">{ast.component}</div>
}

/**
 * Top-level viewer for a ASTNode with error handling.
 * Create one of these and it will create <ASTView>s underneath for `props.ast`.
 */
export class ASTViewer extends React.Component {
  state = { error: undefined }

  static getDerivedStateFromError(error) {
    console.warn("ASTViewer error boundary got error", error)
    return { error }
  }

  static getDerivedStateFromProps(props, state) {
    const newState = {
      lastAST: props.ast
    }
    if (state.error && state.lastAST !== props.ast) {
      newState.error = null
    }
    return newState
  }

  componentDidCatch(error, errorInfo) {
    store.showError(error)
  }

  render() {
    const { error } = this.state
    const { ast, match, inputOffset } = this.props
    if (error) {
      return (
        <div className="ASTViewer">
          <h4>Error: {error.message}</h4>
        </div>
      )
    }
    return <ASTViewerInner ast={ast} match={match} inputOffset={inputOffset} />
  }
}
