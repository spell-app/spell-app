import React from "react"

import { view, scrollForElement, centerElementInParent } from "~/util"
import { P } from "~/parser"
import type { ASTNode } from "~/parser/ast/AST"
import { store } from "~/app/store"

import * as UI from "./ui"
import { ErrorHandler } from "./ErrorHandler"
import type { ErrorHandlerState, ErrorHandlerWrapperProps } from "./ErrorHandler"
import "./ASTViewer.less"

/** Shape of `store.selection`, as set by `store.onInputCursor()`/`store.showMatch()`. */
export type EditorSelectionPoint = {
  line?: number
  ch?: number
  top?: number
  offset?: number
}
export type EditorSelectionScroll = {
  event?: string
  direction?: string
  percent?: number
  max?: number
  current?: number
  total?: number
  visible?: number
}
export type EditorSelection = {
  scroll?: EditorSelectionScroll
  anchor?: EditorSelectionPoint
  head?: EditorSelectionPoint
}

export type ASTRootProps = {
  showToolbar?: boolean
  scrolling?: boolean
}

/**
 *  Root element to show the `<ASTViewer/>` in `SpellEditor`
 */
export const ASTRoot = view(function ASTRoot({ showToolbar = true, scrolling = true }: ASTRootProps) {
  return (
    <div className="ASTRoot">
      {!!showToolbar && <ASTToolbar />}
      <ASTViewer
        scrolling={scrolling}
        ast={store.file && "AST" in store.file ? store.file.AST : undefined}
        selection={store.selection}
        showError={store.showError}
      />
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

export type ASTViewerProps = {
  scrolling?: boolean
  ast?: ASTNode
  selection?: EditorSelection
  showError?: (error: unknown) => void
}

type ASTViewerState = ErrorHandlerState & { ast?: ASTNode }

/** Top-level error handler. */
export class ASTViewer extends ErrorHandler<ASTViewerProps> {
  /** Clear `state.error` if `props.ast` changes. */
  static getDerivedStateFromProps(props: ASTViewerProps, oldState: ASTViewerState): Partial<ASTViewerState> {
    const newState: Partial<ASTViewerState> = { ast: props.ast }
    if (oldState.ast !== newState.ast) newState.error = undefined
    return newState
  }

  /* Show error in UI when caught. */
  componentDidCatch(error: Error) {
    this.props.showError?.(error)
  }

  /**
   * Wrapper class to manage scrolling and showing selection.
   */
  Wrapper = ({ component, props }: ErrorHandlerWrapperProps<ASTViewerProps>) => {
    const classNames = ["ASTViewer"]
    if (props.scrolling) classNames.push("scrolling")
    return <div className={classNames.join(" ")}>{component}</div>
  }

  /** Actual component which draws the root `ast` ASTNode passed in. */
  Component({ ast, selection }: ASTViewerProps) {
    // `ast.component` is memoized
    const component = ast?.component || null

    // Update view to match selection
    React.useEffect(() => {
      if (!ast || !selection) return
      const viewer = document.querySelector<HTMLElement>(".ASTViewer")
      if (!viewer) return
      ASTViewer.updateScroll(viewer, ast.match, selection)
      ASTViewer.updateHighlight(viewer, ast.match, selection)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component, selection])

    return component
  }

  /////////////////////////
  //  Scroll / highlight management
  /////////////////////////

  /** Return element that corresponds to `match`. */
  static elementForMatch(viewer: HTMLElement, match: P.AnyMatch): HTMLElement | null {
    return viewer.querySelector(`.ASTNode[data-match="${match.ruleName}"][data-start="${match.start}"]`)
  }

  /** Update scroll for `selection`. */
  static updateScroll(viewer: HTMLElement, match: P.AnyMatch, selection: EditorSelection): void {
    if (selection?.scroll?.event === "cursor" || typeof selection?.scroll?.percent !== "number") return
    const size = scrollForElement(viewer)
    // console.info(selection.scroll, size)
    if (!size) return
    viewer.scrollTop = selection.scroll.percent * size.max
  }

  static clearHighlights(viewer: HTMLElement): void {
    viewer.querySelectorAll(".ASTNode.highlight").forEach((el) => el.classList.remove("highlight"))
  }
  static highlight(viewer: HTMLElement, ...matches: P.AnyMatch[]): void {
    matches.forEach((match) => {
      const element = ASTViewer.elementForMatch(viewer, match)
      if (element) element.classList.add("highlight")
    })
  }
  /** Update highlight for `match` and `selection` */
  static updateHighlight(viewer: HTMLElement, match: P.AnyMatch, selection: EditorSelection): void {
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
    const firstElForLine = viewer.querySelector<HTMLElement>(`.ASTNode[data-line="${stack[0].line}"]`)
    if (selection.scroll?.event === "cursor") {
      centerElementInParent(firstElForLine, viewer)
    }

    ASTViewer.clearHighlights(viewer)
    // find the inner-most thing that's represented on the page
    const innerItem = stack.reverse().find((item) => ASTViewer.elementForMatch(viewer, item))
    // console.info(stack, { lineIndex, innerItem, firstElForLine })
    if (innerItem) ASTViewer.highlight(viewer, innerItem)
    else if (firstElForLine) firstElForLine.classList.add("highlight")
  }
}
