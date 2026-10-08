import { Show, createMemo } from "solid-js"

import { P } from "$/parser"
import { SP } from "$/spell"

import { editor } from "$/app/editor"
import { ErrorBoundary, MenuHeader, MoreMenu, PanelMenu, Submenu, tracked } from "$/app/solid"

import "./TreeViewer.css"

/****************
 * ### `<TreeRoot>`
 * Root element to show the `<TreeViewer/>` in `SpellEditor`:  the spell tree of the line the cursor is on.
 * - Follows `editor.file`'s `match` and `editor.selection` through `tracked()`.
 ****************/
export function TreeRoot(props: TreeRootProps) {
  const match = tracked(() => {
    const file = editor.file
    return file && "match" in file ? file.match : undefined
  })
  const selection = tracked(() => editor.selection)
  return (
    <div class="TreeRoot">
      <Show when={props.showToolbar ?? true}>
        <TreeToolbar />
      </Show>
      <TreeViewer match={match()} offset={selection()?.head?.offset} showError={(error) => editor.showError(error)} />
    </div>
  )
}

/** Props for `<TreeRoot>`. */
export type TreeRootProps = {
  /** Show `<TreeToolbar>` above viewer.  Default:  `true`. */
  showToolbar?: boolean
}

/****************
 * ### `<TreeToolbar>`
 * Toolbar above `<TreeViewer>`:  just a header today (no actions).
 ****************/
export function TreeToolbar() {
  return (
    <PanelMenu>
      <Submenu left spring>
        <MenuHeader>Spell Tree</MenuHeader>
      </Submenu>
      <Submenu right spring>
        <MoreMenu stub />
      </Submenu>
    </PanelMenu>
  )
}

/****************
 * ### `<TreeViewer>`
 * The spell tree (`P.TreeWriter`) of the `line` in `match` at `offset`, drawn by `<ui-tree-diagram>`.
 * - A new tree on every cursor move:  only the line under the cursor, so it stays small.
 * - No line there (or nothing parsed yet):  a hint instead.
 * - Errors:  the tree is worked out in RENDER, so `<ErrorBoundary>` catches a throwing `getAST()`, tells
 *   `showError`, and heals on the next move.
 ****************/
export function TreeViewer(props: TreeViewerProps) {
  const tree = createMemo(() => {
    const { match, offset } = props
    if (!match || typeof offset !== "number") return undefined
    const ast = SP.BlockLine.lineAt(match, offset)?.AST
    return P.TreeWriter.treeOf(ast)
  })
  return (
    <div class="TreeViewer">
      <ErrorBoundary onError={(error) => props.showError?.(error)}>
        <Show when={tree()} fallback={<p class="TreeViewer-hint">Put the cursor on a line to see its spell tree.</p>}>
          <ui-tree-diagram prop:tree={tree()} />
        </Show>
      </ErrorBoundary>
    </div>
  )
}

/** Props for `<TreeViewer>`. */
export type TreeViewerProps = {
  /** The file's whole match. */
  match?: P.Match
  /** The cursor's offset in the file. */
  offset?: number
  /** Called with a caught error. */
  showError?: (error: unknown) => void
}
