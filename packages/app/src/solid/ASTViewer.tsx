import { createEffect, Show } from "solid-js"

import { scrollForElement, centerElementInParent } from "$/util"
import { P } from "$/parser"

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
 * Top-level error-handling wrapper around the drawn `ASTNode` tree.
 * - The tree is `ast.markup` (`$/parser`'s `renderAST.ts`:  plain data, no UI framework), drawn as DOM by
 *   `P.render.toDOM()` -- fresh nodes for each new `ast`.  It's static:  a new compile makes a new `ast`.
 * - Errors:  `ast.markup` throwing (it builds the whole tree, eagerly) is read in RENDER, so `<ErrorBoundary>`
 *   catches it, tells `showError`, and heals when a new `ast` draws.
 * - SIDE EFFECT:  when `selection` is given, scrolls the box to it and highlights the code under the cursor --
 *   whenever `ast` or `selection` changes, after the tree is in the DOM.
 ****************/
export function ASTViewer(props: ASTViewerProps) {
  let viewer: HTMLDivElement | undefined

  createEffect(
    () => [props.ast, props.selection] as const,
    ([ast, selection]) => {
      if (!viewer || !ast || !selection) return
      updateScroll(viewer, selection)
      updateHighlight(viewer, ast.match, selection)
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
        {props.ast ? P.render.toDOM(props.ast.markup) : null}
      </ErrorBoundary>
    </div>
  )
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
