import React, { type ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { createEffect, createMemo, onCleanup, Show, untrack } from "solid-js"

import { scrollForElement, centerElementInParent } from "$/util"
import type { P } from "$/parser"

import { editor } from "$/app/editor"
import type { UI } from "$/app/ui"
import { ErrorBoundary, MenuHeader, MoreMenu, PanelMenu, Submenu, tracked } from "$/app/solid"

import "$/app/ui/syntax.css"
import "./ASTViewer.css"

/****************
 * ### `<ASTRoot>`
 * Root element to show the `<ASTViewer/>` in `SpellEditor`.
 * - Follows `editor.file`'s `AST` and `editor.selection` through `tracked()`.
 ****************/
export function ASTRoot(props: ASTRootProps) {
  const ast = tracked(() => {
    const file = editor.file
    return file && "AST" in file ? file.AST : undefined
  })
  const selection = tracked(() => editor.selection)
  return (
    <div class="ASTRoot">
      <Show when={props.showToolbar ?? true}>
        <ASTToolbar />
      </Show>
      <ASTViewer
        scrolling={props.scrolling ?? true}
        ast={ast()}
        selection={selection()}
        showError={(error) => editor.showError(error)}
      />
    </div>
  )
}

/** Props for `<ASTRoot>`. */
export type ASTRootProps = {
  /** Show `<ASTToolbar>` above viewer.  Default:  `true`. */
  showToolbar?: boolean
  /** Pass through to `<ASTViewer>`.  Default:  `true`. */
  scrolling?: boolean
}

/****************
 * ### `<ASTToolbar>`
 * Toolbar above `<ASTViewer>`: just a header today (no actions).
 ****************/
export function ASTToolbar() {
  return (
    <PanelMenu>
      <Submenu left spring>
        <MenuHeader>Javascript Output</MenuHeader>
      </Submenu>
      <Submenu right spring>
        <MoreMenu stub />
      </Submenu>
    </PanelMenu>
  )
}

/****************
 * ### `<ASTViewer>`
 * Top-level error-handling wrapper around the rendered `ASTNode` tree.
 * - The tree is `ast.component`, a REACT element:  `$/parser`'s `renderAST.tsx` draws every `ASTNode` with React,
 *   and moves to Solid in P8.  Until then `<ReactHost>` mounts it here.
 * - Errors:  `ast.component` throwing (it builds the whole tree, eagerly) is caught by `<ErrorBoundary>`, which
 *   heals when a new `ast` renders;  a React component of the tree throwing is caught on the React side
 *   (`<ReactCatcher>`).  Either tells `showError`.
 * - SIDE EFFECT:  when `selection` is given, scrolls the box to it and highlights the code under the cursor --
 *   after each React render of the tree, and whenever `selection` changes.
 ****************/
export function ASTViewer(props: ASTViewerProps) {
  let viewer: HTMLDivElement | undefined

  createEffect(
    () => props.selection,
    () => {
      sync()
    }
  )

  return (
    <div
      ref={(element) => {
        viewer = element
      }}
      class={["ASTViewer", { scrolling: !!props.scrolling }]}
    >
      <ErrorBoundary onError={(error) => props.showError?.(error)}>
        <ReactHost
          element={props.ast?.component ?? null}
          onRendered={sync}
          onError={(error) => props.showError?.(error)}
        />
      </ErrorBoundary>
    </div>
  )

  /**
   * Scroll and highlight for the current `ast` and `selection`.
   * - Called from an effect's apply and from React's commit:  NOT a tracking scope, so read untracked.
   */
  function sync() {
    const [ast, selection] = untrack(() => [props.ast, props.selection] as const)
    if (!viewer || !ast || !selection) return
    updateScroll(viewer, selection)
    updateHighlight(viewer, ast.match, selection)
  }
}

/** Props for `<ASTViewer>`. */
export type ASTViewerProps = {
  /** Add scrolling className to wrapper. */
  scrolling?: boolean
  /** Root AST node to render. */
  ast?: P.ASTNode
  /** Current editor selection, used to scroll/highlight the matching line. */
  selection?: UI.EditorSelection
  /** Called with caught render error. */
  showError?: (error: unknown) => void
}

////////////////
// ## React in Solid
// TODO: goes in P8, when `renderAST.tsx` draws with Solid.
////////////////

/****************
 * ### `<ReactHost>`
 * A REACT `element` mounted in Solid:  a React root on a `display: contents` `<div>`, the inverse of
 * `solidIsland()`.
 * - Created on the first render of `element`, which re-renders on each new one;  unmounted on cleanup.
 * - `element` throwing (reading it, e.g. `ast.component`) reaches the nearest `<ErrorBoundary>`.
 * - React renders on ITS schedule, not synchronously:  `onRendered` says when the DOM is there.  No `flushSync`:
 *   inside a `solidIsland()` this runs in React's commit, where `flushSync` can't flush (and warns).
 * - NOTE: unmounts on a microtask:  disposal may come from a React commit (an island unmounting), where a
 *   synchronous `unmount()` warns.
 ****************/
function ReactHost(props: ReactHostProps) {
  let host: HTMLDivElement | undefined
  let root: Root | undefined
  const element = createMemo(() => props.element)

  createEffect(() => [element(), props.onRendered, props.onError] as const, {
    effect: ([element, onRendered, onError]) => {
      if (!host) return
      root ??= createRoot(host)
      root.render(React.createElement(ReactCatcher, { element, onRendered, onError }))
    },
    // `element` threw:  `checkElement()` hands that to the `<ErrorBoundary>` around us
    error: () => {}
  })

  onCleanup(() => {
    const done = root
    root = undefined
    if (done) queueMicrotask(() => done.unmount())
  })

  return (
    <>
      {checkElement()}
      <div
        ref={(element) => {
          host = element
        }}
        style={{ display: "contents" }}
      />
    </>
  )

  /**
   * Read `element` in RENDER, drawing nothing:  if it throws (e.g. `ast.component`), an `<ErrorBoundary>` around us
   * catches it.  An effect's errors never reach one:  uncaught, they halt Solid.
   */
  function checkElement() {
    element()
    return null
  }
}

/** Props for `<ReactHost>`. */
type ReactHostProps = {
  /** React element to show. */
  element: ReactNode
  /** React committed `element` to the DOM. */
  onRendered?: () => void
  /** A React component in `element` threw while rendering. */
  onError?: (error: Error) => void
}

/****************
 * ### `<ReactCatcher>`
 * React error boundary for `<ReactHost>`:  shows `Error: <message>` (as React's `ErrorHandler` did) in place of
 * an `element` that throws, until the next `element`.
 * - Calls `onRendered` after each commit of `element`.
 ****************/
class ReactCatcher extends React.Component<ReactHostProps, ReactCatcherState> {
  state: ReactCatcherState = {}

  /** A new `element` clears the error. */
  static getDerivedStateFromProps(props: ReactHostProps, state: ReactCatcherState): ReactCatcherState | null {
    return props.element === state.element ? null : { element: props.element, error: undefined }
  }

  /** Catching a render error stashes it in `state.error`. */
  static getDerivedStateFromError(error: Error): Partial<ReactCatcherState> {
    return { error }
  }

  /** Tell `onError`. */
  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  /** First commit. */
  componentDidMount() {
    this.props.onRendered?.()
  }

  /** Each later commit. */
  componentDidUpdate() {
    this.props.onRendered?.()
  }

  /** `element`, or the error. */
  render() {
    const { error } = this.state
    return error ? React.createElement("h4", null, "Error: ", error.message) : this.props.element
  }
}

/** State of `<ReactCatcher>`. */
type ReactCatcherState = {
  /** `element` the state is for:  a new one resets `error`. */
  element?: ReactNode
  /** Error caught rendering `element`. */
  error?: Error
}

////////////////
// ## Scroll / highlight management
// Static methods of React's `ASTViewer` class;  module functions here.
////////////////

/** Return element that corresponds to `match`. */
function elementForMatch(viewer: HTMLElement, match: P.AnyMatch): HTMLElement | null {
  return viewer.querySelector(`.ASTNode[data-match="${match.ruleName}"][data-start="${match.start}"]`)
}

/** Update scroll for `selection`:  only on a scroll (a cursor move centers its line instead). */
function updateScroll(viewer: HTMLElement, selection: UI.EditorSelection): void {
  if (selection?.scroll?.event === "cursor" || typeof selection?.scroll?.percent !== "number") return
  const size = scrollForElement(viewer)
  if (!size) return
  viewer.scrollTop = selection.scroll.percent * size.max
}

/** Clear all highlighted nodes. */
function clearHighlights(viewer: HTMLElement): void {
  viewer.querySelectorAll(".ASTNode.highlight").forEach((el) => el.classList.remove("highlight"))
}

/** Highlight `matches`. */
function highlight(viewer: HTMLElement, ...matches: P.AnyMatch[]): void {
  for (const match of matches) elementForMatch(viewer, match)?.classList.add("highlight")
}

/** Update highlight for `match` and `selection`. */
function updateHighlight(viewer: HTMLElement, match: P.AnyMatch, selection: UI.EditorSelection): void {
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

  clearHighlights(viewer)
  // find the inner-most thing that's represented on the page
  const innerItem = stack.reverse().find((item) => elementForMatch(viewer, item))
  if (innerItem) highlight(viewer, innerItem)
  else if (firstElForLine) firstElForLine.classList.add("highlight")
}
