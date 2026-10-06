//
//  ## Types shared by the writers (`Writer`, `JSWriter`, `TreeWriter`).
//  - Runtime-light:  types only, so anything in the folder may import it.
//

/**
 * One box of a spell tree diagram:  what `P.TreeWriter` writes for each AST node.
 * - The same shape `@spell-app/ui`'s `<ui-tree-diagram>` draws (its `TreeDiagramNode`):  plain data, as JSON, so the
 *   parser and `ui` never import each other.
 */
export type TreeNode = {
  /** The box's text, e.g. `If`, `Variable number`, `Number 15`. */
  label: string
  /** A second, smaller line, e.g. the node's datatype `number`;  none when unknown. */
  detail?: string
  /** Its place in its parent, on the line from it, e.g. `condition`, `lhs`. */
  slot?: string
  /** Hover text:  the spell it came from, e.g. `the number divided by 15`. */
  title?: string
  /** Its children, left to right. */
  children?: TreeNode[]
}
