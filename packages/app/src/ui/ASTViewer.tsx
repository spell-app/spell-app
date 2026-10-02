/** @jsxImportSource react */
import React from "react"

import { view, scrollForElement, centerElementInParent } from "$/util"
import { P } from "$/parser"
import { editor } from "$/app/editor"

import { UI } from "$/app/ui"
import { ErrorHandler, type ErrorHandlerState, type ErrorHandlerWrapperProps } from "./ErrorHandler"
import type { EditorSelection } from "./ui.types"
import "./ASTViewer.css"

/****************
 * ### `<ASTRoot>`
 * Root element to show the `<ASTViewer/>` in `SpellEditor`.
 ****************/
export const ASTRoot = view(function ASTRoot({ showToolbar = true, scrolling = true }: ASTRootProps) {
  return (
    <div className="ASTRoot">
      {!!showToolbar && <ASTToolbar />}
      <ASTViewer
        scrolling={scrolling}
        ast={editor.file && "AST" in editor.file ? editor.file.AST : undefined}
        selection={editor.selection}
        showError={editor.showError}
      />
    </div>
  )
})

/** Props for `<ASTRoot>`. */
export type ASTRootProps = {
  /** Show `<ASTToolbar>` above viewer. */
  showToolbar?: boolean
  /** Pass through to `<ASTViewer>`. */
  scrolling?: boolean
}

/****************
 * ### `<ASTToolbar>`
 * Toolbar above `<ASTViewer>`: just a header today (no actions).
 ****************/
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

/****************
 * ### `<ASTViewer>`
 * Top-level error-handling wrapper around the rendered `ASTNode` tree.
 ****************/
export class ASTViewer extends ErrorHandler<ASTViewerProps> {
  /** Clear `state.error` if `props.ast` changes. */
  static getDerivedStateFromProps(props: ASTViewerProps, oldState: ASTViewerState): Partial<ASTViewerState> {
    const newState: Partial<ASTViewerState> = { ast: props.ast }
    if (oldState.ast !== newState.ast) newState.error = undefined
    return newState
  }

  /** Show error in UI when caught. */
  componentDidCatch(error: Error) {
    this.props.showError?.(error)
  }

  /**
   * Wrapper class to manage scrolling and showing selection.
   */
  Wrapper = ASTWrapper

  /**
   * Actual component which draws the root `ast` ASTNode passed in.
   * This lives on the class prototype (see `ErrorHandler`'s class doc) but is used only as a
   * detached function reference via `React.createElement(this.Component, props)` -- it's never
   * called as `this.Component()`, so it's a plain function component and hooks are legal here.
   */
  Component = ASTComponent

  ////////////////
  // ## Scroll / highlight management
  ////////////////

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

  /** Clear all highlighted nodes. */
  static clearHighlights(viewer: HTMLElement): void {
    viewer.querySelectorAll(".ASTNode.highlight").forEach((el) => el.classList.remove("highlight"))
  }

  /** Highlight `matches`. */
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

/** State for `<ASTViewer>`: `ErrorHandlerState` plus the `ast` we're tracking for reset purposes. */
type ASTViewerState = ErrorHandlerState & { ast?: P.ASTNode }

/****************
 * ### `<ASTWrapper>`
 * Wrapper class to manage scrolling and showing selection.
 ****************/
function ASTWrapper({ component, props }: ErrorHandlerWrapperProps<ASTViewerProps>) {
  const classNames = ["ASTViewer"]
  if (props.scrolling) classNames.push("scrolling")
  return <div className={classNames.join(" ")}>{component}</div>
}

/****************
 * ### `<ASTComponent>`
 * Actual component which draws the root `ast` ASTNode passed in.
 * - This lives on the class prototype (see `ErrorHandler`'s class doc) but is used only as a
 *   detached function reference via `React.createElement(this.Component, props)` -- it's never
 *   called as `this.Component()`, so it's a plain function component and hooks are legal here.
 ****************/
function ASTComponent({ ast, selection }: ASTViewerProps) {
  // `ast.component` is memoized
  const element = ast?.component || null

  // Update view to match selection
  React.useEffect(() => {
    if (!ast || !selection) return
    const viewer = document.querySelector<HTMLElement>(".ASTViewer")
    if (!viewer) return
    ASTViewer.updateScroll(viewer, ast.match, selection)
    ASTViewer.updateHighlight(viewer, ast.match, selection)
  }, [ast, element, selection])

  return element
}

/** Props for `<ASTViewer>`. */
export type ASTViewerProps = {
  /** Add scrolling className to wrapper. */
  scrolling?: boolean
  /** Root AST node to render. */
  ast?: P.ASTNode
  /** Current editor selection, used to scroll/highlight the matching line. */
  selection?: EditorSelection
  /** Called with caught render error. */
  showError?: (error: unknown) => void
}
