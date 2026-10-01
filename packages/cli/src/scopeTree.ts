/**
 * Helpers for walking the Type Explorer's tree (`LSP.ScopeNode`) -- shared by `spell describe` and `spell explore`.
 * - Pure:  they only read the tree.
 * - The tree's LAST top-level child is the project it was built for;  before it come spell's built-in types,
 *   then the projects that one imports.  See `ScopeExplorer.tree()`.
 * - A node or member is named by its `path`, e.g. `project:Solitaire/file:Card.spell/type:Card` -- see `LSP.scopePath()`.
 */
import { LSP } from "#lsp"
import { CLI } from "#cli"

/** Node of the project `tree` was built for. */
export function projectNodeOf(tree: LSP.ScopeNode): LSP.ScopeNode {
  return tree.children.at(-1)!
}

/** Node for the file at `uri` in `tree`'s project -- `undefined` if its project doesn't parse it, e.g. it isn't active. */
export function fileNodeFor(tree: LSP.ScopeNode, uri: string): LSP.ScopeNode | undefined {
  return projectNodeOf(tree).children.find((node) => node.kind === "file" && node.uri === uri)
}

/** Every node below `node`, depth first. */
export function descendants(node: LSP.ScopeNode): LSP.ScopeNode[] {
  return node.children.flatMap((child) => [child, ...descendants(child)])
}

/** Nodes from `tree`'s top level down to node `path` -- itself last -- or `[]` if it isn't there. */
export function trailTo(tree: LSP.ScopeNode, path: string): LSP.ScopeNode[] {
  for (const child of tree.children) {
    if (child.path === path) return [child]
    const below = trailTo(child, path)
    if (below.length) return [child, ...below]
  }
  return []
}

/**
 * Where node or member `path` of `tree` is declared, given its `details` -- `undefined` if it isn't in a file,
 * e.g. a built-in, or has no statement of its own, e.g. a file.
 * - Its file:  where its details say it's declared, else the file its node is in -- as the app's Type Explorer.
 */
export function declaredAt(
  tree: LSP.ScopeNode,
  path: string,
  details: LSP.ScopeDetails | null
): CLI.DeclaredAt | undefined {
  const uri = details?.uri ?? trailTo(tree, path).at(-1)?.uri
  if (!uri || details?.line === undefined) return undefined
  return { uri, line: LSP.firstLine(details.line) }
}

/**
 * Rows a tree view of `tree` shows, top to bottom -- NOT `tree` itself:  its children are the top level.
 * - Without `filter`:  each node, and the children of those whose `path` is in `expanded`.
 * - With `filter`:  every node whose name holds it -- see `CLI.normalizedName()` -- and their ancestors,
 *   all expanded, so you see where each one is.
 */
export function treeRows(tree: LSP.ScopeNode, expanded: ReadonlySet<string>, filter = ""): TreeRow[] {
  const wanted = CLI.normalizedName(filter)
  const rows: TreeRow[] = []
  for (const child of tree.children) addRows(child, 0)
  return rows

  /**
   * Add rows for `node` at `depth`, and whatever below it shows.
   * - Returns whether it -- or anything below it -- matches `filter`.
   */
  function addRows(node: LSP.ScopeNode, depth: number): boolean {
    const hasChildren = node.children.length > 0
    if (!wanted) {
      const isOpen = hasChildren && expanded.has(node.path)
      rows.push({ node, depth, hasChildren, isOpen })
      if (isOpen) for (const child of node.children) addRows(child, depth + 1)
      return true
    }
    // filtering:  add ourselves, then take ourselves back out if nothing here matched
    const at = rows.push({ node, depth, hasChildren, isOpen: true }) - 1
    const matches = node.children.map((child) => addRows(child, depth + 1)).some(Boolean)
    const isMatch = CLI.normalizedName(node.name).includes(wanted)
    if (!isMatch && !matches) {
      rows.splice(at)
      return false
    }
    rows[at]!.isOpen = matches
    return true
  }
}

/**
 * One row of a tree view -- see `treeRows()`.
 * - `depth`:  0 for the top level
 * - `hasChildren`:  can it open?
 * - `isOpen`:  are its children the rows below it?
 */
export type TreeRow = {
  node: LSP.ScopeNode
  depth: number
  hasChildren: boolean
  isOpen: boolean
}
