/**
 * Helpers for walking the Type Explorer's tree (`LSP.ScopeNode`), for `spell describe`.
 * - The full-screen `spell explore` used them too, and its tree view's rows (`treeRows()`), until epic `repo-split`
 *   P13 deleted it.
 * - Pure:  they only read the tree.
 * - The tree's LAST top-level child is the project it was built for;  before it come spell's built-in types,
 *   then the projects that one imports.  See `ScopeExplorer.tree()`.
 * - A node or member is named by its `path`, e.g. `project:Solitaire/file:Card.spell/type:Card` -- see `LSP.scopePath()`.
 */
import { LSP } from "$/lsp"
import { CLI } from "$/cli"

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
